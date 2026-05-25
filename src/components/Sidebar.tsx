'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  MessageSquare,
  Info,
  History,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  LayoutGrid,
  ExternalLink,
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
  { title: 'Dashboard', icon: Home, href: '/' },
  { title: 'Nhiệm vụ', icon: ListTodo, href: '/tasks' },
  { title: 'Workspace', icon: Briefcase, href: '/workspace' },
]

const TOOLS_MENU = [
  { title: 'Pomodoro', icon: Timer, href: '/pomodoro' },
]


// Các trang thông tin được đưa vào Khám phá
const PANEL_PAGES = [
  { title: 'About Us', icon: Info, href: '/about' },
  { title: 'Contact', icon: MessageSquare, href: '/contact' },
  { title: 'Changelog', icon: History, href: '/changelog' },
  { title: 'FAQ', icon: HelpCircle, href: '/faq' },
  { title: 'Help Center', icon: BookOpen, href: '/docs' },
  { title: 'Legal', icon: ShieldCheck, href: '/legal' },
]

export default function Sidebar({ user, profile: initialProfile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const focus = useFocus()

  const [profile, setProfile] = useState<any>(initialProfile || null)

  // Client-side SWR profile fetching
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

  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsExploreOpen(false)
      }
    }
    if (isExploreOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExploreOpen])

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

        {/* Khám phá (Đặt ở dưới cùng, trên notification) */}
        <div
          ref={wrapperRef}
          className="relative"
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExploreOpen(!isExploreOpen)
            }}
            className={`flex items-center transition-all rounded-xl py-2 text-secondary hover:text-foreground hover:bg-zinc-200/60 w-full cursor-pointer ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
            title="Khám phá"
          >
            <LayoutGrid className="w-[18px] h-[18px] shrink-0 text-secondary" />
            {!isCollapsed && <span className="text-[13px]">Khám phá</span>}
          </button>

          {/* Flyout Panel 1 cột */}
          {isExploreOpen && (
            <div
              className={`absolute ${isCollapsed ? 'left-[50px]' : 'left-[210px]'} bottom-0 w-[200px] bg-white border border-border-strong rounded-2xl p-4 z-[100] animate-in fade-in slide-in-from-left-2 duration-200`}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className={`${SIDEBAR_STYLES.sectionTitle} mb-2 px-2`}>Trang</div>
                <div className="flex flex-col gap-0.5">
                  {PANEL_PAGES.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] text-secondary hover:text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-secondary/80" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>



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
