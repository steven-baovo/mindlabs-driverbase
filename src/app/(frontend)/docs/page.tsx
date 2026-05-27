'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, Target, FileText, Timer, ChevronRight, HelpCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react'

type SectionId = 'intro' | 'tasks' | 'library' | 'pomodoro'

interface DocSection {
  id: SectionId
  title: string
  icon: React.ComponentType<any>
  content: React.ReactNode
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('intro')

  const handleScrollTo = (id: SectionId) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Cập nhật menu active khi người dùng cuộn nội dung bài viết
  useEffect(() => {
    const handleScroll = () => {
      const sections: SectionId[] = ['intro', 'tasks', 'library', 'pomodoro']
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sections: DocSection[] = [
    {
      id: 'intro',
      title: 'Giới thiệu chung',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Không Gian Làm Việc Số Leanity</h1>
            <p className="text-sm text-secondary">Hướng dẫn sử dụng và nguyên lý vận hành hệ thống</p>
          </div>
          
          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Chào mừng bạn đến với <strong>Leanity</strong> - một hệ sinh thái năng suất tinh gọn được thiết kế đặc biệt nhằm giúp bạn giải phóng tiềm năng làm việc và khôi phục sự tập trung sâu sắc.
          </p>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 text-sm">💡</div>
            <p className="text-xs text-primary font-medium leading-relaxed">
              <strong>Triết lý của Leanity:</strong> Loại bỏ hoàn toàn sự cồng kềnh (bloatware) của các phần mềm quản lý dự án truyền thống. Chúng tôi tích hợp 3 trụ cột năng suất cốt lõi gồm: <strong>Nhiệm vụ (Tasks)</strong>, <strong>Thư viện tri thức (Library)</strong> và <strong>Đồng hồ tập trung (Pomodoro)</strong> trong một màn hình duy nhất để triệt tiêu ma sát nhận thức.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="border border-border-main bg-surface/30 p-5 rounded-2xl space-y-2.5">
              <span className="text-xl">🎯</span>
              <h3 className="font-bold text-xs text-foreground">Tập Trung Luồng Việc</h3>
              <p className="text-[10px] text-secondary leading-relaxed">Quản lý nhiệm vụ tinh gọn bằng trạng thái phân cấp và chu kỳ thời gian.</p>
            </div>
            <div className="border border-border-main bg-surface/30 p-5 rounded-2xl space-y-2.5">
              <span className="text-xl">📝</span>
              <h3 className="font-bold text-xs text-foreground">Bộ Não Thứ Hai</h3>
              <p className="text-[10px] text-secondary leading-relaxed">Kết nối ghi chú và dữ liệu phi tuyến tính thông qua sơ đồ liên kết node.</p>
            </div>
            <div className="border border-border-main bg-surface/30 p-5 rounded-2xl space-y-2.5">
              <span className="text-xl">⏱️</span>
              <h3 className="font-bold text-xs text-foreground">Chu Kỳ Trầm Tĩnh</h3>
              <p className="text-[10px] text-secondary leading-relaxed">Tập trung khoa học bằng phương pháp Pomodoro và thống kê năng suất.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tasks',
      title: 'Quản lý Nhiệm vụ (Tasks)',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              <span>Quản lý Nhiệm vụ & Chu Kỳ (Cycles)</span>
            </h2>
            <p className="text-sm text-secondary">Nguyên lý dòng chảy nhiệm vụ tinh gọn và thao tác nhanh</p>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Hệ thống quản lý Tasks của Leanity vận hành theo nguyên lý <strong>quyết định nhanh và giảm thiểu thao tác nhập liệu dư thừa</strong>. Công việc không đơn thuần là một danh sách để gạch đi, mà là một dòng chảy (workflow) có định hướng rõ ràng.
          </p>

          <h3 className="text-sm font-bold text-foreground pt-2">1. Phân cấp Trạng thái Nhiệm vụ (Task Statuses)</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Mỗi nhiệm vụ trong Leanity luôn bắt buộc thuộc về một trong năm trạng thái logic sau:
          </p>
          
          <div className="space-y-2.5">
            <div className="flex items-center space-x-3 p-3 bg-surface/50 border border-border-main rounded-xl">
              <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Backlog</span>
              <span className="text-xs text-secondary leading-relaxed">Nơi lưu trữ các ý tưởng, công việc chuẩn bị thực hiện nhưng chưa lên lịch cụ thể.</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface/50 border border-border-main rounded-xl">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase tracking-wider">Todo</span>
              <span className="text-xs text-secondary leading-relaxed">Nhiệm vụ đã được xác nhận sẽ thực hiện và sẵn sàng bắt đầu bất cứ lúc nào.</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface/50 border border-border-main rounded-xl">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase tracking-wider">In Progress</span>
              <span className="text-xs text-secondary leading-relaxed">Công việc đang trực tiếp được xử lý tại thời điểm hiện tại. Tránh ôm đồm quá nhiều Task ở trạng thái này.</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface/50 border border-border-main rounded-xl">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-wider">Done</span>
              <span className="text-xs text-secondary leading-relaxed">Nhiệm vụ đã hoàn thành xuất sắc và được lưu trữ lịch sử để tính điểm năng suất.</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface/50 border border-border-main rounded-xl">
              <span className="px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 text-[9px] font-bold uppercase tracking-wider">Canceled</span>
              <span className="text-xs text-secondary leading-relaxed">Nhiệm vụ không còn cần thiết hoặc bị hủy bỏ để giữ danh sách công việc sạch sẽ.</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground pt-4">2. Vận hành theo Chu Kỳ (Cycles)</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Thay vì tạo ra các kỳ hạn (deadlines) gây áp lực tâm lý, Leanity sử dụng khái niệm <strong>Chu Kỳ (Cycles)</strong> - một khoảng thời gian cố định (thường là 1 hoặc 2 tuần) để bạn tập trung hoàn thành một nhóm công việc cụ thể.
          </p>
          <ul className="list-disc pl-5 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
            <li><strong>Tự động gối đầu:</strong> Khi một chu kỳ kết thúc, các Task chưa hoàn thành sẽ tự động được đề xuất chuyển sang chu kỳ tiếp theo hoặc đưa về Backlog.</li>
            <li><strong>Đo lường Vận tốc (Velocity):</strong> Leanity ghi nhận số lượng Task bạn hoàn thành mỗi chu kỳ để đưa ra mức dự báo năng suất chính xác cho các chu kỳ sau.</li>
          </ul>

          <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
            <strong>Mẹo thao tác cực nhanh:</strong> Leanity tối ưu hóa phím tắt tối đa. Bạn có thể nhấn phím tắt nhanh để tạo Task mới, gán nhanh độ ưu tiên (Priority: High, Medium, Low) mà không cần phải nhấp chuột qua nhiều bước.
          </div>
        </div>
      )
    },
    {
      id: 'library',
      title: 'Thư viện Tri thức (Library)',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-violet-500" />
              <span>Thư viện Tri thức & Liên kết mạng lưới</span>
            </h2>
            <p className="text-sm text-secondary">Xây dựng bộ não thứ hai (Second Brain) phi tuyến tính</p>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Khác với các ứng dụng ghi chép thông thường lưu trữ tệp tin riêng rẽ và cô lập, <strong>Library</strong> của Leanity vận hành theo triết lý <strong>kết nối tri thức đa chiều</strong>. Mọi ghi chú, tài liệu hay liên kết web đều là một nút (node) trong mạng lưới tư duy của bạn.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span>Mạng liên kết 2 chiều (Bidirectional Links)</span>
              </h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Khi bạn kết nối Ghi chú A với Ghi chú B, Leanity tự động thiết lập một đường liên kết hai chiều. Bạn có thể dễ dàng đứng từ ghi chú B để nhìn thấy mối quan hệ ngược lại với ghi chú A (Backlinks), tạo ra dòng chảy suy nghĩ liền mạch, tự nhiên như bộ não con người.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Sơ đồ mạng lưới (Graph View)</span>
              </h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Trực quan hóa toàn bộ dữ liệu của bạn dưới dạng một bản đồ mạng lưới liên kết. Các nút ghi chú có nhiều liên kết sẽ tự động phình to hơn, giúp bạn ngay lập tức nhận diện ra đâu là trung tâm của các ý tưởng và mối liên kết tiềm năng giữa chúng.
              </p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground pt-4">Sự kết hợp giữa Cây phân cấp và Mạng lưới tự do</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Leanity mang lại sự dung hòa hoàn hảo:
          </p>
          <ul className="list-disc pl-5 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
            <li><strong>Thanh bên cây thư mục:</strong> Giúp bạn lưu giữ thói quen tổ chức tài liệu gọn gàng theo các dự án lớn hoặc phân loại.</li>
            <li><strong>Liên kết phi cấu trúc:</strong> Cho phép các ghi chú thuộc các thư mục khác nhau kết nối chéo với nhau mà không làm phá vỡ cấu trúc thư mục hiện tại.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'pomodoro',
      title: 'Đồng hồ Pomodoro',
      icon: Timer,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Timer className="w-6 h-6 text-emerald-500" />
              <span>Đồng hồ Pomodoro & Tập trung sâu</span>
            </h2>
            <p className="text-sm text-secondary">Khoa học bảo toàn năng lượng trí óc và nhịp độ làm việc</p>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Đồng hồ tập trung của Leanity không chỉ đơn thuần là một công cụ đếm ngược thời gian, mà nó là **trung tâm điều phối sự tập trung**. Được thiết kế trên nguyên lý tối giản hóa để triệt tiêu tối đa sự phân tâm khi làm việc.
          </p>

          <h3 className="text-sm font-bold text-foreground pt-2">1. Chu kỳ Tập trung & Nghỉ ngơi Khoa học</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Theo các nghiên cứu về nhịp sinh học của não bộ con người, sự tập trung cao độ thường suy giảm rõ rệt sau 25-30 phút. Do đó, Leanity áp dụng chu kỳ chuẩn:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1.5">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>25 Phút Tập Trung Sâu</span>
              </h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Dành trọn vẹn trí lực cho một nhiệm vụ duy nhất. Tắt toàn bộ thông báo mạng xã hội, các tab không liên quan.
              </p>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-1.5">
              <h4 className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>5 Phút Nghỉ Ngắn</span>
              </h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Đứng dậy, uống nước, vươn vai hoặc nhắm mắt thư giãn. Tuyệt đối không đọc tin tức hay kiểm tra tin nhắn làm gián đoạn phục hồi não bộ.
              </p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground pt-4">2. Báo cáo Tự động & Ghi nhận Hiệu suất</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            Mỗi phiên tập trung hoàn thành sẽ được hệ thống ghi nhận trực tiếp vào cơ sở dữ liệu local. Leanity tự động tổng hợp số phiên tập trung để vẽ nên biểu đồ phản ánh thời lượng làm việc hiệu quả nhất của bạn trong ngày, giúp bạn thấu hiểu nhịp sinh học cá nhân của chính mình.
          </p>
        </div>
      )
    }
  ]

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 bg-background overflow-hidden relative">
      
      {/* Sidebar navigation docs */}
      <aside className="w-full lg:w-[260px] border-b lg:border-b-0 lg:border-r border-border-main shrink-0 p-6 flex flex-col space-y-6 bg-surface/10">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black tracking-tight text-foreground">Tài liệu hướng dẫn</h2>
        </div>

        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 no-scrollbar">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => handleScrollTo(section.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap lg:w-full text-left ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-linear'
                    : 'text-secondary hover:bg-hover-bg hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{section.title}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-16 max-w-4xl no-scrollbar">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-10 border-b border-border-main/50 pb-16 last:border-b-0 last:pb-0"
          >
            {section.content}
          </section>
        ))}

        {/* Footer in docs */}
        <footer className="pt-10 border-t border-border-main/50 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Tài liệu vận hành an toàn bởi Leanity Core</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Thiết kế vì sự tập trung của bạn</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </footer>
      </div>

    </div>
  )
}
