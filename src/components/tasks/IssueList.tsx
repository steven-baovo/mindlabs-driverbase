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
import { useQuickCreate } from '@/contexts/QuickCreateContext';

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

  const { open: openQuickCreate } = useQuickCreate();

  const [view, setView] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<IssueStatus | null>(null);

  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueStatus, setIssueStatus] = useState<IssueStatus>('backlog');
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

  const openQuickEntry = () => openQuickCreate();


  
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

  // Keyboard listener đã được chuyển lên GlobalKeyboardListener (layout)


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

      {/* Modal tạo nhanh đã được chuyển lên QuickCreateModal (layout global) */}
    </div>
  );
}
