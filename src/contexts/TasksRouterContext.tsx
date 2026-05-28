'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface TasksRouteState {
  view?: 'projects' | 'cycles' | null
  projectId?: string | null
  cycleId?: string | null
  issueId?: string | null
}

interface TasksRouterContextType {
  state: TasksRouteState
  goToMyTasks: () => void
  goToProjectsView: () => void
  goToCyclesView: () => void
  goToProject: (id: string) => void
  goToCycle: (id: string) => void
  goToIssue: (id: string) => void
}

const defaultState: TasksRouteState = {}

function parseStateFromUrl(): TasksRouteState {
  if (typeof window === 'undefined') return defaultState
  if (!window.location.pathname.startsWith('/tasks')) return defaultState

  const params = new URLSearchParams(window.location.search)
  const view = params.get('view') as 'projects' | 'cycles' | null
  const projectId = params.get('project')
  const cycleId = params.get('cycle')
  const issueId = params.get('issue')

  return { view, projectId, cycleId, issueId }
}

const TasksRouterContext = createContext<TasksRouterContextType | null>(null)

function TasksRouterSearchParamsSync({ onUpdate }: { onUpdate: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    onUpdate()

    const handlePopState = () => {
      onUpdate()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pathname, searchParams, onUpdate])

  return null
}

export function TasksRouterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<TasksRouteState>(defaultState)

  const handleUpdateFromUrl = useCallback(() => {
    setState(parseStateFromUrl())
  }, [])

  const silentUpdateUrl = useCallback((path: string, query: Record<string, string>) => {
    if (pathname !== '/tasks') {
      // If we are not on the tasks page, we must use Next.js router to actually change the page
      const params = new URLSearchParams(query)
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      router.push(`/tasks${queryStr}`)
    } else {
      // If we are already on the tasks page, we silently update the URL to skip Next.js router overhead
      const params = new URLSearchParams(query)
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      window.history.pushState(null, '', `/tasks${queryStr}`)
    }
  }, [pathname, router])

  const goToMyTasks = useCallback(() => {
    setState({})
    silentUpdateUrl('/tasks', {})
  }, [silentUpdateUrl])

  const goToProjectsView = useCallback(() => {
    setState({ view: 'projects' })
    silentUpdateUrl('/tasks', { view: 'projects' })
  }, [silentUpdateUrl])

  const goToCyclesView = useCallback(() => {
    setState({ view: 'cycles' })
    silentUpdateUrl('/tasks', { view: 'cycles' })
  }, [silentUpdateUrl])

  const goToProject = useCallback((id: string) => {
    setState({ projectId: id })
    silentUpdateUrl('/tasks', { project: id })
  }, [silentUpdateUrl])

  const goToCycle = useCallback((id: string) => {
    setState({ cycleId: id })
    silentUpdateUrl('/tasks', { cycle: id })
  }, [silentUpdateUrl])

  const goToIssue = useCallback((id: string) => {
    setState({ issueId: id })
    silentUpdateUrl('/tasks', { issue: id })
  }, [silentUpdateUrl])

  return (
    <TasksRouterContext.Provider value={{
      state,
      goToMyTasks,
      goToProjectsView,
      goToCyclesView,
      goToProject,
      goToCycle,
      goToIssue
    }}>
      <Suspense fallback={null}>
        <TasksRouterSearchParamsSync onUpdate={handleUpdateFromUrl} />
      </Suspense>
      {children}
    </TasksRouterContext.Provider>
  )
}

export function useTasksRouter() {
  const context = useContext(TasksRouterContext)
  if (!context) {
    throw new Error('useTasksRouter must be used within a TasksRouterProvider')
  }
  return context
}
