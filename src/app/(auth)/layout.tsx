import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#f5f5f7] relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

      <div className="absolute top-8 left-8 z-50">
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
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/80 backdrop-blur-3xl p-8 sm:p-10 rounded-[2rem] border border-black/[0.03] -black/[0.02]">
          {children}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/30">
          Powered by Mindlabs • 2026
        </p>
      </div>
    </div>
  )
}
