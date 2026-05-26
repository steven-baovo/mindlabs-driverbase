'use client'

import React, { useState, useEffect } from 'react'
import { Link as LucideLink, X } from 'lucide-react'

interface LinkNodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, url: string) => void
  initialTitle?: string
  initialUrl?: string
  mode: 'create' | 'edit'
}

export default function LinkNodeModal({
  isOpen,
  onClose,
  onSubmit,
  initialTitle = '',
  initialUrl = '',
  mode
}: LinkNodeModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [url, setUrl] = useState(initialUrl)
  const [error, setError] = useState<string | null>(null)

  // Reset inputs when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setUrl(initialUrl)
      setError(null)
    }
  }, [isOpen, initialTitle, initialUrl])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('URL liên kết không được để trống!')
      return
    }

    let formattedUrl = url.trim()
    // Tự động thêm https:// nếu thiếu giao thức
    if (
      !formattedUrl.startsWith('http://') && 
      !formattedUrl.startsWith('https://') && 
      !formattedUrl.startsWith('/')
    ) {
      formattedUrl = `https://${formattedUrl}`
    }

    const titleToUse = title.trim() || 'Liên kết mới'
    onSubmit(titleToUse, formattedUrl)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-surface w-full max-w-md rounded-2xl border border-border-main flex flex-col overflow-hidden transform scale-95 animate-in zoom-in-95 duration-200 shadow-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border-main/50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <LucideLink className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-secondary text-base">
                {mode === 'create' ? 'Tạo Liên kết mới' : 'Chỉnh sửa Liên kết'}
              </h3>
              <p className="text-[11px] text-secondary/50 mt-0.5">
                {mode === 'create' ? 'Thêm một trang web vào cây thư mục workspace' : 'Cập nhật tiêu đề hoặc địa chỉ URL của node link'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            type="button"
            className="p-1.5 hover:bg-gray-100 rounded-full text-secondary/40 hover:text-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-100 px-3 py-2 rounded-xl text-[11px] text-red-600 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Tiêu đề */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-secondary/70">Tiêu đề hiển thị</label>
            <input
              type="text"
              placeholder="Ví dụ: Wikipedia tiếng Việt, Tài liệu tham khảo..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError(null)
              }}
              className="w-full px-3.5 py-2.5 bg-active-bg/30 border border-border-main rounded-xl text-sm outline-none focus:border-primary focus:bg-surface transition-all text-foreground"
              autoFocus
            />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-secondary/70">Địa chỉ URL</label>
            <input
              type="text"
              placeholder="Ví dụ: https://wikipedia.org hoặc wikipedia.org"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              className="w-full px-3.5 py-2.5 bg-active-bg/30 border border-border-main rounded-xl text-sm outline-none focus:border-primary focus:bg-surface transition-all text-foreground"
            />
            <p className="text-[10px] text-secondary/40">
              Nhập địa chỉ của website. Hệ thống sẽ tự động cấu hình giao thức bảo mật.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-gray-100 rounded-xl transition-all duration-150 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer"
            >
              {mode === 'create' ? 'Tạo liên kết' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
