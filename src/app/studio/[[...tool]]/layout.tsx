export const metadata = {
  title: 'Leanity Studio',
  description: 'Hệ thống quản trị nội dung',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
