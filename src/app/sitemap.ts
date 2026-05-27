import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Thay thế bằng tên miền chính thức của bạn khi deploy (ví dụ: https://leanity.vn)
  const baseUrl = 'https://leanity.com'
  const lastModified = new Date()

  // Các trang công khai (public routes) được hiển thị ra ngoài để Google lập chỉ mục
  const routes = [
    '',
    '/pomodoro',
    '/productivity',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: lastModified,
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }))
}
