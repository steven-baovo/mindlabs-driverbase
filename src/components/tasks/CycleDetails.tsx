'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ChevronLeft, ChevronRight, Check, Calendar, Activity, X } from 'lucide-react';
import Link from 'next/link';
import { useLocalCycles, useLocalIssues } from '@/lib/local-first/useLocalTasks';
import IssueList from '@/components/tasks/IssueList';
import { MockCycle } from '@/components/tasks/types';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// ─── Popover ───────────────────────────────────────────────────────────────────
function Popover({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[196px] bg-surface border border-border-main rounded-lg overflow-hidden shadow-overlay"
    >
      {children}
    </div>
  );
}

function MenuOption({ icon, label, active, onClick }: {
  icon?: React.ReactNode; label: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-hover-bg transition-colors text-left cursor-pointer"
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center">{icon}</span>}
      <span className="flex-1">{label}</span>
      {active && <Check className="w-3 h-3 text-zinc-400 shrink-0" />}
    </button>
  );
}

function PropRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-xs text-zinc-600 transition-colors text-left ${onClick ? 'hover:bg-hover-bg cursor-pointer' : 'cursor-default'}`}
    >
      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-zinc-400">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-main bg-surface relative">
      <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-3">
        <span className="text-[13px] font-medium text-primary">{title}</span>
      </div>
      <div className="flex flex-col py-1">{children}</div>
    </div>
  );
}

// ─── Custom Calendar Picker ──────────────────────────────────────────────────
function CalendarPicker({ value, onChange, onClose }: {
  value: string;
  onChange: (date: string | null) => void;
  onClose: () => void;
}) {
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [currentMonth, setCurrentMonth] = useState(() => new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const setQuickDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    onChange(d.toISOString().split('T')[0]);
    onClose();
  };

  const setNextWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay() + 1) % 7 + 1); // Next Monday
    onChange(d.toISOString().split('T')[0]);
    onClose();
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysFromPrevMonth = firstDayIndex;
  
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }
    const remaining = 42 - cells.length;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false,
      });
    }
    return cells;
  }, [year, month, daysInMonth, daysFromPrevMonth, daysInPrevMonth, prevMonth, prevMonthYear]);

  const handleDayClick = (cell: { day: number; month: number; year: number }) => {
    const monthStr = String(cell.month + 1).padStart(2, '0');
    const dayStr = String(cell.day).padStart(2, '0');
    onChange(`${cell.year}-${monthStr}-${dayStr}`);
    onClose();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1));
  };

  const isSelected = (cell: { day: number; month: number; year: number }) => {
    if (!value) return false;
    const cleanValue = value.split('T')[0];
    const cellValue = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
    return cleanValue === cellValue;
  };

  const isToday = (cell: { day: number; month: number; year: number }) => {
    const today = new Date();
    return today.getDate() === cell.day && today.getMonth() === cell.month && today.getFullYear() === cell.year;
  };

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="flex flex-col w-[196px] bg-surface text-foreground p-2.5">
      {/* Quick Select Buttons */}
      <div className="flex flex-col gap-1 pb-2 mb-2 border-b border-border-main">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setQuickDate(0)}
            className="flex items-center justify-center px-1 py-1 text-[10px] font-medium text-secondary hover:bg-hover-bg border border-border-main rounded-md transition-colors text-center cursor-pointer"
          >
            Hôm nay
          </button>
          <button
            onClick={() => setQuickDate(1)}
            className="flex items-center justify-center px-1 py-1 text-[10px] font-medium text-secondary hover:bg-hover-bg border border-border-main rounded-md transition-colors text-center cursor-pointer"
          >
            Ngày mai
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={setNextWeek}
            className="flex items-center justify-center px-1 py-1 text-[10px] font-medium text-secondary hover:bg-hover-bg border border-border-main rounded-md transition-colors text-center cursor-pointer"
          >
            Tuần sau
          </button>
          <button
            onClick={() => { onChange(null); onClose(); }}
            className="flex items-center justify-center px-1 py-1 text-[10px] font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-md transition-colors text-center cursor-pointer"
          >
            Bỏ chọn
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[10.5px] font-bold text-foreground">
          Tháng {month + 1}, {year}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-secondary hover:bg-hover-bg hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-md text-secondary hover:bg-hover-bg hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {weekDays.map(wd => (
          <span key={wd} className="text-[9px] font-semibold text-secondary/60 py-0.5">
            {wd}
          </span>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarCells.map((cell, idx) => {
          const selected = isSelected(cell);
          const today = isToday(cell);
          return (
            <button
              key={idx}
              onClick={() => handleDayClick(cell)}
              className={`
                aspect-square text-[9.5px] font-medium rounded-md transition-colors flex items-center justify-center relative cursor-pointer
                ${cell.isCurrentMonth ? 'text-foreground hover:bg-hover-bg' : 'text-secondary/35 hover:bg-hover-bg/30'}
                ${selected ? '!bg-zinc-950 dark:!bg-zinc-100 !text-white dark:!text-zinc-900 hover:!bg-zinc-900 dark:hover:!bg-zinc-200' : ''}
                ${today && !selected ? 'border border-border-strong font-bold text-foreground' : ''}
              `}
            >
              {cell.day}
              {today && !selected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-zinc-950 dark:bg-zinc-100 scale-75" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────────
export default function CycleDetails({ cycleId }: { cycleId: string }) {
  const router = useRouter();
  const { cycles: dbCycles, updateCycle, deleteCycle } = useLocalCycles();
  const { issues: dbIssues } = useLocalIssues();
  const [cyclesEnabled, setCyclesEnabled] = useState(true);

  const [localName, setLocalName] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const enabled = localStorage.getItem('cycles_enabled') !== 'false';
      setCyclesEnabled(enabled);
      if (!enabled) {
        router.replace('/tasks');
      }
    }
  }, [router]);

  const cycle = useMemo(() => {
    if (!dbCycles) return null;
    const found = dbCycles.find(c => c.id === cycleId);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      isActive: found.is_active,
      startDate: found.start_date || '',
      endDate: found.end_date || ''
    };
  }, [dbCycles, cycleId]);

  useEffect(() => {
    if (cycle) {
      setLocalName(cycle.name);
    }
  }, [cycle?.id]);

  if (!cyclesEnabled) return null;
  if (!dbCycles) return <div className="flex-1 bg-background" />;
  if (!cycle) return (
    <div className="p-8 flex flex-col items-center justify-center flex-1 h-full gap-4 text-zinc-500 bg-background">
      <p className="text-xs font-semibold uppercase tracking-wider">Chu kỳ không tồn tại hoặc đã bị xóa.</p>
      <Link href="/tasks" className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline">Quay lại danh sách</Link>
    </div>
  );

  const handleUpdate = (field: string, value: any) => {
    if (field === 'name') {
      updateCycle(cycleId, { name: value });
    } else if (field === 'is_active') {
      updateCycle(cycleId, { is_active: value });
    } else if (field === 'start_date') {
      updateCycle(cycleId, { start_date: value });
    } else if (field === 'end_date') {
      updateCycle(cycleId, { end_date: value });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chu kỳ này? Tất cả nhiệm vụ bên trong sẽ trở về trạng thái tự do.')) {
      deleteCycle(cycleId);
      router.push('/tasks');
    }
  };

  // Tính toán thống kê nhiệm vụ trong chu kỳ
  const cycleIssues = (dbIssues || []).filter(i => i.cycle_id === cycleId);
  const doneIssues = cycleIssues.filter(i => i.status === 'done');
  const inProgressIssues = cycleIssues.filter(i => i.status === 'in_progress');
  const todoIssues = cycleIssues.filter(i => i.status === 'todo');
  const backlogIssues = cycleIssues.filter(i => i.status === 'backlog');
  const canceledIssues = cycleIssues.filter(i => i.status === 'canceled');

  const activeCycleIssues = cycleIssues.filter(i => i.status !== 'canceled');
  const progress = activeCycleIssues.length > 0 ? Math.round((doneIssues.length / activeCycleIssues.length) * 100) : 0;
  const isUpcoming = cycle.startDate ? new Date() < new Date(cycle.startDate) : false;

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* CỘT TRÁI (Rộng - Vùng làm việc chính) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header của cột trái */}
        <div className="p-6 pb-3 border-b border-border-main bg-background shrink-0 flex flex-col gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Link href="/tasks" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Nhiệm vụ</span>
            </Link>
            <span>/</span>
            <span className="text-foreground">Chu kỳ</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              onBlur={() => { if (localName.trim() && localName !== cycle.name) handleUpdate('name', localName.trim()); }}
              className="w-full bg-transparent text-xl font-bold text-foreground outline-none placeholder:text-zinc-300 py-1"
              placeholder="Tên chu kỳ..."
            />
            {/* Badge Trạng thái */}
            {cycle.isActive ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 text-[10px] font-bold rounded-full border border-green-200/50 dark:border-green-900/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Đang hoạt động
              </span>
            ) : isUpcoming ? (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-200/50 dark:border-blue-900/30 shrink-0">
                Sắp diễn ra
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-bold rounded-full shrink-0">
                Đã hoàn thành
              </span>
            )}
          </div>
        </div>

        {/* Danh sách nhiệm vụ thuộc Chu kỳ (IssueList) */}
        <div className="flex-1 overflow-hidden relative">
          <IssueList cycleId={cycleId} title="" hideHeader={false} hideTitle={true} />
        </div>
      </div>

      {/* CỘT PHẢI (Hẹp - Sidebar thuộc tính Chu kỳ) */}
      <div className="w-80 border-l border-border-main bg-background shrink-0 flex flex-col overflow-y-auto custom-scrollbar p-6 gap-6 select-none">
        
        {/* Properties Block */}
        <SidebarBlock title="Properties">
          {/* Trạng thái chu kỳ */}
          <div className="relative">
            <PropRow 
              icon={<Activity />} 
              label={cycle.isActive ? "Đang hoạt động" : "Tạm đóng"} 
              onClick={() => setStatusOpen(true)} 
            />
            <Popover open={statusOpen} onClose={() => setStatusOpen(false)}>
              <div className="py-1">
                <MenuOption 
                  label="Đang hoạt động" 
                  active={cycle.isActive} 
                  onClick={() => { handleUpdate('is_active', true); setStatusOpen(false); }} 
                />
                <MenuOption 
                  label="Tạm đóng" 
                  active={!cycle.isActive} 
                  onClick={() => { handleUpdate('is_active', false); setStatusOpen(false); }} 
                />
              </div>
            </Popover>
          </div>

          {/* Ngày bắt đầu */}
          <div className="relative">
            <PropRow 
              icon={<Calendar />} 
              label={cycle.startDate ? formatDate(cycle.startDate) : 'Thêm ngày bắt đầu...'} 
              onClick={() => setStartOpen(true)} 
            />
            <Popover open={startOpen} onClose={() => setStartOpen(false)}>
              <CalendarPicker
                value={cycle.startDate}
                onChange={d => handleUpdate('start_date', d)}
                onClose={() => setStartOpen(false)}
              />
            </Popover>
          </div>

          {/* Ngày kết thúc */}
          <div className="relative">
            <PropRow 
              icon={<Calendar />} 
              label={cycle.endDate ? formatDate(cycle.endDate) : 'Thêm ngày kết thúc...'} 
              onClick={() => setTargetOpen(true)} 
            />
            <Popover open={targetOpen} onClose={() => setTargetOpen(false)}>
              <CalendarPicker
                value={cycle.endDate}
                onChange={d => handleUpdate('end_date', d)}
                onClose={() => setTargetOpen(false)}
              />
            </Popover>
          </div>
        </SidebarBlock>

        {/* Tiến độ hoàn thành */}
        <SidebarBlock title="Progress">
          <div className="px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-active-bg h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-black text-secondary">{progress}%</span>
            </div>
          </div>
        </SidebarBlock>

        {/* Thống kê chi tiết */}
        <SidebarBlock title="Analytics">
          <div className="space-y-1 text-xs px-2 py-1">
            <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-hover-bg/30">
              <span className="text-zinc-500 font-medium">Tổng nhiệm vụ</span>
              <span className="font-bold text-foreground">{cycleIssues.length}</span>
            </div>
            
            <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-hover-bg/30">
              <span className="text-zinc-500 font-medium">Đã hoàn thành</span>
              <span className="font-bold text-green-600 dark:text-green-400">{doneIssues.length}</span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-hover-bg/30">
              <span className="text-zinc-500 font-medium">Đang tiến hành</span>
              <span className="font-bold text-blue-500">{inProgressIssues.length}</span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-hover-bg/30">
              <span className="text-zinc-500 font-medium">Cần thực hiện</span>
              <span className="font-bold text-zinc-600 dark:text-zinc-400">{todoIssues.length}</span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-hover-bg/30">
              <span className="text-zinc-500 font-medium">Chờ (Backlog)</span>
              <span className="font-bold text-zinc-400">{backlogIssues.length}</span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-hover-bg/30">
              <span className="text-zinc-500 font-medium">Đã hủy (Canceled)</span>
              <span className="font-bold text-zinc-400 dark:text-zinc-500">{canceledIssues.length}</span>
            </div>
          </div>
        </SidebarBlock>

        {/* Nút Xóa chu kỳ (Danger Zone) */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200 hover:border-red-300 bg-red-50/10 hover:bg-red-50/50 dark:border-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa chu kỳ</span>
          </button>
        </div>

      </div>
    </div>
  );
}
