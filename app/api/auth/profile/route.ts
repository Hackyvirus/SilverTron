import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload || !payload.sub) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: payload.sub },
        select: { onboarded: true },
    });

    return NextResponse.json({ onboarded: profile?.onboarded ?? false });
}
