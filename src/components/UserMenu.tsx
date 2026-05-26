'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User as UserIcon, LogOut, Settings, Sun, Moon, Monitor, X } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface UserMenuProps {
  user: {
    email?: string
  } | null
  profile?: {
    avatar_url?: string
    display_name?: string
  } | null
}

type Theme = 'light' | 'dark' | 'system'

export default function UserMenu({ user, profile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('system')
  const menuRef = useRef<HTMLDivElement>(null)

  // Load theme on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(savedTheme)
  }, [])

  // Function to change theme
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // system theme selection
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Listen to system prefers-color-scheme changes if theme is system
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [theme])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#242424] dark:text-gray-200 rounded-full flex items-center justify-center text-xs font-bold uppercase overflow-hidden hover:ring-2 hover:ring-[#242424] dark:hover:ring-gray-200 transition-all focus:outline-none cursor-pointer"
      >
        {profile?.avatar_url ? (
          <Image 
            src={profile.avatar_url} 
            alt="Avatar" 
            width={32} 
            height={32} 
            className="w-full h-full object-cover" 
          />
        ) : (
          profile?.display_name?.[0] || user?.email?.[0] || '?'
        )}
      </button>

      {isOpen && (
        <div className="absolute left-full ml-4 bottom-0 w-64 bg-surface rounded-2xl border border-border-main py-2 z-[60] animate-in fade-in zoom-in duration-200 origin-bottom-left">
          <div className="px-4 py-2 border-b border-border-main mb-1">
            <p className="text-xs text-foreground/80 font-bold truncate">
              {profile?.display_name || 'Người dùng'}
            </p>
            <p className="text-[10px] text-foreground/50 truncate">{user?.email}</p>
          </div>
          
          <Link 
            href="/account" 
            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-hover-bg transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <UserIcon className="w-4 h-4 text-foreground/50" />
            Tài khoản
          </Link>

          <button 
            type="button"
            onClick={() => {
              setIsOpen(false)
              setIsSettingsOpen(true)
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:bg-hover-bg transition-colors text-left cursor-pointer"
          >
            <Settings className="w-4 h-4 text-foreground/50" />
            Cài đặt
          </button>

          <button 
            type="button" 
            onClick={async () => {
              setIsOpen(false);
              try {
                const { db } = await import('@/lib/local-first/db');
                await db.delete(); // Xoá sạch IndexedDB
                localStorage.removeItem('mindlabs_initial_pull_done');
                localStorage.removeItem('mindlabs-user');
              } catch (err) {
                console.error('Failed to clear local db on signout', err);
              }
              signOut({ callbackUrl: '/login' });
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsSettingsOpen(false)} />
          
          <div className="relative bg-surface border border-border-main rounded-2xl p-6 w-96 max-w-[90vw] shadow-overlay z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-main">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Cài đặt hệ thống
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 hover:bg-hover-bg rounded-lg text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground/60 block mb-2">
                  Giao diện ứng dụng
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-main hover:bg-hover-bg text-foreground/75'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span>Sáng</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-main hover:bg-hover-bg text-foreground/75'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span>Tối</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleThemeChange('system')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-main hover:bg-hover-bg text-foreground/75'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
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
