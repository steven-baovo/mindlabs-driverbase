'use client'

import { useState, useEffect, useRef } from 'react'
import { useFocus } from '@/contexts/FocusContext'
import { Play, Pause, SkipForward, Maximize2, Minimize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FocusTimer() {
  const {
    mode,
    timeLeft,
    isActive,
    setMode,
    toggleTimer,
    skipTimer,
    formatTime,
    pomodorosCompleted
  } = useFocus()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenUI, setShowFullscreenUI] = useState(true)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const resetHideTimeout = () => {
    if (!isFullscreen) return
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    setShowFullscreenUI(true)
    hideTimeoutRef.current = setTimeout(() => {
      setShowFullscreenUI(false)
    }, 3000)
  }

  useEffect(() => {
    if (isFullscreen) {
      resetHideTimeout()
    } else {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      setShowFullscreenUI(true)
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [isFullscreen])

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const modes = [
    { id: 'pomodoro', label: 'Tập trung' },
    { id: 'short_break', label: 'Nghỉ ngắn' },
    { id: 'long_break', label: 'Nghỉ dài' },
  ] as const

  return (
    <div
      ref={containerRef}
      onPointerMove={resetHideTimeout}
      onClick={resetHideTimeout}
      onTouchStart={resetHideTimeout}
      className={`flex flex-col items-center justify-center transition-all duration-700 ${isFullscreen
        ? 'fixed inset-0 bg-black z-[9999] h-screen w-screen cursor-none'
        : 'p-6 sm:p-12 bg-surface rounded-3xl border border-border-main relative overflow-hidden'
        } ${isFullscreen && !showFullscreenUI ? 'cursor-none' : ''}`}
    >
      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFullscreen()
          }}
          className={`absolute top-10 right-10 p-4 rounded-full bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all z-50 ${showFullscreenUI ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
            }`}
        >
          <Minimize2 className="w-6 h-6" />
        </button>
      )}

      {/* Mode Selector - Hidden in Fullscreen, replaced by simple label */}
      {!isFullscreen ? (
        <div className="flex items-center gap-1 mb-12 sm:mb-16 relative z-10 w-full justify-center">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                if (isActive) {
                  const confirm = window.confirm('Chuyển chế độ? Phiên hiện tại sẽ bị đặt lại.')
                  if (!confirm) return
                }
                setMode(m.id)
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${mode === m.id ? 'text-white' : 'text-foreground/40 hover:text-foreground'
                }`}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="active-mode"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                />
              )}
              {m.label}
            </button>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-12 text-sm font-black uppercase tracking-[0.8em] ${mode === 'pomodoro' ? 'text-white/40' : 'text-green-500/40'
            }`}
        >
          {mode === 'pomodoro' ? 'Hãy tập trung' : 'Hãy nghỉ ngơi'}
        </motion.div>
      )}

      {/* Timer Display - Master Typography */}
      <div className={`relative z-10 font-black tracking-[-0.08em] leading-none select-none transition-all duration-700 ${isFullscreen
          ? `text-[120px] sm:text-[320px] ${mode === 'pomodoro' ? 'text-white' : 'text-green-500'}`
          : 'text-[72px] sm:text-[160px] text-foreground mb-8 sm:mb-16'
        }`}>
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className={`flex items-center gap-6 relative z-10 transition-all duration-500 ${isFullscreen
        ? (showFullscreenUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none')
        : 'opacity-100'
        }`}>
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center transition-all duration-500 active:scale-95 border border-white/20 group/play ${isFullscreen
            ? 'h-16 px-10 rounded-full bg-white/10 text-white hover:bg-white/20'
            : isActive
              ? 'h-24 px-12 rounded-full bg-surface text-primary border border-border-main hover:bg-hover-bg'
              : 'h-24 px-12 rounded-full bg-primary text-white hover:opacity-90'
            }`}
        >
          {isActive ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6 fill-current" />
              <span className="text-sm font-black uppercase tracking-[0.3em]">Bắt đầu</span>
            </div>
          )}
        </button>

        <AnimatePresence>
          {isActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              onClick={skipTimer}
              className={`flex items-center justify-center rounded-full transition-all active:scale-95 ${isFullscreen
                ? 'w-16 h-16 bg-white/5 text-white/40 hover:text-white'
                : 'w-14 h-14 bg-hover-bg text-foreground/40 hover:text-foreground hover:bg-active-bg'
                }`}
              title="Bỏ qua"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </motion.button>
          )}
        </AnimatePresence>

        {!isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-hover-bg text-foreground/40 hover:text-foreground hover:bg-active-bg transition-all active:scale-95"
            title="Toàn màn hình"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Subtle Progress Indicator - Hidden in Fullscreen */}
      {!isFullscreen && (
        <div className="mt-16 flex items-center gap-2 opacity-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i < (pomodorosCompleted % 4) ? 'bg-primary scale-125' : 'bg-foreground/20'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
