import { db } from './db'
import { findOrCreateSyncFile, downloadSyncData, uploadSyncData } from '../gdrive-api'

let isSyncing = false

async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return null;
    const session = await res.json();
    return session?.accessToken || null;
  } catch {
    return null;
  }
}

async function recoverOrphanedItems(): Promise<number> {
  // Logic remain mostly the same to gather unsynced items to outbox
  let recoveredCount = 0;
  try {
    const allOutboxItems = await db.outbox.toArray()
    const outboxLookup = new Set(
      allOutboxItems.map(item => `${item.table_name}:${item.record_id}`)
    )
    const outboxItemsToAdd: any[] = []

    const checkAndAdd = async (table: any, tableName: string) => {
      const unsynced = await table.where({ is_synced: 0 }).toArray()
      for (const item of unsynced) {
        const lookupKey = `${tableName}:${item.id}`
        if (!outboxLookup.has(lookupKey)) {
          outboxItemsToAdd.push({
            action: item.is_deleted === 1 ? 'delete' : 'update',
            table_name: tableName,
            record_id: item.id,
            payload: item,
            created_at: new Date().toISOString()
          })
          recoveredCount++
        }
      }
    }

    await checkAndAdd(db.mind_notes, 'mind_notes');
    await checkAndAdd(db.mindmaps, 'mindmaps');
    await checkAndAdd(db.workspace_nodes, 'workspace_nodes');
    await checkAndAdd(db.focus_tasks, 'focus_tasks');
    await checkAndAdd(db.projects, 'projects');
    await checkAndAdd(db.cycles, 'cycles');
    await checkAndAdd(db.issues, 'issues');
    await checkAndAdd(db.focus_sessions, 'focus_sessions');
    await checkAndAdd(db.focus_settings, 'focus_settings');

    if (outboxItemsToAdd.length > 0) {
      await db.outbox.bulkAdd(outboxItemsToAdd)
    }
  } catch (err) {
    console.error('[Sync Engine] Failed to recover orphaned items:', err)
  }
  return recoveredCount;
}

export async function triggerSync() {
  if (isSyncing) return
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return
  }

  const accessToken = await getAccessToken()
  if (!accessToken) {
    return
  }

  isSyncing = true

  try {
    const fileId = await findOrCreateSyncFile(accessToken)
    if (!fileId) throw new Error("Could not create or find GDrive sync file")

    // 1. Recover orphaned
    await recoverOrphanedItems()

    // 2. Download remote JSON snapshot
    let remoteData = await downloadSyncData(accessToken, fileId) || {}

    // 3. Pull: Merge remote to local (Last-Write-Wins based on updated_at)
    await pullRemoteChanges(remoteData)

    // 4. Push: Read outbox and apply to remoteData
    const outboxItems = await db.outbox.orderBy('id').filter(i => i.status !== 'failed').toArray()
    if (outboxItems.length > 0) {
      let modifiedRemote = false;

      for (const item of outboxItems) {
        const table = item.table_name;
        if (!remoteData[table]) remoteData[table] = {};

        if (item.action === 'delete') {
          if (remoteData[table][item.record_id]) {
            delete remoteData[table][item.record_id];
            modifiedRemote = true;
          }
        } else {
          // Update / Create
          const localRecord = await (db as any)[table].get(item.record_id);
          if (localRecord) {
            remoteData[table][item.record_id] = { ...localRecord, is_synced: 1 };
            modifiedRemote = true;
          }
        }
      }

      if (modifiedRemote) {
        // Upload the new merged JSON
        const success = await uploadSyncData(accessToken, fileId, remoteData);
        if (success) {
          // Mark all local as synced and delete outbox
          const outboxIds = outboxItems.map(i => i.id as number);
          for (const item of outboxItems) {
            if (item.action !== 'delete') {
               await (db as any)[item.table_name].update(item.record_id, { is_synced: 1 });
            }
          }
          await db.outbox.bulkDelete(outboxIds);
        }
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('mindlabs_initial_pull_done', 'true')
      window.dispatchEvent(new CustomEvent('mindlabs-sync-complete'))
    }
  } catch (err) {
    console.error('[Sync Engine] Sync failed:', err)
  } finally {
    isSyncing = false
  }
}

async function pullRemoteChanges(remoteData: any) {
  // remoteData: { workspace_nodes: { id1: {...}, id2: {...} }, mind_notes: {...} }
  const tables = ['mind_notes', 'mindmaps', 'workspace_nodes', 'focus_tasks', 'projects', 'cycles', 'issues', 'focus_sessions', 'focus_settings'];
  
  for (const tableName of tables) {
    const tableRemoteData = remoteData[tableName];
    if (!tableRemoteData) continue;

    const localTable = (db as any)[tableName];
    const remoteRecords = Object.values(tableRemoteData) as any[];

    await db.transaction('rw', [localTable, db.outbox], async () => {
      for (const rItem of remoteRecords) {
        const localItem = await localTable.get(rItem.id);
        if (!localItem) {
          await localTable.put({ ...rItem, is_synced: 1 });
        } else {
          const pendingUpdates = await db.outbox.where({ record_id: rItem.id, table_name: tableName }).count();
          if (pendingUpdates === 0) {
            // Local is synced, check updated_at
            const remoteTime = new Date(rItem.updated_at).getTime() || 0;
            const localTime = new Date(localItem.updated_at).getTime() || 0;
            if (remoteTime > localTime) {
              await localTable.put({ ...rItem, is_synced: 1 });
            }
          }
        }
      }

      // Check deletions (if it exists locally, synced, but not in remote)
      const remoteIds = new Set(remoteRecords.map(r => r.id));
      const localSyncedItems = await localTable.where({ is_synced: 1 }).toArray();
      for (const localItem of localSyncedItems) {
        if (!remoteIds.has(localItem.id)) {
           await localTable.delete(localItem.id);
        }
      }
    });
  }
}

// Throttler for sync calls
let syncTimeout: NodeJS.Timeout | null = null
export function scheduleSync() {
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    triggerSync()
  }, 2000)
}

export function startSyncEngine() {
  if (typeof window === 'undefined') return () => {}

  // 1. Initial pull
  triggerSync()

  // 2. Poll every 30s
  const interval = setInterval(triggerSync, 30000)

  // 3. Online/Offline
  const onOnline = () => triggerSync()
  window.addEventListener('online', onOnline)

  // 4. Manual trigger
  const onTrigger = () => scheduleSync()
  window.addEventListener('mindlabs-trigger-sync', onTrigger)

  return () => {
    clearInterval(interval)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('mindlabs-trigger-sync', onTrigger)
  }
}
