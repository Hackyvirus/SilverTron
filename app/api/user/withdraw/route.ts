import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  console.log('user', user)
  console.log('userRole', user?.role)
  
  if (!user || !user.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
 
  const userId = user.userId
  const formData = await req.formData()
  const amountRaw = formData.get('amount')
  const reason = (formData.get('reason') as string) || ''
  const amount = parseFloat(amountRaw as string)
  
  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
  }
  
  const profile = await prisma.profile.findUnique({
    where: { userId },
  })
  
  if (!profile) {
    return NextResponse.json({ message: 'Profile not found' }, { status: 404 })
  }
  
  const newRequest = await prisma.withdrawalRequest.create({
    data: {
      profileId: profile.id,
      amount,
      reason,
    },
  })
  
  const adminUsers = await prisma.user.findMany({
    where: {
      profile: {
        role: 'admin',
      },
    },
    include: {
      profile: true,
    },
  })
  
  await Promise.all(
    adminUsers.map((admin) =>
      prisma.notification.create({
        data: {
          type: 'withdrawal_request',
          message: `💰 New withdrawal request of $${amount} submitted by ${profile.fullName || 'a user'}.`,
          senderId: profile.userId,
          recipientId: admin.id,
        },
      })
    )
  )
  
  return NextResponse.json({
    message: 'Withdrawal request submitted successfully',
    withdrawal: newRequest,
  })
}