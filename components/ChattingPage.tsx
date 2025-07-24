'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  SendHorizonal,
  Search,
  User,
  MessageCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'
import { toast } from 'sonner'
import Pusher from 'pusher-js'
import type { Channel } from 'pusher-js'

type Profile = {
  id: string
  userId: string
  email: string
  fullName: string
  phoneNumber: string
  role: string
  photoFileName?: string
}

type ChatMessage = {
  id: string
  senderId: string
  receiverId: string
  message: string
  timestamp: string
  senderProfile?: Profile
  receiverProfile?: Profile
}

type ChatPreview = {
  userId: string
  profile: Profile
  lastMessage?: ChatMessage
  unreadCount: number
}

export default function FixedRealTimeChatPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [searchUsers, setSearchUsers] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasPermissionError, setHasPermissionError] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<Channel | null>(null)
  const pusherRef = useRef<Pusher | null>(null)
  const selectedUserIdRef = useRef<string>('')

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chat on mount
  useEffect(() => {
    initializeChat()

    // Cleanup function: Disconnect Pusher when the component unmounts
    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect()
        pusherRef.current = null
      }
      if (channelRef.current) {
        channelRef.current = null
      }
    }
  }, [])

  // Update ref when selectedUserId changes
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId
  }, [selectedUserId])

  // Setup Pusher subscription when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setupRealtimeSubscription(currentUser.userId)
    }
  }, [currentUser])

  // Initialize current user, load users, chat previews, and setup Pusher
  const initializeChat = async () => {
    try {
      const res = await fetch('/api/auth/get-profile', {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const user = await res.json()
      setCurrentUser(user)
      console.log('Current User Profile:', user);

      await loadUsers(user.userId)
      await loadChatPreviews(user.userId)
      setLoading(false)
    } catch (err) {
      console.error('Failed to initialize chat:', err)
      setHasPermissionError(true)
      setLoading(false)
    }
  }

  // Load all users except current user
  const loadUsers = async (currentUserId: string) => {
    try {
      const res = await fetch('/api/auth/load-profiles', {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load profiles')
      const allUsers: Profile[] = await res.json()
      const filtered = allUsers.filter(user => user.userId !== currentUserId);
      console.log('Loaded all users (excluding current):', filtered.map(u => u.userId));
      setUsers(filtered)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  // Load recent chat previews for current user
  const loadChatPreviews = async (userId: string) => {
    try {
      const res = await fetch(`/api/chat/previews?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load chat previews')
      const previews: ChatPreview[] = await res.json()
      console.log('Loaded chat previews:', previews.map(p => p.userId));
      setChatPreviews(previews)
    } catch (err) {
      console.error('Failed to load chat previews:', err)
    }
  }

  // Setup Pusher real-time subscription for current user
  const setupRealtimeSubscription = (userId: string) => {
    // Disconnect existing Pusher instance if any, to avoid multiple connections
    if (pusherRef.current) {
      pusherRef.current.disconnect()
      pusherRef.current = null
      channelRef.current = null
    }

    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.warn('Pusher environment variables not found, real-time features disabled')
      toast.error('Pusher configuration missing. Real-time chat disabled.')
      return
    }

    // Initialize Pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      forceTLS: true,
    })
    pusherRef.current = pusher

    const channelName = `user-${userId}`
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    // Bind to 'new-message' event for real-time message reception
    channel.bind('new-message', (data: ChatMessage) => {
      console.log('New message received:', data);
      console.log('Current selectedUserId from ref:', selectedUserIdRef.current);
      
      // Determine the other user in the conversation
      const otherUserId = data.senderId === userId ? data.receiverId : data.senderId;
      console.log('Other user in conversation:', otherUserId);
      
      // Update messages if this message involves the currently selected chat
      // Use the ref to get the current selectedUserId value
      const currentSelectedUserId = selectedUserIdRef.current;
      if (currentSelectedUserId === otherUserId) {
        console.log('Message is for current chat, adding to messages');
        setMessages(prev => {
          // Avoid duplicate messages
          if (prev.find(msg => msg.id === data.id)) {
            console.log('Duplicate message, skipping');
            return prev;
          }
          console.log('Adding message to current chat:', data);
          return [...prev, data];
        });
      } else {
        console.log('Message is not for current chat, currentSelectedUserId:', currentSelectedUserId, 'otherUserId:', otherUserId);
      }
      
      // Update chat previews - simplified logic
      setChatPreviews(prev => {
        const currentSelectedUserId = selectedUserIdRef.current;
        const existingChatIndex = prev.findIndex(chat => chat.userId === otherUserId);
        
        if (existingChatIndex >= 0) {
          // Update existing chat
          const updatedPreviews = [...prev];
          const shouldIncrementUnread = (otherUserId !== currentSelectedUserId) && (data.senderId !== userId);
          
          updatedPreviews[existingChatIndex] = {
            ...updatedPreviews[existingChatIndex],
            lastMessage: data,
            unreadCount: shouldIncrementUnread ? updatedPreviews[existingChatIndex].unreadCount + 1 : updatedPreviews[existingChatIndex].unreadCount,
          };
          
          return updatedPreviews;
        } else {
          // Create new chat preview if it doesn't exist
          const user = users.find(u => u.userId === otherUserId);
          if (user) {
            const shouldIncrementUnread = (otherUserId !== currentSelectedUserId) && (data.senderId !== userId);
            const newChatPreview = {
              userId: otherUserId,
              profile: user,
              lastMessage: data,
              unreadCount: shouldIncrementUnread ? 1 : 0,
            };
            return [...prev, newChatPreview];
          }
        }
        return prev;
      });
    });

    // Handle Pusher subscription errors
    channel.bind('pusher:subscription_error', (err: any) => {
      console.error('Pusher subscription error:', err)
      toast.error('Real-time connection failed')
      setHasPermissionError(true);
    })

    // Connection state changes
    pusher.connection.bind('state_change', (states: any) => {
      console.log('Pusher connection state:', states.current);
      if (states.current === 'disconnected' || states.current === 'unavailable') {
        toast.warning('Real-time connection lost. Attempting to reconnect...');
      } else if (states.current === 'connected') {
        toast.success('Real-time connection established.');
      }
    });
  }

  // Send message to selected user
  const sendMessage = async () => {
    if (!input.trim() || !selectedUserId || !currentUser || sending) return
    const messageText = input.trim()
    setInput('')
    setSending(true)

    // Optimistic UI update
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: ChatMessage = {
      id: tempMessageId,
      senderId: currentUser.userId,
      receiverId: selectedUserId,
      message: messageText,
      timestamp: new Date().toISOString(),
      senderProfile: currentUser,
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUserId,
          message: messageText,
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error?.error || 'Failed to send message')
      }
      
      const sentMessage = await res.json()

      // Replace optimistic message with actual message
      setMessages(prev =>
        prev.map(msg => (msg.id === tempMessageId ? sentMessage : msg))
      )

      // The real-time handler will update chat previews, so we don't need to do it here
      // unless real-time is not working for some reason
      toast.success('Message sent')
    } catch (err) {
      console.error('Send message error:', err)
      toast.error('Failed to send message')
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setInput(messageText); // Restore input
    } finally {
      setSending(false)
    }
  }

  // Load messages when a user is selected
  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId)
    setMessages([])

    try {
      const res = await fetch(`/api/chat/messages?userId=${userId}&currentUserId=${currentUser?.userId}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch messages')
      const history: ChatMessage[] = await res.json()
      setMessages(history)

      // Mark messages as read
      setChatPreviews(prev =>
        prev.map(chat =>
          chat.userId === userId
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      )
    } catch (err) {
      console.error('Load messages error:', err)
      toast.error('Failed to load chat history')
    }
  }

  // Filter users by search
  const filteredUsers = users.filter(
    user =>
      user.fullName.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUsers.toLowerCase())
  )

  // Selected user profile for chat header
  const selectedUser =
    users.find(u => u.userId === selectedUserId) ||
    chatPreviews.find(c => c.userId === selectedUserId)?.profile

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (hasPermissionError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Permission Denied</h3>
          <p className="text-gray-500 mb-4">
            Your account doesn't have permission to access the chat system.
            Please contact your administrator to configure the necessary database policies.
          </p>
          <Button onClick={initializeChat} className="mb-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <details className="text-left text-sm text-gray-600 mt-4">
            <summary className="cursor-pointer font-medium">Database Setup Required</summary>
            <p className="mt-2">
              The administrator needs to run the RLS policies for Profile and ChatMessage tables.
            </p>
          </details>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500 mb-4">Please log in to access the chat system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar with users and chat previews */}
      <aside className="w-80 border-r border-gray-300 flex flex-col">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search users..."
              value={searchUsers}
              onChange={e => setSearchUsers(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {/* All Users */}
          <h3 className="text-sm font-semibold px-4 pt-2 text-gray-500">All Users</h3>
          {filteredUsers.length === 0 ? (
            <p className="p-4 text-gray-500">No other users found.</p>
          ) : (
            filteredUsers.map(user => (
              <button
                key={`user-${user.userId}`}
                onClick={() => handleUserSelect(user.userId)}
                className={clsx(
                  'w-full flex items-center p-3 text-left hover:bg-gray-100 focus:outline-none border-b border-gray-100',
                  selectedUserId === user.userId && 'bg-blue-50 border-blue-200'
                )}
              >
                <User className="w-8 h-8 mr-3 text-gray-600 flex-shrink-0" />
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex flex-col flex-grow">
        <header className="p-4 border-b border-gray-300 flex items-center space-x-3 bg-white">
          {selectedUser ? (
            <>
              <User className="w-8 h-8 text-gray-600 flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <h2 className="text-lg font-semibold truncate">{selectedUser.fullName}</h2>
                <p className="text-sm text-gray-500 truncate">{selectedUser.email}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a user to start chatting</p>
          )}
        </header>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && selectedUser ? (
            <p className="text-center text-gray-400">No messages yet. Say hello!</p>
          ) : (
            messages.map(msg => {
              const isSender = msg.senderId === currentUser?.userId
              return (
                <div
                  key={msg.id}
                  className={clsx(
                    'flex',
                    isSender ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm',
                      isSender
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={clsx(
                      'text-xs mt-1',
                      isSender ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        {selectedUser && (
          <form
            className="p-4 border-t border-gray-300 bg-white"
            onSubmit={e => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={sending}
                className="flex-grow"
                autoFocus
              />
              <Button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-4"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <SendHorizonal className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}