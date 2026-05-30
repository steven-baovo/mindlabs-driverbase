'use client'

import React, { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/local-first/db'
import { 
  Timer, 
  CheckSquare, 
  Clock, 
  Activity, 
  TrendingUp, 
  Award, 
  Briefcase,
  ChevronLeft
} from 'lucide-react'
import { useClientNavigate } from '@/hooks/useClientNavigate'

export default function ProductivityReport() {
  const { navigate } = useClientNavigate()
  // Query dữ liệu từ offline database
  const sessions = useLiveQuery(() => db.focus_sessions.toArray()) || []
  const issues = useLiveQuery(() => db.issues.toArray()) || []

  // --- 1. TÍNH TOÁN CÁC CHỈ SỐ TỔNG QUAN (METRICS) ---
  const stats = useMemo(() => {
    const completedPomodoros = sessions.filter(s => s.is_completed && s.session_type === 'pomodoro')
    const totalFocusMinutes = completedPomodoros.reduce((sum, s) => sum + s.duration_minutes, 0)
    const completedIssuesCount = issues.filter(i => i.status === 'done' && i.is_deleted === 0).length
    const pendingIssuesCount = issues.filter(i => i.status !== 'done' && i.status !== 'canceled' && i.is_deleted === 0).length

    // Chuyển đổi phút thành định dạng "X giờ Y phút" hoặc "Y phút"
    const hours = Math.floor(totalFocusMinutes / 60)
    const mins = totalFocusMinutes % 60
    const focusTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

    return {
      focusTimeStr,
      pomodorosCount: completedPomodoros.length,
      completedIssuesCount,
      pendingIssuesCount,
      totalFocusMinutes
    }
  }, [sessions, issues])

  // --- 2. TÍNH TOÁN DỮ LIỆU XU HƯỚNG 7 NGÀY GẦN NHẤT ---
  const dailyFocusTrend = useMemo(() => {
    const days = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateString = d.toISOString().split('T')[0]
      
      // Nhãn thứ trong tuần (viết tắt tiếng Việt)
      const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      const dayLabel = daysOfWeek[d.getDay()]
      
      const dayMinutes = sessions
        .filter(s => {
          if (!s.is_completed || s.session_type !== 'pomodoro') return false
          const sessionDate = s.completed_at ? s.completed_at.split('T')[0] : s.created_at.split('T')[0]
          return sessionDate === dateString
        })
        .reduce((sum, s) => sum + s.duration_minutes, 0)

      days.push({
        label: dayLabel,
        minutes: dayMinutes,
        date: dateString
      })
    }
    return days
  }, [sessions])

  // Giá trị cột lớn nhất để tính tỉ lệ chiều cao cột biểu đồ
  const maxDailyMinutes = useMemo(() => {
    const max = Math.max(...dailyFocusTrend.map(d => d.minutes), 0)
    return max === 0 ? 60 : max // Mặc định tối thiểu chia cho 60 phút
  }, [dailyFocusTrend])

  // --- 3. PHÂN BỔ THỜI GIAN (POMO VS BREAK) ---
  const timeAllocation = useMemo(() => {
    let focus = 0
    let breakTime = 0

    sessions.forEach(s => {
      if (!s.is_completed) return
      if (s.session_type === 'pomodoro') {
        focus += s.duration_minutes
      } else {
        breakTime += s.duration_minutes
      }
    })

    const total = focus + breakTime
    const focusPercent = total > 0 ? Math.round((focus / total) * 100) : 100
    const breakPercent = total > 0 ? Math.round((breakTime / total) * 100) : 0

    return {
      focus,
      breakTime,
      focusPercent,
      breakPercent,
      total
    }
  }, [sessions])

  // --- 4. DANH SÁCH NHIỆM VỤ HOÀN THÀNH GẦN ĐÂY ---
  const recentlyCompletedTasks = useMemo(() => {
    return issues
      .filter(i => i.status === 'done' && i.is_deleted === 0)
      .map(i => ({
        id: i.id,
        title: i.title,
        completedAt: i.updated_at
      }))
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5)
  }, [issues])

  // --- 5. LỊCH SỬ CÁC PHIÊN TẬP TRUNG GẦN ĐÂY ---
  const recentSessions = useMemo(() => {
    return [...sessions]
      .filter(s => s.is_completed && s.session_type === 'pomodoro')
      .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())
      .slice(0, 5)
      .map(s => {
        // Tìm tên nhiệm vụ dự án nếu có gắn task_id
        const matchedIssue = issues.find(i => i.id === s.task_id)
        return {
          id: s.id,
          taskTitle: matchedIssue ? matchedIssue.title : 'Tập trung tự do',
          duration: s.duration_minutes,
          completedAt: s.completed_at || s.created_at
        }
      })
  }, [sessions, issues])

  return (
    <main className="w-full h-full flex flex-col bg-background p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workspace')}
            className="w-8 h-8 rounded-full border border-border-main flex items-center justify-center text-secondary hover:text-foreground hover:bg-hover-bg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Quay lại"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight uppercase">Báo cáo Năng suất</h1>
            <p className="text-[11px] text-secondary tracking-tight">Tổng hợp kết quả tập trung và nhiệm vụ của bạn</p>
          </div>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
        {/* Metric 1 */}
        <div className="p-4 bg-surface border border-border-main rounded-default shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-secondary font-medium tracking-tight uppercase">Tổng thời gian</p>
            <h3 className="text-base sm:text-lg font-black text-foreground truncate mt-0.5">{stats.focusTimeStr}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-surface border border-border-main rounded-default shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-secondary font-medium tracking-tight uppercase">Phiên Pomodoro</p>
            <h3 className="text-base sm:text-lg font-black text-foreground truncate mt-0.5">{stats.pomodorosCount} phiên</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-surface border border-border-main rounded-default shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-secondary font-medium tracking-tight uppercase">Nhiệm vụ hoàn thành</p>
            <h3 className="text-base sm:text-lg font-black text-foreground truncate mt-0.5">{stats.completedIssuesCount} task</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-surface border border-border-main rounded-default shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-secondary font-medium tracking-tight uppercase">Nhiệm vụ đang xử lý</p>
            <h3 className="text-base sm:text-lg font-black text-foreground truncate mt-0.5">{stats.pendingIssuesCount} task</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar Chart 7 Days (Col-span: 2) */}
        <div className="lg:col-span-2 p-5 bg-surface border border-border-main rounded-default shadow-subtle flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-[13px] font-black text-foreground uppercase tracking-tight">Xu hướng tập trung 7 ngày</h2>
            </div>
            <span className="text-[11px] text-secondary tracking-tight">Đơn vị: phút</span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 pt-6 px-2">
            {dailyFocusTrend.map((day, idx) => {
              // Tính tỉ lệ phần trăm chiều cao cột (tối đa 80% chiều cao của khu vực biểu đồ)
              const heightPercent = Math.max((day.minutes / maxDailyMinutes) * 100, 4) // Tối thiểu 4% để có hiển thị cột
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Cột dữ liệu */}
                  <div className="w-full relative flex items-end justify-center h-40">
                    {/* Tooltip nổi lên trên cột khi hover */}
                    <div className="absolute bottom-full mb-1.5 px-2 py-0.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {day.minutes} phút
                    </div>
                    {/* Thanh cột */}
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className={`w-8 sm:w-12 rounded-t-sm transition-all duration-500 ${
                        day.minutes > 0 
                          ? 'bg-primary group-hover:bg-primary/80' 
                          : 'bg-zinc-100 dark:bg-zinc-800/40'
                      }`}
                    />
                  </div>
                  {/* Nhãn thứ */}
                  <span className="text-[11px] text-secondary font-medium tracking-tight mt-1">{day.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Time Allocation Pie Chart (Col-span: 1) */}
        <div className="p-5 bg-surface border border-border-main rounded-default shadow-subtle flex flex-col items-center justify-between min-h-[300px]">
          <div className="w-full flex items-center gap-2 mb-4 self-start">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h2 className="text-[13px] font-black text-foreground uppercase tracking-tight">Phân bổ hoạt động</h2>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background Circle */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="3" />
              {/* Foreground Focus Circle */}
              {stats.totalFocusMinutes > 0 && (
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-primary" 
                  strokeWidth="3.2" 
                  strokeDasharray={`${timeAllocation.focusPercent} ${100 - timeAllocation.focusPercent}`} 
                  strokeDashoffset="0" 
                />
              )}
            </svg>
            {/* Center percentage label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-foreground leading-none">{timeAllocation.focusPercent}%</span>
              <span className="text-[9px] text-secondary uppercase font-bold tracking-wider mt-0.5">Tập trung</span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2 mt-4">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Tập trung</span>
              </div>
              <span className="font-bold text-foreground">{timeAllocation.focusPercent}% ({timeAllocation.focus}m)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span>Nghỉ ngơi</span>
              </div>
              <span className="font-bold text-foreground">{timeAllocation.breakPercent}% ({timeAllocation.breakTime}m)</span>
            </div>
          </div>
        </div>
      </div>

      {/* History & Lists Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Tasks List */}
        <div className="p-5 bg-surface border border-border-main rounded-default shadow-subtle flex flex-col min-h-[250px]">
          <h2 className="text-[13px] font-black text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Nhiệm vụ hoàn thành gần đây</span>
          </h2>

          <div className="flex-1 space-y-3">
            {recentlyCompletedTasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[12px] text-secondary/70 italic py-10">
                Chưa có nhiệm vụ nào được hoàn thành gần đây
              </div>
            ) : (
              recentlyCompletedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2.5 rounded hover:bg-hover-bg transition-colors border border-border-main bg-background/50">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <p className="text-[12px] font-medium text-foreground truncate">{task.title}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-secondary shrink-0 font-bold ml-2">
                    Dự án
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Focus History List */}
        <div className="p-5 bg-surface border border-border-main rounded-default shadow-subtle flex flex-col min-h-[250px]">
          <h2 className="text-[13px] font-black text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-500" />
            <span>Lịch sử tập trung gần đây</span>
          </h2>

          <div className="flex-1 space-y-3">
            {recentSessions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[12px] text-secondary/70 italic py-10">
                Chưa có lịch sử phiên tập trung nào
              </div>
            ) : (
              recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-2.5 rounded hover:bg-hover-bg transition-colors border border-border-main bg-background/50">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <p className="text-[12px] font-medium text-foreground truncate">{session.taskTitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      +{session.duration}m
                    </span>
                    <span className="text-[10px] text-secondary">
                      {new Date(session.completedAt).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
