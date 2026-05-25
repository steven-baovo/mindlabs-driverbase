'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, Clock, Sparkles, ArrowRight, FileText, BookOpen } from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [workspaceHref, setWorkspaceHref] = useState('/workspace')

  useEffect(() => {
    setMounted(true)
    const cachedUser = localStorage.getItem('mindlabs-user')
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser))
      } catch (e) {
        console.error('Failed to parse cached user', e)
      }
    }

    const supabase = createClient()
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          localStorage.setItem('mindlabs-user', JSON.stringify(session.user))
        } else {
          setUser(null)
          localStorage.removeItem('mindlabs-user')
        }
      } catch (err) {
        console.error('Error verifying session on page mount:', err)
      }
    }

    checkSession()
  }, [])

  // 1. Render Landing Page shell if not mounted to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className="w-full bg-background min-h-screen overflow-hidden">
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[100px] -z-10" />
      </div>
    )
  }

  // 2. Nếu ĐÃ ĐĂNG NHẬP -> Hiện Command Center
  if (user) {
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Bạn'

    // Mock data cho các file gần đây
    const recentFiles = [
      { id: 1, title: 'Kế hoạch phát triển Mindlabs', type: 'note', updated: '2 giờ trước' },
      { id: 2, title: 'Sơ đồ tư duy Hệ sinh thái', type: 'map', updated: 'Hôm qua' },
      { id: 3, title: 'Ghi chú cuộc họp', type: 'note', updated: '3 ngày trước' },
    ]

    return (
      <div className="w-full bg-background min-h-screen pb-20">
        <div className="container mx-auto px-6 max-w-7xl pt-16">
          {/* Greeting */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">
              Chào buổi chiều, <span className="text-primary">{displayName}</span>!
            </h1>
            <p className="text-secondary font-bold opacity-90">Hôm nay bạn muốn tập trung vào việc gì?</p>
          </div>

          {/* Grid Layout cho Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Cột chính: Công cụ và File */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Widget Mở nhanh */}
              <div className="bg-surface rounded-xl border border-border-main p-6 shadow-subtle">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Tài liệu gần đây</h2>
                  <Link href={workspaceHref} className="text-xs font-bold text-primary hover:underline">
                    Xem tất cả
                  </Link>
                </div>
                
                <div className="flex flex-col gap-2">
                  {recentFiles.map((file) => (
                    <Link key={file.id} href={workspaceHref} className="flex items-center justify-between p-3.5 rounded-md hover:bg-hover-bg transition-all border border-transparent hover:border-border-main group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          {file.type === 'note' ? (
                            <FileText className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                          ) : (
                            <Zap className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{file.title}</h3>
                          <span className="text-[11px] text-secondary/80 font-semibold">{file.updated}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-secondary/60 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* Cột phụ: Pomodoro và Journal */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Widget Pomodoro */}
              <div className="bg-zinc-950 dark:bg-zinc-900 text-white rounded-xl border border-zinc-800 p-6 relative overflow-hidden shadow-subtle">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-md">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">MindFocus</span>
                  </div>
                  <h3 className="text-xl font-black mb-2 tracking-tighter">Sẵn sàng tập trung?</h3>
                  <p className="text-xs text-slate-300 mb-8 font-medium">Bắt đầu một phiên Pomodoro 25 phút để hoàn thành công việc.</p>
                  <Link href="/pomodoro" className="inline-block w-full text-center py-3 bg-primary text-white rounded-md font-bold text-[11px] uppercase tracking-[0.15em] hover:opacity-95 transition-all shadow-subtle hover:scale-[1.01]">
                    Bật Timer Ngay
                  </Link>
                </div>
              </div>

              {/* Widget Journal */}
              <div className="bg-surface rounded-xl border border-border-main p-6 shadow-subtle">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-md">
                     <BookOpen className="w-5 h-5 text-secondary/80" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-secondary/80">Góc Đọc</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Đọc nghiên cứu mới</h3>
                <p className="text-xs text-secondary opacity-90 mb-6">Nâng cấp tư duy với các bài viết chuyên sâu trên Mindlabs Journal.</p>
                <Link href="/journal" className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group">
                  Vào Journal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. Nếu CHƯA ĐĂNG NHẬP -> Hiện Landing Page
  return (
    <div className="w-full bg-background min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 container mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[100px] -z-10" />
        
        <div className="flex items-center gap-2 mb-6">
          <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Chào mừng đến với Mindlabs</span>
          </div>
        </div>

        <h1 className="text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-none mb-6">
          Nâng Cấp <span className="text-primary">Tâm Trí</span>,<br/>Tối Ưu <span className="text-secondary/85">Hiệu Suất</span>
        </h1>
        
        <p className="text-xl text-secondary font-medium max-w-2xl mb-12 opacity-95">
          Mindlabs là hệ sinh thái công cụ hỗ trợ tư duy, tập trung và phát triển bản thân dựa trên khoa học nhận thức.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={workspaceHref} className="group relative px-8 py-3.5 bg-foreground dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-bold text-[11px] uppercase tracking-[0.2em] overflow-hidden transition-all active:scale-[0.98] shadow-subtle hover:bg-zinc-800 dark:hover:bg-white">
            <span className="relative z-10">Khám phá Workspace</span>
          </Link>
          <Link href="/journal" className="px-8 py-3.5 glass text-[11px] font-bold uppercase tracking-[0.2em] text-foreground hover:bg-hover-bg transition-all rounded-md border border-border-main shadow-subtle">
            Đọc Nghiên Cứu
          </Link>
        </div>
      </section>

      {/* Products Bento Grid */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-4">Hệ sinh thái Mindlabs</h2>
          <p className="text-secondary font-medium opacity-95">Các công cụ được thiết kế để tối ưu hóa từng khía cạnh trong công việc của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Workspace */}
          <div className="group relative p-8 rounded-xl bg-surface border border-border-main hover:-translate-y-1 shadow-subtle transition-all duration-300 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Zap className="w-6 h-6 text-secondary/80 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Không gian</span>
              <h3 className="text-xl font-bold text-foreground mt-2 mb-3">Workspace</h3>
              <p className="text-sm text-secondary opacity-95 mb-6">Không gian làm việc dự án, giúp bạn tổ chức tài liệu và bản đồ tư duy một cách khoa học.</p>
              <Link href={workspaceHref} className="text-[11px] font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                Trải nghiệm <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-950 dark:bg-zinc-900 rounded-xl mx-4 lg:mx-8 my-12 overflow-hidden relative border border-zinc-800 shadow-subtle">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-8 lg:px-16 max-w-7xl relative z-10 text-center text-white">
          <h2 className="text-5xl lg:text-6xl font-black mb-6 tracking-tighter leading-none">
            Sẵn sàng nâng cấp <br/> <span className="text-primary">tư duy của bạn?</span>
          </h2>
          <p className="text-lg text-white/85 mb-12 max-w-xl mx-auto font-medium">
            Bắt đầu hành trình tối ưu hóa hiệu suất ngay hôm nay với các công cụ chuyên sâu.
          </p>
          <Link href="/register" className="inline-block px-10 py-3.5 bg-primary text-white rounded-md font-bold text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-subtle hover:bg-primary/95">
            Bắt đầu miễn phí
          </Link>
        </div>
      </section>
    </div>
  )
}
