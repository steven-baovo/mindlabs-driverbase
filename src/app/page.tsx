import Link from 'next/link'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Leanity - Giải Pháp Quản Lý Năng Suất, Tasks & Pomodoro',
  description: 'Trải nghiệm không gian làm việc số Leanity với quản lý công việc (Tasks), soạn thảo tài liệu, ghi chú và đồng hồ Pomodoro giúp tối đa hóa sự tập trung.',
}

export default async function Home() {
  // Tự động chuyển hướng thông minh trên Server nếu đã đăng nhập
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      redirect('/workspace')
    }
  } catch (e) {
    console.error('Auth check error on landing page:', e)
  }

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
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-primary/30 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Background Glows (Linear/Capacities-style ambient lighting) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-200px] left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px]" />
        <div className="absolute top-[-150px] right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[130px]" />
        <div className="absolute top-[250px] left-1/3 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Floating Header Navigation */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-14 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/40 rounded-full z-50 px-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
            L
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Leanity
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors duration-200">Tính năng</a>
          <a href="#method" className="hover:text-white transition-colors duration-200">Phương pháp</a>
          <a href="#about" className="hover:text-white transition-colors duration-200">Về chúng tôi</a>
        </nav>

        <div>
          <Link 
            href="/workspace" 
            className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold rounded-full transition-all duration-200 shadow-lg flex items-center space-x-1.5"
          >
            <span>Vào Workspace</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 lg:pt-40 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs font-bold text-zinc-300 mb-8 shadow-sm backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Phiên bản v1.0.0 chính thức phát hành</span>
        </div>

        {/* Hero Headings */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight pb-4 leading-[1.1]">
          <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Không Gian Làm Việc Số
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Tối Giản & Tập Trung.
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-zinc-400 font-medium max-w-2xl mt-6 leading-relaxed">
          Hệ sinh thái thông minh tích hợp Quản lý công việc (Tasks), Soạn thảo tài liệu và đồng hồ Pomodoro giúp bạn giải phóng tiềm năng làm việc mỗi ngày.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/workspace" 
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white text-sm font-bold rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>Bắt Đầu Trải Nghiệm</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-full border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex items-center justify-center"
          >
            Tìm hiểu thêm
          </a>
        </div>

        {/* Premium Workspace UI Mockup Preview (Linear/Capacities Style) */}
        <section className="mt-20 w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group overflow-hidden">
          
          {/* Subtle gradient border overlay */}
          <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-primary/20 via-transparent to-emerald-500/20 rounded-2xl pointer-events-none -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top Bar window layout */}
          <div className="h-7 bg-zinc-900/50 rounded-t-xl border-b border-zinc-800/50 flex items-center px-4 space-x-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            <div className="flex-1 text-[10px] text-zinc-500 font-mono text-center">app.leanity.com/workspace</div>
          </div>

          {/* Simulated Workspace Dashboard Content */}
          <div className="bg-[#0b0c10] rounded-b-xl h-[280px] sm:h-[380px] flex overflow-hidden text-left text-zinc-400 font-sans text-xs">
            
            {/* Mock Sidebar */}
            <aside className="w-1/4 border-r border-zinc-900 p-4 hidden sm:flex flex-col space-y-4 shrink-0 bg-zinc-950/40">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded bg-zinc-800" />
                <div className="w-16 h-3 bg-zinc-800 rounded" />
              </div>
              <div className="space-y-2.5 pt-4">
                <div className="h-3.5 bg-primary/10 border-l-2 border-primary rounded-r w-full flex items-center px-2 text-[10px] text-primary font-bold">Workspace</div>
                <div className="h-3.5 hover:bg-zinc-900 rounded w-full flex items-center px-2 text-[10px]">Nhiệm vụ</div>
                <div className="h-3.5 hover:bg-zinc-900 rounded w-full flex items-center px-2 text-[10px]">Tập trung Pomodoro</div>
                <div className="h-3.5 hover:bg-zinc-900 rounded w-full flex items-center px-2 text-[10px]">Cài đặt</div>
              </div>
            </aside>

            {/* Mock Main Application Pane */}
            <section className="flex-1 flex flex-col p-6 overflow-hidden bg-zinc-950/10">
              <header className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-4">
                <div className="space-y-1">
                  <div className="h-4 bg-zinc-800 rounded w-32" />
                  <div className="h-2 bg-zinc-900 rounded w-20" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-[9px] font-bold">Local-First</div>
                  <div className="w-5 h-5 rounded-full bg-zinc-800" />
                </div>
              </header>

              <div className="flex-1 grid grid-cols-3 gap-4">
                {/* Notes Column */}
                <article className="col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-4 space-y-3">
                  <div className="h-3 bg-zinc-800 rounded w-1/3" />
                  <div className="space-y-2 pt-2">
                    <div className="h-2 bg-zinc-900 rounded w-full" />
                    <div className="h-2 bg-zinc-900 rounded w-[90%]" />
                    <div className="h-2 bg-zinc-900 rounded w-[95%]" />
                    <div className="h-2 bg-zinc-900 rounded w-[60%]" />
                  </div>
                </article>

                {/* Pomodoro Widget Column */}
                <article className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-4 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin duration-1000" />
                    <span className="font-mono text-zinc-300 font-bold text-[10px]">25:00</span>
                  </div>
                  <div className="w-12 h-4 bg-primary/20 text-primary text-[9px] font-bold rounded flex items-center justify-center">Focus</div>
                </article>
              </div>
            </section>
          </div>
        </section>

      </main>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 lg:py-32 px-6 max-w-5xl mx-auto">
        <header className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Tính năng vượt trội</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Mọi công cụ năng suất trong một hệ thống tinh gọn
          </p>
        </header>

        {/* Bento Grid Layout (Unsymmetric and beautifully aligned like Capacities/Linear) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Tasks & Workspace (Large - spans 2 columns) */}
          <article className="md:col-span-2 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800/80 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10 group-hover:bg-primary/10 transition-colors" />
            
            <div className="space-y-4 max-w-md">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg text-primary">🎯</div>
              <h3 className="text-xl font-bold text-white">Quản lý Tasks & Kanban Workspace</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Tổ chức toàn bộ công việc của bạn một cách trực quan thông qua danh sách Tasks linh hoạt hoặc bảng Kanban hiện đại. Hỗ trợ phân loại trạng thái rõ ràng giúp theo sát mục tiêu nhanh chóng.
              </p>
            </div>

            <div className="mt-8 border border-zinc-900 rounded-xl p-3 bg-zinc-950/60 space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>Task Đang Làm</span>
                <span className="text-primary">Độ ưu tiên cao</span>
              </div>
              <div className="h-8 bg-zinc-900/60 rounded-lg flex items-center px-3 border border-zinc-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2.5" />
                <span className="text-zinc-300 font-semibold text-[11px] truncate">Thiết kế hoàn chỉnh giao diện Landing Page</span>
              </div>
            </div>
          </article>

          {/* Card 2: Pomodoro Clock (Spans 1 column) */}
          <article className="bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800/80 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg text-emerald-400">⏱️</div>
              <h3 className="text-xl font-bold text-white">Đồng hồ Pomodoro</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Phương pháp đếm ngược Pomodoro chuẩn khoa học giúp chia nhỏ thời gian làm việc, tối đa hóa tập trung và ghi nhận năng suất tự động.
              </p>
            </div>

            <div className="mt-6 flex justify-center items-center py-4">
              <div className="w-24 h-24 rounded-full border-4 border-zinc-900 flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500" />
                <span className="font-mono text-zinc-200 font-extrabold text-xs">25:00</span>
              </div>
            </div>
          </article>

          {/* Card 3: Library & Connecting Nodes (Spans 1 column) */}
          <article className="bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800/80 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none -z-10" />

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg text-violet-400">📝</div>
              <h3 className="text-xl font-bold text-white">Thư Viện Tài Liệu</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Trình soạn thảo mạnh mẽ, lưu giữ ghi chú, tài liệu dài lâu với kiến trúc tổ chức cây phân cấp thông minh như cấu trúc tri thức của Capacities.
              </p>
            </div>

            <div className="mt-6 border border-zinc-900 rounded-xl p-3 bg-zinc-950/40 text-[10px] space-y-2">
              <div className="flex items-center text-zinc-500">
                <span className="mr-1">📁</span> <span>Thư mục cha</span>
              </div>
              <div className="flex items-center text-zinc-300 font-semibold pl-3 border-l border-zinc-800">
                <span className="mr-1">📄</span> <span>Tài liệu thiết kế.docx</span>
              </div>
            </div>
          </article>

          {/* Card 4: Local-First & Sync Engine (Large - spans 2 columns) */}
          <article className="md:col-span-2 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800/80 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10 group-hover:bg-emerald-500/10 transition-colors" />

            <div className="space-y-4 max-w-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg text-emerald-400">⚡</div>
              <h3 className="text-xl font-bold text-white">Đồng Bộ Siêu Nhanh (Local-First Sync)</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Tốc độ phản hồi cực nhanh dưới 5ms vì dữ liệu hoạt động trực tiếp từ bộ nhớ cục bộ. Đồng bộ hóa ngầm mượt mà với Supabase và đám mây Google Drive để bảo vệ thông tin hoàn hảo trên mọi thiết bị.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between border border-zinc-900 bg-zinc-950/80 p-3 rounded-xl">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Trực Tuyến & Đồng Bộ</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Độ trễ: 0.1ms (Local Cache)</span>
            </div>
          </article>

        </div>
      </section>

      {/* Philosophy Method Section */}
      <section id="method" className="py-24 border-t border-zinc-900 px-6 max-w-5xl mx-auto bg-gradient-to-b from-[#070709] via-zinc-950/20 to-[#070709]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Triết lý thiết kế</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">Vì sao chọn triết lý tinh gọn (Lean)?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Thế giới kỹ thuật số ngày nay tràn ngập các công cụ quá tải tính năng, gây xao nhãng và làm giảm sự tập trung vốn có. Leanity ra đời để tái cấu trúc lại cách bạn làm việc:
            </p>
            <ul className="space-y-3.5 text-xs text-zinc-300">
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Giảm tải xao nhãng:</strong> Giao diện tối giản, tập trung vào cốt lõi nhiệm vụ và tài liệu.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Phục vụ người dùng trước:</strong> Cơ chế Local-first giúp ứng dụng hoạt động mượt mà ngay cả khi ngoại tuyến.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Bảo mật dữ liệu tuyệt đối:</strong> Quyền sở hữu tài liệu nằm trong tay bạn qua tùy chọn sao lưu đám mây cá nhân.</span>
              </li>
            </ul>
          </div>
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none -z-10" />
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 font-mono">Quotes / Khách hàng</div>
              <p className="text-sm font-semibold italic text-zinc-200">
                "Leanity thực sự làm tôi nhớ đến sự mượt mà của Linear và tính tổ chức cây thông minh của Capacities. Không gian làm việc giờ đây vô cùng yên tĩnh và tập trung!"
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
              <div>
                <div className="text-[11px] font-bold text-white">Thành Viên Sáng Lập</div>
                <div className="text-[9px] text-zinc-500">Phát Triển Sản Phẩm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Footer */}
      <section id="about" className="py-24 text-center max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-b from-zinc-900/40 to-zinc-950/60 border border-zinc-900 rounded-3xl p-10 lg:p-16 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Bắt đầu nâng cao hiệu suất ngay hôm nay</h2>
          <p className="text-zinc-400 text-xs max-w-lg mx-auto leading-relaxed">
            Tham gia vào không gian làm việc số tối giản, an toàn và tối đa hóa sự tập trung cùng hàng nghìn người dùng chuyên nghiệp.
          </p>

          <div className="flex justify-center">
            <Link 
              href="/workspace" 
              className="px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-extrabold rounded-full transition-all duration-200 shadow-xl flex items-center space-x-2"
            >
              <span>Vào Workspace Của Bạn</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-[#070709]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500 text-[11px] font-semibold">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-400">L</div>
            <span className="font-bold text-zinc-400">Leanity Workspace</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Leanity. Tất cả quyền được bảo lưu.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Hỗ trợ</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
