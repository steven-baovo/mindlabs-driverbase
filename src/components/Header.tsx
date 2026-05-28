'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import { Menu, Search, ArrowRight } from 'lucide-react'

interface HeaderProps {
  onSearchClick?: () => void
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export default function Header({
  onSearchClick,
  onMobileMenuToggle,
  isMobileMenuOpen
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-white/85 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-[1200px] mx-auto w-full h-full px-6 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu Trigger + Logo */}
        <div className="flex items-center space-x-3.5 shrink-0">
          {onMobileMenuToggle && (
            <button 
              onClick={onMobileMenuToggle}
              className="lg:hidden p-1.5 rounded hover:bg-zinc-100 text-zinc-600 cursor-pointer flex items-center justify-center focus:outline-none"
              aria-label="Mở thanh điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <Link href="/" className="flex items-center space-x-2.5 group">
            <Logo size={28} className="group-hover:scale-[1.05]" />
            <span className="font-extrabold text-[24px] tracking-tight text-zinc-900 select-none">
              Leanity
            </span>
          </Link>
        </div>

        {/* Central Section: ALWAYS show Navigation Menu */}
        <div className="flex-1 flex justify-center max-w-2xl">
          <nav className="hidden md:flex items-center space-x-8 text-[13px] font-semibold text-zinc-500">
            <a href="/#features" className="hover:text-zinc-950 transition-colors duration-200">Product</a>
            
            {/* Resources Dropdown Menu */}
            <div className="relative group py-4">
              <button className="flex items-center space-x-1 hover:text-zinc-950 transition-colors duration-200 cursor-pointer focus:outline-none">
                <span>Resources</span>
                <svg className="w-3 h-3 opacity-60 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Box with animation */}
              <div className="absolute top-[80%] left-1/2 -translate-x-1/2 mt-1.5 w-44 bg-white border border-zinc-200/80 rounded-md shadow-subtle opacity-0 translate-y-1.5 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 p-1 space-y-0.5">
                <Link 
                  href="/blog" 
                  className="flex items-center px-3 py-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 rounded transition-colors duration-150"
                >
                  <span className="font-medium text-[12px]">Blog</span>
                </Link>
                <Link 
                  href="/docs" 
                  className="flex items-center px-3 py-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 rounded transition-colors duration-150"
                >
                  <span className="font-medium text-[12px]">Docs</span>
                </Link>
              </div>
            </div>

            <a href="/#about" className="hover:text-zinc-950 transition-colors duration-200">About</a>
          </nav>
        </div>

        {/* Right Section: Search Icon + Workspace CTA */}
        <div className="shrink-0 flex items-center space-x-3.5">

          {/* Elegant Search Button (Only shown on Docs layout next to Workspace button) */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-950 transition-colors shadow-subtle cursor-pointer focus:outline-none"
              title="Tìm kiếm tài liệu (Ctrl + K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
          
          <Link 
            href="/workspace" 
            className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-[13px] font-normal rounded shadow-subtle flex items-center space-x-1.5 transition-all select-none"
          >
            <span>Vào Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
