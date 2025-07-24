'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

type Profile = {
  fullName: string
  passportNumber: string
  currentAddress: string
  permanentAddress: string
  alternateContactNumber: string
  dateOfBirth: string
  panNumber: string
  aadhaarNumber: string
  educationDetails: string
  bloodGroup: string
  phoneNumber: string
  email: string
  photoFileName: string
  share?: string
  onboarded?: string
  accountNumber?: string
  role?: string
}

const defaultData: Profile = {
  fullName: '',
  passportNumber: '',
  currentAddress: '',
  permanentAddress: '',
  alternateContactNumber: '',
  dateOfBirth: '',
  panNumber: '',
  aadhaarNumber: '',
  educationDetails: '',
  bloodGroup: '',
  phoneNumber: '',
  email: '',
  photoFileName: '',
}

export default function MyAccountPage() {
  const [formData, setFormData] = useState<Profile>(defaultData)
  const [originalData, setOriginalData] = useState<Profile>(defaultData)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    refreshProfile()
  }, [])

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  const getToken = () => {
    return getCookie('token') || localStorage.getItem('token')
  }

  const refreshProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/get-profile', {
        method: 'GET',
        credentials: 'include',
      })
      console.log('res', res)

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error('Expected JSON but got: ' + text)
      }
      const data = await res.json()
      const formattedDate = data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split('T')[0]
        : ''
      console.log('data', data)
      setFormData({
        ...data,
        dateOfBirth: formattedDate,
      })
      setOriginalData({
        ...data,
        dateOfBirth: formattedDate,
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })


      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = 'Failed to update profile'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      toast.success('Profile updated successfully!')
      setOriginalData(formData)
      setEditMode(false)

    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    toast.success('Logged out successfully')
    window.location.href = '/auth/user/login'
  }

  const handleCancel = () => {
    setFormData(originalData)
    setEditMode(false)
  }

  if (loading)
    return <p className="text-center text-lg mt-10 text-gray-600">Loading profile...</p>

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <Card className="shadow-md border rounded-2xl">
        <CardContent className="p-6 md:p-10">

          <div className="flex flex-col items-center justify-center gap-4 mb-8 text-center">
            {formData.photoFileName && (
              <Image
                src={formData.photoFileName}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-gray-300 object-cover"
              />
            )}

            <h2 className="text-3xl font-bold">My Account</h2>
            <span className="text-blue-600">{formData.role || 'N/A'}</span>
            <p className="text-muted-foreground text-sm">Manage your personal information</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-center text-sm text-gray-600">
              {/* Show private info only if NOT admin */}
              {formData.role !== 'admin' && (
                <>
                  <div>
                    <span className="font-semibold">Account Number:</span>{' '}
                    {formData.accountNumber || <span className="text-yellow-600">Pending</span>}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{' '}
                    {formData.accountNumber && formData.share ? (
                      <span className="text-green-600">Approved</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Share:</span>{' '}
                    {formData.share || <span className="text-yellow-600">Pending</span>}
                  </div>
                </>
              )}
              {/* Always show role */}

            </div>

          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'fullName', label: 'Full Name' },
              { id: 'passportNumber', label: 'Passport Number' },
              { id: 'currentAddress', label: 'Current Address' },
              { id: 'permanentAddress', label: 'Permanent Address' },
              { id: 'phoneNumber', label: 'Primary Contact Number' },
              { id: 'alternateContactNumber', label: 'Alternate Contact Number' },
              { id: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
              { id: 'email', label: 'Email', type: 'email', disabled: true },
              { id: 'panNumber', label: 'PAN Number' },
              { id: 'aadhaarNumber', label: 'Aadhaar Number' },
              { id: 'bloodGroup', label: 'Blood Group' },
              { id: 'educationDetails', label: 'Education Details' },
            ].map(({ id, label, type = 'text', disabled = false }) => (
              <div key={id}>
                <Label htmlFor={id} className="font-semibold">
                  {label}
                </Label>
                <Input
                  id={id}
                  type={type}
                  value={formData[id as keyof Profile] ?? ''}
                  onChange={handleChange}
                  disabled={disabled || !editMode}
                />
              </div>
            ))}

            <div className="col-span-full flex flex-col-reverse sm:flex-row justify-between items-center mt-8 gap-4">
              <div>
                {editMode ? (
                  <div className="flex gap-4">
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save
                    </Button>
                    <Button variant="outline" type="button" onClick={handleCancel} disabled={submitting}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button type="button" className="cursor-pointer" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
              <Button variant="destructive" className="cursor-pointer" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
