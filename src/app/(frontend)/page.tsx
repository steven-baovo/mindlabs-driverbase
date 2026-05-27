import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leanity - Giải Pháp Quản Lý Năng Suất, Tasks & Pomodoro',
  description: 'Trải nghiệm không gian làm việc số Leanity với quản lý công việc (Tasks), soạn thảo tài liệu, ghi chú và đồng hồ Pomodoro giúp tối đa hóa sự tập trung.',
}

export default function Home() {
  // Cấu trúc Dữ liệu Schema FAQPage dành cho Generative Engine Optimization (Google AI Overviews)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Leanity là gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Leanity là một nền tảng quản lý năng suất toàn diện, cung cấp không gian làm việc số tích hợp quản lý công việc (Tasks), soạn thảo và lưu trữ tài liệu lâu dài, cùng với đồng hồ Pomodoro hỗ trợ tập trung cao độ."
        }
      },
      {
        "@type": "Question",
        "name": "Leanity có hỗ trợ quản lý Pomodoro không?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Có. Leanity tích hợp sẵn đồng hồ Pomodoro chuẩn xác, giúp người dùng chia nhỏ thời gian làm việc, tăng cường sự tập trung và cung cấp các báo cáo công việc tự động hàng ngày."
        }
      },
      {
        "@type": "Question",
        "name": "Làm thế nào để bắt đầu sử dụng Leanity?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Chỉ cần nhấp vào nút 'Vào Workspace' để truy cập ngay lập tức vào không gian làm việc cá nhân của bạn, quản lý Kanban, Todo và lưu trữ tài liệu một cách khoa học."
        }
      }
    ]
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-16 z-10">
        <header className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
            🚀 Nền tảng năng suất dành cho bạn
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 pb-2">
            Không Gian Làm Việc Số Leanity
          </h1>
          <p className="text-xl lg:text-2xl text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
            Hệ sinh thái thông minh giúp bạn quản lý năng suất, theo dõi công việc và cân bằng cuộc sống với phương pháp khoa học.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <article className="bg-surface/50 backdrop-blur-xl p-8 rounded-2xl shadow-subtle border border-border-main hover:border-primary/30 transition-all duration-300 flex flex-col space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎯</div>
            <h2 className="text-2xl font-bold">Quản Lý Tasks & Kanban</h2>
            <p className="text-secondary leading-relaxed">Tổ chức công việc khoa học theo dạng danh sách Todo hoặc bảng Kanban trực quan, đảm bảo không bỏ sót bất kỳ nhiệm vụ nào.</p>
          </article>
          
          <article className="bg-surface/50 backdrop-blur-xl p-8 rounded-2xl shadow-subtle border border-border-main hover:border-primary/30 transition-all duration-300 flex flex-col space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📝</div>
            <h2 className="text-2xl font-bold">Soạn Thảo & Lưu Trữ</h2>
            <p className="text-secondary leading-relaxed">Công cụ soạn thảo tài liệu mạnh mẽ giúp bạn ghi chép, lưu trữ và tra cứu thông tin lâu dài một cách dễ dàng và bảo mật.</p>
          </article>

          <article className="bg-surface/50 backdrop-blur-xl p-8 rounded-2xl shadow-subtle border border-border-main hover:border-primary/30 transition-all duration-300 flex flex-col space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⏱️</div>
            <h2 className="text-2xl font-bold">Đồng Hồ Pomodoro</h2>
            <p className="text-secondary leading-relaxed">Tích hợp sẵn bộ đếm thời gian Pomodoro giúp tối đa hóa sự tập trung và tự động trích xuất báo cáo năng suất hàng ngày.</p>
          </article>
        </section>

        <div className="pt-8 w-full flex justify-center">
          <Link 
            href="/workspace" 
            className="px-8 py-4 bg-primary text-primary-foreground text-lg font-semibold rounded-full shadow-linear hover:shadow-lg hover:scale-105 hover:bg-primary/90 transition-all duration-300 flex items-center space-x-2"
          >
            <span>Vào Workspace Của Bạn</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </main>
  )
}
