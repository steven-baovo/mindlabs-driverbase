import React from 'react'
import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShieldAlert, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật & Điều Khoản | Leanity Workspace',
  description: 'Tìm hiểu về chính sách bảo mật dữ liệu, lưu trữ cục bộ, cơ chế mã hóa đám mây và quyền sở hữu thông tin cá nhân tại Leanity.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#5e6ad2]/20 selection:text-[#5e6ad2] font-sans overflow-x-hidden relative flex flex-col">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-150px] left-1/3 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute top-[-100px] right-1/3 w-[400px] h-[400px] rounded-full bg-[#5e6ad2]/5 blur-[100px]" />
      </div>

      <Header />

      <main className="flex-1 py-16 px-6 max-w-[720px] mx-auto w-full flex flex-col">
        
        {/* Header Intro */}
        <header className="space-y-4 mb-12 border-b border-zinc-200/80 pb-8 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-subtle">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-[13px] font-normal uppercase tracking-widest text-[#5e6ad2]">
              Pháp lý & Quyền riêng tư
            </h2>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
            Chính sách bảo mật & Điều khoản sử dụng
          </h1>
          <p className="text-[13px] text-zinc-400 font-normal leading-relaxed">
            Cập nhật lần cuối: ngày 28 tháng 5 năm 2026
          </p>
        </header>

        {/* Article content (prose layout) */}
        <article className="space-y-8 text-[13px] text-zinc-600 leading-relaxed font-normal">
          
          <section id="introduction" className="space-y-3">
            <h2 className="text-[16px] font-bold text-zinc-900">1. Giới thiệu chung</h2>
            <p>
              Chào mừng bạn đến với <strong>Leanity Workspace</strong>. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ dữ liệu cá nhân của bạn theo tiêu chuẩn cao nhất. Tài liệu này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin khi bạn truy cập trang web hoặc sử dụng phần mềm Leanity.
            </p>
          </section>

          <section id="data-ownership" className="space-y-3">
            <h2 className="text-[16px] font-bold text-zinc-900">2. Triết lý sở hữu dữ liệu (Data Ownership)</h2>
            <p>
              Chúng tôi xây dựng Leanity theo mô hình <strong>Local-First</strong> (Ưu tiên lưu trữ cục bộ). Mọi ghi chú, tài liệu thiết kế, sơ đồ tư duy và danh sách công việc của bạn đều được lưu trữ trực tiếp trong trình duyệt hoặc bộ nhớ vật lý của thiết bị của bạn. 
            </p>
            <p>
              Chúng tôi không có quyền truy cập, đọc, sửa đổi hoặc bán bất kỳ dữ liệu nội dung nào bạn tạo ra bên trong Workspace của mình.
            </p>
          </section>

          <section id="cloud-sync" className="space-y-3">
            <h2 className="text-[16px] font-bold text-zinc-900">3. Đồng bộ hóa và Bảo mật đám mây</h2>
            <p>
              Khi bạn chủ động kích hoạt tính năng đồng bộ hóa đám mây (Cloud Sync):
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Supabase Database:</strong> Dữ liệu cấu trúc (Task, trạng thái Pomodoro) được truyền tải qua kết nối HTTPS mã hóa SSL và lưu trữ an toàn trong máy chủ đám mây Supabase.
              </li>
              <li>
                <strong>Google Drive Backups:</strong> Bạn có thể tùy chọn kết nối tài khoản Google Drive cá nhân của mình để sao lưu tự động các file tài liệu lớn. Quá trình sao lưu được phân quyền bảo mật cao (OAuth 2.0) trực tiếp giữa máy khách của bạn và API của Google.
              </li>
            </ul>
          </section>

          <section id="cookies" className="space-y-3">
            <h2 className="text-[16px] font-bold text-zinc-900">4. Sử dụng Cookies và Bộ nhớ cục bộ</h2>
            <p>
              Leanity sử dụng <strong>LocalStorage</strong> và <strong>IndexedDB</strong> để duy trì trạng thái hoạt động ngoại tuyến và lưu trữ tạm thời các cài đặt giao diện (như Chế độ sáng/tối, thời gian đếm ngược Pomodoro). Các cookie phân tích ẩn danh tối thiểu có thể được dùng để đo lường hiệu năng hoạt động của trang chủ nhằm liên tục tối ưu hóa tốc độ tải trang.
            </p>
          </section>

          <section id="terms" className="space-y-3">
            <h2 className="text-[16px] font-bold text-zinc-900">5. Điều khoản sử dụng dịch vụ</h2>
            <p>
              Bằng việc sử dụng Leanity Workspace, bạn đồng ý không lạm dụng dịch vụ để truyền tải nội dung độc hại, vi phạm pháp luật hoặc can thiệp trái phép vào hệ thống máy chủ đồng bộ đám mây của chúng tôi. Leanity Labs bảo lưu quyền ngừng cung cấp dịch vụ đồng bộ đối với các tài khoản vi phạm các chính sách an toàn thông tin chung.
            </p>
          </section>

          {/* Core values visual callout */}
          <section className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 font-normal mt-10">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#5e6ad2]" />
              <span>Cam kết của Leanity Labs</span>
            </h3>
            <p className="text-[13px] text-zinc-500 font-normal leading-relaxed">
              Chúng tôi cam kết không chèn quảng cáo, không bán thông tin người dùng cho bên thứ ba, và không sử dụng dữ liệu ghi chú cá nhân của bạn để huấn luyện bất kỳ mô hình AI nào khi chưa được sự cho phép rõ ràng từ phía bạn.
            </p>
          </section>

        </article>

      </main>

      <Footer />
    </div>
  )
}
