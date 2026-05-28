'use client'

import React from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Sun, MessageSquare, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white pt-16 pb-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-16">
          
          {/* Left Brand block (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Logo size={28} />
              <span className="font-extrabold text-base tracking-tight text-zinc-900 select-none">
                Leanity
              </span>
            </div>
            <p className="text-zinc-400 text-[12px] font-normal leading-relaxed max-w-[220px]">
              Không gian làm việc số tĩnh lặng giúp nâng cao hiệu suất công việc.
            </p>
            
            {/* Social media links */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                aria-label="GitHub Repository"
              >
                <svg className="w-3.5 h-3.5 font-bold" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                aria-label="Twitter X profile"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                aria-label="YouTube Channel"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.525 3.545 12 3.545 12 3.545s-7.525 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.863.508 9.388.508 9.388.508s7.525 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a 
                href="https://discord.gg" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                aria-label="Discord Community Server"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Columns (8 cols total, 2 cols each) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            
            {/* Column 1: Product */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Product</h4>
              <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                <li><Link href="/workspace" className="hover:text-zinc-950 transition-colors">Workspace</Link></li>
                <li><Link href="/tasks" className="hover:text-zinc-950 transition-colors">Tasks & Kanban</Link></li>
                <li><Link href="/pomodoro" className="hover:text-zinc-950 transition-colors">Pomodoro Timer</Link></li>
                <li><Link href="/docs/xay-dung-thu-vien-tri-thuc-second-brain" className="hover:text-zinc-950 transition-colors">Library Notes</Link></li>
                <li><Link href="/docs/xay-dung-thu-vien-tri-thuc-second-brain" className="hover:text-zinc-950 transition-colors">Graph View</Link></li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Resources</h4>
              <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                <li className="flex items-center gap-1">
                  <Link href="/docs" className="hover:text-zinc-950 transition-colors">Documentation</Link>
                  <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                </li>
                <li><Link href="/blog" className="hover:text-zinc-950 transition-colors">Productivity Blog</Link></li>
                <li><Link href="/docs/bang-tra-cuu-phim-tat-nhanh" className="hover:text-zinc-950 transition-colors">Shortcuts sheet</Link></li>
                <li className="flex items-center gap-1">
                  <a href="https://status.supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 transition-colors flex items-center gap-0.5">Status</a>
                  <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                </li>
                <li><Link href="/docs/bi-mat-kich-hoat-trang-thai-dong-chay-flow-state" className="hover:text-zinc-950 transition-colors">Flow State Guide</Link></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                <li><Link href="/about" className="hover:text-zinc-950 transition-colors">Our Team</Link></li>
                <li><Link href="/docs/bat-dau-nhanh-voi-leanity" className="hover:text-zinc-950 transition-colors">Principles</Link></li>
                <li><Link href="/about#sustainability" className="hover:text-zinc-950 transition-colors">Sustainability</Link></li>
                <li><Link href="/faq" className="hover:text-zinc-950 transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                <li><Link href="/privacy" className="hover:text-zinc-950 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/privacy#terms" className="hover:text-zinc-950 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy#data-ownership" className="hover:text-zinc-950 transition-colors">Data Ownership</Link></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom row (Copyright & Sun) */}
        <div className="border-t border-zinc-200 pt-8 flex items-center justify-between text-[11px] font-semibold text-zinc-400 select-none">
          <span>© {new Date().getFullYear()} Leanity Labs. Tất cả quyền được bảo lưu.</span>
          
          {/* Pure light theme focus icon */}
          <button 
            className="w-7 h-7 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#5e6ad2] hover:bg-[#5e6ad2]/5 transition-colors shadow-subtle shrink-0" 
            title="Leanity Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  )
}
