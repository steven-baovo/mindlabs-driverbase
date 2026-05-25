'use client'

import { usePathname } from 'next/navigation'

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Loại trừ trang workspace để chúng tự tạo đảo nổi riêng
  const isCustomLayout = pathname?.includes('/workspace') || pathname?.includes('/tasks')
  
  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${
      isCustomLayout 
        ? 'lg:py-[5px] lg:pr-[5px]' 
        : 'bg-white lg:rounded-2xl lg:my-[5px] lg:mr-[5px] lg:ml-[5px] border border-border-main'
    }`}>
      <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar relative">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
