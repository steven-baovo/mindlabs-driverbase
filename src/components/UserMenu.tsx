'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User as UserIcon, LogOut, Settings } from 'lucide-react'
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

export default function UserMenu({ user, profile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
        className="w-8 h-8 bg-gray-100 border border-gray-200 text-[#242424] rounded-full flex items-center justify-center text-xs font-bold uppercase overflow-hidden hover:ring-2 hover:ring-[#242424] transition-all focus:outline-none cursor-pointer"
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
        <div className="absolute left-full ml-4 bottom-0 w-64 bg-white rounded-2xl border border-border-main py-2 z-[60] animate-in fade-in zoom-in duration-200 origin-bottom-left">
          <div className="px-4 py-2 border-b border-border-main mb-1">
            <p className="text-xs text-gray-600 font-bold truncate">
              {profile?.display_name || 'Người dùng'}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
          
          <Link 
            href="/account" 
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#f9f9f9] transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <UserIcon className="w-4 h-4 text-gray-500" />
            Tài khoản
          </Link>

            <button 
              type="button" 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
        </div>
      )}
    </div>
  )
}
