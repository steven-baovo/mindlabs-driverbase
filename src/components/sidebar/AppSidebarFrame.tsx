'use client'

import React, { useState, useEffect, useRef } from 'react'

interface AppSidebarFrameProps {
  children: React.ReactNode;
  defaultWidth?: number;
}

export default function AppSidebarFrame({ children, defaultWidth = 300 }: AppSidebarFrameProps) {
  // State cho việc kéo dãn chiều rộng Sidebar
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [isWidthLoaded, setIsWidthLoaded] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  // Đọc chiều rộng từ localStorage khi mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-sidebar-width')
      if (saved) {
        setWidth(parseInt(saved, 10))
      }
      setIsWidthLoaded(true)
    }
  }, [])

  // Lưu chiều rộng vào localStorage khi thay đổi (chỉ sau khi đã load xong)
  useEffect(() => {
    if (isWidthLoaded) {
      localStorage.setItem('app-sidebar-width', width.toString())
    }
  }, [width, isWidthLoaded])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-width', `${width}px`)
    }
  }, [width])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return
      const rect = sidebarRef.current.getBoundingClientRect()
      let newWidth = e.clientX - rect.left
      // Giới hạn chiều rộng từ 200px đến 600px
      if (newWidth < 200) newWidth = 200
      if (newWidth > 600) newWidth = 600
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <>
      {isResizing && (
        <div className="fixed inset-0 cursor-col-resize z-[9999]" />
      )}
      <div
        className="relative h-full flex-shrink-0"
        style={{ width: `${width}px` }}
      >
        <aside
          ref={sidebarRef}
          className="w-full h-full flex flex-col relative bg-transparent overflow-hidden"
        >
          {children}
        </aside>

        {/* Resize Handle */}
        <div
          className="absolute top-0 -right-[13px] w-[22px] h-full cursor-col-resize z-50"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizing(true)
          }}
        />
      </div>
    </>
  )
}
