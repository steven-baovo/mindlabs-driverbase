import type { Metadata } from 'next'
import DocsLayoutClient from './DocsLayoutClient'

export const metadata: Metadata = {
  title: 'Leanity Docs - Tài Liệu Hướng Dẫn & Vận Hành Hệ Thống',
  description: 'Hướng dẫn sử dụng toàn diện không gian làm việc số Leanity: Quản lý công việc (Tasks), xây dựng bộ não thứ hai phi tuyến tính (Library), và tối đa sự tập trung với đồng hồ Pomodoro khoa học.',
  keywords: [
    'hướng dẫn leanity',
    'tài liệu hướng dẫn',
    'sử dụng pomodoro',
    'quản lý công việc',
    'ghi chú liên kết',
    'leanity'
  ],
  alternates: {
    canonical: '/docs',
  },
}

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <DocsLayoutClient>
      {children}
    </DocsLayoutClient>
  )
}
