'use client'

import { createContext, useContext, useState } from 'react'

interface WorkspaceContextType {
  activeId: string | null
  setActiveId: (activeId: string | null) => void
  title: string
  setTitle: (title: string) => void
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  activeId: null,
  setActiveId: () => {},
  title: '',
  setTitle: () => {},
  isSaving: false,
  setIsSaving: () => {},
})

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  return (
    <WorkspaceContext.Provider value={{ activeId, setActiveId, title, setTitle, isSaving, setIsSaving }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
