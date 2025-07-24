'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import logo from '@/public/optitaxs-h-logo.png'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Login = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loadingStep, setLoadingStep] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setLoadingStep('Authenticating admin...')

    if (!identifier || !password) {
      setError('Email and Password are required')
      setLoading(false)
      setLoadingStep('')
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        setLoadingStep('')
      } else {
        setLoadingStep('Verifying admin credentials...')
        const role = data?.user?.role

        setLoadingStep('Login successful! Redirecting...')

        setTimeout(() => {
          if (role === 'admin') {
            setLoadingStep('Loading admin dashboard...')
            router.push('/dashboard/admin')
          } else if (role === 'employee') {
            setLoadingStep('Loading user dashboard...')
            router.push('/dashboard/user')
          } else {
            setError('Unknown user role')
            setLoadingStep('')
          }
        }, 1000)
      }
    } catch (err) {
      setError('Something went wrong')
      console.error('Login error:', err)
      setLoadingStep('')
    } finally {
      if (error || loadingStep === '') {
        setLoading(false)
      }
    }
  }

  return (
    <section className="w-full min-h-screen flex flex-col-reverse lg:flex-row bg-white">
      {/* Left Section */}
      <div className="register-left-div w-full lg:w-1/2 p-8 flex flex-col justify-between items-start text-white">
        <Image src={logo} alt="Logo" width={200} height={60} />
        <h2 className="register-text gradient-text">
          Welcome.<br />Start your journey now with our management system!
        </h2>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-5">
          <h2 className="text-2xl font-semibold text-gray-800 text-center Poppins">Admin Login</h2>

          <div>
            <Label htmlFor="email" className='mb-2'>Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your admin email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className='mb-2'>Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <div className="text-right mt-1">
              <Link
                href="/auth/user/forgot-password"
                className={`text-sm text-[#1570EF] hover:underline ${loading ? 'pointer-events-none opacity-50' : ''}`}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          {loadingStep && (
            <div className="flex items-center gap-2 text-blue-600 my-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">{loadingStep}</span>
            </div>
          )}

          <Button type="submit" variant="default" disabled={loading} className="w-full">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                {loadingStep.includes('Redirecting') || loadingStep.includes('Loading') ? 'Redirecting...' : 'Logging in...'}
              </div>
            ) : (
              'Login as Admin'
            )}
          </Button>

          <div className="text-center text-sm mt-4">
            <p>
              Don't have an account?{' '}
              <Link
                href="/auth/admin/register"
                className={`text-[#1570EF] hover:underline ${loading ? 'pointer-events-none opacity-50' : ''}`}
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Login
