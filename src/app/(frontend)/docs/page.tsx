'use client'

import { useState } from 'react'
import { BookOpen, Search, ArrowRight, MousePointer2, Layout, Sparkles, Calendar, MessageSquare, Zap } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Bắt đầu',
    icon: <Zap className="w-6 h-6" />,
    desc: 'Hướng dẫn cơ bản để bạn làm quen với Mindlabs trong 5 phút.',
    articles: ['Tạo tài khoản', 'Giao diện chính', 'Thiết lập profile']
  },
  {
    id: 'mindnote',
    title: 'Mindnote',
    icon: <Layout className="w-6 h-6" />,
    desc: 'Cách tổ chức ghi chú thông minh và kết nối các ý tưởng.',
    articles: ['Soạn thảo văn bản', 'Gắn thẻ & Liên kết', 'Tìm kiếm thông minh']
  },
  {
    id: 'mindmap',
    title: 'Mindmap',
    icon: <MousePointer2 className="w-6 h-6" />,
    desc: 'Biến ý tưởng thành sơ đồ trực quan sinh động.',
    articles: ['Các phím tắt cơ bản', 'Tùy chỉnh màu sắc', 'Xuất bản đồ']
  },
  {
    id: 'community',
    title: 'Cộng đồng',
    icon: <MessageSquare className="w-6 h-6" />,
    desc: 'Tham gia thảo luận và chia sẻ kinh nghiệm sử dụng.',
    articles: ['Tham gia Discord', 'Góp ý tính năng', 'Chương trình Partner']
  }
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-full bg-[#fcfdfe] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24">
          <div className="flex justify-center mb-6">
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-premium text-primary">Trung tâm học liệu</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-none mb-8">
            Tìm hiểu cách <br /> <span className="text-secondary/20">làm chủ Mindlabs.</span>
          </h1>
          
          <div className="max-w-2xl mx-auto relative group mt-12">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-secondary/30 group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu hướng dẫn..."
              className="w-full pl-16 pr-8 py-6 bg-white border border-border-main/50 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, idx) => (
            <div key={idx} className="group glass p-10 rounded-[48px] border border-primary/5 hover:border-primary/20 hover:-premium transition-all duration-500 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                {cat.icon}
              </div>
              <h3 className="text-2xl font-black text-foreground mb-4">{cat.title}</h3>
              <p className="text-secondary/60 text-sm leading-relaxed mb-8 flex-1">
                {cat.desc}
              </p>
              
              <div className="space-y-3 mb-8">
                {cat.articles.map((art, aIdx) => (
                  <button key={aIdx} className="flex items-center gap-2 text-xs font-bold text-secondary/40 hover:text-primary transition-colors w-full text-left">
                    <ArrowRight className="w-3 h-3" />
                    {art}
                  </button>
                ))}
              </div>

              <button className="text-premium text-primary flex items-center gap-2 group/btn font-black text-[10px] uppercase tracking-widest mt-auto">
                Xem tất cả <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Popular Articles or Quick Links */}
        <div className="mt-32">
           <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-foreground tracking-tight">Bài viết phổ biến</h2>
              <button className="text-premium text-secondary/40 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">Xem tất cả tài liệu →</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "10 phím tắt giúp bạn làm việc nhanh hơn x2",
                "Cách xây dựng hệ thống quản lý tri thức cá nhân (PKM)",
                "Tích hợp Mindlabs vào quy trình làm việc hàng ngày",
                "Cách tối ưu hóa Clarity Planner để lập kế hoạch tuần"
              ].map((title, idx) => (
                <div key={idx} className="flex items-center justify-between p-8 bg-white border border-border-main/50 rounded-[32px] hover:border-primary/20 transition-all cursor-pointer group">
                  <span className="text-base font-bold text-foreground/80 group-hover:text-primary transition-colors">{title}</span>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                     <ArrowRight className="w-4 h-4 text-secondary/30 group-hover:text-primary" />
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Support Section */}
        <div className="mt-32 text-center py-20 border-t border-gray-100">
           <h3 className="text-2xl font-black text-foreground mb-4">Không tìm thấy thứ bạn cần?</h3>
           <p className="text-secondary/60 mb-10 max-w-md mx-auto">
             Chúng tôi luôn sẵn sàng hỗ trợ trực tiếp. Hãy gửi tin nhắn cho đội ngũ hỗ trợ của Mindlabs.
           </p>
           <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-foreground text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all">
             Yêu cầu hỗ trợ ngay
           </Link>
        </div>

      </div>
    </div>
  )
}
