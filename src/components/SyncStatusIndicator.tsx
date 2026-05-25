'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudOff, AlertCircle, CheckCircle2, LogIn } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/local-first/db'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'

export function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleSyncError = (e: any) => {
      setSyncError(e.detail?.errorMsg || 'Sync failed')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('mindlabs-sync-error', handleSyncError)

    // Check initial auth state and listen for changes
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('mindlabs-sync-error', handleSyncError)
      subscription.unsubscribe()
    }
  }, [])

  const outboxCount = useLiveQuery(() => db.outbox.count(), [])
  const failedCount = useLiveQuery(() => db.outbox.filter(i => i.status === 'failed').count(), [])

  // If there are no failed items, clear the error message
  useEffect(() => {
    if (failedCount === 0) setSyncError(null)
  }, [failedCount])

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
        <CloudOff size={14} />
        <span>Offline</span>
      </div>
    )
  }

  // Handle completely expired session or logged out with pending items
  if (user === null && outboxCount !== undefined && outboxCount > 0) {
    return (
      <Link 
        href="/login"
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all border border-amber-200/50 dark:border-amber-500/20 active:scale-95 cursor-pointer"
        title="Session expired or not logged in. Click here to login and sync your changes."
      >
        <LogIn size={14} className="animate-pulse" />
        <span>Login to Sync ({outboxCount})</span>
      </Link>
    )
  }

  if (failedCount !== undefined && failedCount > 0) {
    return (
      <div 
        className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2.5 py-1 rounded-full cursor-help hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        title={syncError || `${failedCount} items failed to sync`}
      >
        <AlertCircle size={14} />
        <span>Sync Error ({failedCount})</span>
      </div>
    )
  }

  if (outboxCount !== undefined && outboxCount > 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2.5 py-1 rounded-full">
        <Cloud size={14} className="animate-pulse" />
        <span>Syncing...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400 px-2.5 py-1 rounded-full opacity-80">
      <CheckCircle2 size={14} />
      <span>Synced</span>
    </div>
  )
}
