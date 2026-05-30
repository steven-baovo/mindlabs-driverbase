'use client'

import React, { Suspense } from 'react';
import { useTasksRouter } from '@/contexts/TasksRouterContext';
import IssueList from '@/components/issues/IssueList';
import IssueDetails from '@/components/issues/IssueDetails';
import ProjectDetails from '@/components/projects/ProjectDetails';
import CycleDetails from '@/components/cycles/CycleDetails';
import CycleList from '@/components/cycles/CycleList';
import ProjectList from '@/components/projects/ProjectList';

function TasksContent() {
  const { state } = useTasksRouter();
  
  // Read parameters from context instead of URL
  const { issueId, projectId, cycleId, view } = state;

  // SPA Routing logic
  if (issueId) return <IssueDetails issueId={issueId} />;
  if (projectId) return <ProjectDetails projectId={projectId} />;
  if (cycleId) return <CycleDetails cycleId={cycleId} />;
  
  if (view === 'cycles') return <CycleList />;
  if (view === 'projects') return <ProjectList />;

  // Default view
  return <IssueList />;
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-zinc-400">Đang tải...</div>}>
      <TasksContent />
    </Suspense>
  );
}
