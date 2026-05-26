'use client'

import { usePathname } from 'next/navigation'

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Các phân hệ làm việc chính (Workspace & Tasks) sử dụng giao diện phẳng tràn viền (Edge-to-Edge)
  const isCustomLayout = pathname?.includes('/workspace') || pathname?.includes('/tasks')
  
  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${
      isCustomLayout 
        ? 'p-0' 
        : 'bg-surface lg:rounded-2xl lg:my-[5px] lg:mr-[5px] lg:ml-[5px] border border-border-main'
    }`}>
      <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar relative">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
