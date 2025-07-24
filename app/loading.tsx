'use client'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-700">
      <div className="w-12 h-12 border-4 border-[rgb(25,25,25)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium">Loading...</p>
    </div>
  )
}
