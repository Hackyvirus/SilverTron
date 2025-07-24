// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: identifier },
    });
    console.log('profileuser', user)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Get JWT secret
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');

    // Get user profile for role
    const userProfile = await prisma.profile.findFirst({
      where: { userId: user.id },
    });
    console.log('userProfile', userProfile)
    console.log(' userProfile?.role || ', userProfile?.role || 'employee')

    // Create JWT token using jose
    const token = await new SignJWT({
      userId: user.id,
      role: userProfile?.role || 'employee',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode(secret));

    // Create response - NOW INCLUDING TOKEN
    const response = NextResponse.json({
      message: 'Login successful',
      token: token, // Add this line
      user: {
        id: user.id,
        email: user.email,
        role: userProfile?.role
      }
    });
        // Set cookie (keep this for additional security)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}