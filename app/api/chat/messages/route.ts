// app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') // The other user's ID
  const currentUserId = searchParams.get('currentUserId') // Current user's ID

  if (!userId || !currentUserId) {
    return NextResponse.json({ 
      error: 'Missing userId or currentUserId' 
    }, { status: 400 })
  }

  try {
    // Fetch messages between current user and selected user
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      orderBy: {
        timestamp: 'asc',
      },
      include: {
        sender: {
          select: { 
            id: true, 
            profile: {
              select: {
                id: true,
                userId: true,
                email: true,
                fullName: true,
                phoneNumber: true,
                role: true,
                photoFileName: true,
              }
            }
          },
        },
        receiver: {
          select: { 
            id: true, 
            profile: {
              select: {
                id: true,
                userId: true,
                email: true,
                fullName: true,
                phoneNumber: true,
                role: true,
                photoFileName: true,
              }
            }
          },
        },
      },
    })

    // Transform the data to match your component's expected format
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      message: msg.message,
      timestamp: msg.timestamp,
      senderProfile: msg.sender.profile,
      receiverProfile: msg.receiver.profile,
    }))

    return NextResponse.json(transformedMessages)
  } catch (error) {
    console.error('❌ Failed to fetch messages:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}