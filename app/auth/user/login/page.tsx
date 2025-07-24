'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import logo from '@/public/optitaxs-h-logo.png'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const Login = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!identifier || !password) {
      setError('Email and Password are required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        toast.error(data.message || 'Login failed')
      } else {
        if (!data.token) {
          setError('No token received from server')
          toast.error('Login failed - no token received')
          return
        }

        localStorage.setItem('token', data.token)
        const role = data?.user?.role
        toast.success('Login successful!')

        if (role === 'admin') {
          router.push('/dashboard/admin')
        } else if (role === 'employee') {
          router.push('/dashboard/user')
        } else {
          setError('Unknown user role')
          toast.error('Unknown user role')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full min-h-screen flex flex-col-reverse lg:flex-row">
      {/* LEFT SIDE */}
      <div className="register-left-div w-full lg:w-1/2 p-8 flex flex-col justify-between items-start text-white">
        <Image src={logo} alt="Logo" width={180} height={60} />
        <h2 className="register-text gradient-text">
          Welcome.<br />Start your journey now with our management system!
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-5 popins">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Login</h2>

          <div>
            <Label htmlFor="email" className='mb-2'>Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label className='mb-2' htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <div className="text-right mt-1">
              <Link href="/auth/user/forgot-password" className="text-sm text-[#1570EF] hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center text-sm">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/auth/user/register" className="text-[#1570EF] hover:underline">
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
