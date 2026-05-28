'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { login, signup } from './actions'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    const result = isLogin ? await login(formData) : await signup(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) {
        setErrorMsg(error.message)
        setIsLoading(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập Google thất bại')
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Header */}
      <div className="mb-8 space-y-1.5">
        <AnimatePresence mode="wait">
          <motion.h1
            key={isLogin ? 'login-title' : 'signup-title'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="text-2xl font-black tracking-tight text-zinc-900"
          >
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
          </motion.h1>
        </AnimatePresence>
        <p className="text-[13px] text-zinc-500 font-normal">
          {isLogin
            ? 'Đăng nhập để tiếp tục không gian làm việc của bạn.'
            : 'Bắt đầu hành trình làm việc tập trung cùng Leanity.'}
        </p>
      </div>

      {/* Google Sign-in — Primary social action */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        aria-label="Tiếp tục với Google"
        className="w-full flex justify-center items-center gap-2.5 py-3 px-4 rounded-lg text-[13px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Tiếp tục với Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-zinc-200" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">hoặc</span>
        <span className="flex-1 h-px bg-zinc-200" />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="space-y-1">
          <label htmlFor="email" className="text-[12px] font-semibold text-zinc-600 tracking-wide">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 bg-white text-[13px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/25 focus:border-[#5e6ad2] transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-[12px] font-semibold text-zinc-600 tracking-wide">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-zinc-200 bg-white text-[13px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/25 focus:border-[#5e6ad2] transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <p className="text-[12px] text-red-600 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-label={isLogin ? 'Đăng nhập vào Leanity' : 'Tạo tài khoản Leanity'}
          className="mt-1 w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-bold text-white bg-[#5e6ad2] hover:bg-[#4f5bbf] active:scale-[0.99] transition-all duration-150 disabled:opacity-60 cursor-pointer shadow-[0_1px_3px_rgba(94,106,210,0.3)]"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Toggle Login / Signup */}
      <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setErrorMsg('')
          }}
          className="text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors duration-150 cursor-pointer"
        >
          {isLogin ? (
            <>Chưa có tài khoản?{' '}<span className="font-semibold text-[#5e6ad2] hover:underline underline-offset-2">Đăng ký ngay</span></>
          ) : (
            <>Đã có tài khoản?{' '}<span className="font-semibold text-[#5e6ad2] hover:underline underline-offset-2">Đăng nhập</span></>
          )}
        </button>
      </div>
    </motion.div>
  )
}
