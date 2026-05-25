'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Settings Actions ---

export async function loadFocusSettings() {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Unauthorized' }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('focus_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    // No settings found, create default
    const { data: newData, error: createError } = await supabase
      .from('focus_settings')
      .insert([{ user_id: user.id }])
      .select()
      .single()
    
    if (createError) return { error: createError.message }
    return { data: newData }
  }

  if (error) return { error: error.message }
  return { data }
}

export async function updateFocusSettings(updates: any) {
  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  const supabase = await createClient()

  const { error } = await supabase
    .from('focus_settings')
    .update(updates)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { success: true }
}

// --- Tasks Actions ---

export async function loadFocusTasks() {
  const user = await getAuthUser()
  if (!user) return { data: [], error: 'Unauthorized' }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('focus_tasks')
    .select('*')
    .order('is_completed', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function createFocusTask(title: string, estimated_pomodoros: number, notes?: string, id?: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  const supabase = await createClient()

  const insertData: any = { 
    user_id: user.id,
    title,
    estimated_pomodoros,
    notes
  }

  if (id) {
    insertData.id = id
  }

  const { data, error } = await supabase
    .from('focus_tasks')
    .insert([insertData])
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { data }
}

export async function updateFocusTask(id: string, updates: any) {
  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  const supabase = await createClient()

  const { error } = await supabase
    .from('focus_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { success: true }
}

export async function deleteFocusTask(id: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  const supabase = await createClient()

  const { error } = await supabase
    .from('focus_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/pomodoro')
  return { success: true }
}

// --- Sessions Actions ---

export async function logFocusSession(taskId: string | null, sessionType: 'pomodoro' | 'short_break' | 'long_break', durationMinutes: number, id?: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  const supabase = await createClient()

  const insertData: any = {
    user_id: user.id,
    task_id: taskId,
    session_type: sessionType,
    duration_minutes: durationMinutes,
    is_completed: true,
    completed_at: new Date().toISOString()
  }

  if (id) {
    insertData.id = id
  }

  const { data, error } = await supabase
    .from('focus_sessions')
    .insert([insertData])
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }

  revalidatePath('/pomodoro')
  return { success: true }
}
