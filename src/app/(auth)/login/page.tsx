'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { login, signup } from './actions'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLogin, setIsLogin] = useState(true)

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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col items-center text-center w-full max-w-sm"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2">
            Mindlabs
          </h2>
          <p className="text-[13px] font-medium text-secondary/60">
            Đăng nhập để đồng bộ dữ liệu của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
          />
          
          {errorMsg && (
            <p className="text-red-500 text-sm font-medium text-left">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-3 py-4 px-4 rounded-2xl text-[13px] font-black uppercase tracking-[0.1em] text-white bg-foreground hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</span>
            )}
          </button>
        </form>

        <div className="w-full flex items-center justify-between my-5">
          <span className="w-[40%] h-[1px] bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary/40">Hoặc</span>
          <span className="w-[40%] h-[1px] bg-border" />
        </div>

        {/* Nút Đăng nhập Google Cao cấp */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-3 py-3.5 px-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.05em] text-foreground bg-background border border-border hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-[13px] font-medium text-secondary/60 hover:text-foreground transition-colors cursor-pointer"
        >
          {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
        </button>

      </motion.div>
    </div>
  )
}

