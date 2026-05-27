'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

import { db } from '@/lib/local-first/db'
import { triggerSync } from '@/lib/local-first/sync-engine'


export type FocusMode = 'pomodoro' | 'short_break' | 'long_break'

interface FocusSettings {
  pomodoro_duration: number
  short_break_duration: number
  long_break_duration: number
  auto_start_breaks: boolean
  auto_start_pomodoros: boolean
  long_break_interval: number
  alarm_sound: string
  ticking_sound: string
}

interface FocusContextType {
  mode: FocusMode
  timeLeft: number
  isActive: boolean
  settings: FocusSettings
  pomodorosCompleted: number
  setMode: (mode: FocusMode) => void
  toggleTimer: () => void
  skipTimer: () => void
  updateSettings: (newSettings: Partial<FocusSettings>) => void
  formatTime: (seconds: number) => string
}

const defaultSettings: FocusSettings = {
  pomodoro_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  auto_start_breaks: true,
  auto_start_pomodoros: true,
  long_break_interval: 4,
  alarm_sound: 'bell',
  ticking_sound: 'none'
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FocusSettings>(defaultSettings)
  const [mode, setMode] = useState<FocusMode>('pomodoro')
  const [timeLeft, setTimeLeft] = useState(defaultSettings.pomodoro_duration * 60)
  const [isActive, setIsActive] = useState(false)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)
  const tickingAudioRef = useRef<HTMLAudioElement | null>(null)
  const isHandlingComplete = useRef(false)
  
  // Load settings and tasks on mount
  useEffect(() => {
    // 1. Tải cấu hình cài đặt từ localStorage đồng bộ ngay lập tức để tránh độ trễ hiển thị
    const cachedSettings = localStorage.getItem('focus-settings')
    if (cachedSettings) {
      try {
        const parsed = JSON.parse(cachedSettings)
        setSettings(parsed)
        setTimeLeft(parsed.pomodoro_duration * 60)
      } catch (e) {
        console.error('Failed to parse cached focus settings:', e)
      }
    }

    const timer = setTimeout(async () => {
      try {
        // Fallback or skip remote settings fetch if using GDrive JSON
        // Remote settings are now synchronized directly by sync-engine.
        const dbSettings = await db.focus_settings.toArray()
        if (dbSettings && dbSettings.length > 0) {
          const settingsObj = dbSettings[0]
          setSettings(settingsObj)
          setTimeLeft(settingsObj.pomodoro_duration * 60)
          localStorage.setItem('focus-settings', JSON.stringify(settingsObj))
        }
      } catch (err) {
        console.error('Failed to fetch local focus settings asynchronously:', err)
      }
    }, 1000)
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }

    // Setup audio elements
    if (typeof window !== 'undefined') {
      alarmAudioRef.current = new Audio('/audio/alarm.wav')
      tickingAudioRef.current = new Audio('https://actions.google.com/sounds/v1/tools/clock_ticking.ogg')
      tickingAudioRef.current.loop = true
    }

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Sync timeLeft when mode or settings change
  useEffect(() => {
    // We only auto-sync if NOT active, or if we are forced to (handled in setMode)
    if (!isActive) {
      if (mode === 'pomodoro') setTimeLeft(settings.pomodoro_duration * 60)
      else if (mode === 'short_break') setTimeLeft(settings.short_break_duration * 60)
      else if (mode === 'long_break') setTimeLeft(settings.long_break_duration * 60)
    }
  }, [mode, settings, isActive])

  const handleTimerComplete = async () => {
    if (isHandlingComplete.current) return
    isHandlingComplete.current = true
    
    setIsActive(false)
    if (tickingAudioRef.current) tickingAudioRef.current.pause()

    if (alarmAudioRef.current) {
      alarmAudioRef.current.currentTime = 0
      alarmAudioRef.current.volume = 0.8
      alarmAudioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'pomodoro' ? 'Đã đến giờ nghỉ ngơi!' : 'Đã đến lúc tập trung!'
      const body = mode === 'pomodoro' ? 'Làm tốt lắm! Bạn đã hoàn thành một phiên tập trung.' : 'Thời gian nghỉ đã hết. Hãy quay lại làm việc thôi.'
      new Notification(title, { body, icon: '/favicon.ico' })
    }

    let duration = 0
    if (mode === 'pomodoro') duration = settings.pomodoro_duration
    else if (mode === 'short_break') duration = settings.short_break_duration
    else if (mode === 'long_break') duration = settings.long_break_duration

    // Log session locally to IndexedDB + Sync Engine
    try {
      let userId = 'anonymous'
      try {
        const res = await fetch('/api/auth/session')
        const authData = await res.json()
        if (authData?.user?.id) userId = authData.user.id
      } catch (e) {
        console.error('No session')
      }
      const sessionId = crypto.randomUUID()
      const now = new Date().toISOString()

      await db.focus_sessions.put({
        id: sessionId,
        user_id: userId,
        task_id: null,
        session_type: mode,
        duration_minutes: duration,
        is_completed: true,
        completed_at: now,
        created_at: now,
        updated_at: now,
        is_synced: 0
      })

      await db.outbox.add({
        action: 'create',
        table_name: 'focus_sessions',
        record_id: sessionId,
        payload: { task_id: null, session_type: mode, duration_minutes: duration },
        created_at: now
      })
    } catch (err) {
      console.error('Failed to log focus session locally:', err)
    }

    // (Nhiệm vụ Pomodoro đã được gỡ bỏ hoàn toàn)
    
    // Trigger sync engine to push all local changes to server
    triggerSync()
    
    if (mode === 'pomodoro') {
      const newCount = pomodorosCompleted + 1
      setPomodorosCompleted(newCount)
      const isLongBreak = newCount % settings.long_break_interval === 0
      const nextMode = isLongBreak ? 'long_break' : 'short_break'
      
      const nextDuration = nextMode === 'short_break' ? settings.short_break_duration : settings.long_break_duration
      setTimeLeft(nextDuration * 60)
      setMode(nextMode)
      
      if (settings.auto_start_breaks) setIsActive(true)
    } else {
      setTimeLeft(settings.pomodoro_duration * 60)
      setMode('pomodoro')
      
      if (settings.auto_start_pomodoros) setIsActive(true)
    }
    
    isHandlingComplete.current = false
  }

  // Timer tick logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (settings.ticking_sound !== 'none' && tickingAudioRef.current) {
        tickingAudioRef.current.play().catch(() => {})
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      if (tickingAudioRef.current) tickingAudioRef.current.pause()
      if (isActive && timeLeft === 0) handleTimerComplete()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (tickingAudioRef.current) tickingAudioRef.current.pause()
    }
  }, [isActive, timeLeft, settings.ticking_sound])

  const toggleTimer = () => setIsActive(!isActive)
  const skipTimer = () => { setIsActive(false); handleTimerComplete() }

  const updateSettingsState = (newSettings: Partial<FocusSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('focus-settings', JSON.stringify(updated))
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <FocusContext.Provider value={{
      mode,
      timeLeft,
      isActive,
      settings,
      pomodorosCompleted,
      setMode,
      toggleTimer,
      skipTimer,
      updateSettings: updateSettingsState,
      formatTime
    }}>
      {children}
    </FocusContext.Provider>
  )
}

export function useFocus() {
  const context = useContext(FocusContext)
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider')
  }
  return context
}
