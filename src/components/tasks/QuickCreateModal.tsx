'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  X, Maximize2, ChevronDown, Check, Calendar, Paperclip,
  Tag, Box, History,
} from 'lucide-react';
import { useLocalIssues, useLocalProjects, useLocalCycles } from '@/lib/local-first/useLocalTasks';
import {
  IssueStatus, IssuePriority,
  getStatusIcon, getStatusLabel, getPriorityIcon, getPriorityLabel, formatDueDate,
} from '@/components/tasks/types';
import { useQuickCreate } from '@/contexts/QuickCreateContext';

export default function QuickCreateModal() {
  const { isOpen, close } = useQuickCreate();

  const { issues: dbIssues, addIssue } = useLocalIssues();
  const { projects: dbProjects } = useLocalProjects();
  const { cycles: dbCycles } = useLocalCycles();

  const projects = dbProjects || [];
  const cycles = useMemo(() => {
    return [...(dbCycles || [])].sort((a, b) => {
      const dateA = a.start_date || '';
      const dateB = b.start_date || '';
      if (dateA && dateB) return dateA.localeCompare(dateB);
      return (a.number || 0) - (b.number || 0);
    });
  }, [dbCycles]);

  const allExistingLabels = useMemo(() => {
    const labelsSet = new Set<string>(['bug', 'feature', 'improvement', 'documentation', 'design', 'research']);
    (dbIssues || []).forEach(i => {
      (i.labels || []).forEach(l => labelsSet.add(l.toLowerCase()));
    });
    return Array.from(labelsSet);
  }, [dbIssues]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>('backlog');
  const [priority, setPriority] = useState<IssuePriority>('none');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [createMore, setCreateMore] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | 'project' | 'cycle' | 'labels' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form mỗi lần mở — tự nhận project/cycle nếu đang xem trang đó
  useEffect(() => {
    if (!isOpen) return;

    const params = new URLSearchParams(window.location.search);
    const urlProject = params.get('project') || null;
    const urlCycle   = params.get('cycle')   || null;

    setTitle('');
    setDescription('');
    setStatus('backlog');
    setPriority('none');
    setProjectId(urlProject);          // null nếu không ở trang project cụ thể
    setCycleId(urlCycle);              // null nếu không ở trang cycle cụ thể
    setLabels([]);
    setDueDate('');
    setActiveDropdown(null);
  }, [isOpen]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        close();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addIssue({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || null,
        project_id: projectId || null,
        cycle_id: cycleId || null,
        parent_id: null,
        labels,
      });
      if (createMore) {
        setTitle('');
        setDescription('');
        setActiveDropdown(null);
      } else {
        close();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[500] p-4 animate-in fade-in duration-200"
      onClick={() => { setActiveDropdown(null); close(); }}
    >
      {/* Đóng dropdown khi click ngoài */}
      {activeDropdown && (
        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setActiveDropdown(null)} />
      )}

      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-overlay flex flex-col overflow-visible animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 select-none">
          <div className="text-[13px] font-semibold text-foreground">
            Tạo nhiệm vụ mới
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="p-1 rounded-md text-zinc-400 hover:text-foreground hover:bg-hover-bg transition-colors" title="Mở rộng">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={close} className="p-1 rounded-md text-zinc-400 hover:text-foreground hover:bg-hover-bg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tiêu đề & Mô tả */}
        <div className="flex flex-col p-1.5">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); if (title.trim()) handleSubmit(); }
            }}
            placeholder="Tiêu đề nhiệm vụ..."
            className="w-full bg-transparent border-0 px-4 pt-4 pb-2 text-base font-semibold text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (title.trim()) handleSubmit(); }
            }}
            placeholder="Mô tả nhiệm vụ... (Ctrl + Enter để tạo)"
            className="w-full bg-transparent border-0 px-4 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 min-h-[120px] resize-none outline-none"
          />
        </div>

        {/* Nhãn đã chọn */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 px-5 pb-3">
            {labels.map(l => (
              <span key={l} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 capitalize">
                <span>{l}</span>
                <button type="button" onClick={() => setLabels(labels.filter(x => x !== l))} className="hover:text-indigo-600 dark:hover:text-indigo-300">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Thuộc tính */}
        <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-1 border-b border-zinc-100 dark:border-zinc-800 select-none">

          {/* Status */}
          <div className="relative">
            <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle">
              {getStatusIcon(status, 'w-3.5 h-3.5')}
              <span>{getStatusLabel(status).split(' (')[0]}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {activeDropdown === 'status' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-50 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
                {(['backlog', 'todo', 'in_progress', 'done', 'canceled'] as IssueStatus[]).map(s => (
                  <button key={s} type="button" onClick={() => { setStatus(s); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors">
                    <div className="flex items-center gap-2">{getStatusIcon(s, 'w-3.5 h-3.5')}<span>{getStatusLabel(s).split(' (')[0]}</span></div>
                    {status === s && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="relative">
            <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle">
              {getPriorityIcon(priority, 'w-3.5 h-3.5')}
              <span>{getPriorityLabel(priority)}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {activeDropdown === 'priority' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-50 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
                {(['none', 'low', 'medium', 'high', 'urgent'] as IssuePriority[]).map(p => (
                  <button key={p} type="button" onClick={() => { setPriority(p); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors">
                    <div className="flex items-center gap-2">{getPriorityIcon(p, 'w-3.5 h-3.5')}<span>{getPriorityLabel(p)}</span></div>
                    {priority === p && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project */}
          <div className="relative">
            <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'project' ? null : 'project')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle">
              <Box className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate max-w-[120px]">{projectId ? (projects.find(p => p.id === projectId)?.name || 'Dự án') : 'Dự án'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {activeDropdown === 'project' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-50 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100 max-h-60 overflow-y-auto">
                <button type="button" onClick={() => { setProjectId(null); setActiveDropdown(null); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-500 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                  <span>Không thuộc dự án</span>
                  {!projectId && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                </button>
                {projects.map(p => (
                  <button key={p.id} type="button" onClick={() => { setProjectId(p.id); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors">
                    <span className="truncate">{p.name}</span>
                    {projectId === p.id && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cycle */}
          <div className="relative">
            <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'cycle' ? null : 'cycle')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate max-w-[120px]">{cycleId ? (cycles.find(c => c.id === cycleId)?.name || 'Chu kỳ') : 'Chu kỳ'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {activeDropdown === 'cycle' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-50 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100 max-h-60 overflow-y-auto">
                <button type="button" onClick={() => { setCycleId(null); setActiveDropdown(null); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-500 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                  <span>Không thuộc chu kỳ</span>
                  {!cycleId && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                </button>
                {cycles.map(c => (
                  <button key={c.id} type="button" onClick={() => { setCycleId(c.id); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      {c.is_active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />}
                      <span className="truncate">{c.name}</span>
                    </div>
                    {cycleId === c.id && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="relative">
            <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'labels' ? null : 'labels')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              <span>{labels.length > 0 ? `${labels.length} Nhãn` : 'Nhãn'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {activeDropdown === 'labels' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-50 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100 max-h-56 overflow-y-auto">
                {allExistingLabels.map(label => {
                  const isSelected = labels.includes(label);
                  return (
                    <button key={label} type="button"
                      onClick={() => setLabels(isSelected ? labels.filter(l => l !== label) : [...labels, label])}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors capitalize font-medium">
                      <span>{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="relative flex items-center">
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" title="Hạn chót" />
            <button type="button" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{dueDate ? formatDueDate(dueDate) : 'Hạn chót'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-b-xl select-none">
          <button type="button" className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Đính kèm tài liệu">
            <Paperclip className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tạo liên tục</span>
              <button type="button" onClick={() => setCreateMore(!createMore)}
                className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 focus:outline-none ${createMore ? 'bg-[#5e6ad2]' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${createMore ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </button>
            </div>

            <button type="button" onClick={handleSubmit} disabled={!title.trim() || isSubmitting}
              className="px-4 py-1.5 bg-[#5e6ad2] hover:bg-[#4d5ac2] active:bg-[#4350b5] disabled:opacity-40 disabled:hover:bg-[#5e6ad2] text-white text-xs font-semibold rounded-md shadow-subtle transition-all cursor-pointer">
              Tạo nhiệm vụ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
