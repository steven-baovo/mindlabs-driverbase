'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User as UserIcon, LogOut, Settings, Sun, Moon, Monitor, X, ChevronDown } from 'lucide-react'
import { signOut } from 'next-auth/react'

type Theme = 'light' | 'dark' | 'system'

export default function SidebarHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('system')
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

  // Load theme on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(savedTheme)
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
        <div className="flex items-center gap-2 min-w-0">
          {/* Colored Circle Avatar */}
          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold tracking-tight shrink-0 shadow-sm ${avatarBg}`}>
            {initials}
          </div>
          {/* Display Name */}
          <span className="font-normal truncate pr-1" style={{ fontSize: 'var(--font-size-system, 13px)' }}>
            {displayName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-1.5 top-full mt-1.5 w-60 bg-surface rounded-xl border border-border-main py-1.5 z-[60] shadow-overlay animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-3 py-1.5 border-b border-border-main mb-1">
            <p className="text-xs text-foreground font-bold truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-foreground/50 truncate">
              {user?.email || 'local@leanity.app'}
            </p>
          </div>
          
          <Link 
            href="/account" 
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-foreground/80 hover:bg-hover-bg transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <UserIcon className="w-3.5 h-3.5 text-foreground/50" />
            Tài khoản
          </Link>

          <button 
            type="button"
            onClick={() => {
              setIsOpen(false)
              setIsSettingsOpen(true)
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-foreground/80 hover:bg-hover-bg transition-colors text-left cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-foreground/50" />
            Cài đặt
          </button>

          <button 
            type="button" 
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
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsSettingsOpen(false)} />
          
          <div className="relative bg-surface border border-border-main rounded-2xl p-5 w-80 max-w-[90vw] shadow-overlay z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-2.5 border-b border-border-main">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Cài đặt hệ thống
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-hover-bg rounded-md text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block mb-2">
                  Giao diện ứng dụng
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-main hover:bg-hover-bg text-foreground/75'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Sáng</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-main hover:bg-hover-bg text-foreground/75'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Tối</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleThemeChange('system')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-main hover:bg-hover-bg text-foreground/75'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Hệ thống</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
