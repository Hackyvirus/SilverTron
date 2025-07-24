'use client'

import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SendHorizonal, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type DecodedToken = {
  userId: string
  role: 'admin' | 'employee'
  exp: number
}

export default function ChatbotPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          "👋 Hello! I'm your company assistant. Ask me anything about policies, benefits, services, or general FAQs!",
      },
    ])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      const contentType = res.headers.get('content-type') || ''
      const rawText = await res.text()

      if (!contentType.includes('application/json')) {
        throw new Error('Server error: invalid content type')
      }

      const data = JSON.parse(rawText)

      if (data?.choices?.[0]?.message?.content) {
        setMessages((prev) => [...prev, data.choices[0].message])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '⚠️ Sorry, I couldn’t find an answer to that.' },
        ])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ An error occurred. Please try again later.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Card className="max-w-4xl mx-auto flex flex-col h-[90vh] shadow-md border rounded-2xl">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={clsx(
                  'rounded-2xl px-4 py-2 max-w-xs md:max-w-sm whitespace-pre-wrap text-sm shadow',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>

        <div className="bg-white p-4 border-t flex gap-2 items-center sticky bottom-0 z-10">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me about company FAQs..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <SendHorizonal className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}
