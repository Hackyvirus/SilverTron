// app/api/onboard/route.ts
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const user = await getCurrentUser(req)
  console.log('user',user)
  console.log('userROle',user?.role)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const pendingRequests = await prisma.onboardingRequest.findMany({
      where: { status: 'pending' },
    })

    return NextResponse.json(pendingRequests)
  } catch (error) {
    console.error('Error fetching onboarding requests:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
