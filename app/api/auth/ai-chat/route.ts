import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'



export async function POST(req: NextRequest) {
  try {
    // 1. Get current user from token
    const user = await getCurrentUser(req)
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get the user's profile
    const profile = await prisma.profile.findFirst({
      where: { userId: user.userId }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profileId = profile.id
    const profileRole = profile.role

    const { messages } = await req.json()

    // Define company-specific system instructions
    const systemPrompt = {
      role: 'system',
      content: `
You are a helpful assistant for Optitaxs LLP. Here's some company info:
- We are a software development firm based in New York.
- Our working hours are 9 AM to 6 PM, Monday to Friday.
- Employees get 20 days of paid leave per year.
- We use Slack and Jira for internal communication.
- For HR queries, email hr@xyzcorp.com.

Always answer questions based on this context.
      `.trim(),
    }

    // Combine system message with user message history
    const messagesWithSystem = [systemPrompt, ...messages]

    // Save user messages to DB
    for (const m of messages.filter((m: any) => m.role === 'user')) {
      await prisma.aiChatHistory.create({
        data: {
          userId: profileId,
          role: 'user',
          message: m.content,
        },
      })
    }

    // Call OpenAI API
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messagesWithSystem,
        temperature: 0.7,
      }),
    })

    const contentType = openaiRes.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const rawText = await openaiRes.text()
      console.error('Non-JSON response from OpenAI:', rawText)
      return NextResponse.json({ error: 'Unexpected response from OpenAI' }, { status: 500 })
    }

    const data = await openaiRes.json()
    const assistantReply = data?.choices?.[0]?.message?.content

    if (assistantReply) {
      // Save assistant message to DB
      await prisma.aiChatHistory.create({
        data: {
          userId: profileId,
          role: 'assistant',
          message: assistantReply,
        },
      })

      return NextResponse.json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: assistantReply,
            },
          },
        ],
      })
    }

    return NextResponse.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'No response from AI.',
          },
        },
      ],
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
