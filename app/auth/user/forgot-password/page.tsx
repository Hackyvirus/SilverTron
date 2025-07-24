'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import logo from '@/public/optitaxs-h-logo.png'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('A password reset link has been sent to your email.')
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <section className='w-full h-full bg-white flex'>
      <div className='w-1/2 h-dvh register-left-div p-8 justify-between flex-col flex items-start'>
        <Image src={logo} alt="Logo" width={200} height={60} />
        <h2 className='register-text gradient-text'>
          Forgot Password?<br />We’ll help you reset it quickly!
        </h2>
      </div>

      <div className="bg-white w-1/2 h-dvh flex justify-center flex-col items-center">
        <form onSubmit={handleRequestSubmit} className='w-[400px] h-max mx-auto my-3'>
          <h2 className='font-medium text-[28px] Poppins'>Forgot Password</h2>

          {!submitted ? (
            <>
              <div className="grid w-full max-w-sm items-center gap-3 my-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button type="submit" variant="default">Send Reset Link</Button>
            </>
          ) : (
            <p className='text-green-600'>{message}</p>
          )}
        </form>

        <div className='flex flex-col gap-2 text-center mt-4'>
          <p>
            Remembered your password?{' '}
            <Link href='/auth/login' className='text-[#1570EF] hover:underline'>Login</Link>
          </p>
          <p>
            Don’t have an account?{' '}
            <Link href='/auth/register' className='text-[#1570EF] hover:underline'>Sign Up</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ForgotPassword
