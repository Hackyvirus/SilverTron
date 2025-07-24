import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// ✅ Ensure JWT secret is available
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables.')
}

// ✅ Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/auth/user/login',
  '/auth/user/register',
  '/auth/admin/login',
  '/auth/admin/register',
  '/unauthorized',
]

// ✅ Route check helpers
const isAdminRoute = (pathname: string) => pathname.startsWith('/dashboard/admin')
const isUserRoute = (pathname: string) => pathname.startsWith('/dashboard/user')
const isChatbotRoute = (pathname: string) => pathname === '/chatbot'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log('🔒 Middleware hit for:', pathname)

  // 1. Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // 2. Get token from HttpOnly cookie
  const token = request.cookies.get('token')?.value
  console.log('🪙 Token in cookie:', token)

  // 3. Redirect if token is missing
  if (!token) {
    const loginPath = isAdminRoute(pathname)
      ? '/auth/admin/login'
      : '/auth/user/login'
    return NextResponse.redirect(new URL(loginPath, request.url))
  }

  try {
    // 4. Verify JWT
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // 5. Validate token structure
    if (!payload || typeof payload.role !== 'string') {
      throw new Error('Invalid token payload')
    }

    const { role } = payload
    console.log('🔑 User role from token:', role)

    // 6. Allow chatbot for any authenticated user
    if (isChatbotRoute(pathname)) {
      return NextResponse.next()
    }

    // 7. Role-based dashboard protection
    if (isAdminRoute(pathname) && role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/admin/login', request.url))
    }

    if (isUserRoute(pathname) && role !== 'employee') {
      return NextResponse.redirect(new URL('/auth/user/login', request.url))
    }

    // 8. Valid token and role → allow access
    console.log('✅ Token verified successfully, proceeding to:', pathname)
    return NextResponse.next()

  } catch (error) {
    console.error('❌ JWT verification failed:', error)
    const fallbackLogin = isAdminRoute(pathname)
      ? '/auth/admin/login'
      : '/auth/user/login'
    return NextResponse.redirect(new URL(fallbackLogin, request.url))
  }
}

// ✅ Apply middleware to protected paths
export const config = {
  matcher: ['/dashboard/:path*', '/chatbot'],
}
