// File: /app/api/aprovedeny/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminId = user.userId

    // 1. Get admin's profile
    const profile = await prisma.profile.findFirst({
      where: { userId: adminId }
    })

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin Request Only' }, { status: 403 })
    }

    const body = await req.json()
    const { id, status, share, accountNumber } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Update onboarding request
    const updated = await prisma.onboardingRequest.update({
      where: { id },
      data: {
        status,
        share: status === 'approved' ? share : null,
        accountNumber: status === 'approved' ? accountNumber : null,
      },
    })

    // 3. Update user profile (if approved)
    const updatedProfile = await prisma.profile.update({
      where: { userId: updated.userId },
      data: {
        share: status === 'approved' ? share : null,
        accountNumber: status === 'approved' ? accountNumber : null,
      },
    })

    // 4. Create notification for the user
    const message =
      status === 'approved'
        ? `Your onboarding request has been approved.`
        : `Your onboarding request has been rejected.`

    await prisma.notification.create({
      data: {
        type: 'Onboarding',
        message,
        senderId: adminId,
        recipientId: updated.userId,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PATCH /aprovedeny]', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
