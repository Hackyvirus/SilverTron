import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findFirst({
      where: { userId: user.userId },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    })

    const latestWithdrawal = withdrawals[0] ?? null

    return NextResponse.json({
      latestWithdrawal,
      allWithdrawals: withdrawals,
    })
  } catch (error) {
    console.error('❌ Error fetching withdrawals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
