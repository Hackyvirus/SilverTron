'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import logo from '@/public/optitaxs-h-logo.png'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Register = () => {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMsg('')

    if (!userName || !email || !phone || !password) {
      setError("Please fill in all fields.")
      return
    }

    setIsSubmitting(true)
    setLoadingStep("Creating admin account...")

    try {
      const UserData = {
        username: userName,
        email: email,
        phone: phone,
        password: password,
        role: 'admin'
      }

      const result = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserData })
      })

      const response = await result.json()

      if (!result.ok) {
        throw new Error(response.message || 'Admin registration failed')
      } else {
        setLoadingStep("Admin account created! Redirecting...")
        setMsg('✅ Admin account registered successfully. Redirecting to login...')

        setUserName("")
        setEmail("")
        setPhone("")
        setPassword("")

        setTimeout(() => {
          setLoadingStep("Loading login page...")
          router.push('/auth/admin/login')
        }, 1500)
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.')
      setLoadingStep("")
    } finally {
      if (error) {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <section className="w-full min-h-screen flex flex-col-reverse lg:flex-row bg-white">
      {/* Left */}
      <div className="register-left-div w-full lg:w-1/2 p-8 flex flex-col justify-between items-start text-white">
        <Image src={logo} alt="Logo" width={200} height={60} />
        <h2 className="register-text gradient-text">
          Welcome.<br />Start your journey now with our management system!
        </h2>
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-10">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md space-y-5"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center Poppins">Create Admin Account</h2>

          <div>
            <Label htmlFor="username">Admin Name</Label>
            <Input
              id="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter admin name"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className='mb-2'>Admin Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className='mb-2'>Phone Number</Label>
            <Input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className='mb-2'>Admin Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create admin password"
              disabled={isSubmitting}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {msg && <p className="text-green-600 text-sm">{msg}</p>}

          {loadingStep && (
            <div className="flex items-center gap-2 text-blue-600 my-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">{loadingStep}</span>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                {loadingStep.includes('Redirecting') || loadingStep.includes('Loading') ? 'Redirecting...' : 'Creating Admin...'}
              </div>
            ) : (
              "Register as Admin"
            )}
          </Button>

          <div className="text-center text-sm mt-4 space-y-2">
            <p>
              Already have an admin account?{' '}
              <Link
                href="/auth/admin/login"
                className={`text-[#1570EF] hover:underline ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Register
