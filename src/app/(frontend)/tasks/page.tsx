'use client'

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import IssueList from '@/components/tasks/IssueList';
import IssueDetails from '@/components/tasks/IssueDetails';
import ProjectDetails from '@/components/tasks/ProjectDetails';
import CycleDetails from '@/components/tasks/CycleDetails';
import CycleList from '@/components/tasks/CycleList';
import ProjectList from '@/components/tasks/ProjectList';

function TasksContent() {
  const searchParams = useSearchParams();
  
  // Read parameters
  const issueId = searchParams?.get('issue');
  const projectId = searchParams?.get('project');
  const cycleId = searchParams?.get('cycle');
  const view = searchParams?.get('view');

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
