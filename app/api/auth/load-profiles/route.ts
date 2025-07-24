import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.get('authorization')?.replace('Bearer ', '')

    // If not in header, check cookies
    if (!token) {
      token = req.cookies.get('token')?.value
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyJWT(token) as { userId: string; role: string }

    // Optional: Only allow access to admins
    // if (decoded.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    // Load all user profiles
    const profiles = await prisma.profile.findMany({
      include: { user: { select: { email: true } } } // optional: include related user data
    })

    return NextResponse.json(profiles)
  } catch (err) {
    console.error('Load profiles error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
