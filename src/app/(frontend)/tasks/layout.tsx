import React, { Suspense } from 'react';
import TasksSidebar from '@/components/tasks/TasksSidebar';
import { TasksProvider } from '@/lib/local-first/TasksProvider';

export const metadata = {
  title: 'Mindlabs Tasks',
  description: 'Manage your projects and tasks',
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TasksProvider>
      <div className="flex h-full w-full overflow-hidden bg-transparent p-[4px] gap-[4px]">
        <Suspense fallback={<aside className="w-[300px] shrink-0 flex flex-col p-4 bg-[#f2f2f2] dark:bg-zinc-900 animate-pulse" />}>
          <TasksSidebar />
        </Suspense>
        <main className="flex-1 bg-surface flex flex-col relative overflow-hidden rounded-default border border-border-main">
          {children}
        </main>
      </div>
    </TasksProvider>
  );
}
