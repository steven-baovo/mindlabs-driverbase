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
      <div className="flex h-full w-full overflow-hidden bg-transparent p-[5px] gap-[5px]">
        <Suspense fallback={<aside className="w-[300px] shrink-0 flex flex-col p-4 bg-[#f2f2f2] animate-pulse" />}>
          <TasksSidebar />
        </Suspense>
        <main className="flex-1 bg-white flex flex-col relative overflow-hidden rounded-default">
          {children}
        </main>
      </div>
    </TasksProvider>
  );
}
