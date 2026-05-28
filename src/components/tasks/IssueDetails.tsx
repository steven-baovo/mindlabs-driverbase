'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trash2, ChevronLeft, ChevronRight, Calendar, Check,
  Plus, Circle, CheckCircle2, Clock, X, FolderOpen, Tag
} from 'lucide-react';
import { useLocalIssues, useLocalProjects, useLocalCycles } from '@/lib/local-first/useLocalTasks';
import {
  MockIssue, IssueStatus, IssuePriority,
  getStatusIcon, getPriorityIcon, getStatusLabel, getPriorityLabel,
  getIssueDisplayId
} from '@/components/tasks/types';

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

function MenuOption({ icon, label, active, onClick, onDelete }: {
  icon?: React.ReactNode; label: string; active?: boolean; onClick: () => void; onDelete?: () => void;
}) {
  return (
    <div className="group w-full flex items-center gap-2.5 px-3 py-1 hover:bg-hover-bg transition-colors">
      <button
        type="button"
        onClick={onClick}
        className="flex-1 flex items-center gap-2.5 py-1 text-xs text-foreground text-left cursor-pointer outline-none"
      >
        {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center">{icon}</span>}
        <span className="flex-1 capitalize">{label}</span>
        {active && <Check className="w-3 h-3 text-zinc-400 shrink-0" />}
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Xóa nhãn khỏi kho"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Sidebar Block ─────────────────────────────────────────────────────────────
// Mỗi block là card độc lập, KHÔNG bị ôm bởi sidebar wrapper
function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-main bg-surface relative">
      {/* Header bên trong card — màu accent giống Linear */}
      <button className="w-full flex items-center gap-1.5 px-4 pt-3.5 pb-3 cursor-default select-none">
        <span className="text-[13px] font-medium text-primary">{title}</span>
      </button>
      {/* Items */}
      <div className="flex flex-col py-1">
        {children}
      </div>
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
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-md text-secondary hover:bg-hover-bg hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3 h-3" />
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

// Full-width row: icon + label, clickable
function PropRow({ icon, label, onClick, children }: {
  icon: React.ReactNode; label: string; onClick?: () => void; children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-xs text-zinc-600 transition-colors text-left ${onClick ? 'hover:bg-hover-bg cursor-pointer' : 'cursor-default'}`}
    >
      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-zinc-400">{icon}</span>
      <span className="flex-1">{label}</span>
      {children}
    </button>
  );
}

// ─── Sub-issue row ─────────────────────────────────────────────────────────────
function SubIssueRow({ sub, onToggle, onDelete }: {
  sub: { id: string; displayId: string; title: string; status: IssueStatus };
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isDone = sub.status === 'done';
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-hover-bg group transition-colors">
      <button onClick={onToggle} className="shrink-0 cursor-pointer text-zinc-400 hover:text-zinc-700 transition-colors">
        {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" /> : <Circle className="w-3.5 h-3.5" />}
      </button>
      <Link
        href={`/tasks?issue=${sub.id}`}
        className={`flex-1 text-xs truncate transition-colors hover:text-foreground ${isDone ? 'line-through text-zinc-400' : 'text-zinc-600'}`}
      >
        <span className="text-zinc-300 mr-1.5">{sub.displayId}</span>
        {sub.title}
      </Link>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 shrink-0 text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IssueDetails({ issueId }: { issueId: string }) {
  const router = useRouter();

  const { issues: dbIssues, updateIssue, deleteIssue, addIssue } = useLocalIssues();
  const { projects: dbProjects } = useLocalProjects();
  const { cycles: dbCycles } = useLocalCycles();

  const [cyclesEnabled, setCyclesEnabled] = useState(true);
  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [addingSubIssue, setAddingSubIssue] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');
  const subInputRef = useRef<HTMLInputElement>(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const issue = useMemo<MockIssue | null>(() => {
    if (!dbIssues) return null;
    const found = dbIssues.find(i => i.id === issueId);
    if (!found) return null;
    return {
      id: found.id,
      displayId: getIssueDisplayId(found.created_at, found.number),
      title: found.title,
      description: found.description,
      status: found.status,
      priority: found.priority,
      dueDate: found.due_date || '',
      projectId: found.project_id || null,
      cycleId: found.cycle_id || null,
      labels: found.labels || [],
      createdAt: found.created_at
    };
  }, [dbIssues, issueId]);

  const subIssues = useMemo(() => {
    if (!dbIssues) return [];
    return dbIssues.filter(i => i.parent_id === issueId && !i.is_deleted);
  }, [dbIssues, issueId]);

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelQuery, setLabelQuery] = useState('');
  const [deletedLabels, setDeletedLabels] = useState<string[]>([]);

  const LABEL_LIST = useMemo(() => {
    const labelsSet = new Set<string>(['bug', 'feature', 'improvement', 'documentation', 'design', 'research']);
    if (dbIssues) {
      dbIssues.forEach(i => {
        if (i.labels) {
          i.labels.forEach(l => labelsSet.add(l.toLowerCase()));
        }
      });
    }
    return Array.from(labelsSet).filter(l => !deletedLabels.includes(l.toLowerCase()));
  }, [dbIssues, deletedLabels]);

  useEffect(() => {
    if (issue) { setLocalTitle(issue.title); setLocalDescription(issue.description); }
  }, [issueId, !!issue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCyclesEnabled(localStorage.getItem('cycles_enabled') !== 'false');
      const saved = localStorage.getItem('mindlabs-deleted-labels');
      if (saved) {
        try {
          setDeletedLabels(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (addingSubIssue) setTimeout(() => subInputRef.current?.focus(), 50);
  }, [addingSubIssue]);

  if (!dbIssues || !dbProjects) return <div className="p-8 text-xs text-zinc-400 animate-pulse">Đang tải...</div>;
  if (!issue) return (
    <div className="p-8 flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
      <p className="text-sm">Nhiệm vụ không tồn tại hoặc đã bị xóa.</p>
      <Link href="/tasks" className="text-xs font-semibold text-zinc-900 hover:underline">Quay lại</Link>
    </div>
  );

  const projects = dbProjects || [];
  const cycles = useMemo(() => {
    return [...(dbCycles || [])].sort((a, b) => {
      const dateA = a.start_date || '';
      const dateB = b.start_date || '';
      if (dateA && dateB) return dateA.localeCompare(dateB);
      return (a.number || 0) - (b.number || 0);
    });
  }, [dbCycles]);

  const handleUpdate = (field: keyof MockIssue, value: any) => {
    const map: Record<string, string> = { projectId: 'project_id', cycleId: 'cycle_id', dueDate: 'due_date' };
    updateIssue(issueId, { [map[field] || field]: value });
  };

  const handleGlobalDeleteLabel = (labelToDelete: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhãn "${labelToDelete}" khỏi toàn bộ nhiệm vụ và kho nhãn?`)) return;
    if (dbIssues) {
      dbIssues.forEach(item => {
        if (item.labels && item.labels.includes(labelToDelete)) {
          const updatedLabels = item.labels.filter(l => l !== labelToDelete);
          updateIssue(item.id, { labels: updatedLabels });
        }
      });
    }
    const newDeleted = [...deletedLabels, labelToDelete.toLowerCase()];
    setDeletedLabels(newDeleted);
    localStorage.setItem('mindlabs-deleted-labels', JSON.stringify(newDeleted));
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
      deleteIssue(issueId);
      router.push('/tasks');
    }
  };

  const handleAddSubIssue = async () => {
    if (!newSubTitle.trim()) { setAddingSubIssue(false); return; }
    await addIssue({
      title: newSubTitle.trim(), description: '', status: 'backlog', priority: 'none',
      project_id: issue.projectId, cycle_id: null, parent_id: issueId, due_date: null, labels: []
    });
    setNewSubTitle(''); setAddingSubIssue(false);
  };

  const projectName = issue.projectId ? projects.find(p => p.id === issue.projectId)?.name ?? null : null;
  const cycleName = issue.cycleId ? cycles.find(c => c.id === issue.cycleId)?.name ?? null : null;
  const STATUSES: IssueStatus[] = ['backlog', 'todo', 'in_progress', 'done', 'canceled'];
  const PRIORITIES: IssuePriority[] = ['urgent', 'high', 'medium', 'low', 'none'];

  const formatDate = (d: string) => {
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
          <Link href="/tasks" className="p-1 rounded-md text-zinc-400 hover:bg-hover-bg hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1 text-standard text-zinc-400 leading-none">
            {issue.projectId ? (
              <Link href={`/tasks?project=${issue.projectId}`} className="hover:text-standard-text transition-colors leading-none">{projectName}</Link>
            ) : <span className="leading-none">Nhiệm vụ</span>}
            <span className="mx-1 leading-none">/</span>
            <span className="text-standard-text font-semibold leading-none">{issue.displayId}</span>
          </div>
        </div>
        <button onClick={handleDelete} className="p-1.5 rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer" title="Xóa">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Center content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto px-10 py-10 flex flex-col gap-6">
            <input
              type="text"
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              onBlur={() => { if (localTitle.trim() && localTitle !== issue.title) handleUpdate('title', localTitle); }}
              onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              className="w-full bg-transparent text-[22px] font-bold text-foreground outline-none placeholder:text-zinc-300 leading-snug"
              placeholder="Tiêu đề nhiệm vụ..."
            />
            <textarea
              value={localDescription}
              onChange={e => setLocalDescription(e.target.value)}
              onBlur={() => { if (localDescription !== issue.description) handleUpdate('description', localDescription); }}
              placeholder="Add description..."
              className="w-full min-h-[140px] bg-transparent text-sm text-zinc-500 placeholder:text-zinc-300 outline-none resize-none leading-relaxed"
            />

            {/* Sub-issues */}
            <div className="flex flex-col gap-0.5">
              {subIssues.map(sub => (
                <SubIssueRow
                  key={sub.id}
                  sub={{
                    id: sub.id,
                    displayId: getIssueDisplayId(sub.created_at, sub.number),
                    title: sub.title,
                    status: sub.status as IssueStatus
                  }}
                  onToggle={() => updateIssue(sub.id, { status: sub.status === 'done' ? 'todo' : 'done' })}
                  onDelete={() => deleteIssue(sub.id)}
                />
              ))}
              {addingSubIssue ? (
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Circle className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <input
                    ref={subInputRef}
                    value={newSubTitle}
                    onChange={e => setNewSubTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddSubIssue();
                      if (e.key === 'Escape') { setAddingSubIssue(false); setNewSubTitle(''); }
                    }}
                    onBlur={handleAddSubIssue}
                    placeholder="Tên sub-issue... (Enter để lưu)"
                    className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-zinc-300"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAddingSubIssue(true)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer w-fit rounded-md hover:bg-hover-bg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add sub-issue</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Sidebar — blocks float riêng trên nền ── */}
        <div className="w-[220px] shrink-0 overflow-y-auto custom-scrollbar px-3 py-4 flex flex-col gap-3">

          {/* Block: Properties */}
          <SidebarBlock title="Properties">
            {/* Status */}
            <div className="relative">
              <PropRow
                icon={getStatusIcon(issue.status, 'w-4 h-4')}
                label={getStatusLabel(issue.status)}
                onClick={() => setStatusOpen(v => !v)}
              />
              <Popover open={statusOpen} onClose={() => setStatusOpen(false)}>
                {STATUSES.map(s => (
                  <MenuOption key={s} icon={getStatusIcon(s, 'w-3.5 h-3.5')} label={getStatusLabel(s)}
                    active={issue.status === s}
                    onClick={() => { handleUpdate('status', s); setStatusOpen(false); }}
                  />
                ))}
              </Popover>
            </div>

            {/* Priority */}
            <div className="relative">
              <PropRow
                icon={getPriorityIcon(issue.priority, 'w-4 h-4')}
                label={getPriorityLabel(issue.priority)}
                onClick={() => setPriorityOpen(v => !v)}
              />
              <Popover open={priorityOpen} onClose={() => setPriorityOpen(false)}>
                {PRIORITIES.map(p => (
                  <MenuOption key={p} icon={getPriorityIcon(p, 'w-3.5 h-3.5')} label={getPriorityLabel(p)}
                    active={issue.priority === p}
                    onClick={() => { handleUpdate('priority', p); setPriorityOpen(false); }}
                  />
                ))}
              </Popover>
            </div>

            {/* Due date */}
            <div className="relative">
              <PropRow
                icon={<Calendar className="w-4 h-4" />}
                label={formatDate(issue.dueDate) ?? 'Set due date'}
                onClick={() => setDateOpen(v => !v)}
              />
              <Popover open={dateOpen} onClose={() => setDateOpen(false)}>
                <CalendarPicker
                  value={issue.dueDate}
                  onChange={dateStr => handleUpdate('dueDate', dateStr)}
                  onClose={() => setDateOpen(false)}
                />
              </Popover>
            </div>

            {/* Cycle */}
            {cyclesEnabled && cycles.length > 0 && (
              <div className="relative">
                <PropRow
                  icon={<Clock className="w-4 h-4" />}
                  label={cycleName ?? 'Add to cycle'}
                  onClick={() => setCycleOpen(v => !v)}
                />
                <Popover open={cycleOpen} onClose={() => setCycleOpen(false)}>
                  <MenuOption label="Không có" active={!issue.cycleId}
                    onClick={() => { handleUpdate('cycleId', null); setCycleOpen(false); }}
                  />
                  {cycles.map(c => (
                    <MenuOption key={c.id} label={c.name} active={issue.cycleId === c.id}
                      onClick={() => { handleUpdate('cycleId', c.id); setCycleOpen(false); }}
                    />
                  ))}
                </Popover>
              </div>
            )}
          </SidebarBlock>

          {/* Block: Labels */}
          <SidebarBlock title="Labels">
            {issue.labels.length > 0 ? (
              <div className="px-4 py-2 flex flex-wrap gap-1.5">
                {issue.labels.map(label => (
                  <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-active-bg text-secondary border border-border-main capitalize">
                    {label}
                    <button
                      onClick={() => handleUpdate('labels', issue.labels.filter(l => l !== label))}
                      className="cursor-pointer text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="relative">
              <PropRow
                icon={<Tag className="w-4 h-4" />}
                label="Add label"
                onClick={() => setLabelOpen(v => !v)}
              />
              <Popover open={labelOpen} onClose={() => { setLabelOpen(false); setLabelQuery(''); }}>
                <div className="p-1.5 border-b border-border-main">
                  <input
                    type="text"
                    value={labelQuery}
                    onChange={(e) => setLabelQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = labelQuery.trim().toLowerCase();
                        if (!val) return;
                        
                        const exists = LABEL_LIST.some(l => l.toLowerCase() === val);
                        if (!exists) {
                          handleUpdate('labels', [...issue.labels, val]);
                          if (deletedLabels.includes(val)) {
                            const newDeleted = deletedLabels.filter(l => l !== val);
                            setDeletedLabels(newDeleted);
                            localStorage.setItem('mindlabs-deleted-labels', JSON.stringify(newDeleted));
                          }
                        } else {
                          const originalLabel = LABEL_LIST.find(l => l.toLowerCase() === val) || val;
                          const isChecked = issue.labels.includes(originalLabel);
                          const newLabels = isChecked
                            ? issue.labels.filter(l => l !== originalLabel)
                            : [...issue.labels, originalLabel];
                          handleUpdate('labels', newLabels);
                        }
                        
                        setLabelQuery('');
                        setLabelOpen(false);
                      }
                    }}
                    placeholder="Tìm kiếm hoặc tạo nhãn..."
                    className="w-full px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50 focus:bg-white dark:focus:bg-zinc-900 border border-border-main rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder-zinc-400 text-zinc-900 dark:text-zinc-100"
                    autoFocus
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto py-1">
                  {LABEL_LIST.filter(l => l.toLowerCase().includes(labelQuery.toLowerCase().trim())).map(label => {
                    const isChecked = issue.labels.includes(label);
                    return (
                      <MenuOption
                        key={label}
                        icon={<Tag className="w-3.5 h-3.5 text-zinc-400" />}
                        label={label}
                        active={isChecked}
                        onClick={() => {
                          const newLabels = isChecked
                            ? issue.labels.filter(l => l !== label)
                            : [...issue.labels, label];
                          handleUpdate('labels', newLabels);
                        }}
                        onDelete={() => handleGlobalDeleteLabel(label)}
                      />
                    );
                  })}
                  {labelQuery.trim() !== '' && !LABEL_LIST.some(l => l.toLowerCase() === labelQuery.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        const newLabel = labelQuery.trim().toLowerCase();
                        handleUpdate('labels', [...issue.labels, newLabel]);
                        if (deletedLabels.includes(newLabel)) {
                          const newDeleted = deletedLabels.filter(l => l !== newLabel);
                          setDeletedLabels(newDeleted);
                          localStorage.setItem('mindlabs-deleted-labels', JSON.stringify(newDeleted));
                        }
                        setLabelQuery('');
                        setLabelOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-primary font-medium hover:bg-hover-bg transition-colors text-left cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span>Tạo nhãn "{labelQuery.trim()}"</span>
                    </button>
                  )}
                </div>
              </Popover>
            </div>
          </SidebarBlock>

          {/* Block: Project */}
          <SidebarBlock title="Project">
            <div className="relative">
              <PropRow
                icon={<FolderOpen className="w-4 h-4" />}
                label={projectName ?? 'Add to project'}
                onClick={() => setProjectOpen(v => !v)}
              />
              <Popover open={projectOpen} onClose={() => setProjectOpen(false)}>
                <MenuOption label="Không thuộc dự án" active={!issue.projectId}
                  onClick={() => { handleUpdate('projectId', null); setProjectOpen(false); }}
                />
                {projects.map(p => (
                  <MenuOption key={p.id} label={p.name} active={issue.projectId === p.id}
                    onClick={() => { handleUpdate('projectId', p.id); setProjectOpen(false); }}
                  />
                ))}
              </Popover>
            </div>
          </SidebarBlock>

        </div>
      </div>
    </div>
  );
}
