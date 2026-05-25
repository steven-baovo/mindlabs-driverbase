'use client'

import { createContext, useContext } from 'react'

interface MindmapWorkspaceContextType {
  title: string
  setTitle: (title: string) => void
  onSavingChange: (saving: boolean) => void
}

export const MindmapWorkspaceContext = createContext<MindmapWorkspaceContextType>({
  title: '',
  setTitle: () => {},
  onSavingChange: () => {},
})

export function useMindmapWorkspace() {
  return useContext(MindmapWorkspaceContext)
}
