import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)

  try {
    console.log('🧪 Token to verify:', token)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (err) {
    console.error('JWT verification failed:', err)
    return null
  }
}


export async function getCurrentUser(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const token = cookie
    .split(';')
    .find(c => c.trim().startsWith('token='))
    ?.split('=')[1];

  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}