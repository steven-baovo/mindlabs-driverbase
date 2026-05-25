import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(keysToSet) {
          keysToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          keysToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')
  const isPublicApiRoute = pathname.startsWith('/api')
  const isStaticOrNextPath = 
    pathname.startsWith('/_next') || 
    pathname === '/favicon.ico' || 
    pathname === '/manifest.json' || 
    pathname === '/sw.js' || 
    pathname.startsWith('/workbox-') || 
    pathname.startsWith('/swe-worker-') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.webp')

  // Route Protection: Unauthenticated users -> Redirect to login
  if (!user && !isAuthRoute && !isPublicApiRoute && !isStaticOrNextPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login pages -> Redirect to workspace
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/workspace'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
