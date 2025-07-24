'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md max-w-6xl mx-auto w-full">
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">Personal Information</h2>
      <p className="mb-6 text-gray-500 text-sm sm:text-base">Please fill out the registration form below.</p>

      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[
          { label: 'Full Name', placeholder: 'Enter your full name', type: "text" },
          { label: 'Passport Number', placeholder: 'Enter Passport Number', type: "number" },
          { label: 'Current Address', placeholder: 'Enter your current address' },
          { label: 'Primary Contact Number', placeholder: 'Enter primary contact number', type: "number" },
          { label: 'Permanent Address', placeholder: 'Enter your permanent address', type: "text" },
          { label: 'Alternate Contact Number', placeholder: 'Enter alternate contact number', type: "number" },
          { label: 'Date of Birth', placeholder: 'DD/MM/YYYY', type: "date" },
          { label: 'Email Address', placeholder: 'Enter your email', type: "email" },
          { label: 'PAN Number', placeholder: 'Enter PAN Number', hint: 'Available physical copy', type: "number" },
          { label: 'Aadhaar Number', placeholder: 'Enter Aadhaar Number', hint: 'Available physical copy', type: "number" },
        ].map((field, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Label>{field.label}</Label>
            <Input placeholder={field.placeholder} type={field.type} />
            {field.hint && <p className="text-xs text-gray-400">{field.hint}</p>}
          </div>
        ))}
        <div className="sm:col-span-2 flex justify-center mt-4">
          <Button type="submit">Submit</Button>
        </div>
      </form>

      <div className="mt-12 p-4 sm:p-6 bg-gradient-to-r from-[#d3ccff] to-[#f0d0f0] rounded-xl text-center">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Engage with our AI assistant</h3>
        <Button variant="default">Ask Me Anything</Button>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-400">
        <p>© 2025</p>
        <div className="flex flex-wrap justify-center gap-4 mt-1">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </div>
  )
}
