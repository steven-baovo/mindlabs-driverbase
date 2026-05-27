import Dexie, { type Table } from 'dexie'
import { WorkspaceNode } from '@/lib/node-utils'
export type { WorkspaceNode }

export interface LocalWorkspaceNode extends WorkspaceNode {
  is_synced: number; // 0: false, 1: true
  is_deleted: number; // 0: false, 1: true
}

export interface LocalMindNote {
  id: string
  user_id: string
  title: string
  content: any
  created_at: string
  updated_at: string
  is_synced: number
  is_deleted: number // 0: false, 1: true — dùng cho soft-delete
}

export interface LocalMindmap {
  id: string
  user_id: string
  title: string
  nodes: any
  edges: any
  created_at: string
  updated_at: string
  is_synced: number
  is_deleted: number // 0: false, 1: true — dùng cho soft-delete
}

export interface LocalFocusTask {
  id: string
  user_id: string
  title: string
  estimated_pomodoros: number
  completed_pomodoros: number
  is_completed: boolean
  notes?: string
  created_at: string
  updated_at: string
  is_synced: number
}

export interface LocalProject {
  id: string
  user_id: string
  name: string
  description?: string
  status: 'planned' | 'active' | 'paused' | 'completed' | 'canceled'
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  start_date?: string
  target_date?: string
  icon?: string
  created_at: string
  updated_at: string
  is_synced: number
  is_deleted: number
}

export interface LocalCycle {
  id: string
  user_id: string
  number: number
  name: string
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  is_synced: number
  is_deleted: number
}

export interface LocalIssue {
  id: string
  user_id: string
  number: number
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  project_id?: string | null
  cycle_id?: string | null
  parent_id?: string | null
  due_date?: string | null
  labels: string[]
  created_at: string
  updated_at: string
  is_synced: number
  is_deleted: number
}

export interface LocalFocusSession {
  id: string
  user_id: string
  task_id: string | null
  session_type: 'pomodoro' | 'short_break' | 'long_break'
  duration_minutes: number
  is_completed: boolean
  completed_at: string
  created_at: string
  updated_at: string
  is_synced: number
}

export interface LocalFocusSetting {
  id: string
  user_id: string
  pomodoro_duration: number
  short_break_duration: number
  long_break_duration: number
  auto_start_breaks: boolean
  auto_start_pomodoros: boolean
  long_break_interval: number
  alarm_sound: string
  ticking_sound: string
  created_at: string
  updated_at: string
  is_synced: number
}

export interface LocalOutboxItem {
  id?: number
  action: 'create' | 'update' | 'delete'
  table_name: 'workspace_nodes' | 'mind_notes' | 'mindmaps' | 'projects' | 'cycles' | 'issues' | 'focus_sessions' | 'focus_settings'
  record_id: string
  created_at: string
  status?: 'pending' | 'failed'
}

class MindlabsOfflineDatabase extends Dexie {
  workspace_nodes!: Table<LocalWorkspaceNode>
  mind_notes!: Table<LocalMindNote>
  mindmaps!: Table<LocalMindmap>
  projects!: Table<LocalProject>
  cycles!: Table<LocalCycle>
  issues!: Table<LocalIssue>
  focus_sessions!: Table<LocalFocusSession>
  focus_settings!: Table<LocalFocusSetting>
  outbox!: Table<LocalOutboxItem>

  constructor() {
    super('MindlabsOfflineDatabase')

    this.version(3).stores({
      workspace_nodes: 'id, parent_id, order, type, note_id, map_id, is_synced, is_deleted',
      mind_notes: 'id, is_synced',
      mindmaps: 'id, is_synced',
      focus_tasks: 'id, is_completed, is_synced',
      outbox: '++id, table_name, record_id, created_at, [record_id+table_name]'
    })

    this.version(4).stores({
      workspace_nodes: 'id, parent_id, order, type, note_id, map_id, is_synced, is_deleted',
      mind_notes: 'id, is_synced',
      mindmaps: 'id, is_synced',
      focus_tasks: 'id, is_completed, is_synced',
      projects: 'id, user_id, status, is_synced, is_deleted',
      cycles: 'id, user_id, is_active, is_synced, is_deleted',
      issues: 'id, user_id, project_id, cycle_id, status, priority, is_synced, is_deleted',
      outbox: '++id, table_name, record_id, created_at, [record_id+table_name]'
    })

    this.version(5).stores({
      workspace_nodes: 'id, parent_id, order, type, note_id, map_id, is_synced, is_deleted',
      mind_notes: 'id, is_synced',
      mindmaps: 'id, is_synced',
      focus_tasks: 'id, is_completed, is_synced',
      projects: 'id, user_id, status, is_synced, is_deleted',
      cycles: 'id, user_id, is_active, is_synced, is_deleted',
      issues: 'id, user_id, project_id, cycle_id, status, priority, is_synced, is_deleted',
      focus_sessions: 'id, user_id, task_id, session_type, is_synced',
      focus_settings: 'id, user_id, is_synced',
      outbox: '++id, table_name, record_id, created_at, [record_id+table_name]'
    })

    // v6: Thêm is_deleted index cho mind_notes và mindmaps để hỗ trợ soft-delete
    this.version(6).stores({
      workspace_nodes: 'id, parent_id, order, type, note_id, map_id, is_synced, is_deleted',
      mind_notes: 'id, is_synced, is_deleted',
      mindmaps: 'id, is_synced, is_deleted',
      focus_tasks: 'id, is_completed, is_synced',
      projects: 'id, user_id, status, is_synced, is_deleted',
      cycles: 'id, user_id, is_active, is_synced, is_deleted',
      issues: 'id, user_id, project_id, cycle_id, status, priority, is_synced, is_deleted',
      focus_sessions: 'id, user_id, task_id, session_type, is_synced',
      focus_settings: 'id, user_id, is_synced',
      outbox: '++id, table_name, record_id, created_at, [record_id+table_name]'
    })

    // v7: Loại bỏ hoàn toàn bảng focus_tasks để hợp nhất vào issues
    this.version(7).stores({
      workspace_nodes: 'id, parent_id, order, type, note_id, map_id, is_synced, is_deleted',
      mind_notes: 'id, is_synced, is_deleted',
      mindmaps: 'id, is_synced, is_deleted',
      projects: 'id, user_id, status, is_synced, is_deleted',
      cycles: 'id, user_id, is_active, is_synced, is_deleted',
      issues: 'id, user_id, project_id, cycle_id, status, priority, is_synced, is_deleted',
      focus_sessions: 'id, user_id, task_id, session_type, is_synced',
      focus_settings: 'id, user_id, is_synced',
      outbox: '++id, table_name, record_id, created_at, [record_id+table_name]'
    })
  }
}

export const db = new MindlabsOfflineDatabase()
