// app/api/auth/onboarding/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest) {
  try {
    // ✅ Step 1: Verify JWT from cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    let payload;
    try {
      payload = await jwtVerify(token, new TextEncoder().encode(secret));
    } catch (err) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.payload.userId as string;

    // ✅ Step 2: Parse FormData
    const formData = await req.formData();

    const file = formData.get('photo') as File;
    const fields = {
      fullName: formData.get('fullName') as string,
      passportNumber: formData.get('passportNumber') as string,
      currentAddress: formData.get('currentAddress') as string,
      primaryContactNumber: formData.get('primaryContactNumber') as string,
      permanentAddress: formData.get('permanentAddress') as string,
      alternateContactNumber: formData.get('alternateContactNumber') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      panNumber: formData.get('panNumber') as string,
      aadhaarNumber: formData.get('aadhaarNumber') as string,
      educationDetails: formData.get('educationDetails') as string,
      bloodGroup: formData.get('bloodGroup') as string,
    };

    // ✅ Step 3: Upload to Cloudinary (if file provided)
    let photoUrl: string | null = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'profile-pictures',
            public_id: `user-${userId}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      photoUrl = (result as any).secure_url;
    }

    // ✅ Step 4: Update profile in DB
    const currentProfile = await prisma.profile.update({
      where: { userId },
      data: {
        fullName: fields.fullName,
        passportNumber: fields.passportNumber,
        currentAddress: fields.currentAddress,
        phoneNumber: fields.primaryContactNumber,
        permanentAddress: fields.permanentAddress,
        alternateContactNumber: fields.alternateContactNumber,
        dateOfBirth: fields.dateOfBirth ? new Date(fields.dateOfBirth) : undefined,
        panNumber: fields.panNumber,
        aadhaarNumber: fields.aadhaarNumber,
        educationDetails: fields.educationDetails,
        bloodGroup: fields.bloodGroup,
        photoFileName: photoUrl || undefined,
        onboarded: true,
      },
    });

    // ✅ Step 4.1: Fetch profile and check role
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { role: true }
    });

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    const isAdmin = profile.role === 'admin';

    //  Fetch user's email from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ✅ Step 5: Create OnboardingRequest only if user is not an admin
    if (!isAdmin) {
      await prisma.onboardingRequest.create({
        data: {
          userId,
          email: user.email,
          fullName: fields.fullName,
          passportNumber: fields.passportNumber || null,
          currentAddress: fields.currentAddress || null,
          permanentAddress: fields.permanentAddress || null,
          alternateContactNumber: fields.alternateContactNumber || null,
          primaryContactNumber: fields.primaryContactNumber || null,
          dateOfBirth: fields.dateOfBirth ? new Date(fields.dateOfBirth) : null,
          panNumber: fields.panNumber || null,
          aadhaarNumber: fields.aadhaarNumber || null,
          educationDetails: fields.educationDetails || null,
          bloodGroup: fields.bloodGroup || null,
          photoFileName: photoUrl || null,
        },
      });
    }

    // ✅ Step 6: Notify Admins
    // ✅ Step 6: Notify Admins
    const admins = await prisma.profile.findMany({
      where: { role: 'admin' },
      select: {
        user: {
          select: { id: true }
        }
      }
    });

    console.log('admins', admins);

    if (admins.length > 0) {
      await Promise.all(
        admins.map((admin) =>
          prisma.notification.create({
            data: {
              type: 'Form Submission',
              message: `New onboarding submitted by ${fields.fullName}`,
              senderId: userId,
              recipientId: admin.user.id,
            },
          })
        )
      );
    } else {
      console.log('No admin users found to notify');
    }

    return NextResponse.json({ message: 'Profile updated successfully' });

  } catch (err) {
    console.error('Onboarding Error:', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
