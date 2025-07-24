'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type OnboardingRequest = {
  id: string
  userId: string
  fullName: string
  email: string
  status: string
  share: number | ''
  accountNumber: string | null
  submittedAt: string
}


export default function AdminUsersPage() {
  const [requests, setRequests] = useState<OnboardingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  // Fetch onboarding requests on mount
  useEffect(() => {
    const fetchOnboardingRequests = async () => {
      try {
        const res = await fetch('/api/admin/onboard', {
          method: 'GET',
          credentials: 'include'
        })

        console.log('res', res)
        if (!res.ok) {
          const errorData = await res.json()
          console.error('Fetch onboarding requests error:', errorData)
          throw new Error(`HTTP error! status: ${res.status} - ${errorData.error || 'Unknown error'}`)
        }

        const data = await res.json()

        // Filter for pending requests only
        const pendingRequests = data.filter((req: any) => req.status === 'pending')

        setRequests(
          pendingRequests.map((req: any) => ({
            id: req.id,
            userId: req.userId,
            fullName: req.fullName,
            email: req.email,
            status: req.status,
            share: req.share ?? '',
            accountNumber: req.accountNumber ?? null,
            submittedAt: req.submittedAt,
          }))
        )
      } catch (error) {
        console.error('Failed to fetch onboarding requests:', error)
        toast.error(`Failed to fetch onboarding requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOnboardingRequests()
  }, [])

  const updateShare = (id: string, value: number | '') => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, share: value } : request
      )
    )
  }

  const updateAccountNumber = (id: string, value: string) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, accountNumber: value } : request
      )
    )
  }

  const removeRequest = (id: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== id))
  }

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const request = requests.find((req) => req.id === id)
    if (!request) {
      toast.error('Request not found')
      return
    }

    // Validation for approval
    if (action === 'approved') {
      if (request.share === '' || request.share <= 0) {
        toast.error('Please enter a valid share percentage')
        return
      }
      if (!request.accountNumber || request.accountNumber.trim() === '') {
        toast.error('Please enter an account number')
        return
      }
    }

    setProcessing(id)

    try {
      const requestBody = {
        id: request.id,
        userId: request.userId,
        share: action === 'approved' ? request.share : null,
        accountNumber: action === 'approved' ? request.accountNumber : null,
        status: action,
      }

      console.log('Request body:', requestBody)

      const res = await fetch('/api/aprovedeny', {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('API error response:', errorData)
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

      const result = await res.json()
      console.log('API success response:', result)

      if (result.success) {
        toast.success(`Request ${action} successfully`)
        removeRequest(id)
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error)
      toast.error(`Failed to ${action} request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Pending Access Requests</h2>
        <p className="text-sm text-muted-foreground">
          Review and approve or reject onboarding requests from users
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-2">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No pending requests to review.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
                <div className="flex-1">
                  <p className="font-medium">{request.fullName}</p>
                  <p className="text-sm text-muted-foreground">{request.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex flex-col items-start">
                    <Label htmlFor={`share-${request.id}`} className="text-xs mb-1">Share (%)</Label>
                    <Input
                      id={`share-${request.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={request.share === '' ? '' : request.share.toString()}
                      className="w-24"
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          updateShare(request.id, '')
                        } else {
                          const parsed = parseInt(val)
                          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                            updateShare(request.id, parsed)
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="flex flex-col items-start">
                    <Label htmlFor={`acc-${request.id}`} className="text-xs mb-1">Account No.</Label>
                    <Input
                      id={`acc-${request.id}`}
                      type="text"
                      value={request.accountNumber || ''}
                      className="w-40"
                      onChange={(e) => {
                        updateAccountNumber(request.id, e.target.value)
                      }}
                    />
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAction(request.id, 'approved')}
                      disabled={
                        processing === request.id ||
                        request.share === '' ||
                        request.share <= 0 ||
                        !request.accountNumber ||
                        request.accountNumber.trim() === ''
                      }
                    >
                      {processing === request.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(request.id, 'rejected')}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}