import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // 1. Get current user from token
    const user = await getCurrentUser(req)
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get the user's profile
    const profile = await prisma.profile.findFirst({
      where: { userId: user.userId },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profileId = profile.id

    // 3. Fetch all 4 performance types for the user's profile
    const [eq, op, intraday, total] = await Promise.all([
      prisma.equityPerformance.findMany({
        where: { profileId },
        include: { profile: true },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.optionsPerformance.findMany({
        where: { profileId },
        include: { profile: true },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.intradayPerformance.findMany({
        where: { profileId },
        include: { profile: true },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.totalPerformance.findMany({
        where: { profileId },
        include: { profile: true },
        orderBy: { recordedAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      data: {
        eq,
        op,
        in: intraday,
        total,
      },
    })
  } catch (error) {
    console.error('❌ Error fetching user analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
