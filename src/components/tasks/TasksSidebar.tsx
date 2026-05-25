'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Folder, Layers, Keyboard, Command, X, CheckSquare, Settings, Box, History, ChevronDown } from 'lucide-react';
import { useLocalProjects, useLocalCycles, useLocalIssues } from '@/lib/local-first/useLocalTasks';
import { MockProject, MockCycle } from './types';
import { runAutoCycleEngine } from '@/lib/local-first/cycle-engine';
import { SIDEBAR_STYLES } from '@/lib/sidebar-styles';

export default function TasksSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { projects: dbProjects, addProject } = useLocalProjects();
  const { cycles: dbCycles, addCycle } = useLocalCycles();
  const { issues: dbIssues } = useLocalIssues();



  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isCyclesExpanded, setIsCyclesExpanded] = useState(true);

  // Cycle Settings States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cyclesEnabled, setCyclesEnabled] = useState(true);
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [startDay, setStartDay] = useState(1);
  const [autoTransfer, setAutoTransfer] = useState(true);
  const [showPastCycles, setShowPastCycles] = useState(false);

  // Kích hoạt chạy engine chu kỳ khi sidebar được tải
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const enabled = localStorage.getItem('cycles_enabled') !== 'false';
      setCyclesEnabled(enabled);
      if (enabled) {
        runAutoCycleEngine();
      }

      const handleSyncComplete = () => {
        const currentlyEnabled = localStorage.getItem('cycles_enabled') !== 'false';
        if (currentlyEnabled) {
          runAutoCycleEngine();
        }
      };

      window.addEventListener('mindlabs-sync-complete', handleSyncComplete);
      return () => {
        window.removeEventListener('mindlabs-sync-complete', handleSyncComplete);
      };
    }
  }, []);

  const projects = (dbProjects || []).map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    startDate: p.start_date || '',
    targetDate: p.target_date || ''
  })) as MockProject[];

  const cycles = (dbCycles || []).map(c => ({
    id: c.id,
    name: c.name,
    isActive: c.is_active,
    startDate: c.start_date || '',
    endDate: c.end_date || ''
  })).sort((a, b) => a.startDate.localeCompare(b.startDate)) as MockCycle[];



  const handleSaveSettings = async () => {
    localStorage.setItem('cycles_enabled', cyclesEnabled.toString());
    localStorage.setItem('cycle_duration_weeks', durationWeeks.toString());
    localStorage.setItem('cycle_start_day', startDay.toString());
    localStorage.setItem('auto_transfer_unfinished', autoTransfer.toString());
    
    setIsSettingsOpen(false);
    
    // Chạy lại engine và refresh trang
    if (cyclesEnabled) {
      await runAutoCycleEngine();
    }
    window.location.reload();
  };

  const projectProgress: Record<string, number> = {};
  projects.forEach(p => {
    const projIssues = (dbIssues || []).filter(i => i.project_id === p.id && i.status !== 'canceled');
    if (projIssues.length === 0) {
      projectProgress[p.id] = 0;
    } else {
      const doneIssues = projIssues.filter(i => i.status === 'done');
      projectProgress[p.id] = Math.round((doneIssues.length / projIssues.length) * 100);
    }
  });

  // Phân chia chu kỳ theo triết lý Linear: Current, Upcoming, Past
  const activeCycle = cycles.find(c => c.isActive);
  const nowStr = new Date().toISOString();

  const upcomingCycles = cycles.filter(c => {
    if (activeCycle) return c.startDate > activeCycle.endDate;
    return c.startDate > nowStr;
  }).slice(0, 2);

  const pastCycles = cycles.filter(c => {
    if (activeCycle) return c.endDate < activeCycle.startDate;
    return c.endDate < nowStr;
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <aside className="w-64 shrink-0 flex flex-col p-4 select-none bg-[#f2f2f2]">
      <div className="flex items-center mb-6 px-1">
        <Link href="/tasks" className="font-bold text-sm tracking-tight text-foreground hover:opacity-80">Task Center</Link>
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Main Menu */}
        <div className="space-y-0.5">
          <Link
            href="/tasks"
            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md ${SIDEBAR_STYLES.linkText} transition-colors cursor-pointer ${(!searchParams?.get('project') && !searchParams?.get('cycle') && !searchParams?.get('issue') && pathname === '/tasks') ? SIDEBAR_STYLES.linkActive : SIDEBAR_STYLES.linkInactive}`}
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-zinc-400/80" />
              <span>My tasks</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/50 dark:bg-zinc-800/50 text-secondary">{(dbIssues || []).length}</span>
          </Link>
        </div>

        {/* Projects */}
        <div className="flex flex-col gap-1">
          <div className="relative group/header">
            <Link
              href="/tasks?view=projects"
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md ${SIDEBAR_STYLES.linkText} transition-colors cursor-pointer ${searchParams?.get('view') === 'projects' ? SIDEBAR_STYLES.linkActive : SIDEBAR_STYLES.linkInactive}`}
            >
              <div className="flex items-center gap-2">
                <Box className="w-3.5 h-3.5 text-zinc-400/80" />
                <span className="font-medium text-[13px]">Projects</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsProjectsExpanded(!isProjectsExpanded);
                }}
                className="p-0.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-400 hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isProjectsExpanded ? '' : '-rotate-90'}`} />
              </button>
            </Link>
          </div>
          
          {isProjectsExpanded && (
            <div className="space-y-0.5">
              {projects.map(project => {
                const count = (dbIssues || []).filter(i => i.project_id === project.id).length;
                const progress = projectProgress[project.id] || 0;
                const isActive = searchParams?.get('project') === project.id;
                
                return (
                  <Link
                    key={project.id}
                    href={`/tasks?project=${project.id}`}
                    className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md ${SIDEBAR_STYLES.linkText} transition-colors cursor-pointer ${isActive ? SIDEBAR_STYLES.linkActive : SIDEBAR_STYLES.linkInactive}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pl-1.5">
                      <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0" title={`Tiến độ: ${progress}%`}>
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1.5" />
                          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" className="text-zinc-500 dark:text-zinc-400" strokeDasharray="31.4" strokeDashoffset={31.4 - (31.4 * progress) / 100} strokeWidth="1.5" />
                        </svg>
                      </div>
                      <span className="truncate">{project.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium px-1">{count}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Cycles */}
        {cyclesEnabled && (
          <div className="flex flex-col gap-1">
            <div className="relative group/header">
              <Link
                href="/tasks?view=cycles"
                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md ${SIDEBAR_STYLES.linkText} transition-colors cursor-pointer ${searchParams?.get('view') === 'cycles' ? SIDEBAR_STYLES.linkActive : SIDEBAR_STYLES.linkInactive}`}
              >
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-zinc-400/80" />
                  <span className="font-medium text-[13px]">Cycles</span>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setDurationWeeks(parseInt(localStorage.getItem('cycle_duration_weeks') || '1', 10));
                      setStartDay(parseInt(localStorage.getItem('cycle_start_day') || '1', 10));
                      setAutoTransfer(localStorage.getItem('auto_transfer_unfinished') !== 'false');
                      setCyclesEnabled(localStorage.getItem('cycles_enabled') !== 'false');
                      setIsSettingsOpen(true);
                    }}
                    className="p-0.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-400 hover:text-foreground opacity-0 group-hover/header:opacity-100 transition-opacity cursor-pointer"
                    title="Cài đặt chu kỳ"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsCyclesExpanded(!isCyclesExpanded);
                    }}
                    className="p-0.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-400 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isCyclesExpanded ? '' : '-rotate-90'}`} />
                  </button>
                </div>
              </Link>
            </div>

            {isCyclesExpanded && (
              <div className="space-y-0.5">
                {activeCycle && (
                  <Link
                    href={`/tasks?cycle=${activeCycle.id}`}
                    className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md ${SIDEBAR_STYLES.linkText} transition-colors cursor-pointer ${searchParams?.get('cycle') === activeCycle.id ? SIDEBAR_STYLES.linkActive : SIDEBAR_STYLES.linkInactive}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pl-1.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-500 animate-pulse" />
                      <span className="truncate">{activeCycle.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {(dbIssues || []).filter(i => i.cycle_id === activeCycle.id).length}
                    </span>
                  </Link>
                )}

                {upcomingCycles.length > 0 && 
                  upcomingCycles.map(c => {
                    const count = (dbIssues || []).filter(i => i.cycle_id === c.id).length;
                    const isActive = searchParams?.get('cycle') === c.id;
                    return (
                      <Link
                        key={c.id}
                        href={`/tasks?cycle=${c.id}`}
                        className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md ${SIDEBAR_STYLES.linkText} transition-colors cursor-pointer ${isActive ? SIDEBAR_STYLES.linkActive : SIDEBAR_STYLES.linkInactive}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pl-1.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-zinc-300 dark:bg-zinc-700" />
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">{count}</span>
                      </Link>
                    );
                  })
                }

                {/* 3. Chu kỳ đã qua (Past) */}
                {pastCycles.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowPastCycles(!showPastCycles)}
                      className={SIDEBAR_STYLES.subButton}
                    >
                      <span>Chu kỳ đã qua</span>
                      <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{pastCycles.length}</span>
                    </button>

                    {showPastCycles && (
                      <div className="space-y-0.5 mt-1 ml-1 pl-1.5 border-l border-zinc-200 dark:border-zinc-800">
                        {pastCycles.map(c => {
                          const count = (dbIssues || []).filter(i => i.cycle_id === c.id).length;
                          const isActive = searchParams?.get('cycle') === c.id;
                          return (
                            <Link
                              key={c.id}
                              href={`/tasks?cycle=${c.id}`}
                              className={`w-full flex items-center justify-between py-1 px-2 rounded-md ${SIDEBAR_STYLES.nestedLinkText} transition-colors cursor-pointer ${isActive ? SIDEBAR_STYLES.nestedLinkActive : SIDEBAR_STYLES.nestedLinkInactive}`}
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="text-[9px] text-zinc-400">{count}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border-gray-bg pt-4 flex items-center justify-between text-zinc-400 text-[10px] font-medium">
        <div className="flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Phím tắt: Bật</span>
        </div>
        <button 
          onClick={() => {
            setDurationWeeks(parseInt(localStorage.getItem('cycle_duration_weeks') || '1', 10));
            setStartDay(parseInt(localStorage.getItem('cycle_start_day') || '1', 10));
            setAutoTransfer(localStorage.getItem('auto_transfer_unfinished') !== 'false');
            setCyclesEnabled(localStorage.getItem('cycles_enabled') !== 'false');
            setIsSettingsOpen(true);
          }}
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
          <span>Cấu hình</span>
        </button>
      </div>



      {/* Cycle Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-surface border border-border-main rounded-xl shadow-overlay p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Cấu hình hệ thống</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-md text-zinc-400 hover:text-foreground hover:bg-hover-bg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 py-2">
              {/* Cycles Enabled Toggle */}
              <div className="flex items-center gap-3 p-2 bg-hover-bg/30 border border-border-main/50 rounded-md">
                <input
                  id="cyclesEnabledToggle"
                  type="checkbox"
                  checked={cyclesEnabled}
                  onChange={e => setCyclesEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border-main text-zinc-900 focus:ring-zinc-500 cursor-pointer accent-zinc-800"
                />
                <label htmlFor="cyclesEnabledToggle" className="text-xs font-semibold text-foreground cursor-pointer flex-1">
                  Sử dụng Chu kỳ tập trung (Cycles)
                </label>
              </div>

              {cyclesEnabled && (
                <>
                  {/* Cycle Duration */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Độ dài chu kỳ</span>
                    <select
                      value={durationWeeks}
                      onChange={e => setDurationWeeks(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-surface border border-border-main rounded-md text-xs text-foreground font-semibold focus:outline-none focus:border-border-strong cursor-pointer hover:bg-hover-bg/30"
                    >
                      <option value={1}>1 tuần</option>
                      <option value={2}>2 tuần</option>
                    </select>
                  </div>

                  {/* Start Day of Week */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ngày bắt đầu trong tuần</span>
                    <select
                      value={startDay}
                      onChange={e => setStartDay(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-surface border border-border-main rounded-md text-xs text-foreground font-semibold focus:outline-none focus:border-border-strong cursor-pointer hover:bg-hover-bg/30"
                    >
                      <option value={1}>Thứ Hai</option>
                      <option value={2}>Thứ Ba</option>
                      <option value={3}>Thứ Tư</option>
                      <option value={4}>Thứ Năm</option>
                      <option value={5}>Thứ Sáu</option>
                      <option value={6}>Thứ Bảy</option>
                      <option value={7}>Chủ Nhật</option>
                    </select>
                  </div>

                  {/* Auto Transfer Toggle */}
                  <div className="flex items-center gap-3 p-2 bg-hover-bg/30 border border-border-main/50 rounded-md">
                    <input
                      id="autoTransferToggle"
                      type="checkbox"
                      checked={autoTransfer}
                      onChange={e => setAutoTransfer(e.target.checked)}
                      className="w-4 h-4 rounded border-border-main text-zinc-900 focus:ring-zinc-500 cursor-pointer accent-zinc-800"
                    />
                    <label htmlFor="autoTransferToggle" className="text-xs font-semibold text-foreground cursor-pointer flex-1">
                      Chuyển task chưa xong sang chu kỳ mới
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsSettingsOpen(false)} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-foreground rounded-md font-semibold transition-colors cursor-pointer">Hủy</button>
              <button onClick={handleSaveSettings} className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-md shadow-subtle transition-colors cursor-pointer">Lưu cài đặt</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
