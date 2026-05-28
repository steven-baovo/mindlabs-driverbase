import Link from 'next/link'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { MessageSquare, ExternalLink, Sun } from 'lucide-react'
import Header from '@/components/Header'
import Logo from '@/components/Logo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Leanity - Giải Pháp Quản Lý Năng Suất, Tasks & Pomodoro',
  description: 'Trải nghiệm không gian làm việc số Leanity với quản lý công việc (Tasks), soạn thảo tài liệu, ghi chú và đồng hồ Pomodoro giúp tối đa hóa sự tập trung.',
}

export default async function Home() {
  // Tự động chuyển hướng thông minh trên Server nếu đã đăng nhập (Tạm thời tắt để user test giao diện trang chủ mới)
  /*
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      redirect('/workspace')
    }
  } catch (e) {
    console.error('Auth check error on landing page:', e)
  }
  */

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
          "text": "Chỉ cần đăng ký và truy cập ngay lập tức vào không gian làm việc cá nhân (Workspace) của bạn để quản lý công việc và lưu trữ tài liệu một cách khoa học."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#5e6ad2]/20 selection:text-[#5e6ad2] font-sans overflow-x-hidden relative">
      
      {/* Background Glows (Linear/Capacities-style soft ambient lighting) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-200px] left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-[150px]" />
        <div className="absolute top-[-150px] right-1/4 w-[500px] h-[500px] rounded-full bg-[#5e6ad2]/5 blur-[130px]" />
        <div className="absolute top-[250px] left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[140px]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Unified Header */}
      <Header />

      {/* Hero Section */}
      <main className="pt-20 lg:pt-24 px-6 max-w-[1200px] mx-auto flex flex-col items-center text-center">
        
        {/* Hero Headings */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight pb-4 leading-[1.1] text-zinc-950">
          Không Gian Làm Việc Số
          <br />
          <span className="bg-gradient-to-r from-[#5e6ad2] via-indigo-600 to-[#10b981] bg-clip-text text-transparent">
            Tối Giản & Tập Trung.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-500 font-normal max-w-2xl mt-6 leading-relaxed">
          Hệ sinh thái thông minh tích hợp Quản lý công việc (Tasks), Soạn thảo tài liệu và đồng hồ Pomodoro giúp bạn giải phóng tiềm năng làm việc mỗi ngày.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/workspace" 
            className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-full shadow-subtle transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>Bắt Đầu Trải Nghiệm</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-full border border-zinc-200 transition-all duration-200 shadow-sm flex items-center justify-center"
          >
            Tìm hiểu thêm
          </a>
        </div>

        {/* Premium Workspace UI Mockup Preview (Capacities Style Light Mode) */}
        <section className="mt-20 w-full rounded-2xl border border-zinc-200 bg-white p-3 shadow-overlay relative group overflow-hidden">
          
          {/* Subtle gradient border overlay */}
          <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-[#5e6ad2]/10 via-transparent to-[#10b981]/10 rounded-2xl pointer-events-none -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top Bar window layout */}
          <div className="h-7 bg-zinc-50 rounded-t-xl border-b border-zinc-100 flex items-center px-4 space-x-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
            <div className="flex-1 text-[10px] text-zinc-400 font-mono text-center">app.leanity.com/workspace</div>
          </div>

          {/* Simulated Workspace Dashboard Content */}
          <div className="bg-white rounded-b-xl h-[280px] sm:h-[380px] flex overflow-hidden text-left text-zinc-500 font-sans text-xs">
            
            {/* Mock Sidebar */}
            <aside className="w-1/4 border-r border-zinc-100 p-4 hidden sm:flex flex-col space-y-4 shrink-0 bg-zinc-50/50">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded bg-zinc-200" />
                <div className="w-16 h-3 bg-zinc-200 rounded" />
              </div>
              <div className="space-y-2.5 pt-4">
                <div className="h-3.5 bg-[#5e6ad2]/10 border-l-2 border-[#5e6ad2] rounded-r w-full flex items-center px-2 text-[10px] text-[#5e6ad2] font-bold">Workspace</div>
                <div className="h-3.5 hover:bg-zinc-100 rounded w-full flex items-center px-2 text-[10px]">Nhiệm vụ</div>
                <div className="h-3.5 hover:bg-zinc-100 rounded w-full flex items-center px-2 text-[10px]">Tập trung Pomodoro</div>
                <div className="h-3.5 hover:bg-zinc-100 rounded w-full flex items-center px-2 text-[10px]">Cài đặt</div>
              </div>
            </aside>

            {/* Mock Main Application Pane */}
            <section className="flex-1 flex flex-col p-6 overflow-hidden bg-white">
              <header className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                <div className="space-y-1">
                  <div className="h-4 bg-zinc-100 rounded w-32" />
                  <div className="h-2 bg-zinc-50 rounded w-20" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-5 bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] rounded-full flex items-center justify-center text-[9px] font-bold">Local-First</div>
                  <div className="w-5 h-5 rounded-full bg-zinc-100" />
                </div>
              </header>

              <div className="flex-1 grid grid-cols-3 gap-4">
                {/* Notes Column */}
                <article className="col-span-2 border border-zinc-100 bg-zinc-50/30 rounded-xl p-4 space-y-3">
                  <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  <div className="space-y-2 pt-2">
                    <div className="h-2 bg-zinc-100 rounded w-full" />
                    <div className="h-2 bg-zinc-100 rounded w-[90%]" />
                    <div className="h-2 bg-zinc-100 rounded w-[95%]" />
                    <div className="h-2 bg-zinc-100 rounded w-[60%]" />
                  </div>
                </article>

                {/* Pomodoro Widget Column */}
                <article className="border border-zinc-100 bg-zinc-50/30 rounded-xl p-4 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-2 border-[#5e6ad2]/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#5e6ad2]" />
                    <span className="font-mono text-zinc-700 font-bold text-[10px]">25:00</span>
                  </div>
                  <div className="w-12 h-4 bg-[#5e6ad2]/10 text-[#5e6ad2] text-[9px] font-bold rounded flex items-center justify-center">Focus</div>
                </article>
              </div>
            </section>
          </div>
        </section>

      </main>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 lg:py-32 px-6 max-w-[1200px] mx-auto">
        <header className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#5e6ad2] font-bold">Tính năng vượt trội</h2>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
            Mọi công cụ năng suất trong một hệ thống tinh gọn
          </p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Tasks & Workspace (Large - spans 2 columns) */}
          <article className="md:col-span-2 bg-white border border-zinc-200 hover:border-zinc-300 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#5e6ad2]/5 rounded-full blur-3xl pointer-events-none -z-10 group-hover:bg-[#5e6ad2]/10 transition-colors" />
            
            <div className="space-y-4 max-w-md">
              <div className="w-10 h-10 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-lg text-primary">🎯</div>
              <h3 className="text-xl font-bold text-zinc-900">Quản lý Tasks & Kanban Workspace</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Tổ chức toàn bộ công việc của bạn một cách trực quan thông qua danh sách Tasks linh hoạt hoặc bảng Kanban hiện đại. Hỗ trợ phân loại trạng thái rõ ràng giúp theo sát mục tiêu nhanh chóng.
              </p>
            </div>

            <div className="mt-8 border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Task Đang Làm</span>
                <span className="text-[#5e6ad2] font-bold">Độ ưu tiên cao</span>
              </div>
              <div className="h-8 bg-white rounded-lg flex items-center px-3 border border-zinc-100 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2.5 animate-pulse" />
                <span className="text-zinc-700 font-semibold text-[11px] truncate">Thiết kế hoàn chỉnh giao diện Landing Page</span>
              </div>
            </div>
          </article>

          {/* Card 2: Pomodoro Clock */}
          <article className="bg-white border border-zinc-200 hover:border-zinc-300 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-lg text-[#10b981]">⏱️</div>
              <h3 className="text-xl font-bold text-zinc-900">Đồng hồ Pomodoro</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Phương pháp đếm ngược Pomodoro chuẩn khoa học giúp chia nhỏ thời gian làm việc, tối đa hóa tập trung và ghi nhận năng suất tự động.
              </p>
            </div>

            <div className="mt-6 flex justify-center items-center py-4">
              <div className="w-24 h-24 rounded-full border-4 border-zinc-100 flex items-center justify-center relative shadow-sm">
                <div className="absolute inset-0 rounded-full border-t-4 border-[#10b981]" />
                <span className="font-mono text-zinc-800 font-extrabold text-xs">25:00</span>
              </div>
            </div>
          </article>

          {/* Card 3: Library & Connecting Nodes */}
          <article className="bg-white border border-zinc-200 hover:border-zinc-300 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg text-violet-500">📝</div>
              <h3 className="text-xl font-bold text-zinc-900">Thư Viện Tài Liệu</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Trình soạn thảo mạnh mẽ, lưu giữ ghi chú, tài liệu dài lâu với kiến trúc tổ chức cây phân cấp thông minh như cấu trúc tri thức của Capacities.
              </p>
            </div>

            <div className="mt-6 border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 text-[10px] space-y-2">
              <div className="flex items-center text-zinc-400">
                <span className="mr-1">📁</span> <span>Thư mục cha</span>
              </div>
              <div className="flex items-center text-zinc-700 font-semibold pl-3 border-l border-zinc-200">
                <span className="mr-1">📄</span> <span>Tài liệu thiết kế.docx</span>
              </div>
            </div>
          </article>

          {/* Card 4: Local-First & Sync Engine */}
          <article className="md:col-span-2 bg-white border border-zinc-200 hover:border-zinc-300 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none -z-10 group-hover:bg-[#10b981]/10 transition-colors" />

            <div className="space-y-4 max-w-md">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-lg text-[#10b981]">⚡</div>
              <h3 className="text-xl font-bold text-zinc-900">Đồng Bộ Siêu Nhanh (Local-First Sync)</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Tốc độ phản hồi cực nhanh dưới 5ms vì dữ liệu hoạt động trực tiếp từ bộ nhớ cục bộ. Đồng bộ hóa ngầm mượt mà với Supabase và đám mây Google Drive để bảo vệ thông tin hoàn hảo trên mọi thiết bị.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between border border-zinc-100 bg-zinc-50 p-3 rounded-xl">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-[#10b981]">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                <span>Trực Tuyến & Đồng Bộ</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Độ trễ: 0.1ms (Local Cache)</span>
            </div>
          </article>

        </div>
      </section>

      {/* Philosophy Method Section */}
      <section id="method" className="py-24 border-t border-zinc-200 px-6 max-w-[1200px] mx-auto bg-gradient-to-b from-white via-zinc-50 to-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-[#5e6ad2] font-bold">Triết lý thiết kế</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 leading-tight">Vì sao chọn triết lý tinh gọn (Lean)?</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Thế giới kỹ thuật số ngày nay tràn ngập các công cụ quá tải tính năng, gây xao nhãng và làm giảm sự tập trung vốn có. Leanity ra đời để tái cấu trúc lại cách bạn làm việc:
            </p>
            <ul className="space-y-3.5 text-xs text-zinc-700 font-normal">
              <li className="flex items-start space-x-2.5">
                <span className="text-[#10b981] font-bold">✓</span>
                <span><strong>Giảm tải xao nhãng:</strong> Giao diện tối giản, tập trung vào cốt lõi nhiệm vụ và tài liệu.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-[#10b981] font-bold">✓</span>
                <span><strong>Phục vụ người dùng trước:</strong> Cơ chế Local-first giúp ứng dụng hoạt động mượt mà ngay cả khi ngoại tuyến.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-[#10b981] font-bold">✓</span>
                <span><strong>Bảo mật dữ liệu tuyệt đối:</strong> Quyền sở hữu tài liệu nằm trong tay bạn qua tùy chọn sao lưu đám mây cá nhân.</span>
              </li>
            </ul>
          </div>
          <div className="border border-zinc-200 bg-white rounded-2xl p-8 space-y-6 relative overflow-hidden shadow-subtle">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#5e6ad2]/5 rounded-full blur-xl pointer-events-none -z-10" />
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-400 font-mono">Quotes / Khách hàng</div>
              <p className="text-sm font-semibold italic text-zinc-800 leading-relaxed">
                "Leanity thực sự làm tôi nhớ đến sự mượt mà của Linear và tính tổ chức cây thông minh của Capacities. Không gian làm việc giờ đây vô cùng yên tĩnh và tập trung!"
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100" />
              <div>
                <div className="text-[11px] font-bold text-zinc-900">Thành Viên Sáng Lập</div>
                <div className="text-[9px] text-zinc-400 font-normal">Phát Triển Sản Phẩm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section id="about" className="py-24 text-center max-w-[1200px] mx-auto px-6">
        <div className="bg-[#5e6ad2]/5 border border-[#5e6ad2]/10 rounded-3xl p-10 lg:p-16 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#5e6ad2]/5 rounded-full blur-3xl pointer-events-none -z-10" />
          
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-950">Bắt đầu nâng cao hiệu suất ngay hôm nay</h2>
          <p className="text-zinc-500 text-xs max-w-lg mx-auto leading-relaxed">
            Tham gia vào không gian làm việc số tối giản, an toàn và tối đa hóa sự tập trung cùng hàng nghìn người dùng chuyên nghiệp.
          </p>

          <div className="flex justify-center">
            <Link 
              href="/workspace" 
              className="px-8 py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-extrabold rounded-full transition-all duration-200 shadow-subtle flex items-center space-x-2"
            >
              <span>Vào Workspace Của Bạn</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Navigation (Capacities.io Premium Style) */}
      <footer className="border-t border-zinc-200 bg-white pt-16 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-16">
            
            {/* Left Brand block (4 cols) */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-2.5">
                <Logo size={28} />
                <span className="font-extrabold text-base tracking-tight text-zinc-900 select-none">
                  Leanity
                </span>
              </div>
              <p className="text-zinc-400 text-[12px] font-normal leading-relaxed max-w-[220px]">
                Không gian làm việc số tĩnh lặng giúp nâng cao hiệu suất công việc.
              </p>
              
              {/* Capacities-style social media cells grid */}
              <div className="flex flex-wrap gap-2 pt-2">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                  aria-label="GitHub Repository"
                >
                  <svg className="w-3.5 h-3.5 font-bold" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                  aria-label="Twitter X profile"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                  aria-label="YouTube Channel"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.525 3.545 12 3.545 12 3.545s-7.525 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.863.508 9.388.508 9.388.508s7.525 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a 
                  href="https://discord.gg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-subtle"
                  aria-label="Discord Community Server"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Columns (8 cols total, 2 cols each) */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
              
              {/* Column 1: Product */}
              <div className="space-y-4">
                <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Product</h4>
                <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                  <li><Link href="/workspace" className="hover:text-zinc-950 transition-colors">Workspace</Link></li>
                  <li><Link href="/tasks" className="hover:text-zinc-950 transition-colors">Tasks & Kanban</Link></li>
                  <li><Link href="/pomodoro" className="hover:text-zinc-950 transition-colors">Pomodoro Timer</Link></li>
                  <li><Link href="/docs/xay-dung-thu-vien-tri-thuc-second-brain" className="hover:text-zinc-950 transition-colors">Library Notes</Link></li>
                  <li><Link href="/docs/xay-dung-thu-vien-tri-thuc-second-brain" className="hover:text-zinc-950 transition-colors">Graph View</Link></li>
                </ul>
              </div>

              {/* Column 2: Resources */}
              <div className="space-y-4">
                <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Resources</h4>
                <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                  <li className="flex items-center gap-1">
                    <Link href="/docs" className="hover:text-zinc-950 transition-colors">Documentation</Link>
                    <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                  </li>
                  <li><Link href="/blog" className="hover:text-zinc-950 transition-colors">Productivity Blog</Link></li>
                  <li><Link href="/docs/bang-tra-cuu-phim-tat-nhanh" className="hover:text-zinc-950 transition-colors">Shortcuts sheet</Link></li>
                  <li className="flex items-center gap-1">
                    <a href="https://status.supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 transition-colors flex items-center gap-0.5">Status</a>
                    <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                  </li>
                  <li><Link href="/docs/bi-mat-kich-hoat-trang-thai-dong-chay-flow-state" className="hover:text-zinc-950 transition-colors">Flow State Guide</Link></li>
                </ul>
              </div>

              {/* Column 3: Company */}
              <div className="space-y-4">
                <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Company</h4>
                <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                  <li><a href="#" className="hover:text-zinc-950 transition-colors">Our Team</a></li>
                  <li><Link href="/docs/bat-dau-nhanh-voi-leanity" className="hover:text-zinc-950 transition-colors">Principles</Link></li>
                  <li><a href="#" className="hover:text-zinc-950 transition-colors">Sustainability</a></li>
                  <li><a href="#" className="hover:text-zinc-950 transition-colors">Help Center</a></li>
                </ul>
              </div>

              {/* Column 4: Legal */}
              <div className="space-y-4">
                <h4 className="text-[12px] font-bold text-zinc-900 tracking-wider">Legal</h4>
                <ul className="space-y-2.5 text-[12px] font-normal text-zinc-500">
                  <li><a href="#" className="hover:text-zinc-950 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-zinc-950 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-zinc-950 transition-colors">Data Ownership</a></li>
                </ul>
              </div>

            </div>

          </div>

          {/* Bottom row (Copyright & Sun) */}
          <div className="border-t border-zinc-200 pt-8 flex items-center justify-between text-[11px] font-semibold text-zinc-400 select-none">
            <span>© {new Date().getFullYear()} Leanity Labs. Tất cả quyền được bảo lưu.</span>
            
            {/* Pure light theme focus icon */}
            <button 
              className="w-7 h-7 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#5e6ad2] hover:bg-[#5e6ad2]/5 transition-colors shadow-subtle shrink-0" 
              title="Leanity Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  )
}
