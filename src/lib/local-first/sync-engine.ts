import { db } from './db'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import {
  createNode,
  updateNode,
  deleteNode,
  createMindNote,
  updateMindNote,
  deleteMindNote,
  createMindmap,
  updateMindmap,
  deleteMindmap,
  getNodes,
  getAllNotes,
  getAllMindmaps,
} from '@/app/(frontend)/workspace/node-actions'
import {
  createFocusTask,
  updateFocusTask,
  deleteFocusTask,
  loadFocusTasks,
  logFocusSession,
  updateFocusSettings,
  loadFocusSettings
} from '@/app/(frontend)/pomodoro/actions'
import {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  createCycle,
  updateCycle,
  deleteCycle,
  getAllCycles,
  createIssue,
  updateIssue,
  deleteIssue,
  getAllIssues
} from '@/app/(frontend)/tasks/actions'

let isSyncing = false

async function handleSelfHealingUpdate<T>(
  recordId: string,
  payload: any,
  localTable: any,
  createServerAction: (...args: any[]) => Promise<any>,
  updateServerAction: (id: string, payload: any) => Promise<any>,
  getCreateArgs: (localRecord: T) => any[] = (rec: any) => [(rec as any).title, (rec as any).id]
): Promise<{ success: boolean; responseData: any; errorMsg: string | null; _discardItem?: boolean }> {
  const res = await updateServerAction(recordId, payload)
  const error = res?.error || null
  const data = res?.data || null

  if (!error) {
    return { success: true, responseData: data, errorMsg: null }
  }

  const isNotFound = error.includes('JSON object') || error.includes('Cannot coerce') || error.includes('not-found') || error.includes('0 rows')
  if (!isNotFound) {
    return { success: false, responseData: null, errorMsg: error }
  }

  console.log(`[Sync Engine] Record ${recordId} not found on server during update. Re-creating...`)
  const localRecord = await localTable.get(recordId)
  if (!localRecord) {
    // Local record đã bị xóa — outbox item này lỗi thời, discard để không chặn queue
    console.warn(`[Sync Engine] Local record not found for ID ${recordId}. Discarding stale outbox item.`)
    return { success: false, responseData: null, errorMsg: null, _discardItem: true }
  }

  const args = getCreateArgs(localRecord)
  const createRes = await createServerAction(...args)
  if (createRes?.error) {
    return { success: false, responseData: null, errorMsg: createRes.error }
  }

  const retryRes = await updateServerAction(recordId, payload)
  if (retryRes?.error) {
    return { success: false, responseData: null, errorMsg: retryRes.error }
  }

  return { success: true, responseData: retryRes?.data || null, errorMsg: null }
}

async function pullEntityChanges<T extends { id: string; updated_at: string }>(
  tableName: string,
  localTable: any,
  remoteData: T[] | null,
  error: string | null,
  extraPutFields: (remoteItem: T) => any = () => ({})
): Promise<number> {
  if (error) {
    console.error(`[Sync Engine] Error pulling ${tableName}:`, error)
    return 0
  }
  if (!remoteData) return 0

  try {
    return await db.transaction('rw', [localTable, db.outbox], async () => {
      let stepCount = 0
      for (const rItem of remoteData) {
        const localItem = await localTable.get(rItem.id)
        if (!localItem) {
          await localTable.put({ ...rItem, is_synced: 1, ...extraPutFields(rItem) })
          stepCount++
        } else {
          const pendingUpdates = await db.outbox.where({ record_id: rItem.id, table_name: tableName }).count()
          if (pendingUpdates === 0) {
            // Cập nhật nếu server thực sự mới hơn (Last-Write-Wins)
            const remoteTime = new Date(rItem.updated_at).getTime()
            const localTime = new Date(localItem.updated_at).getTime()
            if (remoteTime > localTime) {
              await localTable.put({ ...rItem, is_synced: 1, ...extraPutFields(rItem) })
              stepCount++
            }
          }
        }
      }

      const remoteIds = new Set(remoteData.map(rn => rn.id))
      const localSyncedItems = await localTable.where({ is_synced: 1 }).toArray()
      for (const localItem of localSyncedItems) {
        if (!remoteIds.has(localItem.id)) {
          await localTable.delete(localItem.id)
          stepCount++
        }
      }
      return stepCount
    })
  } catch (err) {
    console.error(`[Sync Engine] Pulling ${tableName} failed:`, err)
    return 0
  }
}


async function recoverOrphanedItems(): Promise<number> {
  let recoveredCount = 0

  try {
    // 1. Tải toàn bộ outbox hiện tại vào bộ nhớ để tra cứu siêu tốc O(1)
    const allOutboxItems = await db.outbox.toArray()
    const outboxLookup = new Set(
      allOutboxItems.map(item => `${item.table_name}:${item.record_id}`)
    )

    const outboxItemsToAdd: any[] = []

    // 2. Quét mind_notes (độc lập, workspace_nodes phụ thuộc vào nó)
    const unsyncedNotes = await db.mind_notes.where({ is_synced: 0 }).toArray()
    for (const note of unsyncedNotes) {
      const lookupKey = `mind_notes:${note.id}`
      if (!outboxLookup.has(lookupKey)) {
        outboxItemsToAdd.push({
          action: 'update',
          table_name: 'mind_notes',
          record_id: note.id,
          payload: {
            title: note.title,
            content: note.content
          },
          created_at: new Date().toISOString()
        })
        recoveredCount++
      }
    }

    // 3. Quét mindmaps (độc lập, workspace_nodes phụ thuộc vào nó)
    const unsyncedMaps = await db.mindmaps.where({ is_synced: 0 }).toArray()
    for (const map of unsyncedMaps) {
      const lookupKey = `mindmaps:${map.id}`
      if (!outboxLookup.has(lookupKey)) {
        outboxItemsToAdd.push({
          action: 'update',
          table_name: 'mindmaps',
          record_id: map.id,
          payload: {
            title: map.title,
            nodes: map.nodes,
            edges: map.edges
          },
          created_at: new Date().toISOString()
        })
        recoveredCount++
      }
    }

    // 4. Quét workspace_nodes (phụ thuộc vào mind_notes/mindmaps)
    const unsyncedNodes = await db.workspace_nodes.where({ is_synced: 0 }).toArray()
    
    // Tải toàn bộ danh sách ID của note và mindmap để tra cứu nhanh trong bộ nhớ (O(1))
    const allNoteIds = new Set((await db.mind_notes.toArray()).map(n => n.id))
    const allMapIds = new Set((await db.mindmaps.toArray()).map(m => m.id))
    
    const brokenNodeIds: string[] = []

    for (const node of unsyncedNodes) {
      if (node.note_id && !allNoteIds.has(node.note_id)) {
        brokenNodeIds.push(node.id)
        continue
      }
      if (node.map_id && !allMapIds.has(node.map_id)) {
        brokenNodeIds.push(node.id)
        continue
      }
      
      const lookupKey = `workspace_nodes:${node.id}`
      if (!outboxLookup.has(lookupKey)) {
        outboxItemsToAdd.push({
          action: node.is_deleted === 1 ? 'delete' : 'update',
          table_name: 'workspace_nodes',
          record_id: node.id,
          payload: {
            title: node.title,
            type: node.type,
            url: node.url,
            parent_id: node.parent_id,
            order: node.order,
            note_id: node.note_id,
            map_id: node.map_id,
            connected_node_ids: node.connected_node_ids
          },
          created_at: new Date().toISOString()
        })
        recoveredCount++
      }
    }

    if (brokenNodeIds.length > 0) {
      console.warn(`[Sync Engine] Self-Healing: Deleting ${brokenNodeIds.length} broken nodes referencing non-existent local notes/mindmaps in bulk...`)
      await db.workspace_nodes.bulkDelete(brokenNodeIds)
    }

    // 5. Quét focus_tasks (độc lập)
    const unsyncedTasks = await db.focus_tasks.where({ is_synced: 0 }).toArray()
    for (const task of unsyncedTasks) {
      const lookupKey = `focus_tasks:${task.id}`
      if (!outboxLookup.has(lookupKey)) {
        outboxItemsToAdd.push({
          action: 'update',
          table_name: 'focus_tasks',
          record_id: task.id,
          payload: {
            title: task.title,
            estimated_pomodoros: task.estimated_pomodoros,
            completed_pomodoros: task.completed_pomodoros,
            is_completed: task.is_completed,
            notes: task.notes
          },
          created_at: new Date().toISOString()
        })
        recoveredCount++
      }
    }

    // 6. Quét projects
    const unsyncedProjects = await db.projects.where({ is_synced: 0 }).toArray()
    for (const proj of unsyncedProjects) {
      const lookupKey = `projects:${proj.id}`
      if (!outboxLookup.has(lookupKey)) {
        outboxItemsToAdd.push({
          action: proj.is_deleted === 1 ? 'delete' : 'update',
          table_name: 'projects',
          record_id: proj.id,
          payload: proj,
          created_at: new Date().toISOString()
        })
        recoveredCount++
      }
    }

    // 7. Quét cycles
    const unsyncedCycles = await db.cycles.where({ is_synced: 0 }).toArray()
    for (const cycle of unsyncedCycles) {
      const lookupKey = `cycles:${cycle.id}`
      if (!outboxLookup.has(lookupKey)) {
        outboxItemsToAdd.push({
          action: cycle.is_deleted === 1 ? 'delete' : 'update',
          table_name: 'cycles',
          record_id: cycle.id,
          payload: cycle,
          created_at: new Date().toISOString()
        })
        recoveredCount++
      }
    }

    // 8. Quét issues
    const unsyncedIssues = await db.issues.where({ is_synced: 0 }).toArray()
    for (const issue of unsyncedIssues) {
      const lookupKey = `issues:${issue.id}`
      if (!outboxLookup.has(lookupKey)) {
        outboxItemsToAdd.push({
          action: issue.is_deleted === 1 ? 'delete' : 'update',
          table_name: 'issues',
          record_id: issue.id,
          payload: issue,
          created_at: new Date().toISOString()
        })
        recoveredCount++
      }
    }

    // Thực hiện lưu hàng loạt vào outbox chỉ bằng 1 transaction duy nhất
    if (outboxItemsToAdd.length > 0) {
      await db.outbox.bulkAdd(outboxItemsToAdd)
    }
  } catch (err) {
    console.error('[Sync Engine] Failed to recover orphaned items:', err)
  }

  return recoveredCount
}

export async function triggerSync() {
  if (isSyncing) return
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return
    }
  } catch (err) {
    console.error('[Sync Engine] Client Auth check failed:', err)
    return
  }

  isSyncing = true

  try {
    await recoverOrphanedItems()
    await processOutbox()
    await pullRemoteChanges()
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

async function forceSyncNote(noteId: string): Promise<boolean> {
  const localNote = await db.mind_notes.get(noteId)
  if (!localNote) return false
  
  console.log(`[Sync Engine] Force pre-sync note ${noteId} due to foreign key constraint violation...`)
  const { data: createData, error: createError } = await createMindNote(localNote.title, localNote.id)
  if (createError && !createError.includes('duplicate key value') && !createError.includes('violates unique constraint')) {
    console.error(`[Sync Engine] Force pre-sync note failed:`, createError)
    return false
  }
  
  const { error: updateError } = await updateMindNote(localNote.id, {
    title: localNote.title,
    content: localNote.content
  })
  if (updateError) {
    console.error(`[Sync Engine] Force pre-update note failed:`, updateError)
    return false
  }
  
  await db.mind_notes.update(localNote.id, { is_synced: 1 })
  console.log(`[Sync Engine] Force pre-synced note ${noteId} successfully.`)
  return true
}

async function forceSyncMindmap(mapId: string): Promise<boolean> {
  const localMap = await db.mindmaps.get(mapId)
  if (!localMap) return false
  
  console.log(`[Sync Engine] Force pre-sync mindmap ${mapId} due to foreign key constraint violation...`)
  const { data: createData, error: createError } = await createMindmap(localMap.title, localMap.id)
  if (createError && !createError.includes('duplicate key value') && !createError.includes('violates unique constraint')) {
    console.error(`[Sync Engine] Force pre-sync mindmap failed:`, createError)
    return false
  }
  
  const { error: updateError } = await updateMindmap(localMap.id, {
    title: localMap.title,
    nodes: localMap.nodes,
    edges: localMap.edges
  })
  if (updateError) {
    console.error(`[Sync Engine] Force pre-update mindmap failed:`, updateError)
    return false
  }
  
  await db.mindmaps.update(localMap.id, { is_synced: 1 })
  console.log(`[Sync Engine] Force pre-synced mindmap ${mapId} successfully.`)
  return true
}

async function ensureReferencedEntitiesSynced(node: any): Promise<boolean> {
  if (node.note_id) {
    const localNote = await db.mind_notes.get(node.note_id)
    if (localNote && localNote.is_synced === 0) {
      console.log(`[Sync Engine] Node references unsynced note ${node.note_id}. Syncing note first...`)
      
      const { data: createData, error: createError } = await createMindNote(localNote.title, localNote.id)
      if (createError && !createError.includes('duplicate key value') && !createError.includes('violates unique constraint')) {
        console.error(`[Sync Engine] Failed to pre-sync note ${node.note_id}:`, createError)
        return false
      }
      
      const { error: updateError } = await updateMindNote(localNote.id, {
        title: localNote.title,
        content: localNote.content
      })
      if (updateError) {
        console.error(`[Sync Engine] Failed to pre-update note content ${node.note_id}:`, updateError)
        return false
      }
      
      await db.mind_notes.update(localNote.id, { is_synced: 1 })
      console.log(`[Sync Engine] Pre-synced note ${node.note_id} successfully.`)
    }
  }

  if (node.map_id) {
    const localMap = await db.mindmaps.get(node.map_id)
    if (localMap && localMap.is_synced === 0) {
      console.log(`[Sync Engine] Node references unsynced mindmap ${node.map_id}. Syncing mindmap first...`)
      
      const { data: createData, error: createError } = await createMindmap(localMap.title, localMap.id)
      if (createError && !createError.includes('duplicate key value') && !createError.includes('violates unique constraint')) {
        console.error(`[Sync Engine] Failed to pre-sync mindmap ${node.map_id}:`, createError)
        return false
      }
      
      const { error: updateError } = await updateMindmap(localMap.id, {
        title: localMap.title,
        nodes: localMap.nodes,
        edges: localMap.edges
      })
      if (updateError) {
        console.error(`[Sync Engine] Failed to pre-update mindmap content ${node.map_id}:`, updateError)
        return false
      }
      
      await db.mindmaps.update(localMap.id, { is_synced: 1 })
      console.log(`[Sync Engine] Pre-synced mindmap ${node.map_id} successfully.`)
    }
  }

  return true
}

interface SyncResult {
  success: boolean;
  responseData?: any;
  errorMsg?: string | null;
  _discardItem?: boolean;
}

type SyncHandlerFn = (item: any) => Promise<SyncResult>;

async function syncWorkspaceNode(item: any): Promise<SyncResult> {
  if (item.action === 'delete') {
    const { error } = await deleteNode(item.record_id)
    return { success: !error, errorMsg: error }
  }

  const recordId = item.record_id
  const nodePayload = item.action === 'create' ? item.payload : (await db.workspace_nodes.get(recordId))
  
  if (nodePayload) {
    if (nodePayload.note_id) {
      const localNote = await db.mind_notes.get(nodePayload.note_id)
      if (!localNote) {
        console.warn(`[Sync Engine] Pre-check: Note ${nodePayload.note_id} does not exist locally. Deleting broken node ${recordId} from local DB.`)
        await db.workspace_nodes.delete(recordId)
        return { success: false, _discardItem: true }
      }
    }
    if (nodePayload.map_id) {
      const localMap = await db.mindmaps.get(nodePayload.map_id)
      if (!localMap) {
        console.warn(`[Sync Engine] Pre-check: Mindmap ${nodePayload.map_id} does not exist locally. Deleting broken node ${recordId} from local DB.`)
        await db.workspace_nodes.delete(recordId)
        return { success: false, _discardItem: true }
      }
    }
  }

  if (item.action === 'create') {
    const successSynced = await ensureReferencedEntitiesSynced(item.payload)
    if (!successSynced) {
      return { success: false, errorMsg: `Failed to sync referenced entities for node ${item.record_id}` }
    }

    let { data, error } = await createNode(item.payload)
    if (!error) return { success: true, responseData: data }

    if (error.includes('duplicate key value') || error.includes('violates unique constraint')) {
      console.log(`[Sync Engine] Node ${item.record_id} already exists on server. Marking as synced.`)
      return { success: true, responseData: item.payload }
    }

    if (!error.includes('foreign key constraint')) {
      return { success: false, errorMsg: error }
    }

    console.log(`[Sync Engine] Foreign key constraint violated during node creation. Resolving...`)
    let resolved = false
    if (error.includes('note_id_fkey') && item.payload.note_id) {
      resolved = await forceSyncNote(item.payload.note_id)
      if (!resolved) {
        console.warn(`[Sync Engine] Note ${item.payload.note_id} does not exist locally. Deleting broken node ${item.record_id} from local DB.`)
        await db.workspace_nodes.delete(item.record_id)
        return { success: false, _discardItem: true }
      }
    } else if (error.includes('map_id_fkey') && item.payload.map_id) {
      resolved = await forceSyncMindmap(item.payload.map_id)
      if (!resolved) {
        console.warn(`[Sync Engine] Mindmap ${item.payload.map_id} does not exist locally. Deleting broken node ${item.record_id} from local DB.`)
        await db.workspace_nodes.delete(item.record_id)
        return { success: false, _discardItem: true }
      }
    }

    if (resolved) {
      const retry = await createNode(item.payload)
      return { success: !retry.error, responseData: retry.data, errorMsg: retry.error }
    }

    return { success: false, errorMsg: error }
  }

  if (item.action === 'update') {
    const localNode = await db.workspace_nodes.get(item.record_id)
    if (!localNode) {
      return { success: false, errorMsg: `Local record not found for Node ${item.record_id}` }
    }

    const successSynced = await ensureReferencedEntitiesSynced(localNode)
    if (!successSynced) {
      return { success: false, errorMsg: `Failed to sync referenced entities for node ${item.record_id}` }
    }

    let { data, error } = await updateNode(item.record_id, item.payload)
    if (!error) return { success: true, responseData: data }

    if (error.includes('foreign key constraint')) {
      console.log(`[Sync Engine] Foreign key constraint violated during node update. Resolving...`)
      let resolved = false
      if (error.includes('note_id_fkey') && localNode.note_id) {
        resolved = await forceSyncNote(localNode.note_id)
        if (!resolved) {
          console.warn(`[Sync Engine] Note ${localNode.note_id} does not exist locally. Deleting broken node ${item.record_id} from local DB.`)
          await db.workspace_nodes.delete(item.record_id)
          return { success: false, _discardItem: true }
        }
      } else if (error.includes('map_id_fkey') && localNode.map_id) {
        resolved = await forceSyncMindmap(localNode.map_id)
        if (!resolved) {
          console.warn(`[Sync Engine] Mindmap ${localNode.map_id} does not exist locally. Deleting broken node ${item.record_id} from local DB.`)
          await db.workspace_nodes.delete(item.record_id)
          return { success: false, _discardItem: true }
        }
      }

      if (resolved) {
        const retry = await updateNode(item.record_id, item.payload)
        return { success: !retry.error, responseData: retry.data, errorMsg: retry.error }
      }
      return { success: false, errorMsg: error }
    }
    
    if (error.includes('JSON object') || error.includes('Cannot coerce') || error.includes('not-found') || error.includes('0 rows')) {
      console.log(`[Sync Engine] Node ${item.record_id} not found on server during update. Re-creating...`)
      const createRes = await createNode({
        id: localNode.id,
        title: localNode.title,
        type: localNode.type,
        url: localNode.url,
        parent_id: localNode.parent_id,
        order: localNode.order,
        note_id: localNode.note_id,
        map_id: localNode.map_id,
        connected_node_ids: localNode.connected_node_ids
      })
      if (createRes.error) return { success: false, errorMsg: createRes.error }

      const updateRes = await updateNode(item.record_id, item.payload)
      return { success: !updateRes.error, responseData: updateRes.data, errorMsg: updateRes.error }
    }

    return { success: false, errorMsg: error }
  }

  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncMindNote(item: any): Promise<SyncResult> {
  if (item.action === 'create') {
    const { data, error } = await createMindNote(item.payload.title, item.record_id)
    if (error && (error.includes('duplicate key value') || error.includes('violates unique constraint'))) {
      console.log(`[Sync Engine] MindNote ${item.record_id} already exists on server. Marking as synced.`)
      return { success: true, responseData: data }
    }
    return { success: !error, responseData: data, errorMsg: error }
  } else if (item.action === 'update') {
    return await handleSelfHealingUpdate(
      item.record_id,
      item.payload,
      db.mind_notes,
      createMindNote,
      updateMindNote
    )
  } else if (item.action === 'delete') {
    const { error } = await deleteMindNote(item.record_id)
    return { success: !error, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncMindmap(item: any): Promise<SyncResult> {
  if (item.action === 'create') {
    const { data, error } = await createMindmap(item.payload.title, item.record_id)
    if (error && (error.includes('duplicate key value') || error.includes('violates unique constraint'))) {
      console.log(`[Sync Engine] Mindmap ${item.record_id} already exists on server. Marking as synced.`)
      return { success: true, responseData: data }
    }
    return { success: !error, responseData: data, errorMsg: error }
  } else if (item.action === 'update') {
    return await handleSelfHealingUpdate(
      item.record_id,
      item.payload,
      db.mindmaps,
      createMindmap,
      updateMindmap
    )
  } else if (item.action === 'delete') {
    const { error } = await deleteMindmap(item.record_id)
    return { success: !error, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncFocusTask(item: any): Promise<SyncResult> {
  if (item.action === 'create') {
    const { data, error } = await createFocusTask(item.payload.title, item.payload.estimated_pomodoros, item.payload.notes, item.record_id)
    if (error && (error.includes('duplicate key value') || error.includes('violates unique constraint'))) {
      console.log(`[Sync Engine] FocusTask ${item.record_id} already exists on server. Marking as synced.`)
      return { success: true, responseData: data }
    }
    return { success: !error, responseData: data, errorMsg: error }
  } else if (item.action === 'update') {
    return await handleSelfHealingUpdate(
      item.record_id,
      item.payload,
      db.focus_tasks,
      (title, id, est, notes) => createFocusTask(title, est, notes, id),
      updateFocusTask,
      (rec: any) => [rec.title, rec.id, rec.estimated_pomodoros, rec.notes]
    )
  } else if (item.action === 'delete') {
    const { error } = await deleteFocusTask(item.record_id)
    return { success: !error, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncProject(item: any): Promise<SyncResult> {
  if (item.action === 'create') {
    const { data, error } = await createProject(item.payload)
    if (error && (error.includes('duplicate key value') || error.includes('violates unique constraint'))) {
      return { success: true, responseData: data }
    }
    return { success: !error, responseData: data, errorMsg: error }
  } else if (item.action === 'update') {
    return await handleSelfHealingUpdate(item.record_id, item.payload, db.projects, createProject, updateProject, (rec) => [rec])
  } else if (item.action === 'delete') {
    const { error } = await deleteProject(item.record_id)
    return { success: !error, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncCycle(item: any): Promise<SyncResult> {
  if (item.action === 'create') {
    const { data, error } = await createCycle(item.payload)
    if (error && (error.includes('duplicate key value') || error.includes('violates unique constraint'))) {
      return { success: true, responseData: data }
    }
    return { success: !error, responseData: data, errorMsg: error }
  } else if (item.action === 'update') {
    return await handleSelfHealingUpdate(item.record_id, item.payload, db.cycles, createCycle, updateCycle, (rec) => [rec])
  } else if (item.action === 'delete') {
    const { error } = await deleteCycle(item.record_id)
    return { success: !error, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncIssue(item: any): Promise<SyncResult> {
  if (item.action === 'create') {
    const { data, error } = await createIssue(item.payload)
    if (error && (error.includes('duplicate key value') || error.includes('violates unique constraint'))) {
      return { success: true, responseData: data }
    }
    return { success: !error, responseData: data, errorMsg: error }
  } else if (item.action === 'update') {
    return await handleSelfHealingUpdate(item.record_id, item.payload, db.issues, createIssue, updateIssue, (rec) => [rec])
  } else if (item.action === 'delete') {
    const { error } = await deleteIssue(item.record_id)
    return { success: !error, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncFocusSession(item: any): Promise<SyncResult> {
  if (item.action === 'create') {
    const { data, error } = await logFocusSession(
      item.payload.task_id,
      item.payload.session_type,
      item.payload.duration_minutes,
      item.record_id
    )
    if (error && (error.includes('duplicate key value') || error.includes('violates unique constraint'))) {
      return { success: true, responseData: data }
    }
    return { success: !error, responseData: data, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

async function syncFocusSetting(item: any): Promise<SyncResult> {
  if (item.action === 'update') {
    const { success, error } = await updateFocusSettings(item.payload)
    return { success: !!success, responseData: null, errorMsg: error }
  }
  return { success: false, errorMsg: `Unknown action ${item.action}` }
}

const SyncHandlers: Record<string, SyncHandlerFn> = {
  workspace_nodes: syncWorkspaceNode,
  mind_notes: syncMindNote,
  mindmaps: syncMindmap,
  focus_tasks: syncFocusTask,
  projects: syncProject,
  cycles: syncCycle,
  issues: syncIssue,
  focus_sessions: syncFocusSession,
  focus_settings: syncFocusSetting
}

async function processOutbox(): Promise<number> {
  let pushedCount = 0
  while (true) {
    const item = await db.outbox.orderBy('id').filter(i => i.status !== 'failed').first()
    if (!item) break

    try {
      const handler = SyncHandlers[item.table_name]
      if (!handler) {
        console.warn(`[Sync Engine] Unknown table ${item.table_name}. Marking as failed.`)
        await db.outbox.update(item.id!, { status: 'failed', error_msg: 'Unknown table handler' })
        continue
      }

      const { success, responseData, errorMsg, _discardItem } = await handler(item)

      if (_discardItem) {
        await db.outbox.delete(item.id!)
        pushedCount++
        continue
      }

      if (success) {
        if (item.action !== 'delete') {
          const updates = responseData ? { ...responseData, is_synced: 1 } : { is_synced: 1 }
          if (item.table_name === 'workspace_nodes') await db.workspace_nodes.update(item.record_id, updates)
          else if (item.table_name === 'mind_notes') await db.mind_notes.update(item.record_id, { is_synced: 1 })
          else if (item.table_name === 'mindmaps') await db.mindmaps.update(item.record_id, { is_synced: 1 })
          else if (item.table_name === 'focus_tasks') await db.focus_tasks.update(item.record_id, updates)
          else if (item.table_name === 'projects') await db.projects.update(item.record_id, updates)
          else if (item.table_name === 'cycles') await db.cycles.update(item.record_id, updates)
          else if (item.table_name === 'issues') await db.issues.update(item.record_id, updates)
          else if (item.table_name === 'focus_sessions') await db.focus_sessions.update(item.record_id, updates)
          else if (item.table_name === 'focus_settings') await db.focus_settings.update(item.record_id, updates)
        }
        await db.outbox.delete(item.id!)
        pushedCount++
      } else {
        // errorMsg null + không success → đã được xử lý nội bộ, discard để không chặn queue
        if (!errorMsg) {
          await db.outbox.delete(item.id!)
          pushedCount++
          continue
        }

        const isPermanentError = errorMsg && (
          errorMsg.includes('violates foreign key constraint') ||
          errorMsg.includes('violates unique constraint') ||
          errorMsg.includes('duplicate key value') ||
          errorMsg.includes('violates check constraint') ||
          errorMsg.includes('not-found') ||
          errorMsg.includes('JSON object') ||
          errorMsg.includes('Cannot coerce') ||
          errorMsg.includes('0 rows')
        )

        if (isPermanentError) {
          console.warn(`[Sync Engine] Permanent error detected for item ${item.id}. Marking as failed to unclog sync queue:`, errorMsg)
          await db.outbox.update(item.id!, { status: 'failed', error_msg: errorMsg })
          // Notify the UI about the persistent sync error
          window.dispatchEvent(new CustomEvent('mindlabs-sync-error', { detail: { item, errorMsg } }))
          continue
        }

        console.error(`[Sync Engine] Server failed to process outbox item ${item.id}:`, errorMsg)
        break // Transient error, stop and retry later
      }
    } catch (err: any) {
      console.error(`[Sync Engine] Exception during outbox item ${item.id} processing:`, err)
      break
    }
  }
  return pushedCount
}

async function pullRemoteChanges(): Promise<number> {
  let pulledCount = 0
  
  const { data: remoteNodes, error: nodeError } = await getNodes()
  pulledCount += await pullEntityChanges('workspace_nodes', db.workspace_nodes, remoteNodes || null, nodeError || null, () => ({ is_deleted: 0 }))

  const { data: remoteNotes, error: noteError } = await getAllNotes()
  pulledCount += await pullEntityChanges('mind_notes', db.mind_notes, remoteNotes || null, noteError || null)

  const { data: remoteMaps, error: mapError } = await getAllMindmaps()
  pulledCount += await pullEntityChanges('mindmaps', db.mindmaps, remoteMaps || null, mapError || null)

  const { data: remoteTasks, error: taskError } = await loadFocusTasks()
  pulledCount += await pullEntityChanges('focus_tasks', db.focus_tasks, remoteTasks || null, taskError || null)

  const { data: remoteProjects, error: projError } = await getAllProjects()
  pulledCount += await pullEntityChanges('projects', db.projects, remoteProjects || null, projError || null, () => ({ is_deleted: 0 }))

  const { data: remoteCycles, error: cycleError } = await getAllCycles()
  pulledCount += await pullEntityChanges('cycles', db.cycles, remoteCycles || null, cycleError || null, () => ({ is_deleted: 0 }))

  const { data: remoteIssues, error: issueError } = await getAllIssues()
  pulledCount += await pullEntityChanges('issues', db.issues, remoteIssues || null, issueError || null, () => ({ is_deleted: 0 }))

  return pulledCount
}

export function startSyncEngine() {
  if (typeof window === 'undefined') return

  // Một lần duy nhất dọn sạch outbox bị kẹt để tránh nghẽn hàng chờ
  const CLEANUP_KEY = 'mindlabs_outbox_cleaned_v6'
  
  // Trì hoãn triggerSync đầu tiên đi 2 giây để ưu tiên hoàn tất tiến trình tải trang và các transition mượt mà
  const initialSyncDelay = 2000

  if (!localStorage.getItem(CLEANUP_KEY)) {
    db.outbox.clear().then(() => {
      localStorage.setItem(CLEANUP_KEY, 'true')
      setTimeout(triggerSync, initialSyncDelay)
    }).catch(err => {
      console.error('[Sync Engine] Failed to clear outbox during one-time cleanup:', err)
      setTimeout(triggerSync, initialSyncDelay)
    })
  } else {
    setTimeout(triggerSync, initialSyncDelay)
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      triggerSync()
    }
  }

  const handleBeforeUnload = () => {
    triggerSync()
  }

  window.addEventListener('online', triggerSync)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)

  const intervalId = setInterval(triggerSync, 60000)

  return () => {
    window.removeEventListener('online', triggerSync)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    clearInterval(intervalId)
  }
}
