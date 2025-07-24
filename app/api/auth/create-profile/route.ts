import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { username, email, phone, password, role } = body.UserData || {}

    if (!username || !email || !phone || !password || !role) {
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      )
    }
    const user = await prisma.user.findUnique({ where: { email: email } })

    if (user) {
      return Response.json({ message: 'User Already exist with email' }, { status: 500 })
    }


    console.log('Registering user:', { username, email, phone, role })


    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({ data: { email: email, passwordHash: hashedPassword } })

    if (!newUser) {
      return Response.json({ message: 'error while creating User' }, { status: 501 })
    }

    const NewProfile = await prisma.profile.create({
      data: {
        userId: newUser.id,
        email: newUser.email,
        fullName: username,
        phoneNumber: phone,
        role: role
      }
    })

    if (!NewProfile) {
      return Response.json({ message: 'Error while createing User' }, { status: 501 })
    }

    // Return success
    return NextResponse.json(
      { message: 'User registered successfully.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    )
  }
}
