'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Home, FileText, Sparkles, Cloud, CloudCheck, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import UserMenu from './UserMenu'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useFocus } from '@/contexts/FocusContext'
import { SyncStatusIndicator } from './SyncStatusIndicator'

const DEEP_WORKSPACE = /^\/workspace/

const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Workspace', href: '/workspace', icon: FileText },
]

export default function Header() {
  const pathname = usePathname()
  const { isSaving } = useWorkspace()
  const focus = useFocus()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [workspaceHref, setWorkspaceHref] = useState('/workspace')
  const supabase = createClient()

  const isDeepWorkspace = DEEP_WORKSPACE.test(pathname)


  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    getUser()
  }, [])

  return (
    <motion.header
      layout
      initial={false}
      animate={{
        ...(isDeepWorkspace ? {
          width: '300px',
          left: 'calc(100% - 324px)',
          x: 0,
        } : {
          width: '100%',
          maxWidth: '1280px',
          left: '50%',
          x: '-50%',
        }),
        top: '24px',
      }}
      transition={{ 
        layout: { type: 'spring', stiffness: 300, damping: 30 }
      }}
      className="fixed z-[100] px-6 pointer-events-none"
    >
      <div className="flex h-12 w-full items-center justify-between px-6 glass rounded-full -premium pointer-events-auto border border-black/75 ring-1 ring-white/50 relative group/header backdrop-blur-[64px] backdrop-saturate-[250%]">
        {/* Atmospheric Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000 rounded-full" />
        
        {/* Logo Section */}
        {!isDeepWorkspace && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6 relative z-10"
          >
            <Link href="/" className="flex items-center gap-2 group/logo">
              <img 
                src="/logo.svg" 
                alt="Mindlabs Logo" 
                className="w-5 h-5 rounded-full object-contain group-hover/logo:scale-110 transition-transform duration-300" 
              />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
                Mindlabs
              </span>
            </Link>
          </motion.div>
        )}

        {/* Center Nav */}
        {!isDeepWorkspace && (
          <nav className="hidden md:flex items-center gap-1 relative z-10">
            {NAV_ITEMS.map((item) => {
              const isWorkspace = item.name === 'Workspace'
              const targetHref = isWorkspace ? workspaceHref : item.href
              const isActive = isWorkspace ? pathname.startsWith('/workspace') : pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={targetHref}
                  className={`relative px-4 py-1.5 rounded-full text-[12px] font-bold transition-all duration-300 group/nav ${
                    isActive
                      ? 'text-foreground'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-foreground/5 rounded-full -z-10"
                    />
                  )}
                  {item.name}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary/40 rounded-full group-hover/nav:w-1 transition-all duration-300" />
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto relative z-10">
          {/* Focus Timer Global Indicator */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <SyncStatusIndicator />
            {focus.isActive && (
              <Link 
                href="/pomodoro"
                className="flex items-center gap-2 bg-primary/5 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-all text-xs font-bold group/timer border border-primary/10"
              >
                <Timer className="w-3.5 h-3.5" />
                <span className="w-10 text-center font-black tracking-widest">{focus.formatTime(focus.timeLeft)}</span>
              </Link>
            )}
          </div>

          {!isDeepWorkspace && (
            <div className="hidden sm:flex items-center bg-black/5 rounded-full px-4 py-1 border border-black/5 focus-within:border-primary/20 transition-all w-44 group/search">
              <Search strokeWidth={2.5} className="w-3 h-3 text-secondary/80 group-focus-within/search:text-primary transition-colors mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-[10px] text-foreground placeholder-secondary/70 w-full font-bold uppercase tracking-widest"
              />
            </div>
          )}

          {isDeepWorkspace && (
            <div className="flex items-center gap-1 mr-2 bg-black/5 rounded-full p-0.5">
              {[
                { href: '/', icon: Home, title: 'Home' }
              ].map((link, i) => (
                <Link 
                  key={i}
                  href={link.href} 
                  className="p-1.5 rounded-full hover:bg-white/90 text-secondary hover:text-primary transition-all active:scale-90"
                  title={link.title}
                >
                  <link.icon strokeWidth={2.5} className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {!isDeepWorkspace && (
                <button className="p-1.5 text-secondary hover:text-foreground transition-colors relative group/bell">
                  <Bell strokeWidth={2.5} className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full border-2 border-white" />
                </button>
              )}
              <UserMenu user={user} profile={profile} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-[11px] font-black text-secondary hover:text-foreground uppercase tracking-widest transition-colors px-2">
                Log in
              </Link>
              <Link href="/register" className="bg-foreground text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all active:scale-95">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
