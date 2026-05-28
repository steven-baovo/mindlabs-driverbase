'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Check, Calendar, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { useLocalProjects, useLocalIssues } from '@/lib/local-first/useLocalTasks';
import IssueList from '@/components/tasks/IssueList';
import { MockProject, getProjectStatusIcon, getProjectStatusLabel, getPriorityIcon, getPriorityLabel } from '@/components/tasks/types';

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

// ─── Sidebar Block — card độc lập, không bị ôm ────────────────────────────────
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

function PropRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-xs text-zinc-600 transition-colors text-left ${onClick ? 'hover:bg-hover-bg cursor-pointer' : 'cursor-default'}`}
    >
      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-zinc-400">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────────
export default function ProjectDetails({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { projects: dbProjects, updateProject, deleteProject } = useLocalProjects();
  const { issues: dbIssues } = useLocalIssues();
  const [localName, setLocalName] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  const project = useMemo(() => {
    if (!dbProjects) return null;
    const found = dbProjects.find(p => p.id === projectId);
    if (!found) return null;
    return {
      id: found.id, name: found.name, status: found.status,
      priority: (found.priority as any) || 'none',
      startDate: found.start_date || '', targetDate: found.target_date || '',
      description: found.description || ''
    };
  }, [dbProjects, projectId]);

  useEffect(() => {
    if (project) {
      setLocalName(project.name);
      setLocalDescription(project.description || '');
    }
  }, [project?.id]);

  if (!dbProjects) return <div className="flex-1 bg-background" />;
  if (!project) return (
    <div className="p-8 flex flex-col items-center justify-center flex-1 h-full gap-4 text-zinc-500 bg-background">
      <p className="text-sm">Dự án không tồn tại hoặc đã bị xóa.</p>
      <Link href="/tasks" className="text-xs font-semibold text-zinc-900 hover:underline">Quay lại</Link>
    </div>
  );

  const handleUpdate = (field: keyof MockProject, value: any) => {
    const map: Record<string, string> = { startDate: 'start_date', targetDate: 'target_date' };
    updateProject(projectId, { [map[field] || field]: value });
  };

  const handleDelete = () => {
    if (window.confirm('Xóa dự án này? Tất cả nhiệm vụ sẽ bị mất.')) {
      deleteProject(projectId); router.push('/tasks');
    }
  };

  const projIssues = (dbIssues || []).filter(i => i.project_id === projectId);
  const active = projIssues.filter(i => i.status !== 'canceled');
  const done = active.filter(i => i.status === 'done');
  const progress = active.length > 0 ? Math.round((done.length / active.length) * 100) : 0;

  const healthData = useMemo(() => {
    if (projIssues.length === 0) {
      return { label: 'No updates', bgClass: 'border border-dashed border-zinc-300 dark:border-zinc-700', textClass: 'text-zinc-500' };
    }
    if (progress === 100) {
      return { label: 'Completed', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-450' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueIssues = active.filter(i => i.status !== 'done' && i.due_date && i.due_date < todayStr);

    if (overdueIssues.length > 0) {
      if (overdueIssues.length >= 3) {
        return { label: 'Off track', bgClass: 'bg-red-500', textClass: 'text-red-600 dark:text-red-400' };
      }
      return { label: 'At risk', bgClass: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400' };
    }

    return { label: 'On track', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-450' };
  }, [projIssues, active, progress]);

  const PROJECT_STATUSES: MockProject['status'][] = ['planned', 'active', 'paused', 'completed', 'canceled'];
  const PRIORITIES = ['urgent', 'high', 'medium', 'low', 'none'] as const;

  const fmt = (d: string) => {
    if (!d) return null;
    const clean = d.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [y, m, day] = parts;
      return `${day}/${m}/${y}`;
    }
    return d;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 h-[44px] border-b border-border-main shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Link href="/tasks?view=projects" className="p-1 rounded-md text-zinc-400 hover:bg-hover-bg hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1 text-standard text-zinc-400 leading-none">
            <Link href="/tasks?view=projects" className="hover:text-standard-text transition-colors leading-none">Project</Link>
            <span className="mx-1 leading-none">/</span>
            <span className="text-standard-text font-semibold leading-none">{project.name}</span>
          </div>
        </div>
        <button onClick={handleDelete} className="p-1.5 rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer" title="Xóa dự án">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-y-auto custom-scrollbar min-h-0">

        {/* Center */}
        <div className="flex-1 min-w-0">
          <div className="px-10 pt-10 pb-4">
            <div className="max-w-2xl">
              <input
                type="text"
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                onBlur={() => { if (localName.trim() && localName !== project.name) handleUpdate('name', localName); }}
                className="w-full bg-transparent text-[22px] font-bold text-foreground outline-none placeholder:text-zinc-300 leading-snug"
                placeholder="Tên dự án..."
              />
              <textarea
                value={localDescription}
                onChange={e => setLocalDescription(e.target.value)}
                onBlur={() => { if (localDescription !== (project.description || '')) handleUpdate('description', localDescription); }}
                placeholder="Add description..."
                rows={3}
                className="mt-3 w-full bg-transparent text-sm text-zinc-500 placeholder:text-zinc-300 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
          <div>
            <IssueList projectId={projectId} title="" hideHeader={false} hideTitle={true} disableScroll={true} />
          </div>
        </div>

        {/* Right Sidebar — blocks float riêng, không có wrapper bao ── */}
        <div className="w-[220px] shrink-0 px-3 py-4 flex flex-col gap-3">

          {/* Block: Properties */}
          <SidebarBlock title="Properties">
            {/* Health (Auto-calculated) */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-600 border-b border-border-main/10 select-none">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center text-zinc-400">
                  <Activity className="w-3.5 h-3.5" />
                </span>
                <span>Health</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                {healthData.label === 'No updates' ? (
                  <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 shrink-0" />
                ) : (
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="7"
                        cy="7"
                        r="5"
                        fill="none"
                        stroke="currentColor"
                        className="text-zinc-100 dark:text-zinc-800"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="7"
                        cy="7"
                        r="5"
                        fill="none"
                        stroke="currentColor"
                        className={
                          healthData.label === 'Off track' ? 'text-red-500' :
                          healthData.label === 'At risk' ? 'text-amber-500' :
                          'text-emerald-500'
                        }
                        strokeWidth="1.5"
                        strokeDasharray="31.4"
                        strokeDashoffset={31.4 - (31.4 * progress) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
                <span className={`text-[11px] font-semibold ${healthData.textClass}`}>{healthData.label}</span>
              </div>
            </div>

            {/* Status */}
            <div className="relative">
              <PropRow
                icon={getProjectStatusIcon(project.status, 'w-4 h-4')}
                label={getProjectStatusLabel(project.status)}
                onClick={() => setStatusOpen(v => !v)}
              />
              <Popover open={statusOpen} onClose={() => setStatusOpen(false)}>
                {PROJECT_STATUSES.map(s => (
                  <MenuOption key={s} icon={getProjectStatusIcon(s, 'w-3.5 h-3.5')} label={getProjectStatusLabel(s)}
                    active={project.status === s}
                    onClick={() => { handleUpdate('status', s); setStatusOpen(false); }}
                  />
                ))}
              </Popover>
            </div>

            {/* Priority */}
            <div className="relative">
              <PropRow
                icon={getPriorityIcon(project.priority || 'none', 'w-4 h-4')}
                label={getPriorityLabel(project.priority || 'none')}
                onClick={() => setPriorityOpen(v => !v)}
              />
              <Popover open={priorityOpen} onClose={() => setPriorityOpen(false)}>
                {PRIORITIES.map(p => (
                  <MenuOption key={p} icon={getPriorityIcon(p, 'w-3.5 h-3.5')} label={getPriorityLabel(p)}
                    active={(project.priority || 'none') === p}
                    onClick={() => { handleUpdate('priority', p); setPriorityOpen(false); }}
                  />
                ))}
              </Popover>
            </div>

            {/* Start date */}
            <div className="relative">
              <PropRow
                icon={<Calendar className="w-4 h-4" />}
                label={fmt(project.startDate) ?? 'Start date'}
                onClick={() => setStartOpen(v => !v)}
              />
              <Popover open={startOpen} onClose={() => setStartOpen(false)}>
                <CalendarPicker
                  value={project.startDate}
                  onChange={dateStr => handleUpdate('startDate', dateStr)}
                  onClose={() => setStartOpen(false)}
                />
              </Popover>
            </div>

            {/* Target date */}
            <div className="relative">
              <PropRow
                icon={<Calendar className="w-4 h-4" />}
                label={fmt(project.targetDate) ?? 'Target date'}
                onClick={() => setTargetOpen(v => !v)}
              />
              <Popover open={targetOpen} onClose={() => setTargetOpen(false)}>
                <CalendarPicker
                  value={project.targetDate}
                  onChange={dateStr => handleUpdate('targetDate', dateStr)}
                  onClose={() => setTargetOpen(false)}
                />
              </Popover>
            </div>
          </SidebarBlock>

          {/* Block: Progress */}
          <SidebarBlock title="Progress">
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{done.length}/{active.length} tasks</span>
                <span className="text-xs font-bold text-secondary">{progress}%</span>
              </div>
              <div className="h-1.5 bg-active-bg rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </SidebarBlock>

          {/* Block: Danger zone */}
          <SidebarBlock title="Danger zone">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa dự án</span>
            </button>
          </SidebarBlock>

        </div>
      </div>
    </div>
  );
}
