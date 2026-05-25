'use client'

import { useState, useEffect } from 'react'
import { useFocus } from '@/contexts/FocusContext'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, LocalFocusTask } from '@/lib/local-first/db'
import { triggerSync } from '@/lib/local-first/sync-engine'

interface Task {
  id: string
  title: string
  notes?: string | null
  estimated_pomodoros: number
  completed_pomodoros: number
  is_completed: boolean
}

export default function FocusTasks() {
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskEst, setNewTaskEst] = useState(1)
  const [newTaskNotes, setNewTaskNotes] = useState('')

  const { activeTaskId, setActiveTaskId } = useFocus()
  
  const isLoading = false

  // 1. Reactive tasks live query
  const tasks = useLiveQuery(() => db.focus_tasks.toArray())?.sort((a, b) => {
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  }) || []



  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    setIsAdding(false)
    
    const taskId = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const newTask: LocalFocusTask = {
      id: taskId,
      user_id: '',
      title: newTaskTitle,
      notes: newTaskNotes || undefined,
      estimated_pomodoros: newTaskEst,
      completed_pomodoros: 0,
      is_completed: false,
      created_at: now,
      updated_at: now,
      is_synced: 0
    }
    
    // Save to local DB instantly
    await db.focus_tasks.put(newTask)
    
    // Queue to outbox
    await db.outbox.add({
      action: 'create',
      table_name: 'focus_tasks',
      record_id: taskId,
      payload: {
        title: newTask.title,
        estimated_pomodoros: newTask.estimated_pomodoros,
        notes: newTask.notes
      },
      created_at: now
    })
    
    setNewTaskTitle('')
    setNewTaskEst(1)
    setNewTaskNotes('')
    
    if (tasks.length === 0) setActiveTaskId(taskId)
    
    triggerSync()
  }

  const handleToggleComplete = async (task: Task) => {
    const now = new Date().toISOString()
    const isCompleted = !task.is_completed
    
    await db.focus_tasks.update(task.id, {
      is_completed: isCompleted,
      updated_at: now,
      is_synced: 0
    })
    
    await db.outbox.add({
      action: 'update',
      table_name: 'focus_tasks',
      record_id: task.id,
      payload: { is_completed: isCompleted },
      created_at: now
    })
    
    triggerSync()
  }

  const handleDelete = async (id: string) => {
    const now = new Date().toISOString()
    if (activeTaskId === id) setActiveTaskId(null)
    
    await db.focus_tasks.delete(id)
    
    await db.outbox.add({
      action: 'delete',
      table_name: 'focus_tasks',
      record_id: id,
      payload: null,
      created_at: now
    })
    
    triggerSync()
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 sm:gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] tracking-tight font-medium text-secondary">Nhiệm vụ</h2>
        {tasks.length > 0 && (
          <span className="text-[13px] tracking-tight text-secondary/70 font-medium">{tasks.filter(t => t.is_completed).length}/{tasks.length}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-4 h-4 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 && !isAdding ? (
          <div className="text-center py-12 text-[13px] tracking-tight font-normal text-secondary/70">
            Danh sách nhiệm vụ trống
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-[24px] sm:rounded-3xl transition-all cursor-pointer ${
                  activeTaskId === task.id ? 'bg-black/[0.04]' : 'hover:bg-black/[0.02]'
                }`}
                onClick={() => setActiveTaskId(task.id)}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleComplete(task) }}
                  className={`shrink-0 transition-all ${task.is_completed ? 'text-primary' : 'text-black/20 hover:text-primary'}`}
                >
                  {task.is_completed ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Circle className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] tracking-tight font-bold truncate ${task.is_completed ? 'text-black/30 line-through' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  {task.notes && !task.is_completed && (
                    <p className="text-[13px] tracking-tight mt-0.5 sm:mt-1 text-secondary/70 truncate font-normal">
                      {task.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <span className="text-[13px] tracking-tight font-medium text-secondary/70">
                    {task.completed_pomodoros}/{task.estimated_pomodoros}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id) }}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-red-50 text-black/20 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isAdding ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-black/[0.04] border border-black/[0.05] flex flex-col gap-4"
            onSubmit={handleCreate}
          >
            <input
              autoFocus
              type="text"
              placeholder="Bạn đang tập trung vào điều gì?"
              className="w-full bg-transparent border-none outline-none text-[15px] sm:text-base font-bold placeholder:text-black/30 text-foreground"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-black/50">Dự kiến (Pomo)</span>
                <input
                  type="number"
                  min="1"
                  className="w-full sm:w-16 bg-transparent border-none outline-none font-black text-sm text-foreground"
                  value={newTaskEst}
                  onChange={e => setNewTaskEst(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-black/50 block mb-1">Ghi chú</span>
                <input
                  type="text"
                  placeholder="Thêm ghi chú (không bắt buộc)..."
                  className="w-full bg-transparent border-none outline-none text-[10px] sm:text-[11px] font-medium text-foreground placeholder:text-black/30"
                  value={newTaskNotes}
                  onChange={e => setNewTaskNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all disabled:opacity-50"
              >
                Lưu nhiệm vụ
              </button>
            </div>
          </motion.form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 w-full py-5 sm:py-6 rounded-[24px] sm:rounded-3xl border border-dashed border-black/10 flex items-center justify-center gap-3 text-black/40 hover:text-foreground hover:border-black/30 hover:bg-black/[0.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[13px] tracking-tight font-medium">Thêm nhiệm vụ mới</span>
          </button>
        )}
      </div>
    </div>
  )
}
