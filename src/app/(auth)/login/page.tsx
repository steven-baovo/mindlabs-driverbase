'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/app/auth/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, Loader2, Eye, EyeOff, Info, AlertCircle } from 'lucide-react'

function LoginContent() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData, redirectTo)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col"
    >
      <div className="mb-10">
        <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2">
          Chào mừng trở lại
        </h2>
        <p className="text-[13px] font-medium text-secondary/60">
          Tiếp tục hành trình sáng tạo cùng Mindlabs
        </p>
      </div>

      <AnimatePresence>
        {searchParams.get('signup') === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3"
          >
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-[12px] leading-relaxed text-secondary font-medium">
              Vui lòng kiểm tra <strong>hộp thư đến</strong> hoặc <strong>spam</strong> để xác thực tài khoản trước khi đăng nhập.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/5 border border-red-500/10 text-red-600 p-4 rounded-2xl text-[12px] font-bold flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-widest text-secondary/50 ml-1">
            Email Address
          </label>
          <div className="relative group/input">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-secondary/30 group-focus-within/input:text-primary transition-colors" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full pl-12 pr-4 py-3 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-medium text-foreground outline-none placeholder:text-secondary/20"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="password" className="block text-[11px] font-black uppercase tracking-widest text-secondary/50">
              Password
            </label>
            <a href="#" className="text-[11px] font-bold text-primary hover:opacity-70 transition-opacity">
              Forgot?
            </a>
          </div>
          <div className="relative group/input">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-secondary/30 group-focus-within/input:text-primary transition-colors" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="block w-full pl-12 pr-12 py-3 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-[13px] font-medium text-foreground outline-none placeholder:text-secondary/20"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-4 flex items-center text-secondary/20 hover:text-secondary/40 focus:outline-none transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] text-white bg-foreground hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group/btn"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2 relative z-10">
                Sign In
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000" />
          </button>
        </div>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[12px] font-medium text-secondary/40">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-bold text-foreground hover:text-primary transition-colors">
            Tạo tài khoản mới
          </Link>
        </p>
      </div>
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
