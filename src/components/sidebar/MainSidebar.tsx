'use client';

import React from 'react';
import AppSidebarFrame from '@/components/sidebar/AppSidebarFrame';
import TasksSection from './TasksSection';
import WorkspaceSection from './WorkspaceSection';
import SidebarHeader from './SidebarHeader';

export default function MainSidebar() {
  return (
    <AppSidebarFrame defaultWidth={300}>
      <div className="w-full h-full flex flex-col p-4 select-none">
        {/* Header containing User Profile Dropdown */}
        <SidebarHeader />

        {/* Cột scroll chứa Tasks và Workspace */}
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar gap-2">
          <TasksSection />
          
          <WorkspaceSection />
        </div>
      </div>
    </AppSidebarFrame>
  );
}
