import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-zinc-50 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-[#5e6ad2]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[45%] h-[45%] bg-[#5e6ad2]/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-emerald-400/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo top-left */}
      <div className="absolute top-7 left-7 z-50">
        <Link href="/" className="flex items-center gap-2.5 group/logo" aria-label="Về trang chủ Leanity">
          <img
            src="/logo.svg"
            alt="Leanity Logo"
            className="w-5 h-5 rounded-full object-contain group-hover/logo:scale-110 transition-transform duration-300"
          />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900">
            Leanity
          </span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[420px] px-5 py-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {children}
        </div>
      </div>

      {/* Bottom footer */}
      <div className="absolute bottom-7 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400/60">
          Powered by Mindlabs · 2026
        </p>
      </div>
    </div>
  )
}
