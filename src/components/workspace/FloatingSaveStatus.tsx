'use client'

import { useWorkspace } from '@/contexts/WorkspaceContext'
import { Cloud, CloudCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function FloatingSaveStatus() {
  const { isSaving } = useWorkspace()
  const [showSaved, setShowSaved] = useState(false)

  // Hiệu ứng hiện "Saved" một lúc rồi biến mất
  useEffect(() => {
    if (isSaving) {
      setShowSaved(true)
    } else {
      const timer = setTimeout(() => {
        setShowSaved(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSaving])

  if (!isSaving && !showSaved) return null

  return (
    <div className="fixed top-20 right-8 z-[100] pointer-events-none">
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500
        ${isSaving 
          ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse' 
          : 'bg-emerald-50 border-emerald-100 text-emerald-600'
        }
      `}>
        {isSaving ? (
          <>
            <Cloud className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Saving</span>
          </>
        ) : (
          <>
            <CloudCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Saved</span>
          </>
        )}
      </div>
    </div>
  )
}
