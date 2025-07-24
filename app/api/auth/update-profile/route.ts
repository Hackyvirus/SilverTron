// app/api/auth/update-profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)

    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the profile for the logged-in user
    const profile = await prisma.profile.findFirst({
      where: { userId: user.userId }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await req.json()

    const updatedUser = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        fullName: body.fullName,
        passportNumber: body.passportNumber,
        currentAddress: body.currentAddress,
        permanentAddress: body.permanentAddress,
        alternateContactNumber: body.alternateContactNumber,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        panNumber: body.panNumber,
        aadhaarNumber: body.aadhaarNumber,
        educationDetails: body.educationDetails,
        bloodGroup: body.bloodGroup,
        phoneNumber: body.phoneNumber,
        photoFileName: body.photoFileName,
      },
    })

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser })
  } catch (err) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
