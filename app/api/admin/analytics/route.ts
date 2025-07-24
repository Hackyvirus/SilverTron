import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        console.log('++++++++++++++++++++++++++++==')
        // 1. Get current user from token
        const user = await getCurrentUser(req)
        if (!user || !user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Get the user's profile
        const profile = await prisma.profile.findFirst({
            where: { userId: user.userId }
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const profileId = profile.id
        const profileRole = profile.role
        if (profileRole !== 'admin') {
            return NextResponse.json({ error: 'Admin Request Only' }, { status: 404 })
        }


        // 3. Fetch all 4 performance types for the user's profile
        const [eq, op, intraday, total] = await Promise.all([
            prisma.equityPerformance.findMany({
                include: { profile: true },
                orderBy: { recordedAt: 'desc' },
            }),
            prisma.optionsPerformance.findMany({
                include: { profile: true },
                orderBy: { recordedAt: 'desc' },
            }),
            prisma.intradayPerformance.findMany({
                include: { profile: true },
                orderBy: { recordedAt: 'desc' },
            }),
            prisma.totalPerformance.findMany({
                include: { profile: true },
                orderBy: { recordedAt: 'desc' },
            }),
        ])
        console.log('[eq, op, intraday, total]', [eq, op, intraday, total])
        // Add pagination
        const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
        const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');

        // Add date filtering
        const startDate = req.nextUrl.searchParams.get('startDate');
        const endDate = req.nextUrl.searchParams.get('endDate');

        // Add caching headers
        return NextResponse.json({
            data: { eq, op, in: intraday, total },
            meta: { page, limit, total: eq.length }
        }, {
            headers: {
                'Cache-Control': 'public, max-age=60', // Cache for 1 minute
            }
        });
        // Add caching headers
        return NextResponse.json({
            data: { eq, op, in: intraday, total },
            meta: { page, limit, total: eq.length }
        }, {
            headers: {
                'Cache-Control': 'public, max-age=60', // Cache for 1 minute
            }
        });
    } catch (error) {
        console.error('❌ Error fetching user analytics:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
