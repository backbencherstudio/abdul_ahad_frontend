import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/login/driver',
  '/login/garage',
  '/admin-login',
  '/create-account',
  '/create-account/driver',
  '/create-account/garage',
  '/create-account/pricing',
  '/forgot-password',
  '/contact-us',
  '/cookies-policy',
  '/privacy-policy',
  '/terms-drivers',
  '/terms-garages',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's a public route
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // For protected routes (driver, garage, admin), let the client-side layout handle authentication
  // The middleware will allow the request to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}





