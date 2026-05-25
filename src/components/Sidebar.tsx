'use client'

import { useState, useEffect, useMemo, useRef } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Sparkles,
  Calendar,
  Timer,
  ListTodo,
  Briefcase
} from 'lucide-react'
import UserMenu from './UserMenu'
import { useFocus } from '@/contexts/FocusContext'
import { SIDEBAR_STYLES } from '@/lib/sidebar-styles'


interface SidebarProps {
  user: any
  profile?: any
}

const PRIMARY_MENU = [
  { title: 'Nhiệm vụ', icon: ListTodo, href: '/tasks' },
  { title: 'Workspace', icon: Briefcase, href: '/workspace' },
]

const TOOLS_MENU = [
  { title: 'Pomodoro', icon: Timer, href: '/pomodoro' },
]




export default function Sidebar({ user, profile: initialProfile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const focus = useFocus()

  // NextAuth provides user.name and user.image directly
  const profile = useMemo(() => {
    if (!user) return null
    return {
      display_name: user.name || 'User',
      avatar_url: user.image || null
    }
  }, [user])

  // Initialize collapsed state (default to open to avoid hydration mismatch)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [workspaceHref, setWorkspaceHref] = useState('/workspace')

  // Load and apply persistent state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }

    // Enable transitions only after mounting is complete to prevent initial collapsed transition animation
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Custom state handlers to persist choices
  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  const setCollapsedState = (val: boolean) => {
    setIsCollapsed(val)
    localStorage.setItem('sidebar-collapsed', String(val))
  }



  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon
    const isWorkspace = item.title === 'Workspace'
    const isActive = isWorkspace ? pathname.startsWith('/workspace') : pathname === item.href
    const finalHref = isWorkspace ? workspaceHref : item.href

    return (
      <Link
        key={index}
        href={finalHref || '#'}
        prefetch={true}
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center transition-all group relative rounded-xl py-2 cursor-pointer
          ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}
          ${isActive
            ? 'bg-zinc-200 text-foreground font-medium'
            : 'text-secondary hover:text-foreground hover:bg-zinc-200/60'}
        `}
        title={item.title}
      >
        <Icon strokeWidth={isActive ? 2.0 : 1.5} className={`w-[16px] h-[16px] shrink-0 ${isActive ? 'text-primary' : 'text-secondary group-hover:text-foreground'}`} />

        {!isCollapsed && (
          <span className={`${SIDEBAR_STYLES.linkText} truncate`}>
            {item.title}
          </span>
        )}

        {/* Live Timer Indicator in Sidebar */}
        {item.title === 'MindFocus' && focus.isActive && (
          <>
            {isCollapsed ? (
              <span className="absolute top-0 right-0 flex h-2 w-2 z-20">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${focus.mode === 'pomodoro' ? 'bg-primary' : 'bg-green-500'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${focus.mode === 'pomodoro' ? 'bg-primary' : 'bg-green-500'}`}></span>
              </span>
            ) : (
              <div className={`ml-auto flex items-center gap-1.5 ${focus.mode === 'pomodoro' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'} px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest animate-pulse`}>
                <span>{focus.formatTime(focus.timeLeft)}</span>
              </div>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <aside
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          toggleCollapse()
        }
      }}
      className={`
        hidden lg:flex flex-col bg-[#f2f2f2] border-r border-border-gray-bg h-full z-50 relative
        ${isMounted ? 'transition-all duration-300' : 'transition-none'}
        ${isCollapsed ? 'w-[44px]' : 'w-[220px]'}
        ${isCollapsed ? 'cursor-ew-resize' : 'cursor-default'}
      `}
    >
      {/* Edge toggle hit area */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          toggleCollapse()
        }}
        className={`
          absolute top-0 bottom-0 z-[60] cursor-ew-resize group/toggle
          ${isCollapsed ? '-right-[30px] w-[42px]' : '-right-[30px] w-[38px]'}
        `}
      />

      {/* Logo & Toggle Section */}
      <div
        className={`h-16 flex items-center mb-2 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}
      >
        <Link
          href="/"
          onClick={(e) => e.stopPropagation()}
          aria-label="Mindlabs Home"
          className="flex items-center gap-2 group overflow-hidden shrink-0"
        >
          <img
            src="/logo.svg"
            alt="Mindlabs Logo"
            className="w-8 h-8 rounded-full object-contain group-hover:scale-105 transition-transform duration-300 shrink-0"
          />
          {!isCollapsed && (
            <span className="text-lg font-black tracking-tighter text-foreground whitespace-nowrap">
              Mindlabs
            </span>
          )}
        </Link>

        {!isCollapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCollapsedState(true)
            }}
            className="p-1.5 text-secondary/30 hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 flex flex-col gap-1.5 pt-4">
        <div className="flex flex-col gap-1.5">
          {PRIMARY_MENU.map((item, index) => renderMenuItem(item, index))}
        </div>

        <div className="flex flex-col gap-1.5">
          {!isCollapsed && (
            <div className="mx-3 my-4 border-t border-border-main" />
          )}
          {TOOLS_MENU.map((item, index) => renderMenuItem(item, index))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-2 flex flex-col gap-1.5 relative">



        <div className="mt-2 pt-2">
          {user ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center rounded-xl py-2 hover:bg-zinc-200/60 transition-all ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-2'}`}
            >
              <UserMenu user={user} profile={profile} />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-bold truncate text-foreground leading-tight">
                    {profile?.display_name || 'User'}
                  </span>
                  <span className="text-[10px] text-secondary truncate leading-tight">
                    {user?.email}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex flex-col gap-1.5 ${isCollapsed ? 'items-center' : 'px-1'}`}>
              <Link
                href="/login"
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center transition-all rounded-xl py-2 bg-primary text-white font-bold hover:opacity-90 ${isCollapsed ? 'justify-center w-8 h-8' : 'gap-3 px-3 w-full'}`}
                title="Login"
              >
                <div className={`w-5 h-5 flex items-center justify-center ${isCollapsed ? '' : 'shrink-0'}`}>
                  <span className="text-[10px]">IN</span>
                </div>
                {!isCollapsed && <span className="text-[13px]">Login</span>}
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
