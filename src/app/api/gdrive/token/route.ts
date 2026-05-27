import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch refresh token from Supabase DB
  const { data: settings, error: dbError } = await supabase
    .from('user_settings')
    .select('gdrive_refresh_token')
    .eq('id', user.id)
    .single()

  if (dbError || !settings || !settings.gdrive_refresh_token) {
    return NextResponse.json({ error: 'No GDrive Connection' }, { status: 404 })
  }

  // Exchange refresh token for a new access token
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: settings.gdrive_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const tokens = await response.json()

    if (tokens.error || !tokens.access_token) {
      console.error('[GDrive Token] Error refreshing token:', tokens)
      return NextResponse.json({ error: 'TokenRefreshFailed' }, { status: 500 })
    }

    return NextResponse.json({
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
    })
  } catch (error) {
    console.error('[GDrive Token] Exception:', error)
    return NextResponse.json({ error: 'InternalError' }, { status: 500 })
  }
}
