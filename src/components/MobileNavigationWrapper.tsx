'use client'

import { useState, useEffect } from 'react'

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

  // Use simple user mapping
  useEffect(() => {
    if (!user) return
    setProfile({
      display_name: user.name || 'User',
      avatar_url: user.image || null
    })
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
