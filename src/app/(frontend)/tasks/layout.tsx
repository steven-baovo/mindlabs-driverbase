import React, { Suspense } from 'react';
export const metadata = {
  title: 'Leanity Tasks',
  description: 'Manage your projects and tasks',
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
