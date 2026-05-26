'use client'

import { useState, useEffect } from 'react'
import { useFocus } from '@/contexts/FocusContext'
import { db } from '@/lib/local-first/db'
import { triggerSync } from '@/lib/local-first/sync-engine'

import { Settings2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FloatingPortal } from '@floating-ui/react'

export default function FocusSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings } = useFocus()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevSettings, setPrevSettings] = useState(settings)

  if (isOpen !== prevIsOpen || settings !== prevSettings) {
    setPrevIsOpen(isOpen)
    setPrevSettings(settings)
    if (isOpen) {
      setLocalSettings(settings)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let userId = 'anonymous'
      try {
        const res = await fetch('/api/auth/session')
        const authData = await res.json()
        if (authData?.user?.id) userId = authData.user.id
      } catch (e) {
        console.error('No session')
      }
      const now = new Date().toISOString()
      const recordId = userId // Use user_id as the primary key for settings

      const payload = {
        id: recordId,
        user_id: userId,
        ...localSettings,
        created_at: now,
        updated_at: now,
        is_synced: 0
      }

      await db.focus_settings.put(payload)

      await db.outbox.add({
        action: 'update',
        table_name: 'focus_settings',
        record_id: recordId,
        payload: localSettings,
        created_at: now
      })

      updateSettings(localSettings)
      triggerSync()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-hover-bg hover:bg-active-bg rounded-full transition-all text-secondary hover:text-foreground border border-border-main"
      >
        <Settings2 className="w-4 h-4" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase">CÀI ĐẶT</span>
      </button>

      <FloatingPortal>
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={handleClose}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-surface rounded-2xl overflow-hidden flex flex-col border border-border-main shadow-overlay"
              >
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border-main">
                  <h2 className="text-lg sm:text-xl font-black tracking-tighter text-foreground uppercase">CÀI ĐẶT</h2>
                  <button onClick={handleClose} className="p-2 hover:bg-hover-bg rounded-full transition-colors">
                    <X className="w-5 h-5 text-secondary/50 hover:text-secondary" />
                  </button>
                </div>

                <div className="p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 overflow-y-auto max-h-[70vh] no-scrollbar">
                  {/* Durations */}
                  <div className="space-y-4">
                    <h3 className="text-[9px] sm:text-[10px] font-black text-secondary uppercase tracking-[0.2em] sm:tracking-[0.3em]">Thời lượng (phút)</h3>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {[
                        { label: 'Tập trung', key: 'pomodoro_duration' },
                        { label: 'Nghỉ ngắn', key: 'short_break_duration' },
                        { label: 'Nghỉ dài', key: 'long_break_duration' }
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col gap-1.5 sm:gap-2">
                          <label className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase">{item.label}</label>
                          <input
                            type="number" min="1"
                            className="w-full bg-hover-bg/30 border border-border-main rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-center font-black text-xs sm:text-sm outline-none focus:border-primary focus:bg-surface transition-all"
                            value={localSettings[item.key as keyof typeof localSettings] as number}
                            onChange={e => setLocalSettings({ ...localSettings, [item.key]: Number(e.target.value) })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border-main w-full" />

                  {/* Toggles */}
                  <div className="space-y-5 sm:space-y-6">
                    {[
                      { label: 'Tự động bắt đầu phiên nghỉ', key: 'auto_start_breaks' },
                      { label: 'Tự động bắt đầu phiên tập trung', key: 'auto_start_pomodoros' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">{item.label}</span>
                        <button
                          onClick={() => setLocalSettings({ ...localSettings, [item.key]: !localSettings[item.key as keyof typeof localSettings] })}
                          className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full relative transition-all duration-300 ${localSettings[item.key as keyof typeof localSettings] ? 'bg-primary' : 'bg-active-bg'}`}
                        >
                          <motion.div
                            animate={{ x: localSettings[item.key as keyof typeof localSettings] ? (window.innerWidth < 640 ? 22 : 26) : 4 }}
                            className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute top-1"
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-border-main w-full" />

                  {/* Interval */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Chu kỳ nghỉ dài</span>
                    <input
                      type="number" min="1"
                      className="w-16 sm:w-20 bg-hover-bg/30 border border-border-main rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-center font-black text-xs sm:text-sm outline-none focus:border-primary focus:bg-surface transition-all"
                      value={localSettings.long_break_interval}
                      onChange={e => setLocalSettings({ ...localSettings, long_break_interval: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="p-6 sm:p-8 border-t border-border-main flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-primary text-white rounded-full font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px] hover:opacity-90 transition-all disabled:opacity-50 -primary/20"
                  >
                    {isSaving ? 'Đang lưu...' : 'CẬP NHẬT'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  )
}
