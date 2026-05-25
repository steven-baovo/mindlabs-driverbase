'use client'

import React, { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = () => {
    setIsLoading(true)
    signIn('google', { callbackUrl: '/workspace' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-10">
        <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2">
          Chào mừng đến với Mindlabs
        </h2>
        <p className="text-[13px] font-medium text-secondary/60">
          Ứng dụng 100% miễn phí trọn đời bằng Google Drive
        </p>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full max-w-sm flex justify-center items-center gap-3 py-4 px-4 rounded-2xl text-[13px] font-black uppercase tracking-[0.1em] text-white bg-foreground hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group/btn"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="relative z-10">Đăng nhập bằng Google</span>
          </>
        )}
      </button>

      <p className="mt-6 text-[11px] text-secondary/40 font-medium max-w-xs">
        Việc đăng nhập sẽ cấp quyền cho ứng dụng lưu trữ dữ liệu đồng bộ vào Google Drive của bạn một cách an toàn.
      </p>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
