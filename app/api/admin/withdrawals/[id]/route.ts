import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await the params in Next.js 15
  const { id } = await params;
  const withdrawalId = id;

  try {
    const { action, amount } = await req.json();
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const adminId = payload.userId as string;

    const existing = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: {
        profile: {
          include: {
            user: true, // We need user.id to notify
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Withdrawal not found' }, { status: 404 });
    }

    if (existing.status !== 'pending') {
      return NextResponse.json({ message: 'Request already processed' }, { status: 400 });
    }

    const recipientId = existing.profile.user.id;
    let updated;

    if (action === 'approve') {
      updated = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          amount: amount ?? existing.amount,
        },
      });

      // ✅ Send approval notification to user
      await prisma.notification.create({
        data: {
          type: 'Withdrawal Approval',
          message: `Your withdrawal of ₹${updated.amount} has been approved.`,
          senderId: adminId,
          recipientId,
        },
      });

      return NextResponse.json(updated);
    }

    if (action === 'reject') {
      updated = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'rejected',
          reviewedAt: new Date(),
        },
      });

      // ✅ Send rejection notification to user
      await prisma.notification.create({
        data: {
          type: 'Withdrawal Rejection',
          message: `Your withdrawal request of ₹${existing.amount} has been rejected.`,
          senderId: adminId,
          recipientId,
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('PATCH error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}