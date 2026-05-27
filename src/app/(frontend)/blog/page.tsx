'use client'

import React, { useState } from 'react'
import { Sparkles, Calendar, Clock, ArrowLeft, BookOpen, Heart, Share2, Compass, Cpu } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  subtitle: string
  category: string
  date: string
  readTime: string
  summary: string
  icon: React.ComponentType<any>
  content: React.ReactNode
}

export default function BlogPage() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const blogPosts: BlogPost[] = [
    {
      id: 'flow-state',
      title: 'Trạng thái Dòng chảy (Flow State): Nguyên lý tối thượng của tập trung sâu',
      subtitle: 'Làm thế nào để kích hoạt trạng thái hiệu suất cao nhất và lý do vì sao sự phân rã ngữ cảnh đang âm thầm hủy hoại năng suất của bạn.',
      category: 'Năng suất khoa học',
      date: '27 Tháng 5, 2026',
      readTime: '6 phút đọc',
      icon: Sparkles,
      summary: 'Trạng thái Dòng chảy (Flow State) là đỉnh cao của sự tập trung, nơi cái tôi biến mất và hiệu suất đạt mức tối đa. Khám phá cách Leanity hợp nhất công cụ để giúp bạn kích hoạt và duy trì trạng thái này.',
      content: (
        <div className="space-y-6 text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
          <p>
            Bạn đã bao giờ trải qua cảm giác làm việc say mê đến mức quên cả thời gian? Khi đó, mọi tiếng ồn xung quanh dường như bị tắt tiếng, suy nghĩ tuôn chảy một cách tự nhiên và công việc hoàn thành một cách dễ dàng một cách đáng kinh ngạc. Đó chính là <strong>Trạng thái Dòng chảy (Flow State)</strong> - một khái niệm tâm lý học được định nghĩa bởi giáo sư Mihaly Csikszentmihalyi.
          </p>

          <blockquote className="border-l-4 border-primary pl-4 py-1.5 my-6 italic text-zinc-950 dark:text-zinc-100 font-medium">
            "Flow là trạng thái mà một người chìm đắm hoàn toàn vào hoạt động họ đang làm, đến mức không còn bất kỳ suy nghĩ hay sự tự ý thức nào khác tồn tại."
          </blockquote>

          <h3 className="text-sm font-bold text-foreground pt-4">Nỗi đau thời đại: Sự phân rã ngữ cảnh (Context Switching)</h3>
          <p>
            Trong môi trường làm việc số hiện nay, kẻ thù lớn nhất ngăn cản bạn bước vào dòng chảy không phải là sự lười biếng, mà là <strong>ma sát chuyển đổi ngữ cảnh (Context Switching)</strong>.
          </p>
          <p>
            Hãy tưởng tượng: Bạn đang viết một tài liệu quan trọng trong một tab trình duyệt. Bạn cần kiểm tra xem nhiệm vụ tiếp theo là gì, bạn chuyển sang tab phần mềm quản lý công việc. Sau đó, bạn muốn bấm giờ tập trung, bạn cúi xuống bấm điện thoại hoặc mở một ứng dụng đếm ngược. 
          </p>
          <p>
            Mỗi lần chuyển đổi giữa các công cụ cô lập này, não bộ của bạn phải chịu một mức độ "rò rỉ nhận thức" (cognitive leakage). Khoa học chứng minh rằng phải mất trung bình <strong>23 phút 15 giây</strong> để bộ não con người thực sự quay trở lại trạng thái tập trung sâu sau một lần bị ngắt quãng.
          </p>

          <div className="my-6 p-5 bg-surface/50 border border-border-main rounded-2xl space-y-3">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary" />
              <span>3 Điều kiện cốt lõi để kích hoạt Trạng thái Dòng chảy:</span>
            </h4>
            <ul className="list-decimal pl-5 space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <li><strong>Mục tiêu rõ ràng (Clear Goals):</strong> Bạn phải biết chính xác mình cần làm gì tiếp theo mà không cần phải đắn đo suy nghĩ.</li>
              <li><strong>Phản hồi ngay lập tức (Immediate Feedback):</strong> Nhìn thấy tiến độ công việc thay đổi trực quan theo từng hành động.</li>
              <li><strong>Cân bằng giữa thử thách và kỹ năng:</strong> Nhiệm vụ đủ khó để kích thích trí óc nhưng không quá khó dẫn đến lo âu.</li>
            </ul>
          </div>

          <h3 className="text-sm font-bold text-foreground pt-4">Cách Leanity giúp bạn thiết lập Dòng chảy</h3>
          <p>
            Leanity được xây dựng với mục tiêu duy nhất: **Hợp nhất không gian làm việc số của bạn thành một thể thống nhất**.
          </p>
          <p>
            Bằng cách tích hợp chặt chẽ **Nhiệm vụ (Tasks)**, **Thư viện tri thức (Library)** và **Đồng hồ tập trung (Pomodoro)** trên một màn hình liền mạch:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Bạn chọn một Nhiệm vụ cụ thể từ danh sách.</li>
            <li>Bạn mở tệp tài liệu liên quan đến nhiệm vụ đó để soạn thảo ngay lập tức.</li>
            <li>Bạn nhấn kích hoạt Đồng hồ Pomodoro ngay trên thanh công cụ để bắt đầu tập trung sâu.</li>
          </ul>
          <p>
            Toàn bộ chu kỳ làm việc diễn ra không có một vết đứt gãy nào. Không cần chuyển tab, không cần mở điện thoại, không cần lo lắng về dữ liệu. Trí óc bạn được giải phóng khỏi các thao tác thừa để chìm đắm hoàn toàn vào sáng tạo.
          </p>
        </div>
      )
    },
    {
      id: 'zero-friction',
      title: 'Triết lý thiết kế Zero Friction (Không ma sát): Giải phóng sức mạnh sáng tạo',
      subtitle: 'Tại sao từng mili-giây trễ và từng cú nhấp chuột thừa lại đang âm thầm lấy đi năng lượng sáng tạo quý giá của bạn.',
      category: 'Triết lý sản phẩm',
      date: '26 Tháng 5, 2026',
      readTime: '5 phút đọc',
      icon: Cpu,
      summary: 'Triết lý thiết kế Zero Friction hướng tới việc biến công cụ trở nên vô hình, nhường chỗ hoàn toàn cho tư duy của người dùng. Khám phá kiến trúc Local-First và tối giản tương tác tạo nên sự mượt mà vượt trội.',
      content: (
        <div className="space-y-6 text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
          <p>
            Trong thế giới thiết kế phần mềm, "Ma sát" (Friction) là bất kỳ trở ngại nào cản trở người dùng đạt được mục tiêu của họ. Đó có thể là một vòng tròn xoay tròn chờ tải trang (Loading spinner), một bảng điền thông tin quá dài, hoặc một nút bấm nằm ẩn quá sâu.
          </p>

          <blockquote className="border-l-4 border-violet-500 pl-4 py-1.5 my-6 italic text-zinc-950 dark:text-zinc-100 font-medium">
            "Công cụ tốt nhất là công cụ biến mất hoàn toàn khi bạn đang sử dụng nó. Khi đó, không còn ranh giới giữa bộ não của bạn và công việc đang hiển thị trên màn hình."
          </blockquote>

          <h3 className="text-sm font-bold text-foreground pt-4">Tác hại của Ma sát nhận thức (Cognitive Friction)</h3>
          <p>
            Mỗi khi bạn phải chờ một ứng dụng tải dữ liệu từ máy chủ đám mây mất 2 giây, não bộ của bạn tự động rơi vào trạng thái chờ đợi. Sự tập trung bị chững lại. Ý tưởng vừa lóe lên trong đầu bạn có thể bị bay mất chỉ vì phải đợi một vòng tròn loading xoay tròn.
          </p>
          <p>
            Ma sát không chỉ làm chậm tốc độ làm việc, nó trực tiếp tiêu hao năng lượng ý chí (Willpower) của bạn. Năng lượng ý chí là tài nguyên có hạn trong ngày. Nếu bạn tiêu tốn nó vào việc chờ đợi và thực hiện các thao tác tẻ nhạt trên công cụ, bạn sẽ còn rất ít năng lượng dành cho tư duy sâu và đưa ra quyết định sáng suốt.
          </p>

          <h3 className="text-sm font-bold text-foreground pt-4">Kiến trúc Zero Friction trên Leanity: Sức mạnh của Local-First</h3>
          <p>
            Leanity giải quyết triệt để bài toán ma sát thông qua hai triết lý kỹ thuật nền tảng:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
            <div className="p-5 bg-surface/50 border border-border-main rounded-2xl space-y-2">
              <h4 className="font-bold text-foreground text-xs">⚡ Tốc độ phản hồi &lt; 5ms (Local-First)</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Toàn bộ dữ liệu công việc và tài liệu của bạn hoạt động trực tiếp từ bộ nhớ cục bộ (Local Cache) của trình duyệt. Mọi hành động gõ phím, tạo nhiệm vụ, mở tài liệu đều phản hồi lập tức dưới 5ms, mang lại cảm giác mượt mà tuyệt đối mà không phụ thuộc vào tốc độ mạng. Dữ liệu sẽ tự động được đồng bộ hóa âm thầm lên đám mây ở phía sau.
              </p>
            </div>

            <div className="p-5 bg-surface/50 border border-border-main rounded-2xl space-y-2">
              <h4 className="font-bold text-foreground text-xs">⌨️ Thao tác phím tắt & Tối giản tương tác</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Chúng tôi lược bỏ toàn bộ các bước xác nhận, các hộp thoại cảnh báo không cần thiết và các menu ẩn nhiều cấp. Với hệ thống phím tắt trực quan, bạn có thể tạo ghi chú, thiết lập liên kết node tri thức chỉ bằng một vài nút nhấn trên bàn phím mà không cần rời tay khỏi vị trí gõ.
              </p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground pt-4">Tự do trong sự kỷ luật</h3>
          <p>
            Bằng việc loại bỏ ma sát kỹ thuật, Leanity mang đến một môi trường yên tĩnh. Khi bạn mở ứng dụng lên, không có thông báo chào mừng rườm rà, không có biểu đồ rối mắt. Chỉ có mục tiêu của bạn, tài liệu của bạn và khoảng thời gian tĩnh lặng dành riêng cho sự sáng tạo. Đó chính là ý nghĩa đích thực của triết lý thiết kế **Zero Friction**.
          </p>
        </div>
      )
    }
  ]

  const activePost = blogPosts.find(p => p.id === selectedPostId)

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto no-scrollbar p-6 md:p-10 max-w-5xl mx-auto">
      
      {/* Blog Back navigation if article is open */}
      {selectedPostId && activePost ? (
        <article className="space-y-8 animate-in fade-in duration-300">
          <button
            onClick={() => setSelectedPostId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-secondary hover:bg-hover-bg hover:text-foreground border border-border-main transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </button>

          <header className="space-y-4 border-b border-border-main/50 pb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              {activePost.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              {activePost.title}
            </h1>
            <p className="text-base text-secondary leading-relaxed font-medium">
              {activePost.subtitle}
            </p>
            <div className="flex items-center space-x-4 text-[10px] text-zinc-500 font-bold pt-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {activePost.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {activePost.readTime}</span>
            </div>
          </header>

          {/* Full Article Content */}
          <div className="max-w-3xl">
            {activePost.content}
          </div>

          <footer className="pt-8 border-t border-border-main/50 flex items-center justify-between text-zinc-500 text-[10px] font-bold">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <Heart className="w-4 h-4" /> <span>Thích bài viết</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer pl-2">
                <Share2 className="w-4 h-4" /> <span>Chia sẻ</span>
              </button>
            </div>
            <span>Tác giả: Ban Biên Tập Leanity</span>
          </footer>
        </article>
      ) : (
        // Blog List View
        <div className="space-y-12 animate-in fade-in duration-300">
          <header className="space-y-4 border-b border-border-main/50 pb-8">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black tracking-tight text-foreground">Blog & Kiến thức</h2>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Chia sẻ về năng suất & thiết kế</h1>
            <p className="text-xs text-secondary leading-relaxed max-w-xl">
              Nơi chúng tôi chia sẻ các phương pháp làm việc khoa học, chiều sâu tâm lý của sự tập trung và những triết lý đằng sau quá trình xây dựng Leanity.
            </p>
          </header>

          {/* Post list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => {
              const PostIcon = post.icon
              return (
                <article
                  key={post.id}
                  className="bg-surface/30 border border-border-main hover:border-primary/20 p-8 rounded-2xl shadow-subtle flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                      <div className="flex items-center space-x-3 text-[9px] text-zinc-500 font-bold">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border-main/50 flex items-center justify-between">
                    <span className="text-[9px] text-zinc-500 font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                    <button
                      onClick={() => setSelectedPostId(post.id)}
                      className="text-xs font-bold text-primary hover:text-primary/80 inline-flex items-center gap-1 cursor-pointer select-none"
                    >
                      <span>Đọc tiếp</span>
                      <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
