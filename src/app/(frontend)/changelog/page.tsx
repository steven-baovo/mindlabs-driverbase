'use client'

import { History, Zap, Sparkles, CheckCircle2, Bug, ArrowRight, Star } from 'lucide-react'

const UPDATES = [
  {
    version: 'v1.2.0',
    date: '15 Tháng 5, 2026',
    status: 'Latest',
    changes: [
      { type: 'NEW', title: 'Trang About Us - Kể chuyện thương hiệu', desc: 'Ra mắt trang giới thiệu với phong cách kể chuyện (storytelling) và thiết kế premium.' },
      { type: 'NEW', title: 'Hệ thống Liên hệ thông minh', desc: 'Tích hợp form liên hệ với giao diện glassmorphism và hiệu ứng phản hồi thời gian thực.' },
      { type: 'IMPROVED', title: 'Đồng bộ hóa Thanh điều hướng', desc: 'Cập nhật Sidebar với các mục điều hướng chính mới (About, Contact, Changelog).' },
      { type: 'IMPROVED', title: 'Tối ưu hóa UI/UX', desc: 'Tinh chỉnh các design tokens, hiệu ứng đổ bóng và các vùng sáng (atmospheric glows).' }
    ]
  },
  {
    version: 'v1.1.0',
    date: '14 Tháng 5, 2026',
    changes: [
      { type: 'NEW', title: 'Kéo thả sắp xếp Sidebar', desc: 'Cho phép người dùng tự do sắp xếp thứ tự các Note và Mindmap trên thanh điều hướng.' },
      { type: 'NEW', title: 'Đồng bộ hóa Cloud với Supabase', desc: 'Tự động lưu trữ và đồng bộ thứ tự Sidebar trên tất cả các thiết bị.' },
      { type: 'IMPROVED', title: 'Giao diện Workspace', desc: 'Nâng cấp toàn bộ giao diện Workspace theo phong cách "Flat" tối giản và hiện đại.' }
    ]
  },
  {
    version: 'v1.0.0',
    date: '13 Tháng 5, 2026',
    changes: [
      { type: 'NEW', title: 'Mindnote & Mindmap', desc: 'Phát hành phiên bản đầu tiên của công cụ ghi chú và bản đồ tư duy.' }
    ]
  }
]

export default function ChangelogPage() {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'NEW': return 'bg-primary/10 text-primary border-primary/20'
      case 'IMPROVED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'FIXED': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW': return <Star className="w-3.5 h-3.5" />
      case 'IMPROVED': return <Zap className="w-3.5 h-3.5" />
      case 'FIXED': return <Bug className="w-3.5 h-3.5" />
      default: return <CheckCircle2 className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="min-h-full bg-[#fcfdfe] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 relative z-10">
        
        {/* Header */}
        <div className="mb-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
              <History className="w-3.5 h-3.5 text-primary" />
              <span className="text-premium text-primary">Changelog</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-none mb-8">
            Nhật ký <br /> <span className="text-secondary/20">cập nhật.</span>
          </h1>
          <p className="text-lg text-secondary/60 max-w-lg leading-relaxed">
            Theo dõi hành trình tiến hóa của Mindlabs. Chúng tôi không ngừng cải tiến để mang lại trải nghiệm tốt nhất cho bạn.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-border-main/50 ml-4 md:ml-0 md:pl-0">
          <div className="space-y-20">
            {UPDATES.map((update, idx) => (
              <div key={idx} className="relative pl-10">
                {/* Timeline Dot */}
                <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-white ring-4 ring-primary/10 ${idx === 0 ? 'bg-primary' : 'bg-secondary/20'}`} />
                
                <div className="flex flex-col gap-6">
                  {/* Version & Date */}
                  <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">{update.version}</h2>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-secondary/40">{update.date}</span>
                       {update.status && (
                         <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                           {update.status}
                         </span>
                       )}
                    </div>
                  </div>

                  {/* Changes Cards */}
                  <div className="grid grid-cols-1 gap-4">
                    {update.changes.map((change, cIdx) => (
                      <div key={cIdx} className="group glass p-6 rounded-3xl border border-primary/5 hover:border-primary/20 hover:-premium transition-all duration-500">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shrink-0 ${getBadgeStyle(change.type)}`}>
                            {getIcon(change.type)}
                            {change.type}
                          </div>
                          <div className="flex flex-col gap-1">
                            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{change.title}</h4>
                            <p className="text-sm text-secondary/60 leading-relaxed">{change.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-32 p-12 glass rounded-[40px] border border-primary/10 text-center relative overflow-hidden">
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
           <h3 className="text-2xl font-black text-foreground mb-4">Bạn có ý tưởng mới?</h3>
           <p className="text-secondary/60 mb-8 max-w-sm mx-auto">
             Chúng tôi luôn lắng nghe ý kiến từ cộng đồng để phát triển các tính năng hữu ích nhất.
           </p>
           <a href="/contact" className="inline-flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest hover:gap-4 transition-all">
             Gửi yêu cầu tính năng <ArrowRight className="w-4 h-4" />
           </a>
        </div>

      </div>
    </div>
  )
}
