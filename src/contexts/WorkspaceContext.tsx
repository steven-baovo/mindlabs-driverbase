'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// Selection state for the active file/view in the workspace
interface WorkspaceSelection {
  noteId: string | null
  canvasId: string | null
  linkId: string | null
  graphView: boolean
}

interface WorkspaceContextType {
  // Editor state (existing)
  activeId: string | null
  setActiveId: (activeId: string | null) => void
  title: string
  setTitle: (title: string) => void
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
  // File selection state — enables instant file switching without Next.js router overhead
  selection: WorkspaceSelection
  selectNote: (noteId: string) => void
  selectCanvas: (canvasId: string) => void
  selectLink: (linkId: string) => void
  selectGraphView: () => void
  clearSelection: () => void
}

const defaultSelection: WorkspaceSelection = {
  noteId: null,
  canvasId: null,
  linkId: null,
  graphView: false,
}

/** Parse selection from current URL (only for /workspace routes) */
function parseSelectionFromUrl(): WorkspaceSelection {
  if (typeof window === 'undefined') return defaultSelection
  if (!window.location.pathname.startsWith('/workspace')) return defaultSelection

  const params = new URLSearchParams(window.location.search)
  const noteId = params.get('note')
  const canvasId = params.get('canvas')
  const linkId = params.get('link')
  const view = params.get('view')

  if (noteId) return { noteId, canvasId: null, linkId: null, graphView: false }
  if (canvasId) return { noteId: null, canvasId, linkId: null, graphView: false }
  if (linkId) return { noteId: null, canvasId: null, linkId, graphView: false }
  if (view === 'graph') return { noteId: null, canvasId: null, linkId: null, graphView: true }
  return defaultSelection
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  activeId: null,
  setActiveId: () => {},
  title: '',
  setTitle: () => {},
  isSaving: false,
  setIsSaving: () => {},
  selection: defaultSelection,
  selectNote: () => {},
  selectCanvas: () => {},
  selectLink: () => {},
  selectGraphView: () => {},
  clearSelection: () => {},
})

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [selection, setSelection] = useState<WorkspaceSelection>(defaultSelection)

  // Initialize selection from URL on mount (handles page refresh / direct URL visit)
  useEffect(() => {
    setSelection(parseSelectionFromUrl())
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setSelection(parseSelectionFromUrl())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const selectNote = useCallback((noteId: string) => {
    setSelection({ noteId, canvasId: null, linkId: null, graphView: false })
  }, [])

  const selectCanvas = useCallback((canvasId: string) => {
    setSelection({ noteId: null, canvasId, linkId: null, graphView: false })
  }, [])

  const selectLink = useCallback((linkId: string) => {
    setSelection({ noteId: null, canvasId: null, linkId, graphView: false })
  }, [])

  const selectGraphView = useCallback(() => {
    setSelection({ noteId: null, canvasId: null, linkId: null, graphView: true })
  }, [])

  const clearSelection = useCallback(() => {
    setSelection(defaultSelection)
  }, [])

  return (
    <WorkspaceContext.Provider value={{
      activeId, setActiveId, title, setTitle, isSaving, setIsSaving,
      selection, selectNote, selectCanvas, selectLink, selectGraphView, clearSelection
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
