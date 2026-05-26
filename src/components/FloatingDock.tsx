'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ListTodo, Briefcase, Timer } from 'lucide-react'
import UserMenu from './UserMenu'

interface FloatingDockProps {
  user: any
}

export default function FloatingDock({ user }: FloatingDockProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const profile = useMemo(() => {
    if (!user) return null
    return {
      display_name: user.name || 'User',
      avatar_url: user.image || null
    }
  }, [user])

  // Tránh việc tắt mở đột ngột khi người dùng trượt chuột nhẹ ra ngoài rồi quay lại
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 300) // Trì hoãn 300ms trước khi thu nhỏ
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const navItems = [
    { 
      title: 'Nhiệm vụ', 
      icon: ListTodo, 
      href: '/tasks', 
      active: pathname ? pathname.startsWith('/tasks') : false 
    },
    { 
      title: 'Workspace', 
      icon: Briefcase, 
      href: '/workspace', 
      active: pathname ? pathname.startsWith('/workspace') : false 
    },
    { 
      title: 'Pomodoro', 
      icon: Timer, 
      href: '/pomodoro', 
      active: pathname ? pathname.startsWith('/pomodoro') : false 
    },
  ]

  const isCustomLayout = pathname?.includes('/workspace') || pathname?.includes('/tasks')

  if (isCustomLayout) {
    return (
      <div 
        className="fixed bottom-[4px] left-[4px] z-[9999] pointer-events-auto h-[44px] bg-surface border border-border-main rounded-default flex items-center px-4 justify-between"
        style={{ width: 'var(--sidebar-width, 300px)' }}
      >
        {/* Mục tài khoản / Menu người dùng (ở bên trái) */}
        <div className="shrink-0 flex items-center">
          {user ? (
            <div className="relative group/user">
              <span className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-950/90 text-white dark:bg-white/95 dark:text-zinc-900 text-[9px] font-bold rounded border border-zinc-800 dark:border-zinc-200 opacity-0 group-hover/user:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap translate-y-1 group-hover/user:translate-y-0 z-50">
                {profile?.display_name || 'Tài khoản'}
              </span>
              <UserMenu user={user} profile={profile} />
            </div>
          ) : (
            <Link
              href="/login"
              className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold hover:scale-105 active:scale-95 transition-all"
              title="Đăng nhập"
            >
              IN
            </Link>
          )}
        </div>

        {/* Các icon điều hướng tính năng (ở bên phải) */}
        <div className="flex-1 flex items-center justify-evenly">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={idx}
                href={item.href}
                className={`group relative flex flex-col items-center justify-center w-8 h-8 transition-colors ${
                  item.active 
                    ? 'text-primary dark:text-indigo-400' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {/* Tooltip nổi phía trên icon */}
                <span className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-950/90 text-white dark:bg-white/95 dark:text-zinc-900 text-[9px] font-bold rounded border border-zinc-800 dark:border-zinc-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap translate-y-1 group-hover:translate-y-0 z-50">
                  {item.title}
                </span>

                {/* Biểu tượng phóng to nhẹ */}
                <Icon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed bottom-6 left-6 z-[9999] pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={`flex items-center h-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-full transition-all duration-300 ease-out ${
          isHovered 
            ? 'w-[280px] px-4 gap-3 overflow-visible' 
            : 'w-12 px-0 justify-center gap-0 overflow-hidden'
        }`}
      >
        {/* Launcher Logo - hiển thị khi thu gọn */}
        {!isHovered ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent cursor-pointer select-none">
            <img 
              src="/logo.svg" 
              alt="Mindlabs Logo" 
              className="w-7 h-7 rounded-full object-contain hover:scale-105 active:scale-95 transition-all"
            />
          </div>
        ) : (
          /* Danh sách tính năng - hiển thị khi mở rộng (hover) */
          <div className="flex items-center gap-3 w-full justify-between animate-in fade-in zoom-in-95 duration-200">
            {/* Logo góc trái thanh mở rộng */}
            <Link href="/" className="w-6 h-6 shrink-0 flex items-center justify-center select-none">
              <img 
                src="/logo.svg" 
                alt="Mindlabs Logo" 
                className="w-5 h-5 rounded-full object-contain hover:rotate-12 transition-transform"
              />
            </Link>

            {/* Các icon điều hướng tính năng */}
            <div className="flex items-center gap-2">
              {navItems.map((item, idx) => {
                const Icon = item.icon
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="group relative flex flex-col items-center justify-center w-8 h-8 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    {/* Tooltip nổi phía trên icon */}
                    <span className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-950/90 text-white dark:bg-white/95 dark:text-zinc-900 text-[9px] font-bold rounded border border-zinc-800 dark:border-zinc-200 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap translate-y-1 group-hover:translate-y-0 z-50">
                      {item.title}
                    </span>

                    {/* Biểu tượng phóng to nhẹ dạng macOS dock */}
                    <Icon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-125" strokeWidth={1.5} />

                    {/* Dấu chấm active định vị giống MacOS Active App indicator */}
                    <span className={`w-[3px] h-[3px] rounded-full transition-all duration-300 mt-1 ${
                      item.active 
                        ? 'bg-primary dark:bg-indigo-400 shadow-[0_0_8px_rgba(94,106,210,0.8)] scale-100' 
                        : 'bg-transparent scale-0'
                    }`} />
                  </Link>
                )
              })}
            </div>

            {/* Vách ngăn dọc mảnh */}
            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

            {/* Mục tài khoản / Menu người dùng */}
            <div className="shrink-0 flex items-center">
              {user ? (
                <div className="relative group/user">
                  <span className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-950/90 text-white dark:bg-white/95 dark:text-zinc-900 text-[9px] font-bold rounded border border-zinc-800 dark:border-zinc-200 opacity-0 group-hover/user:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap translate-y-1 group-hover/user:translate-y-0 z-50">
                    {profile?.display_name || 'Tài khoản'}
                  </span>
                  <UserMenu user={user} profile={profile} />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold hover:scale-105 active:scale-95 transition-all"
                  title="Đăng nhập"
                >
                  IN
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
