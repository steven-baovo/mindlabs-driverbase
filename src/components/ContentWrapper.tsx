'use client'

import { usePathname } from 'next/navigation'

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative bg-surface lg:rounded-2xl lg:my-[5px] lg:mr-[5px] lg:ml-[5px] border border-border-main`}>
      <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar relative">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
