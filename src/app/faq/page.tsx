import React from 'react'
import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronDown, MessageCircle, FileText, Lock, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hỏi Đáp Thường Gặp (FAQ) | Leanity Support',
  description: 'Tìm câu trả lời nhanh chóng cho các thắc mắc về không gian làm việc số Leanity, đồng bộ dữ liệu, phím tắt và bảo mật.',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      icon: FileText,
      items: [
        {
          q: "Leanity hoạt động như thế nào?",
          a: "Leanity là không gian làm việc số tích hợp chuẩn mực gồm Quản lý công việc (Tasks), Bảng Kanban, tài liệu ghi chú lâu dài và đồng hồ Pomodoro. Ứng dụng hoạt động theo cơ chế ưu tiên lưu trữ cục bộ (Local-First), giúp dữ liệu tải nhanh tức thì và hoạt động mượt mà kể cả khi ngoại tuyến."
        },
        {
          q: "Tôi có cần trả phí để sử dụng Leanity không?",
          a: "Leanity hoàn toàn miễn phí cho tất cả các tính năng cá nhân cơ bản bao gồm đồng hồ Pomodoro, quản lý công việc và lưu trữ tài liệu trong bộ nhớ cục bộ máy tính của bạn."
        }
      ]
    },
    {
      category: "Sync & Offline",
      icon: Lock,
      items: [
        {
          q: "Dữ liệu của tôi được đồng bộ như thế nào?",
          a: "Mặc định dữ liệu của bạn được lưu trong cơ sở dữ liệu trình duyệt cục bộ của máy tính của bạn. Khi bạn đăng nhập, dữ liệu sẽ được đồng bộ hóa hai chiều siêu tốc lên đám mây bảo mật Supabase và sao lưu tùy chọn trực tiếp về tài khoản Google Drive cá nhân của bạn để đảm bảo dữ liệu không bị thất lạc."
        },
        {
          q: "Leanity có thể hoạt động hoàn toàn ngoại tuyến (Offline) không?",
          a: "Có, đây là tính năng cốt lõi của Local-First. Tất cả thao tác tạo task, ghi chú, chạy Pomodoro đều hoạt động bình thường khi mất kết nối mạng. Ngay khi có mạng trở lại, Leanity sẽ tự động đồng bộ hóa ngầm các thay đổi của bạn mà không gây gián đoạn công việc."
        }
      ]
    },
    {
      category: "Tasks & Pomodoro",
      icon: Clock,
      items: [
        {
          q: "Làm thế nào để sử dụng đồng hồ Pomodoro kết hợp với Tasks?",
          a: "Bạn có thể kích hoạt trực tiếp đồng hồ Pomodoro từ thanh công cụ hoặc bấm chạy Pomodoro gắn liền với một Task cụ thể. Khi đồng hồ chạy hết 25 phút, Leanity sẽ tự động ghi nhận thời gian tập trung (focus session) đó vào bảng báo cáo hiệu suất của Task tương ứng."
        },
        {
          q: "Ứng dụng có hỗ trợ bảng Kanban không?",
          a: "Có, hệ thống công việc (Tasks) của Leanity hỗ trợ hiển thị dưới hai dạng: Danh sách tinh gọn (List View) và Bảng kéo thả (Kanban Board), giúp bạn dễ dàng theo dõi trạng thái công việc (Chưa làm, Đang làm, Đã xong)."
        }
      ]
    }
  ];

  // Generate Google FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.flatMap(cat => cat.items.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    })))
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#5e6ad2]/20 selection:text-[#5e6ad2] font-sans overflow-x-hidden relative flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-150px] right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute top-[-100px] left-1/4 w-[400px] h-[400px] rounded-full bg-[#5e6ad2]/5 blur-[100px]" />
      </div>

      <Header />

      <main className="flex-1 py-16 px-6 max-w-[720px] mx-auto w-full flex flex-col">
        
        {/* Title Header */}
        <header className="space-y-4 mb-16 text-center animate-in fade-in duration-300">
          <span className="text-[13px] font-bold text-[#5e6ad2] uppercase tracking-widest">
            Hỏi đáp & Hỗ trợ
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
            Các câu hỏi thường gặp
          </h1>
          <p className="text-[13px] text-zinc-500 leading-relaxed font-normal max-w-lg mx-auto">
            Tìm câu trả lời nhanh chóng cho tất cả thắc mắc về tính năng, cách thức đồng bộ hóa và bảo mật dữ liệu trên Leanity Workspace.
          </p>
        </header>

        {/* FAQs Accordion list grouped by category */}
        <div className="space-y-12">
          {faqs.map((group, idx) => {
            const CatIcon = group.icon
            return (
              <section key={idx} className="space-y-4">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100">
                  <div className="w-7 h-7 rounded bg-[#5e6ad2]/5 flex items-center justify-center text-[#5e6ad2] shrink-0">
                    <CatIcon className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[13px] font-bold uppercase tracking-wider text-zinc-700">
                    {group.category}
                  </h2>
                </div>

                <div className="space-y-1">
                  {group.items.map((item, itemIdx) => (
                    <details 
                      key={itemIdx} 
                      className="group py-4 border-b border-zinc-150 last:border-b-0 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                        <h3 className="text-[14px] font-bold text-zinc-900 group-open:text-[#5e6ad2] transition-colors pr-4 select-none">
                          {item.q}
                        </h3>
                        <span className="w-5 h-5 rounded border border-zinc-200 bg-white group-hover:bg-zinc-50 flex items-center justify-center text-zinc-400 group-open:rotate-180 transition-transform duration-200 shrink-0">
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      </summary>
                      <div className="mt-3 text-[13px] text-zinc-500 leading-relaxed font-normal">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* Need more help banner */}
        <section className="mt-16 p-6 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#5e6ad2]" />
              <span>Bạn vẫn còn câu hỏi khác?</span>
            </h3>
            <p className="text-[12px] text-zinc-500 font-normal leading-relaxed">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn qua email hoặc cộng đồng chat chính thức.
            </p>
          </div>
          <a
            href="/contact"
            className="w-full sm:w-auto px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-[12px] font-bold rounded shadow-subtle flex items-center justify-center transition-colors"
          >
            Liên hệ ngay
          </a>
        </section>

      </main>

      <Footer />
    </div>
  )
}
