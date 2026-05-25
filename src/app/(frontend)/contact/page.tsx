'use client'

import { useState } from 'react'
import { Send, Mail, MapPin, Phone, MessageSquare, Zap, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-full bg-[#fcfdfe] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="flex flex-col gap-16">
          {/* Header */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2 border border-primary/10">
                <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-premium text-primary">Liên hệ</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-8">
              Hãy cùng <br /> <span className="text-secondary/20">kết nối.</span>
            </h1>
            <p className="text-lg text-secondary/70 leading-relaxed max-w-lg">
              Bạn có ý tưởng, thắc mắc hay đơn giản là muốn nói lời chào? Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Contact Form */}
            <div className="lg:col-span-7">
              {isSubmitted ? (
                <div className="glass p-12 rounded-[40px] border border-primary/5 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-4">Tin nhắn đã được gửi!</h3>
                  <p className="text-secondary/60 mb-8 max-w-sm">
                    Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất có thể.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-8 py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-premium text-secondary/40 ml-1">Họ tên</label>
                      <input
                        required
                        type="text"
                        id="name"
                        placeholder="Nguyễn Văn A"
                        className="w-full px-6 py-4 bg-white border border-border-main/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-premium text-secondary/40 ml-1">Email</label>
                      <input
                        required
                        type="email"
                        id="email"
                        placeholder="email@example.com"
                        className="w-full px-6 py-4 bg-white border border-border-main/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="subject" className="text-premium text-secondary/40 ml-1">Chủ đề</label>
                    <input
                      required
                      type="text"
                      id="subject"
                      placeholder="Hợp tác, Góp ý, Hỗ trợ..."
                      className="w-full px-6 py-4 bg-white border border-border-main/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-premium text-secondary/40 ml-1">Tin nhắn</label>
                    <textarea
                      required
                      id="message"
                      rows={5}
                      placeholder="Nội dung tin nhắn của bạn..."
                      className="w-full px-6 py-4 bg-white border border-border-main/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="mt-4 relative group flex items-center justify-between px-10 py-5 bg-primary text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-95 -primary/20 disabled:opacity-50"
                  >
                    <span className="relative z-10">{isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}</span>
                    <Send className={`w-4 h-4 relative z-10 transition-transform duration-500 group-hover:translate-x-1 ${isSubmitting ? 'animate-bounce' : ''}`} />
                    <div className="absolute right-0 top-0 h-full w-0 group-hover:w-full bg-foreground transition-all duration-500" />
                  </button>
                </form>
              )}
            </div>

            {/* Info Section */}
            <div className="lg:col-span-5 flex flex-col gap-10">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Mail, label: "Email", value: "contact@mindlabs.io.vn", sub: "Phản hồi trong 24h" },
                  { icon: Phone, label: "Hotline", value: "+84 865642110", sub: "Thứ 2 - Thứ 6, 8:00 - 17:00" },
                  { icon: MapPin, label: "Văn phòng", value: "Ho Chi Minh City, Vietnam", sub: "Mindlabs Creative Space" },
                  { icon: MessageSquare, label: "Cộng đồng", value: "@mindlabs.io.vn", sub: "Facebook, Instagram" }
                ].map((item, idx) => (
                  <div key={idx} className="group p-8 rounded-[32px] bg-white border border-border-main/50 hover:border-primary/20 hover:-premium transition-all duration-500 flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <item.icon className="w-5 h-5 text-secondary/40 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-premium text-secondary/30">{item.label}</span>
                      <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{item.value}</h4>
                      <p className="text-[11px] font-medium text-secondary/50 tracking-tight">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social or Extra Info Card */}
              <div className="glass p-10 rounded-[40px] relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-xl font-black text-foreground mb-4 relative z-10">Bạn là Content Creator?</h4>
                <p className="text-sm text-secondary/60 mb-6 relative z-10">
                  Chúng tôi luôn tìm kiếm những tâm hồn sáng tạo để cùng xây dựng cộng đồng Mindlabs phát triển.
                </p>
                <button className="text-premium text-primary hover:underline relative z-10">Tìm hiểu chương trình Partner →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
