'use client'

import { ChevronLeft, CloudCheck, Cloud } from 'lucide-react'
import Link from 'next/link'

interface NoteHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  isSaving?: boolean
}

const NoteHeader = ({ title, onTitleChange, isSaving = false }: NoteHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 glass border-b border-border-main/20 h-14 flex items-center px-4">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <Link 
            href="/workspace"
            className="p-2 hover:bg-black/5 rounded-xl transition-colors text-secondary shrink-0"
            title="Quay lại"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-2 text-premium opacity-40 shrink-0">
            <span>Workspace</span>
            <span>/</span>
          </div>
 
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tiêu đề ghi chú..."
            className="bg-transparent text-sm font-black tracking-tight focus:outline-none placeholder:text-gray-300 w-full truncate text-secondary"
          />
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-premium transition-all">
            {isSaving ? (
              <div className="flex items-center gap-1.5 text-primary animate-pulse">
                <Cloud className="w-3 h-3" />
                <span>Đang lưu</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-500/80">
                <CloudCheck className="w-3 h-3" />
                <span>Đã lưu</span>
              </div>
            )}
          </div>
          
          <div className="h-4 w-px bg-border-medium/30 mx-1" />
          
          {/* Action buttons could go here */}
        </div>
      </div>
    </header>
  )
}

export default NoteHeader
