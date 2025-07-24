import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher-server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { getTokenFromCookie } from '@/lib/utils'
import { JWT_SECRET } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    // Step 1: Get & verify token from cookies
    const token = getTokenFromCookie(req) // must handle NextRequest
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const senderId = payload.userId as string

    const body = await req.json()
    const { receiverId, message } = body

    if (!senderId || !receiverId || !message?.trim()) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    // Step 2: Store message in DB
    const newMessage = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        message: message.trim(),
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        receiver: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Step 3: Notify both users via Pusher
    const channelForReceiver = `private-user-${receiverId}`
    const channelForSender = `private-user-${senderId}`

    await Promise.all([
      pusherServer.trigger(channelForReceiver, 'new-message', newMessage),
      pusherServer.trigger(channelForSender, 'new-message', newMessage),
    ])

    return NextResponse.json(newMessage, { status: 200 })
  } catch (err) {
    console.error('❌ Error in POST /api/chat/send:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
