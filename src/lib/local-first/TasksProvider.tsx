'use client';

import React, { createContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, LocalProject, LocalCycle, LocalIssue, LocalObjective, LocalKeyResult } from './db';

type TasksContextType = {
  projects: LocalProject[] | undefined;
  cycles: LocalCycle[] | undefined;
  issues: LocalIssue[] | undefined;
  objectives: LocalObjective[] | undefined;
  key_results: LocalKeyResult[] | undefined;
};

export const TasksContext = createContext<TasksContextType>({
  projects: undefined,
  cycles: undefined,
  issues: undefined,
  objectives: undefined,
  key_results: undefined,
});

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const projects = useLiveQuery(() => db.projects.where({ is_deleted: 0 }).toArray(), []);
  const cycles = useLiveQuery(() => db.cycles.where({ is_deleted: 0 }).toArray(), []);
  const issues = useLiveQuery(() => db.issues.where({ is_deleted: 0 }).toArray(), []);
  const objectives = useLiveQuery(() => db.objectives.where({ is_deleted: 0 }).toArray(), []);
  const key_results = useLiveQuery(() => db.key_results.where({ is_deleted: 0 }).toArray(), []);

  return (
    <TasksContext.Provider value={{ projects, cycles, issues, objectives, key_results }}>
      {children}
    </TasksContext.Provider>
  );
}
