// hooks/useChatSocket.ts
import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher-client'

export const useChatSocket = ({
  currentUserId,
  selectedUserId,
  onMessage,
}: {
  currentUserId: string
  selectedUserId: string
  onMessage: (message: any) => void
}) => {
  useEffect(() => {
    if (!currentUserId) return

    const channel = pusherClient.subscribe(`private-chat-${currentUserId}`)

    channel.bind('new-message', (data: any) => {
      // Optional: only show messages from the currently selected chat
      if (
        data.senderId === selectedUserId ||
        data.receiverId === selectedUserId
      ) {
        onMessage(data)
      }
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [currentUserId, selectedUserId])
}
