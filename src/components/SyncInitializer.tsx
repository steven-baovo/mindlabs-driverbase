'use client'

import { useEffect } from 'react'
import { startSyncEngine } from '@/lib/local-first/sync-engine'

export default function SyncInitializer() {
  useEffect(() => {
    const stopSync = startSyncEngine()
    return () => {
      if (stopSync) stopSync()
    }
  }, [])

  return null
}
