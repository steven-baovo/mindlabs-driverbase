'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from "@/components/Sidebar"
import { WorkspaceProvider } from "@/contexts/WorkspaceContext"
import { FocusProvider } from "@/contexts/FocusContext"
import MobileNavigationWrapper from "@/components/MobileNavigationWrapper"
import ContentWrapper from "@/components/ContentWrapper"
import SyncInitializer from "@/components/SyncInitializer"

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 1. Tải user từ localStorage đồng bộ ngay lập tức để render Sidebar
    const cachedUser = localStorage.getItem('mindlabs-user')
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser))
      } catch (e) {
        console.error('Failed to parse cached user', e)
      }
    }

    // 2. Chạy ngầm xác thực session thực tế với supabase
    const supabase = createClient()
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          localStorage.setItem('mindlabs-user', JSON.stringify(session.user))
        } else {
          setUser(null)
          localStorage.removeItem('mindlabs-user')
        }
      } catch (err) {
        console.error('Error during layout session check:', err)
      }
    }

    checkSession()

    // 3. Đăng ký thay đổi trạng thái đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        localStorage.setItem('mindlabs-user', JSON.stringify(session.user))
      } else {
        setUser(null)
        localStorage.removeItem('mindlabs-user')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <FocusProvider>
      <WorkspaceProvider>
        {user && <SyncInitializer />}
        <div className="flex flex-col lg:flex-row h-screen bg-[#f2f2f2] overflow-hidden">
          {/* Mobile Navigation */}
          <MobileNavigationWrapper user={user} />

          {/* Sidebar Island (Desktop) */}
          <div className="hidden lg:flex flex-col h-full shrink-0">
            <Sidebar user={user} />
          </div>

          {/* Main Content Island */}
          <ContentWrapper>{children}</ContentWrapper>
        </div>
      </WorkspaceProvider>
    </FocusProvider>
  )
}
