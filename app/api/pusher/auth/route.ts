import { NextRequest, NextResponse } from 'next/server'
import Pusher from 'pusher'

// Init Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { socket_id, channel_name } = body

  // ✅ Optional: Add your own auth logic here (e.g. Supabase or NextAuth session check)

  if (!socket_id || !channel_name) {
    return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 })
  }

  try {
    const authResponse = pusher.authenticate(socket_id, channel_name)
    return NextResponse.json(authResponse)
  } catch (err) {
    console.error('Pusher auth error:', err)
    return NextResponse.json({ error: 'Pusher auth failed' }, { status: 500 })
  }
}
