// app/api/user/profile-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    console.log('tokentoken', token);

    if (!token) {
        return NextResponse.json({ onboarded: false }, { status: 401 });
    }

    try {
        const payload = await verifyJWT(token);
        console.log('payload', payload);

        // Type guard: handle null or missing userId
        if (!payload || !('userId' in payload)) {
            return NextResponse.json({ onboarded: false }, { status: 403 });
        }

        const userId = payload.userId as string;
        console.log('userId', userId);

        const profile = await prisma.profile.findUnique({
            where: { userId },
            select: { onboarded: true },
        });

        console.log('profile', profile);
        return NextResponse.json({ onboarded: profile?.onboarded ?? false });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ onboarded: false }, { status: 500 });
    }
}
