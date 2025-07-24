import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

// ✅ GET withdrawals list (for admin dashboard)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const withdrawals = await prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: {
            fullName: true,
            email: true,
            userId: true,
          },
        },
      },
    });

    return NextResponse.json(withdrawals);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
