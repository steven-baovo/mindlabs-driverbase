import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leanity Blog - Chia Sẻ Về Năng Suất, Khoa Học Tập Trung & Thiết Kế',
  description: 'Nơi chia sẻ các bài viết khoa học về sự tập trung sâu, cách kích hoạt trạng thái dòng chảy (Flow State) và triết lý sản phẩm không ma sát (Zero Friction) cùng Leanity.',
  keywords: [
    'leanity blog',
    'bài viết năng suất',
    'khoa học tập trung',
    'trạng thái dòng chảy',
    'thiết kế không ma sát',
    'leanity'
  ],
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 transition-colors duration-200">
      {children}
    </div>
  )
}
