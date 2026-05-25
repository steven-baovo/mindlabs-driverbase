'use client'

import { useState } from 'react'
import { ShieldCheck, FileText, Lock, Eye, Scale, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react'

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms')

  return (
    <div className="min-h-full bg-[#fcfdfe] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-32 relative z-10">
        
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-premium text-primary">Trung tâm Pháp lý</span>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-none mb-8">
            Pháp lý & <br /> <span className="text-secondary/20">Bảo mật.</span>
          </h1>
          <p className="text-lg text-secondary/60 max-w-lg leading-relaxed">
            Chúng tôi cam kết minh bạch về cách Mindlabs hoạt động và cách chúng tôi bảo vệ quyền lợi của bạn.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex p-1.5 bg-gray-100/50 backdrop-blur-sm rounded-2xl w-fit mb-12 border border-gray-200/50">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'terms' ? 'bg-white text-primary' : 'text-secondary/50 hover:text-secondary'}`}
          >
            <Scale className="w-4 h-4" />
            Điều khoản dịch vụ
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'privacy' ? 'bg-white text-primary' : 'text-secondary/50 hover:text-secondary'}`}
          >
            <Lock className="w-4 h-4" />
            Chính sách bảo mật
          </button>
        </div>

        {/* Content Area */}
        <div className="glass p-10 md:p-16 rounded-[40px] border border-primary/5 -premium bg-white/50 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             {activeTab === 'terms' ? <Scale className="w-32 h-32" /> : <ShieldCheck className="w-32 h-32" />}
          </div>

          <div className="relative z-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'terms' ? (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">1. Chấp nhận điều khoản</h2>
                  </div>
                  <p className="text-secondary/70 leading-relaxed">
                    Bằng việc truy cập và sử dụng Mindlabs, bạn đồng ý tuân thủ các điều khoản này. 
                    Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng dịch vụ của chúng tôi.
                  </p>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">2. Quyền sở hữu trí tuệ</h2>
                  </div>
                  <p className="text-secondary/70 leading-relaxed">
                    Bạn giữ toàn quyền sở hữu đối với nội dung bạn tạo ra (ghi chú, bản đồ tư duy, kế hoạch). 
                    Mindlabs chỉ cung cấp nền tảng để bạn lưu trữ và quản lý chúng. 
                    Chúng tôi không sở hữu và không có quyền truy cập trái phép vào dữ liệu của bạn.
                  </p>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">3. Giới hạn trách nhiệm</h2>
                  </div>
                  <p className="text-secondary/70 leading-relaxed">
                    Chúng tôi nỗ lực tối đa để đảm bảo dịch vụ hoạt động ổn định. Tuy nhiên, Mindlabs được cung cấp 
                    theo hình thức &quot;nguyên trạng&quot; và chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất dữ liệu 
                    nào do các nguyên nhân bất khả kháng hoặc lỗi từ phía người dùng.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">1. Thông tin thu thập</h2>
                  </div>
                  <p className="text-secondary/70 leading-relaxed">
                    Chúng tôi thu thập các thông tin cần thiết để vận hành dịch vụ: Email đăng ký, thông tin profile 
                    cơ bản và dữ liệu bạn trực tiếp tạo ra trên nền tảng. Tất cả dữ liệu này được lưu trữ an toàn 
                    trên hệ thống của Supabase.
                  </p>
                </section>
                <section className="space-y-6">
                  <div className="flex items-center gap-4 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">2. Bảo mật dữ liệu</h2>
                  </div>
                  <p className="text-secondary/70 leading-relaxed">
                    Dữ liệu của bạn được mã hóa và bảo mật bằng các công nghệ tiêu chuẩn ngành. 
                    Chúng tôi thực hiện sao lưu định kỳ để đảm bảo an toàn tối đa cho &quot;tài sản trí tuệ&quot; của bạn.
                  </p>
                </section>
              </>
            )}
          </div>

          <div className="mt-16 pt-10 border-t border-gray-100 text-center">
             <p className="text-[11px] text-secondary/30 uppercase tracking-[0.2em] font-bold">
                Cập nhật lần cuối: 15 Tháng 5, 2026
             </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-secondary/40 text-sm">
           Bạn có thắc mắc về pháp lý? <a href="/contact" className="text-primary hover:underline font-bold">Liên hệ chúng tôi</a>
        </div>

      </div>
    </div>
  )
}
