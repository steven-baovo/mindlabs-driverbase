import { useContext } from 'react'
import { db, LocalObjective, LocalKeyResult } from './db'
import { TasksContext } from './TasksProvider'
import { v4 as uuidv4 } from 'uuid'
import { scheduleSync } from './sync-engine'

// --- OBJECTIVES ---
export function useLocalObjectives() {
  const { objectives } = useContext(TasksContext)

  const addObjective = async (payload: Omit<LocalObjective, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>) => {
    const id = uuidv4()
    const now = new Date().toISOString()
    const newObjective: LocalObjective = {
      ...payload,
      id,
      user_id: 'local-user',
      created_at: now,
      updated_at: now,
      is_synced: 0,
      is_deleted: 0,
    }

    await db.transaction('rw', [db.objectives, db.outbox], async () => {
      await db.objectives.add(newObjective)
      await db.outbox.add({
        action: 'create',
        table_name: 'objectives',
        record_id: id,
        created_at: now,
        status: 'pending',
      })
    })
    scheduleSync()
    return id
  }

  const updateObjective = async (id: string, updates: Partial<Omit<LocalObjective, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>>) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.objectives, db.outbox], async () => {
      const existing = await db.objectives.get(id)
      if (!existing) return

      await db.objectives.update(id, { ...updates, updated_at: now, is_synced: 0 })

      await db.outbox.add({
        action: 'update',
        table_name: 'objectives',
        record_id: id,
        created_at: now,
        status: 'pending',
      })
    })
    scheduleSync()
  }

  const deleteObjective = async (id: string) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.objectives, db.outbox], async () => {
      await db.objectives.update(id, { is_deleted: 1, is_synced: 0, updated_at: now })
      await db.outbox.add({
        action: 'delete',
        table_name: 'objectives',
        record_id: id,
        created_at: now,
        status: 'pending',
      })
    })
    scheduleSync()
  }

  return { objectives, addObjective, updateObjective, deleteObjective }
}

// --- KEY RESULTS ---
export function useLocalKeyResults() {
  const { key_results } = useContext(TasksContext)

  const addKeyResult = async (payload: Omit<LocalKeyResult, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>) => {
    const id = uuidv4()
    const now = new Date().toISOString()
    const newKeyResult: LocalKeyResult = {
      ...payload,
      id,
      user_id: 'local-user',
      created_at: now,
      updated_at: now,
      is_synced: 0,
      is_deleted: 0,
    }

    await db.transaction('rw', [db.key_results, db.outbox], async () => {
      await db.key_results.add(newKeyResult)
      await db.outbox.add({
        action: 'create',
        table_name: 'key_results',
        record_id: id,
        created_at: now,
        status: 'pending',
      })
    })
    scheduleSync()
    return id
  }

  const updateKeyResult = async (id: string, updates: Partial<Omit<LocalKeyResult, 'id' | 'user_id' | 'objective_id' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>>) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.key_results, db.outbox], async () => {
      const existing = await db.key_results.get(id)
      if (!existing) return

      await db.key_results.update(id, { ...updates, updated_at: now, is_synced: 0 })

      await db.outbox.add({
        action: 'update',
        table_name: 'key_results',
        record_id: id,
        created_at: now,
        status: 'pending',
      })
    })
    scheduleSync()
  }

  const deleteKeyResult = async (id: string) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.key_results, db.outbox], async () => {
      await db.key_results.update(id, { is_deleted: 1, is_synced: 0, updated_at: now })
      await db.outbox.add({
        action: 'delete',
        table_name: 'key_results',
        record_id: id,
        created_at: now,
        status: 'pending',
      })
    })
    scheduleSync()
  }

  return { key_results, addKeyResult, updateKeyResult, deleteKeyResult }
}
