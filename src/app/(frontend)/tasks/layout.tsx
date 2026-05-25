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
      <div className="flex h-full w-full gap-[5px] overflow-hidden bg-transparent">
        <Suspense fallback={<aside className="w-64 shrink-0 flex flex-col p-4 bg-[#f2f2f2] animate-pulse" />}>
          <TasksSidebar />
        </Suspense>
        <main className="flex-1 bg-white rounded-2xl flex flex-col relative overflow-hidden border border-border-main">
          {children}
        </main>
      </div>
    </TasksProvider>
  );
}
