'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, List, LayoutGrid, Calendar, ChevronDown, X, Command, Trash2,
  Tag, Box, History, Maximize2, Check, Paperclip
} from 'lucide-react';
import { useLocalIssues, useLocalProjects, useLocalCycles } from '@/lib/local-first/useLocalTasks';
import { 
  MockIssue, IssueStatus, IssuePriority, 
  getStatusIcon, getStatusLabel, getPriorityIcon, getPriorityLabel, formatDueDate 
} from './types';

interface IssueListProps {
  projectId?: string | null;
  cycleId?: string | null;
  title?: string;
  hideHeader?: boolean;
  hideTitle?: boolean;
}

export default function IssueList({ 
  projectId = null, 
  cycleId = null, 
  title = 'My tasks', 
  hideHeader = false,
  hideTitle = false
}: IssueListProps) {
  const router = useRouter();
  
  const { projects: dbProjects } = useLocalProjects();
  const { cycles: dbCycles } = useLocalCycles();
  const { issues: dbIssues, addIssue, updateIssue: dbUpdateIssue, deleteIssue: dbDeleteIssue } = useLocalIssues();

  const projects = dbProjects || [];
  const cycles = useMemo(() => {
    return [...(dbCycles || [])].sort((a, b) => {
      const dateA = a.start_date || '';
      const dateB = b.start_date || '';
      if (dateA && dateB) return dateA.localeCompare(dateB);
      return (a.number || 0) - (b.number || 0);
    });
  }, [dbCycles]);

  const issues = useMemo<MockIssue[]>(() => (dbIssues || []).map(i => ({
    id: i.id,
    displayId: `ML-${i.number}`,
    title: i.title,
    description: i.description,
    status: i.status,
    priority: i.priority,
    dueDate: i.due_date || '',
    projectId: i.project_id || null,
    cycleId: i.cycle_id || null,
    labels: i.labels || [],
    createdAt: i.created_at
  })), [dbIssues]);

  const [view, setView] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<IssueStatus | null>(null);
  
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueStatus, setIssueStatus] = useState<IssueStatus>('todo');
  const [issuePriority, setIssuePriority] = useState<IssuePriority>('none');
  const [issueProjectId, setIssueProjectId] = useState<string | null>(projectId);
  const [issueCycleId, setIssueCycleId] = useState<string | null>(cycleId);
  const [issueLabels, setIssueLabels] = useState<string[]>([]);
  const [issueDueDate, setIssueDueDate] = useState<string>('');
  const [createMore, setCreateMore] = useState(false);
  
  // Dropdown UI state
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | 'project' | 'cycle' | 'labels' | null>(null);

  // Lấy tất cả nhãn đã tồn tại + một số nhãn mặc định tiện dụng
  const allExistingLabels = useMemo(() => {
    const labelsSet = new Set<string>(['bug', 'feature', 'improvement', 'documentation', 'design', 'research']);
    issues.forEach(i => {
      if (i.labels) {
        i.labels.forEach(l => labelsSet.add(l.toLowerCase()));
      }
    });
    return Array.from(labelsSet);
  }, [issues]);

  const openQuickEntry = () => {
    setIssueTitle('');
    setIssueDescription('');
    setIssueStatus('todo');
    setIssuePriority('none');
    setIssueProjectId(projectId);
    setIssueCycleId(cycleId || (cycles.find(c => c.is_active)?.id || null));
    setIssueLabels([]);
    setIssueDueDate('');
    setActiveDropdown(null);
    setIsQuickEntryOpen(true);
  };

  
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.displayId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject = projectId ? issue.projectId === projectId : true;
      const matchCycle = cycleId ? issue.cycleId === cycleId : true;
      const matchPriority = filterPriority ? issue.priority === filterPriority : true;
      
      return matchSearch && matchProject && matchCycle && matchPriority;
    });
  }, [issues, searchQuery, projectId, cycleId, filterPriority]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateIssueCustom = async () => {
    if (!issueTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await addIssue({
        title: issueTitle.trim(),
        description: issueDescription.trim(),
        status: issueStatus,
        priority: issuePriority,
        due_date: issueDueDate || null,
        project_id: issueProjectId || null,
        cycle_id: issueCycleId || null,
        parent_id: null,
        labels: issueLabels,
      });
      
      if (createMore) {
        setIssueTitle('');
        setIssueDescription('');
        setActiveDropdown(null);
      } else {
        setIsQuickEntryOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = (id: string, status: IssueStatus) => {
    dbUpdateIssue(id, { status });
  };

  const handleDeleteIssue = (id: string) => {
    dbDeleteIssue(id);
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickEntryOpen(false);
        setActiveDropdown(null);
        return;
      }

      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.classList.contains('ProseMirror')
      ) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        openQuickEntry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycles]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      
      {!hideHeader && (
        <header className="flex flex-col bg-background shrink-0 select-none">
          {/* Dòng 1: Tiêu đề (nếu có và không ẩn) */}
          {!hideTitle && title && (
            <div className="flex items-center justify-between px-4 h-[44px] border-b border-border-main shrink-0">
              <h1 className="text-standard tracking-tight font-medium text-standard-text truncate leading-none">{title}</h1>
            </div>
          )}

          {/* Dòng 2: Các thanh công cụ dồn 1 hàng */}
          <div className="flex items-center justify-between gap-4 flex-wrap p-4">
            {/* Nhóm bên trái: Tìm kiếm + Lọc ưu tiên */}
            <div className="flex items-center gap-2 text-xs flex-1 min-w-[240px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-hover-bg rounded-md w-full max-w-[240px] border border-transparent focus-within:border-border-strong transition-colors">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm tiêu đề, ID..."
                  className="w-full bg-transparent outline-none text-xs text-foreground placeholder:text-zinc-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3.5 h-3.5 text-zinc-400 hover:text-foreground" />
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={filterPriority || ''}
                  onChange={e => setFilterPriority(e.target.value || null)}
                  className="appearance-none pr-7 pl-2.5 py-1.5 bg-surface border border-border-main rounded-md text-xs text-zinc-500 focus:outline-none focus:border-border-strong cursor-pointer hover:bg-hover-bg/30"
                >
                  <option value="">Lọc ưu tiên</option>
                  <option value="urgent">Khẩn cấp</option>
                  <option value="high">Cao</option>
                  <option value="medium">Vừa</option>
                  <option value="low">Thấp</option>
                  <option value="none">Không ưu tiên</option>
                </select>
                <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Nhóm bên phải: Tạo nhiệm vụ + Chuyển đổi View */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={openQuickEntry}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[11px] font-semibold rounded-md shadow-subtle transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Task</span>
              </button>

              <div className="flex items-center gap-1 p-0.5 bg-hover-bg rounded-md">
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-sm transition-all cursor-pointer ${view === 'list' ? 'bg-surface text-foreground shadow-subtle' : 'text-zinc-400 hover:text-foreground'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setView('board')}
                  className={`p-1.5 rounded-sm transition-all cursor-pointer ${view === 'board' ? 'bg-surface text-foreground shadow-subtle' : 'text-zinc-400 hover:text-foreground'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {filteredIssues.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center gap-2 select-none">
            <Command className="w-8 h-8 text-zinc-300 dark:text-zinc-800 animate-pulse" />
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Không tìm thấy nhiệm vụ nào</p>
            <p className="text-[10px] text-zinc-400 max-w-[240px]">Nhấn phím `C` để tạo mới</p>
          </div>
        ) : view === 'list' ? (
          <div className="space-y-6 select-none pb-20">
            {(['backlog', 'todo', 'in_progress', 'done', 'canceled'] as IssueStatus[]).map(status => {
              const statusIssues = filteredIssues.filter(i => i.status === status);
              if (statusIssues.length === 0) return null;

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between py-1.5 px-2 text-[13px] tracking-tight font-medium text-secondary sticky top-0 bg-background z-10">
                    <div className="flex items-center gap-1.5">
                      <span>{getStatusLabel(status)}</span>
                    </div>
                    <span className="text-[13px] tracking-tight text-secondary/70">{statusIssues.length}</span>
                  </div>

                  <div className="rounded-md bg-surface overflow-hidden ml-6">
                    {statusIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => router.push(`/tasks?issue=${issue.id}`)}
                        className={`flex items-center justify-between gap-4 py-2 px-3 transition-colors cursor-pointer group hover:bg-hover-bg/30`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(issue.id, issue.status === 'done' ? 'todo' : 'done');
                            }}
                            className="shrink-0 transition-transform active:scale-95 cursor-pointer"
                          >
                            {getStatusIcon(issue.status, "w-4 h-4")}
                          </button>
                          <span className="text-[13px] tracking-tight font-medium text-secondary/70 shrink-0 font-mono">
                            {issue.displayId}
                          </span>
                          <p className={`text-[13px] tracking-tight font-normal truncate flex-1 text-foreground ${issue.status === 'done' ? 'text-zinc-400 line-through' : ''}`}>
                            {issue.title}
                          </p>
                          {issue.labels.length > 0 && (
                            <div className="flex items-center gap-1 shrink-0">
                              {issue.labels.map(l => (
                                <span key={l} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-hover-bg text-zinc-500 capitalize">
                                  {l}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-zinc-500">
                          {!projectId && issue.projectId && (
                            <div className="flex items-center text-[13px] tracking-tight text-secondary/70 max-w-[120px]">
                              <span className="truncate font-medium">
                                {projects.find(p => p.id === issue.projectId)?.name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center" title={`Độ ưu tiên: ${getPriorityLabel(issue.priority)}`}>
                            {getPriorityIcon(issue.priority, "w-3.5 h-3.5")}
                          </div>
                          {issue.dueDate && (
                            <div className="flex items-center gap-1 text-[13px] tracking-tight text-secondary/70">
                              <Calendar className="w-3 h-3" />
                              <span className="hidden sm:inline">{formatDueDate(issue.dueDate)}</span>
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteIssue(issue.id); }}
                            className="p-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa nhiệm vụ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-4 h-[calc(100vh-200px)] overflow-x-auto select-none pb-8 custom-scrollbar">
            {(['backlog', 'todo', 'in_progress', 'done'] as IssueStatus[]).map(status => {
              const statusIssues = filteredIssues.filter(i => i.status === status);
              return (
                <div key={status} className="bg-hover-bg/10 border border-border-main rounded-lg w-72 flex flex-col h-full shrink-0 bg-surface/30">
                  <div className="flex items-center justify-between p-3 border-b border-border-main bg-background shrink-0 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status, "w-4 h-4")}
                      <span className="text-[13px] tracking-tight font-medium text-foreground">
                        {getStatusLabel(status).split(' (')[0]}
                      </span>
                    </div>
                    <span className="text-[13px] tracking-tight text-secondary/70 font-medium">
                      {statusIssues.length}
                    </span>
                  </div>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverStatus !== status) setDragOverStatus(status);
                    }}
                    onDragLeave={() => setDragOverStatus(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      const issueId = e.dataTransfer.getData('text/plain') || activeDragId;
                      if (issueId) handleUpdateStatus(issueId, status);
                      setDragOverStatus(null);
                    }}
                    className={`flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar transition-colors ${
                      dragOverStatus === status ? 'bg-hover-bg/30 ring-2 ring-zinc-500/10 rounded-b-lg' : ''
                    }`}
                  >
                    {statusIssues.map((issue) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => {
                          setActiveDragId(issue.id);
                          e.dataTransfer.setData('text/plain', issue.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => setActiveDragId(null)}
                        onClick={() => router.push(`/tasks?issue=${issue.id}`)}
                        className={`bg-surface p-3 rounded-md transition-all flex flex-col gap-3 shadow-subtle group cursor-grab active:cursor-grabbing ${
                          activeDragId === issue.id ? 'opacity-40 border border-dashed border-zinc-400 dark:border-zinc-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {!projectId && issue.projectId && (
                              <span className="text-[13px] tracking-tight text-secondary/70 truncate max-w-[120px]" title={projects.find(p => p.id === issue.projectId)?.name}>
                                {projects.find(p => p.id === issue.projectId)?.name}
                              </span>
                            )}
                            <span className="text-[13px] tracking-tight font-mono text-secondary/70">{issue.displayId}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteIssue(issue.id); }}
                            className="text-zinc-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className={`text-[13px] tracking-tight font-normal text-foreground leading-snug line-clamp-3 ${issue.status === 'done' ? 'text-zinc-400 line-through' : ''}`}>
                          {issue.title}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border-main/50 text-secondary/70 text-[13px] tracking-tight">
                          <div className="flex items-center gap-1">
                            {issue.dueDate && (
                              <><Calendar className="w-3 h-3 shrink-0" /><span>{formatDueDate(issue.dueDate)}</span></>
                            )}
                          </div>
                          <div className="flex items-center" title={`Độ ưu tiên: ${getPriorityLabel(issue.priority)}`}>
                            {getPriorityIcon(issue.priority, "w-3.5 h-3.5")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isQuickEntryOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
          {/* Tấm nền vô hình giúp đóng dropdown nhanh khi click ngoài vùng dropdown */}
          {activeDropdown && (
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setActiveDropdown(null)} />
          )}
          
          <div 
            className="w-full max-w-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-overlay flex flex-col overflow-visible animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 select-none">
              <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-850 px-2.5 py-0.5 rounded-full">
                <span className="font-bold text-[#5e6ad2]">ML</span>
                <span className="text-[9px] text-zinc-400">/</span>
                <span>Tạo nhiệm vụ mới</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="p-1 rounded-md text-zinc-400 hover:text-foreground hover:bg-hover-bg transition-colors" title="Mở rộng">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsQuickEntryOpen(false)} className="p-1 rounded-md text-zinc-400 hover:text-foreground hover:bg-hover-bg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Tiêu đề & Mô tả */}
            <div className="flex flex-col p-1.5">
              <input
                autoFocus
                type="text"
                value={issueTitle}
                onChange={e => setIssueTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (issueTitle.trim()) handleCreateIssueCustom();
                  }
                }}
                placeholder="Tiêu đề nhiệm vụ..."
                className="w-full bg-transparent border-0 px-4 pt-4 pb-2 text-base font-semibold text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none"
              />
              <textarea
                value={issueDescription}
                onChange={e => setIssueDescription(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (issueTitle.trim()) handleCreateIssueCustom();
                  }
                }}
                placeholder="Mô tả nhiệm vụ... (Ctrl + Enter để tạo)"
                className="w-full bg-transparent border-0 px-4 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 min-h-[140px] resize-none outline-none custom-scrollbar"
              />
            </div>
            
            {/* Danh sách nhãn được chọn */}
            {issueLabels.length > 0 && (
              <div className="flex flex-wrap gap-1 px-5 pb-3">
                {issueLabels.map(l => (
                  <span 
                    key={l} 
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 capitalize"
                  >
                    <span>{l}</span>
                    <button 
                      type="button" 
                      onClick={() => setIssueLabels(issueLabels.filter(label => label !== l))}
                      className="hover:text-indigo-600 dark:hover:text-indigo-300"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Dải điều khiển thuộc tính (Status, Priority, Project, Cycle, Labels, Due Date) */}
            <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-1 border-b border-zinc-100 dark:border-zinc-800 select-none">
              
              {/* Dropdown Trạng thái (Status) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle"
                >
                  {getStatusIcon(issueStatus, "w-3.5 h-3.5")}
                  <span>{getStatusLabel(issueStatus).split(' (')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
                {activeDropdown === 'status' && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
                    {(['backlog', 'todo', 'in_progress', 'done', 'canceled'] as IssueStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setIssueStatus(status);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status, "w-3.5 h-3.5")}
                          <span>{getStatusLabel(status).split(' (')[0]}</span>
                        </div>
                        {issueStatus === status && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Dropdown Ưu tiên (Priority) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle"
                >
                  {getPriorityIcon(issuePriority, "w-3.5 h-3.5")}
                  <span>{getPriorityLabel(issuePriority)}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
                {activeDropdown === 'priority' && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
                    {(['none', 'low', 'medium', 'high', 'urgent'] as IssuePriority[]).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => {
                          setIssuePriority(priority);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(priority, "w-3.5 h-3.5")}
                          <span>{getPriorityLabel(priority)}</span>
                        </div>
                        {issuePriority === priority && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Dropdown Dự án (Project) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'project' ? null : 'project')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle"
                >
                  <Box className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate max-w-[120px]">{issueProjectId ? (projects.find(p => p.id === issueProjectId)?.name || 'Dự án') : 'Dự án'}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
                {activeDropdown === 'project' && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIssueProjectId(null);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-500 transition-colors border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <span>Không thuộc dự án</span>
                      {!issueProjectId && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                    </button>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setIssueProjectId(project.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        <span className="truncate">{project.name}</span>
                        {issueProjectId === project.id && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Dropdown Chu kỳ (Cycle) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'cycle' ? null : 'cycle')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle"
                >
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate max-w-[120px]">{issueCycleId ? (cycles.find(c => c.id === issueCycleId)?.name || 'Chu kỳ') : 'Chu kỳ'}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
                {activeDropdown === 'cycle' && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIssueCycleId(null);
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-500 transition-colors border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <span>Không thuộc chu kỳ</span>
                      {!issueCycleId && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                    </button>
                    {cycles.map((cycle) => (
                      <button
                        key={cycle.id}
                        type="button"
                        onClick={() => {
                          setIssueCycleId(cycle.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {cycle.is_active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />}
                          <span className="truncate">{cycle.name}</span>
                        </div>
                        {issueCycleId === cycle.id && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Dropdown Nhãn (Labels) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'labels' ? null : 'labels')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle"
                >
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{issueLabels.length > 0 ? `${issueLabels.length} Nhãn` : 'Nhãn'}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
                {activeDropdown === 'labels' && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-overlay py-1 animate-in fade-in slide-in-from-bottom-2 duration-100 max-h-56 overflow-y-auto">
                    {allExistingLabels.map((label) => {
                      const isSelected = issueLabels.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setIssueLabels(issueLabels.filter(l => l !== label));
                            } else {
                              setIssueLabels([...issueLabels, label]);
                            }
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-left text-xs text-zinc-700 dark:text-zinc-300 transition-colors capitalize font-medium"
                        >
                          <span>{label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Bộ chọn hạn chót ẩn (Due Date Datepicker) */}
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={issueDueDate}
                  onChange={(e) => setIssueDueDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  title="Hạn chót"
                />
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold transition-colors shadow-subtle"
                >
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{issueDueDate ? formatDueDate(issueDueDate) : 'Hạn chót'}</span>
                </button>
              </div>
            </div>
            
            {/* Chân trang Modal */}
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-b-xl select-none">
              
              {/* Nút icon giả lập Đính kèm chuẩn Linear */}
              <button 
                type="button" 
                className="p-1.5 rounded-md text-zinc-450 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors"
                title="Đính kèm tài liệu"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex items-center gap-4">
                {/* Nút gạt chế độ Tạo liên tục (Create More Toggle) */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tạo liên tục</span>
                  <button
                    type="button"
                    onClick={() => setCreateMore(!createMore)}
                    className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 focus:outline-none ${createMore ? 'bg-[#5e6ad2]' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                  >
                    <span 
                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${createMore ? 'translate-x-3.5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
                
                {/* Nút tạo nhiệm vụ chính */}
                <button
                  type="button"
                  onClick={handleCreateIssueCustom}
                  disabled={!issueTitle.trim()}
                  className="px-4 py-1.5 bg-[#5e6ad2] hover:bg-[#4d5ac2] active:bg-[#4350b5] disabled:opacity-40 disabled:hover:bg-[#5e6ad2] text-white text-xs font-semibold rounded-md shadow-subtle transition-all cursor-pointer"
                >
                  Tạo nhiệm vụ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
