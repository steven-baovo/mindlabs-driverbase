import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=NoCode', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=NotAuthenticated', request.url))
  }

  const redirectUri = `${url.origin}/api/gdrive/callback`

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokens = await response.json()

    if (tokens.error) {
      console.error('[GDrive Callback] Error fetching tokens:', tokens)
      return NextResponse.redirect(new URL('/?error=TokenExchangeFailed', request.url))
    }

    if (tokens.refresh_token) {
      // Upsert into user_settings table
      const { error: dbError } = await supabase
        .from('user_settings')
        .upsert({
          id: user.id,
          gdrive_refresh_token: tokens.refresh_token
        }, { onConflict: 'id' })

      if (dbError) {
        console.error('[GDrive Callback] Database error:', dbError)
        return NextResponse.redirect(new URL('/?error=DatabaseUpdateFailed', request.url))
      }
    }

    // Successfully connected!
    return NextResponse.redirect(new URL('/?gdrive=success', request.url))
  } catch (error) {
    console.error('[GDrive Callback] Exception:', error)
    return NextResponse.redirect(new URL('/?error=InternalError', request.url))
  }
}
