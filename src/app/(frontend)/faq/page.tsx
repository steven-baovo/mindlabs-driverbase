'use client'

import { useState } from 'react'
import { HelpCircle, Search, ChevronDown, Sparkles, Shield, Zap, Globe, MessageSquare } from 'lucide-react'

const FAQ_DATA = [
  {
    category: 'Chung',
    icon: <Globe className="w-4 h-4" />,
    questions: [
      {
        q: "Mindlabs là gì?",
        a: "Mindlabs là một hệ sinh thái năng suất tối giản, kết hợp giữa ghi chú (Mindnote), bản đồ tư duy (Mindmap) và lập kế hoạch (Clarity Planner)."
      },
      {
        q: "Tôi có thể sử dụng Mindlabs trên nhiều thiết bị không?",
        a: "Có, Mindlabs là nền tảng web-based và dữ liệu được đồng bộ hóa thời gian thực thông qua tài khoản của bạn, cho phép bạn làm việc trên mọi thiết bị có trình duyệt web."
      }
    ]
  },
  {
    category: 'Tính năng',
    icon: <Zap className="w-4 h-4" />,
    questions: [
      {
        q: "Làm thế nào để xuất dữ liệu của tôi?",
        a: "Hiện tại chúng tôi hỗ trợ xuất ghi chú sang định dạng Markdown và PDF. Tính năng xuất bản đồ tư duy sang hình ảnh (PNG/SVG) đang được phát triển."
      }
    ]
  },
  {
    category: 'Bảo mật',
    icon: <Shield className="w-4 h-4" />,
    questions: [
      {
        q: "Dữ liệu của tôi được lưu trữ ở đâu?",
        a: "Dữ liệu của bạn được lưu trữ an toàn trên nền tảng Supabase (PostgreSQL) với các tiêu chuẩn bảo mật khắt khe nhất."
      },
      {
        q: "Ai có quyền truy cập vào nội dung của tôi?",
        a: "Chỉ duy nhất bạn mới có quyền truy cập vào nội dung của mình. Chúng tôi không chia sẻ hoặc sử dụng dữ liệu của bạn cho mục đích bên thứ ba."
      }
    ]
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>('0-0')
  const [activeCategory, setActiveCategory] = useState('All')

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-full bg-[#fcfdfe] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span className="text-premium text-primary">Trung tâm hỗ trợ</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-none mb-8">
            Chúng tôi có thể <br /> <span className="text-secondary/20">giúp gì cho bạn?</span>
          </h1>
          
          {/* Search Bar Visual */}
          <div className="max-w-xl mx-auto relative group mt-12">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-secondary/30 group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm câu trả lời..."
              className="w-full pl-16 pr-8 py-5 bg-white border border-border-main/50 rounded-full focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
           {['All', ...FAQ_DATA.map(d => d.category)].map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${activeCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white text-secondary/50 border-gray-100 hover:border-primary/20'}`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-12">
           {FAQ_DATA.filter(d => activeCategory === 'All' || d.category === activeCategory).map((section, sIdx) => (
             <div key={sIdx} className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                   <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {section.icon}
                   </div>
                   <h2 className="text-lg font-black text-foreground/80 tracking-tight">{section.category}</h2>
                </div>
                
                <div className="space-y-4">
                   {section.questions.map((faq, qIdx) => {
                     const idx = `${sIdx}-${qIdx}`
                     const isOpen = openIndex === idx
                     return (
                       <div key={idx} className={`glass overflow-hidden rounded-[32px] border transition-all duration-500 ${isOpen ? 'border-primary/20 bg-white/80' : 'border-primary/5 hover:border-primary/10 bg-white/40'}`}>
                          <button 
                            onClick={() => toggleAccordion(idx)}
                            className="w-full px-8 py-6 flex items-center justify-between text-left group"
                          >
                             <span className={`text-base font-bold transition-colors ${isOpen ? 'text-primary' : 'text-foreground/80 group-hover:text-primary'}`}>
                               {faq.q}
                             </span>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-50 text-secondary/30 group-hover:bg-primary/10'}`}>
                                <ChevronDown className="w-4 h-4" />
                             </div>
                          </button>
                          
                          <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                             <div className="px-8 pb-8 text-secondary/60 text-sm leading-relaxed">
                                {faq.a}
                             </div>
                          </div>
                       </div>
                     )
                   })}
                </div>
             </div>
           ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-24 p-12 glass rounded-[48px] border border-primary/5 relative overflow-hidden group">
           <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-2">
                 <h3 className="text-2xl font-black text-foreground">Vẫn còn thắc mắc?</h3>
                 <p className="text-secondary/60 text-sm">Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn.</p>
              </div>
              <a href="/contact" className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] -primary/20 hover:scale-105 transition-all">
                 <MessageSquare className="w-4 h-4" />
                 Liên hệ ngay
              </a>
           </div>
        </div>

      </div>
    </div>
  )
}
