'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User as UserIcon, LogOut, Settings, Sun, Moon, Monitor, X, ChevronDown } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { DropdownCard, DropdownHeader, DropdownItem } from '@/components/ui/DropdownCard'
import SettingsModal from './SettingsModal'

type Theme = 'light' | 'dark' | 'system'

export default function SidebarHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('system')
  const [fontSize, setFontSize] = useState<string>('13px')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch cached user on mount and check session
  useEffect(() => {
    const cachedUser = localStorage.getItem('mindlabs-user')
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser))
      } catch (e) {
        console.error('Failed to parse cached user', e)
      }
    }

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        if (session?.user) {
          setUser(session.user)
          localStorage.setItem('mindlabs-user', JSON.stringify(session.user))
        }
      } catch (err) {
        console.error('Error in SidebarHeader session check:', err)
      }
    }
    checkSession()
  }, [])

  // Load theme and font size on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(savedTheme)

    const savedFontSize = localStorage.getItem('font-size-system') || '13px'
    setFontSize(savedFontSize)
    document.documentElement.style.setProperty('--font-size-system', savedFontSize)
    document.documentElement.style.setProperty('--font-size-standard', savedFontSize)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize)
    localStorage.setItem('font-size-system', newSize)
    document.documentElement.style.setProperty('--font-size-system', newSize)
    document.documentElement.style.setProperty('--font-size-standard', newSize)
  }

  // Get stable colors for avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-pink-500 text-white',
      'bg-purple-500 text-white',
      'bg-indigo-500 text-white',
      'bg-blue-500 text-white',
      'bg-emerald-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const getInitials = (name: string) => {
    if (!name) return 'WS'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Workspace'
  const initials = getInitials(displayName)
  const avatarBg = getAvatarColor(displayName)

  return (
    <div className="relative w-full shrink-0 mb-5 px-1" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 text-foreground transition-all duration-200 cursor-pointer group text-left focus:outline-none"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Display Name */}
          <span className="font-normal truncate pr-1" style={{ fontSize: 'var(--font-size-system, 13px)' }}>
            {displayName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <DropdownCard className="absolute left-1.5 top-full mt-1.5 w-60">
          <DropdownHeader 
            title={displayName} 
            subtitle={user?.email || 'local@leanity.app'} 
          />
          
          <DropdownItem 
            href="/account"
            icon={UserIcon}
            onClick={() => setIsOpen(false)}
          >
            Tài khoản
          </DropdownItem>

          <DropdownItem 
            icon={Settings}
            onClick={() => {
              setIsOpen(false)
              setIsSettingsOpen(true)
            }}
          >
            Cài đặt
          </DropdownItem>

          <DropdownItem 
            variant="danger"
            icon={LogOut}
            onClick={async () => {
              setIsOpen(false)
              try {
                const { db } = await import('@/lib/local-first/db')
                await db.delete() // Clear IndexedDB
                localStorage.removeItem('mindlabs_initial_pull_done')
                localStorage.removeItem('mindlabs-user')
              } catch (err) {
                console.error('Failed to clear local db on signout', err)
              }
              signOut({ callbackUrl: '/login' })
            }}
          >
            Đăng xuất
          </DropdownItem>
        </DropdownCard>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        user={user}
      />
    </div>
  )
}
