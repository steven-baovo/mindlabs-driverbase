import React from 'react'
import { Sparkles, Cpu } from 'lucide-react'

export interface Subheading {
  id: string
  title: string
}

export interface Author {
  name: string
  role: string
  avatar?: string
}

export interface BlogPost {
  id: string // slug
  title: string
  subtitle: string
  category: string
  categorySlug: string
  date: string // ISO Format
  dateFormatted: string
  readTime: string
  summary: string
  icon: React.ComponentType<any>
  subheadings: Subheading[]
  author: Author
  tags: string[]
  content: React.ReactNode
}

export const blogPosts: BlogPost[] = [
  {
    id: 'trang-thai-dong-chay-flow-state-nguyen-ly-toi-thuong-cua-tap-trung-sau',
    title: 'Trạng thái Dòng chảy (Flow State): Nguyên lý tối thượng của tập trung sâu',
    subtitle: 'Làm thế nào để kích hoạt trạng thái hiệu suất cao nhất và lý do vì sao sự phân rã ngữ cảnh đang âm thầm hủy hoại năng suất của bạn.',
    category: 'Năng suất khoa học',
    categorySlug: 'nang-suat-khoa-hoc',
    date: '2026-05-27T08:00:00.000Z',
    dateFormatted: '27 Tháng 5, 2026',
    readTime: '6 phút đọc',
    icon: Sparkles,
    summary: 'Trạng thái Dòng chảy (Flow State) là đỉnh cao của sự tập trung, nơi cái tôi biến mất và hiệu suất đạt mức tối đa. Khám phá cách Leanity hợp nhất công cụ để giúp bạn kích hoạt và duy trì trạng thái này.',
    author: {
      name: 'Ban Biên Tập Leanity',
      role: 'Nghiên Cứu Hiệu Suất'
    },
    tags: ['Tập trung sâu', 'Flow State', 'Năng suất', 'Khoa học'],
    subheadings: [
      { id: 'noi-dau-thoi-dai', title: '1. Nỗi đau thời đại: Phân rã ngữ cảnh' },
      { id: 'dieu-kien-flow', title: '2. 3 Điều kiện cốt lõi kích hoạt Flow' },
      { id: 'cach-leanity-giup', title: '3. Cách Leanity thiết lập Dòng chảy' }
    ],
    content: (
      <div className="space-y-6 text-[13px] leading-relaxed font-normal text-zinc-600 dark:text-zinc-400">
        <p className="text-[13px] font-normal">
          Bạn đã bao giờ trải qua cảm giác làm việc say mê đến mức quên cả thời gian? Khi đó, mọi tiếng ồn xung quanh dường như bị tắt tiếng, suy nghĩ tuôn chảy một cách tự nhiên và công việc hoàn thành một cách dễ dàng một cách đáng kinh ngạc. Đó chính là <strong>Trạng thái Dòng chảy (Flow State)</strong> - một khái niệm tâm lý học được định nghĩa bởi giáo sư Mihaly Csikszentmihalyi.
        </p>

        <blockquote className="border-l-4 border-primary pl-4 py-1.5 my-6 italic text-zinc-950 dark:text-zinc-100 font-normal bg-zinc-50 dark:bg-zinc-900/30 rounded-r text-[13px]">
          "Flow là trạng thái mà một người chìm đắm hoàn toàn vào hoạt động họ đang làm, đến mức không còn bất kỳ suy nghĩ hay sự tự ý thức nào khác tồn tại."
        </blockquote>

        <section id="noi-dau-thoi-dai" className="scroll-mt-20 space-y-3 font-normal pt-4">
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">1. Nỗi đau thời đại: Sự phân rã ngữ cảnh (Context Switching)</h3>
          <p className="text-[13px] font-normal">
            Trong môi trường làm việc số hiện nay, kẻ thù lớn nhất ngăn cản bạn bước vào dòng chảy không phải là sự lười biếng, mà là <strong>ma sát chuyển đổi ngữ cảnh (Context Switching)</strong>.
          </p>
          <p className="text-[13px] font-normal">
            Hãy tưởng tượng: Bạn đang viết một tài liệu quan trọng trong một tab trình duyệt. Bạn cần kiểm tra xem nhiệm vụ tiếp theo là gì, bạn chuyển sang tab phần mềm quản lý công việc. Sau đó, bạn muốn bấm giờ tập trung, bạn cúi xuống bấm điện thoại hoặc mở một ứng dụng đếm ngược. 
          </p>
          <p className="text-[13px] font-normal">
            Mỗi lần chuyển đổi giữa các công cụ cô lập này, não bộ của bạn phải chịu một mức độ "rò rỉ nhận thức" (cognitive leakage). Khoa học chứng minh rằng phải mất trung bình <strong>23 phút 15 giây</strong> để bộ não con người thực sự quay trở lại trạng thái tập trung sâu sau một lần bị ngắt quãng.
          </p>
        </section>

        <section id="dieu-kien-flow" className="scroll-mt-20 space-y-3 font-normal pt-4">
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">2. 3 Điều kiện cốt lõi để kích hoạt Trạng thái Dòng chảy</h3>
          <p className="text-[13px] font-normal">
            Để tạo cơ hội tốt nhất đưa não bộ vào trạng thái hiệu suất cực đại, bạn cần đáp ứng ba điều kiện tâm lý nền tảng:
          </p>
          <div className="my-6 p-5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3 font-normal shadow-subtle">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
              <span>💡</span>
              <span>Ba nguyên tắc kích hoạt:</span>
            </h4>
            <ul className="list-decimal pl-5 space-y-2 text-[13px] text-zinc-500 dark:text-zinc-400 font-normal">
              <li className="text-[13px] font-normal"><strong>Mục tiêu rõ ràng (Clear Goals):</strong> Bạn phải biết chính xác mình cần làm gì tiếp theo mà không cần phải đắn đo suy nghĩ.</li>
              <li className="text-[13px] font-normal"><strong>Phản hồi ngay lập tức (Immediate Feedback):</strong> Nhìn thấy tiến độ công việc thay đổi trực quan theo từng hành động.</li>
              <li className="text-[13px] font-normal"><strong>Cân bằng giữa thử thách và kỹ năng:</strong> Nhiệm vụ đủ khó để kích thích trí óc nhưng không quá khó dẫn đến lo âu.</li>
            </ul>
          </div>
        </section>

        <section id="cach-leanity-giup" className="scroll-mt-20 space-y-3 font-normal pt-4">
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">3. Cách Leanity giúp bạn thiết lập Dòng chảy</h3>
          <p className="text-[13px] font-normal">
            Leanity được xây dựng với mục tiêu duy nhất: <strong>Hợp nhất không gian làm việc số của bạn thành một thể thống nhất</strong>.
          </p>
          <p className="text-[13px] font-normal">
            Bằng cách tích hợp chặt chẽ <strong>Nhiệm vụ (Tasks)</strong>, <strong>Thư viện tri thức (Library)</strong> và <strong>Đồng hồ tập trung (Pomodoro)</strong> trên một màn hình liền mạch:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[13px] font-normal">
            <li className="text-[13px] font-normal">Bạn chọn một Nhiệm vụ cụ thể từ danh sách.</li>
            <li className="text-[13px] font-normal">Bạn mở tệp tài liệu liên quan đến nhiệm vụ đó để soạn thảo ngay lập tức.</li>
            <li className="text-[13px] font-normal">Bạn nhấn kích hoạt Đồng hồ Pomodoro ngay trên thanh công cụ để bắt đầu tập trung sâu.</li>
          </ul>
          <p className="text-[13px] font-normal pt-2">
            Toàn bộ chu kỳ làm việc diễn ra không có một vết đứt gãy nào. Không cần chuyển tab, không cần mở điện thoại, không cần lo lắng về dữ liệu. Trí óc bạn được giải phóng khỏi các thao tác thừa để chìm đắm hoàn toàn vào sáng tạo.
          </p>
        </section>
      </div>
    )
  },
  {
    id: 'triet-ly-thiet-ke-zero-friction-khong-ma-sat-giai-phong-suc-manh-sang-tao',
    title: 'Triết lý thiết kế Zero Friction (Không ma sát): Giải phóng sức mạnh sáng tạo',
    subtitle: 'Tại sao từng mili-giây trễ và từng cú nhấp chuột thừa lại đang âm thầm lấy đi năng lượng sáng tạo quý giá của bạn.',
    category: 'Triết lý sản phẩm',
    categorySlug: 'triet-ly-san-pham',
    date: '2026-05-26T08:00:00.000Z',
    dateFormatted: '26 Tháng 5, 2026',
    readTime: '5 phút đọc',
    icon: Cpu,
    summary: 'Triết lý thiết kế Zero Friction hướng tới việc biến công cụ trở nên vô hình, nhường chỗ hoàn toàn cho tư duy của người dùng. Khám phá kiến trúc Local-First và tối giản tương tác tạo nên sự mượt mà vượt trội.',
    author: {
      name: 'Ban Biên Tập Leanity',
      role: 'Nghiên Cứu Hiệu Suất'
    },
    tags: ['Thiết kế sản phẩm', 'Zero Friction', 'Local-First', 'Trải nghiệm'],
    subheadings: [
      { id: 'tac-hai-ma-sat', title: '1. Tác hại của Ma sát nhận thức' },
      { id: 'kien-truc-zero-friction', title: '2. Kiến trúc Local-First siêu tốc' },
      { id: 'tu-do-trong-ky-luat', title: '3. Tự do trong sự kỷ luật' }
    ],
    content: (
      <div className="space-y-6 text-[13px] leading-relaxed font-normal text-zinc-600 dark:text-zinc-400">
        <p className="text-[13px] font-normal">
          Trong thế giới thiết kế phần mềm, "Ma sát" (Friction) là bất kỳ trở ngại nào cản trở người dùng đạt được mục tiêu của họ. Đó có thể là một vòng tròn xoay tròn chờ tải trang (Loading spinner), một bảng điền thông tin quá dài, hoặc một nút bấm nằm ẩn quá sâu.
        </p>

        <blockquote className="border-l-4 border-primary pl-4 py-1.5 my-6 italic text-zinc-950 dark:text-zinc-100 font-normal bg-zinc-50 dark:bg-zinc-900/30 rounded-r text-[13px]">
          "Công cụ tốt nhất là công cụ biến mất hoàn toàn khi bạn đang sử dụng nó. Khi đó, không còn ranh giới giữa bộ não của bạn và công việc đang hiển thị trên màn hình."
        </blockquote>

        <section id="tac-hai-ma-sat" className="scroll-mt-20 space-y-3 font-normal pt-4">
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">1. Tác hại của Ma sát nhận thức (Cognitive Friction)</h3>
          <p className="text-[13px] font-normal">
            Mỗi khi bạn phải chờ một ứng dụng tải dữ liệu từ máy chủ đám mây mất 2 giây, não bộ của bạn tự động rơi vào trạng thái chờ đợi. Sự tập trung bị chững lại. Ý tưởng vừa lóe lên trong đầu bạn có thể bị bay mất chỉ vì phải đợi một vòng tròn loading xoay tròn.
          </p>
          <p className="text-[13px] font-normal">
            Ma sát không chỉ làm chậm tốc độ làm việc, nó trực tiếp tiêu hao năng lượng ý chí (Willpower) của bạn. Năng lượng ý chí là tài nguyên có hạn trong ngày. Nếu bạn tiêu tốn nó vào việc chờ đợi và thực hiện các thao tác tẻ nhạt trên công cụ, bạn sẽ còn rất ít năng lượng dành cho tư duy sâu và đưa ra quyết định sáng suốt.
          </p>
        </section>

        <section id="kien-truc-zero-friction" className="scroll-mt-20 space-y-3 font-normal pt-4">
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">2. Kiến trúc Zero Friction trên Leanity: Sức mạnh của Local-First</h3>
          <p className="text-[13px] font-normal">
            Leanity giải quyết triệt để bài toán ma sát thông qua hai triết lý kỹ thuật nền tảng:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-normal">
            <div className="p-5 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-subtle space-y-2 font-normal">
              <h4 className="font-bold text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5">
                <span>⚡</span>
                <span>Tốc độ phản hồi &lt; 5ms</span>
              </h4>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Toàn bộ dữ liệu công việc và tài liệu của bạn hoạt động trực tiếp từ bộ nhớ cục bộ (Local Cache) của trình duyệt. Mọi hành động gõ phím, tạo nhiệm vụ, mở tài liệu đều phản hồi lập tức dưới 5ms, mang lại cảm giác mượt mà tuyệt đối.
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-subtle space-y-2 font-normal">
              <h4 className="font-bold text-zinc-950 dark:text-zinc-50 text-xs flex items-center gap-1.5">
                <span>⌨️</span>
                <span>Thao tác phím tắt tối giản</span>
              </h4>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Chúng tôi lược bỏ toàn bộ các bước xác nhận dư thừa. Với hệ thống phím tắt trực quan, bạn có thể tạo ghi chú, thiết lập liên kết node tri thức chỉ bằng một vài nút nhấn trên bàn phím mà không cần rời tay khỏi vị trí gõ.
              </p>
            </div>
          </div>
        </section>

        <section id="tu-do-trong-ky-luat" className="scroll-mt-20 space-y-3 font-normal pt-4">
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">3. Tự do trong sự kỷ luật</h3>
          <p className="text-[13px] font-normal">
            Bằng việc loại bỏ ma sát kỹ thuật, Leanity mang đến một môi trường yên tĩnh. Khi bạn mở ứng dụng lên, không có thông báo chào mừng rườm rà, không có biểu đồ rối mắt. Chỉ có mục tiêu của bạn, tài liệu của bạn và khoảng thời gian tĩnh lặng dành riêng cho sự sáng tạo. Đó chính là ý nghĩa đích thực của triết lý thiết kế <strong>Zero Friction</strong>.
          </p>
        </section>
      </div>
    )
  }
]
