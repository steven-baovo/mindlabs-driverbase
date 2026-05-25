'use client'

import { Info, Sparkles, Target, Zap, Heart, Shield, Globe, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-full bg-[#fcfdfe] relative overflow-hidden">
      {/* Background Decor - Atmospheric Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-32 relative z-10">
        <div className="flex flex-col gap-24">
          
          {/* Section 1: Hero - The Vision */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-8">
              <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span className="text-premium text-primary">Câu chuyện của chúng tôi</span>
              </div>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.85] mb-10">
              Kiến tạo <br /> 
              <span className="text-secondary/20">không gian cho</span> <br />
              Tâm trí.
            </h1>
            <p className="text-xl text-secondary/70 leading-relaxed font-medium">
              Mindlabs không chỉ là một bộ công cụ. Nó là một triết lý về sự tập trung, 
              một nơi trú ẩn an yên giữa thế giới kỹ thuật số đầy ồn ào và xao nhãng.
            </p>
          </div>

          {/* Section 2: The Problem & Solution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-foreground tracking-tight leading-tight">
                Mọi chuyện bắt đầu từ một <br /> câu hỏi đơn giản...
              </h2>
              <div className="space-y-6 text-secondary/70 leading-relaxed">
                <p>
                   Tại sao trong thời đại có nhiều ứng dụng quản lý công việc nhất, chúng ta lại cảm thấy mệt mỏi và mất tập trung nhất? 
                   Chúng tôi nhận ra rằng: Vấn đề không phải là thiếu công cụ, mà là thiếu <strong>sự rõ ràng</strong>.
                </p>
                <p>
                  Chúng ta bị bao vây bởi hàng ngàn tính năng dư thừa, những thông báo không ngừng nghỉ và những giao diện phức tạp. 
                  Mindlabs được sinh ra để phá vỡ điều đó.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="glass p-1 rounded-[40px] border border-primary/5 overflow-hidden aspect-square flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5 flex items-center justify-center relative">
                   <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center animate-pulse -primary/40">
                      <div className="w-16 h-16 bg-white rounded-md rotate-45" />
                   </div>
                   {/* Floating Elements */}
                   <div className="absolute top-1/4 left-1/4 glass p-4 rounded-2xl border border-primary/10 animate-bounce duration-[3000ms]">
                      <Sparkles className="w-6 h-6 text-primary" />
                   </div>
                   <div className="absolute bottom-1/4 right-1/4 glass p-4 rounded-2xl border border-primary/10 animate-bounce duration-[4000ms]">
                      <Target className="w-6 h-6 text-primary" />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: The Philosophy - Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Zap, 
                title: "Tối giản (Minimalism)", 
                desc: "Chúng tôi loại bỏ mọi thứ không cần thiết để nhường chỗ cho những ý tưởng vĩ đại nảy mầm." 
              },
              { 
                icon: Heart, 
                title: "Con người làm trung tâm", 
                desc: "Công cụ phải phục vụ con người, không phải ngược lại. Mindlabs được thiết kế để uốn lượn theo tư duy của bạn." 
              },
              { 
                icon: Shield, 
                title: "Sự riêng tư tuyệt đối", 
                desc: "Suy nghĩ của bạn là tài sản quý giá nhất. Chúng tôi bảo vệ chúng bằng những tiêu chuẩn an ninh cao nhất." 
              }
            ].map((item, idx) => (
              <div key={idx} className="group p-10 rounded-[40px] bg-white border border-border-main/50 hover:border-primary/20 hover:-premium transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <item.icon className="w-6 h-6 text-secondary/40 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">{item.title}</h3>
                <p className="text-secondary/60 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Section 4: The Ecosystem */}
          <div className="glass p-16 rounded-[60px] border border-primary/5 relative overflow-hidden">
             <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
             
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <h2 className="text-4xl font-black text-foreground tracking-tight">Hệ sinh thái Workspace</h2>
                  <p className="text-secondary/70 leading-relaxed">
                    Từ những ghi chú nhanh với <strong>Mindnote</strong>, đến việc phác thảo tầm nhìn trên <strong>Mindmap</strong>, 
                    và quy hoạch thời gian với <strong>Clarity Planner</strong>. Tất cả được hội tụ tại một nơi duy nhất.
                  </p>
                  <Link href="/workspace" className="inline-flex items-center gap-3 text-primary font-black text-sm uppercase tracking-widest hover:gap-5 transition-all">
                    Bắt đầu trải nghiệm ngay <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-8 bg-white/50 backdrop-blur-sm border border-white rounded-3xl text-center">
                      <div className="text-3xl font-black text-primary mb-2">100%</div>
                      <div className="text-[10px] uppercase tracking-wider text-secondary/40 font-bold">Tập trung</div>
                   </div>
                   <div className="p-8 bg-white/50 backdrop-blur-sm border border-white rounded-3xl text-center mt-8">
                      <div className="text-3xl font-black text-primary mb-2">∞</div>
                      <div className="text-[10px] uppercase tracking-wider text-secondary/40 font-bold">Khả năng</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Section 5: Call to Action */}
          <div className="text-center space-y-12 py-20">
             <h2 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-none">
                Hãy cùng chúng tôi <br /> <span className="text-secondary/20">viết tiếp tương lai.</span>
             </h2>
             <div className="flex flex-wrap justify-center gap-6">
                <Link href="/contact" className="px-10 py-5 bg-primary text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] -primary/20 hover:scale-105 transition-all">
                   Kết nối với chúng tôi
                </Link>
                <div className="flex items-center gap-3 text-secondary/40 font-medium italic">
                   <Globe className="w-4 h-4" />
                   <span>Based in Ho Chi Minh City, Vietnam.</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
