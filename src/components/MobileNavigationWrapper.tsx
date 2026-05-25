'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import MobileNavbar from './MobileNavbar'
import MobileSidebar from './MobileSidebar'

interface MobileNavigationWrapperProps {
  user: any
  profile?: any
}

export default function MobileNavigationWrapper({ user, profile: initialProfile }: MobileNavigationWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<any>(initialProfile || null)

  // Client-side SWR profile fetching for mobile
  useEffect(() => {
    if (!user) return

    const cachedProfile = localStorage.getItem(`user-profile-${user.id}`)
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile))
      } catch (e) {
        console.error('Failed to parse cached profile', e)
      }
    }

    const supabase = createClient()
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        if (data && !error) {
          setProfile(data)
          localStorage.setItem(`user-profile-${user.id}`, JSON.stringify(data))
        }
      } catch (err) {
        console.error('Error fetching profile client-side:', err)
      }
    }
    fetchProfile()
  }, [user])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <MobileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        profile={profile} 
      />

      <MobileNavbar onMenuClick={() => setIsSidebarOpen(true)} />
    </>
  )
}
