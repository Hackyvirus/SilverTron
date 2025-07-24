// app/api/chat/previews/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // Get all messages involving the user
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    const chatMap = new Map<string, {
      userId: string
      lastMessage: { message: string, timestamp: Date }
      unreadCount: number
    }>()

    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: {
            message: msg.message,
            timestamp: msg.timestamp,
          },
          unreadCount: 0,
        })
      }

      if (msg.receiverId === userId) {
        const chat = chatMap.get(otherUserId)!
        chat.unreadCount += 1
      }
    }

    const previews = await Promise.all(
      Array.from(chatMap.entries()).map(async ([otherUserId, chat]) => {
        const profile = await prisma.profile.findUnique({
          where: { userId: otherUserId },
          select: {
            userId: true,
            fullName: true,
            email: true,
          },
        })

        if (!profile) {
          return null // or skip if preferred
        }

        return {
          profile, // <- frontend expects `preview.profile.fullName`
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount,
        }
      })
    )

    // Remove null values if any profiles weren't found
    const filteredPreviews = previews.filter(Boolean)

    return NextResponse.json(filteredPreviews)
  } catch (error) {
    console.error('❌ Failed to load chat previews:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
