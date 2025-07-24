'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-4">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
      <h1 className="text-4xl font-semibold text-gray-800 mb-2">404 – Page Not Found</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2 bg-[rgb(25,25,25)] text-white rounded-lg hover:bg-white hover:text-[rgb(25,25,25)] transition"
      >
        Go back home
      </Link>
    </div>
  )
}
