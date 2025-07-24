'use client'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import logo from '@/public/optitaxs-h-logo.png'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset successful. Redirecting to login...')
      setTimeout(() => router.push('/auth/login'), 3000)
    }
  }

  return (
    <section className='w-full h-full bg-white flex'>
      <div className='w-1/2 h-dvh register-left-div p-8 justify-between flex-col flex items-start'>
        <Image src={logo} alt="Logo" width={200} height={60} />
        <h2 className='register-text gradient-text'>
          Set a new password<br />to regain access to your account.
        </h2>
      </div>

      <div className="bg-white w-1/2 h-dvh flex justify-center flex-col items-center">
        <form onSubmit={handleSubmit} className='w-[400px] h-max mx-auto my-3'>
          <h2 className='font-medium text-[28px] Poppins'>Reset Password</h2>

          <div className="grid w-full max-w-sm items-center gap-3 my-4">
            <Label htmlFor="password">New Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-3 my-4">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

          <Button type="submit" variant="default" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </section>
  )
}

export default ResetPassword
