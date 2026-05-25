import { useContext } from 'react'
import { db, LocalProject, LocalCycle, LocalIssue } from './db'
import { TasksContext } from './TasksProvider'
import { v4 as uuidv4 } from 'uuid'
import { triggerSync } from './sync-engine'

// --- PROJECTS ---
export function useLocalProjects() {
  const { projects } = useContext(TasksContext)

  const addProject = async (payload: Omit<LocalProject, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>) => {
    const id = uuidv4()
    const now = new Date().toISOString()
    const newProject: LocalProject = {
      ...payload,
      id,
      user_id: 'local-user',
      created_at: now,
      updated_at: now,
      is_synced: 0,
      is_deleted: 0,
    }

    await db.transaction('rw', [db.projects, db.outbox], async () => {
      await db.projects.add(newProject)
      await db.outbox.add({
        action: 'create',
        table_name: 'projects',
        record_id: id,
        payload: newProject,
        created_at: now
      })
    })
    triggerSync()
    return id
  }

  const updateProject = async (id: string, updates: Partial<Omit<LocalProject, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>>) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.projects, db.outbox], async () => {
      const existing = await db.projects.get(id)
      if (!existing) return
      
      const payload = { ...updates, updated_at: now, is_synced: 0 }
      await db.projects.update(id, payload)
      
      await db.outbox.add({
        action: 'update',
        table_name: 'projects',
        record_id: id,
        payload: payload,
        created_at: now
      })
    })
    triggerSync()
  }

  const deleteProject = async (id: string) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.projects, db.outbox], async () => {
      await db.projects.update(id, { is_deleted: 1, is_synced: 0, updated_at: now })
      await db.outbox.add({
        action: 'delete',
        table_name: 'projects',
        record_id: id,
        payload: null,
        created_at: now
      })
    })
    triggerSync()
  }

  return { projects, addProject, updateProject, deleteProject }
}

// --- CYCLES ---
export function useLocalCycles() {
  const { cycles } = useContext(TasksContext)

  const addCycle = async (payload: Omit<LocalCycle, 'id' | 'user_id' | 'number' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>) => {
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await db.transaction('rw', [db.cycles, db.outbox], async () => {
      const allCycles = await db.cycles.toArray()
      const maxNumber = allCycles.reduce((max, c) => Math.max(max, c.number || 0), 0)
      const number = maxNumber + 1

      const newCycle: LocalCycle = {
        ...payload,
        id,
        user_id: 'local-user',
        number,
        created_at: now,
        updated_at: now,
        is_synced: 0,
        is_deleted: 0,
      }

      await db.cycles.add(newCycle)
      await db.outbox.add({
        action: 'create',
        table_name: 'cycles',
        record_id: id,
        payload: newCycle,
        created_at: now
      })
    })
    triggerSync()
    return id
  }

  const updateCycle = async (id: string, updates: Partial<Omit<LocalCycle, 'id' | 'user_id' | 'number' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>>) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.cycles, db.outbox], async () => {
      const existing = await db.cycles.get(id)
      if (!existing) return
      
      if (updates.is_active === true) {
        const otherCycles = await db.cycles.filter(c => c.id !== id && c.is_active === true).toArray();
        for (const oc of otherCycles) {
           await db.cycles.update(oc.id, { is_active: false, updated_at: now, is_synced: 0 });
           await db.outbox.add({
             action: 'update',
             table_name: 'cycles',
             record_id: oc.id,
             payload: { is_active: false, updated_at: now, is_synced: 0 },
             created_at: now
           });
        }
      }

      const payload = { ...updates, updated_at: now, is_synced: 0 }
      await db.cycles.update(id, payload)
      
      await db.outbox.add({
        action: 'update',
        table_name: 'cycles',
        record_id: id,
        payload: payload,
        created_at: now
      })
    })
    triggerSync()
  }

  const deleteCycle = async (id: string) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.cycles, db.outbox], async () => {
      await db.cycles.update(id, { is_deleted: 1, is_synced: 0, updated_at: now })
      await db.outbox.add({
        action: 'delete',
        table_name: 'cycles',
        record_id: id,
        payload: null,
        created_at: now
      })
    })
    triggerSync()
  }

  return { cycles, addCycle, updateCycle, deleteCycle }
}

// --- ISSUES ---
export function useLocalIssues() {
  const { issues } = useContext(TasksContext)

  const addIssue = async (payload: Omit<LocalIssue, 'id' | 'user_id' | 'number' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>) => {
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await db.transaction('rw', [db.issues, db.outbox], async () => {
      const allIssues = await db.issues.toArray()
      const maxNumber = allIssues.reduce((max, i) => Math.max(max, i.number || 0), 0)
      const number = maxNumber + 1

      const newIssue: LocalIssue = {
        ...payload,
        id,
        user_id: 'local-user',
        number,
        created_at: now,
        updated_at: now,
        is_synced: 0,
        is_deleted: 0,
      }

      await db.issues.add(newIssue)
      await db.outbox.add({
        action: 'create',
        table_name: 'issues',
        record_id: id,
        payload: newIssue,
        created_at: now
      })
    })
    triggerSync()
    return id
  }

  const updateIssue = async (id: string, updates: Partial<Omit<LocalIssue, 'id' | 'user_id' | 'number' | 'created_at' | 'updated_at' | 'is_synced' | 'is_deleted'>>) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.issues, db.outbox], async () => {
      const existing = await db.issues.get(id)
      if (!existing) return
      
      const payload = { ...updates, updated_at: now, is_synced: 0 }
      await db.issues.update(id, payload)
      
      await db.outbox.add({
        action: 'update',
        table_name: 'issues',
        record_id: id,
        payload: payload,
        created_at: now
      })
    })
    triggerSync()
  }

  const deleteIssue = async (id: string) => {
    const now = new Date().toISOString()
    await db.transaction('rw', [db.issues, db.outbox], async () => {
      await db.issues.update(id, { is_deleted: 1, is_synced: 0, updated_at: now })
      await db.outbox.add({
        action: 'delete',
        table_name: 'issues',
        record_id: id,
        payload: null,
        created_at: now
      })
    })
    triggerSync()
  }

  return { issues, addIssue, updateIssue, deleteIssue }
}
