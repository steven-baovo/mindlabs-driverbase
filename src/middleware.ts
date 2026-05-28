import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Routes that require authentication (frontend app routes)
const PROTECTED_ROUTES = ['/workspace', '/tasks', '/pomodoro', '/productivity']

// Public-only routes (redirect to workspace if already logged in)
const PUBLIC_ONLY_ROUTES = ['/']

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // If user is logged in and tries to access the homepage → redirect to workspace
  if (user && PUBLIC_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }

  // If user is NOT logged in and tries to access a protected route → redirect to homepage
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - blog, docs (no auth redirect needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|blog|docs|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
