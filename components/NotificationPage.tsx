'use client'

import { useEffect, useState } from 'react'
import { Bell, UserPlus, FileText, MessageCircle, RefreshCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Notification = {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
  senderId: string
  recipientId: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNotifications = async () => {
    try {
      setRefreshing(true)

      const profileRes = await fetch('/api/auth/get-profile', {
        credentials: 'include',
      })

      if (!profileRes.ok) throw new Error('Failed to get profile')

      const profile = await profileRes.json()
      setRole(profile.role)

      const notificationRes = await fetch(
        profile.role === 'admin' ? '/api/admin/notifications' : '/api/user/notifications',
        {
          credentials: 'include',
        }
      )

      if (!notificationRes.ok) throw new Error('Failed to get notifications')

      const data = await notificationRes.json()
      setNotifications(data.notifications)
    } catch (err: any) {
      console.error('❌ Notification error:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAllAsRead = async () => {
    setMarkingAsRead(true)
    try {
      const res = await fetch('/api/auth/mark-all-read', {
        method: 'PATCH',
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to mark notifications as read')

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      )
    } catch (err) {
      console.error('❌ Error marking notifications as read:', err)
    } finally {
      setMarkingAsRead(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'New User':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'Form Submission':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'Message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  if (loading) {
    return <p className="text-center text-muted-foreground mt-10">Loading notifications...</p>
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <div className="flex gap-2">
          <Button onClick={fetchNotifications} variant="outline" className='w-auto cursor-pointer' disabled={refreshing}>
            {refreshing ? 'Refreshing...' : (
              <>
                <RefreshCcw className="w-auto h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button onClick={markAllAsRead} className='cursor-pointer' disabled={markingAsRead}>
            {markingAsRead ? 'Marking...' : 'Mark all as read'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="divide-y px-0">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-6 py-4 ${!n.isRead ? 'bg-gray-50' : ''}`}
              >
                <div>{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm">{n.message}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {!n.isRead && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <Badge variant="default">New</Badge>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
