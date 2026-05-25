'use server'

import { createClient } from '@/lib/supabase/server'

function sanitizePayload(payload: any) {
  const sanitized = { ...payload }
  delete sanitized.is_synced
  delete sanitized.is_deleted
  return sanitized
}

// --- PROJECTS ---

export async function createProject(payload: any) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...sanitizePayload(payload), user_id: session.user.id }])
    .select()
    .single()

  return { data, error: error?.message }
}

export async function updateProject(id: string, payload: any) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('projects')
    .update(sanitizePayload(payload))
    .eq('id', id)
    .select()
    .single()

  return { data, error: error?.message }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  return { error: error?.message }
}

export async function getAllProjects() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized', data: null }

  const { data, error } = await supabase
    .from('projects')
    .select('*')

  return { data, error: error?.message }
}

// --- CYCLES ---

export async function createCycle(payload: any) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('cycles')
    .insert([{ ...sanitizePayload(payload), user_id: session.user.id }])
    .select()
    .single()

  return { data, error: error?.message }
}

export async function updateCycle(id: string, payload: any) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('cycles')
    .update(sanitizePayload(payload))
    .eq('id', id)
    .select()
    .single()

  return { data, error: error?.message }
}

export async function deleteCycle(id: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('cycles')
    .delete()
    .eq('id', id)

  return { error: error?.message }
}

export async function getAllCycles() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized', data: null }

  const { data, error } = await supabase
    .from('cycles')
    .select('*')

  return { data, error: error?.message }
}

// --- ISSUES ---

export async function createIssue(payload: any) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('issues')
    .insert([{ ...sanitizePayload(payload), user_id: session.user.id }])
    .select()
    .single()

  return { data, error: error?.message }
}

export async function updateIssue(id: string, payload: any) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('issues')
    .update(sanitizePayload(payload))
    .eq('id', id)
    .select()
    .single()

  return { data, error: error?.message }
}

export async function deleteIssue(id: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id)

  return { error: error?.message }
}

export async function getAllIssues() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized', data: null }

  const { data, error } = await supabase
    .from('issues')
    .select('*')

  return { data, error: error?.message }
}
