'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NodeType = 'folder' | 'note' | 'map' | 'link'

export interface WorkspaceNode {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  title: string
  type: NodeType
  url?: string | null
  parent_id?: string | null
  order: number
  note_id?: string | null
  map_id?: string | null
  connected_node_ids?: string[] | null
}

/**
 * Lấy toàn bộ danh sách Node của người dùng hiện tại
 */
export async function getNodes(): Promise<{ data: WorkspaceNode[]; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: [], error: 'Not authenticated' }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workspace_nodes')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true })

  return { data: data || [], error: error?.message || null }
}


/**
 * Hàm hỗ trợ lấy tên không trùng lặp (kiểu Obsidian)
 */
async function getUniqueTitle(supabase: any, userId: string, baseTitle: string, excludeNodeId?: string): Promise<string> {
  let query = supabase
    .from('workspace_nodes')
    .select('title')
    .eq('user_id', userId)
    .like('title', `${baseTitle}%`)
    
  if (excludeNodeId) {
    query = query.neq('id', excludeNodeId)
  }
  
  const { data } = await query
    
  if (!data || data.length === 0) {
    return baseTitle
  }
  
  // Dùng Set để tối ưu hóa việc kiểm tra tồn tại (O(1) thay vì O(N))
  const existingTitles = new Set(data.map((n: any) => n.title))
  if (!existingTitles.has(baseTitle)) {
    return baseTitle
  }
  
  let counter = 1
  while (existingTitles.has(`${baseTitle} (${counter})`)) {
    counter++
  }
  
  return `${baseTitle} (${counter})`
}

/**
 * Tạo một Node mới
 */
export async function createNode(node: Partial<WorkspaceNode>): Promise<{ data: WorkspaceNode | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  let titleToUse = node.title || 'Untitled'
  titleToUse = await getUniqueTitle(supabase, user.id, titleToUse)

  const { data, error } = await supabase
    .from('workspace_nodes')
    .insert([{ ...node, title: titleToUse, user_id: user.id }])
    .select()
    .single()

  return { data, error: error?.message || null }
}

/**
 * Cập nhật thông tin Node (Đổi tên, đổi cha, đổi thứ tự)
 */
export async function updateNode(id: string, updates: Partial<WorkspaceNode>): Promise<{ data: WorkspaceNode | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  let finalUpdates = { ...updates }
  if (finalUpdates.title) {
    finalUpdates.title = await getUniqueTitle(supabase, user.id, finalUpdates.title, id)
  }

  finalUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('workspace_nodes')
    .update(finalUpdates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error: error?.message || null }
}

/**
 * Xóa một Node (Sẽ tự động xóa các node con nhờ ON DELETE CASCADE)
 */
export async function deleteNode(id: string): Promise<{ error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  const supabase = await createClient()

  const userId = user.id

  // Hàm đệ quy dọn dẹp các tệp đính kèm thực tế của node và tất cả con cháu
  async function cleanNodeAndDescendants(nodeId: string) {
    const { data: children } = await supabase
      .from('workspace_nodes')
      .select('id, type, note_id, map_id')
      .eq('parent_id', nodeId)
      .eq('user_id', userId)

    if (children && children.length > 0) {
      for (const child of children) {
        await cleanNodeAndDescendants(child.id)
      }
    }

    const { data: node } = await supabase
      .from('workspace_nodes')
      .select('type, note_id, map_id')
      .eq('id', nodeId)
      .eq('user_id', userId)
      .single()

    if (node) {
      if (node.type === 'note' && node.note_id) {
        await supabase
          .from('mind_notes')
          .delete()
          .eq('id', node.note_id)
          .eq('user_id', userId)
      } else if (node.type === 'map' && node.map_id) {
        await supabase
          .from('mindmaps')
          .delete()
          .eq('id', node.map_id)
          .eq('user_id', userId)
      }
    }
  }

  // Thực hiện dọn dẹp đệ quy các tệp thực tế của con cháu trước khi xóa node
  await cleanNodeAndDescendants(id)

  const { error } = await supabase
    .from('workspace_nodes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return { error: error?.message || null }
}

/**
 * Lấy nội dung chi tiết của một Note để hiển thị vào khung soạn thảo
 */
export async function getNoteContent(noteId: string): Promise<{ data: { id: string, title: string, content: any } | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mind_notes')
    .select('id, title, content')
    .eq('id', noteId)
    .single()

  return { data, error: error?.message || null }
}

/**
 * Tạo một Note mới trong bảng mind_notes
 */
export async function createMindNote(title: string, id?: string): Promise<{ data: any | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  const insertData: any = { user_id: user.id, title }
  if (id) insertData.id = id

  const { data, error } = await supabase
    .from('mind_notes')
    .insert([insertData])
    .select()
    .single()

  return { data, error: error?.message || null }
}

/**
 * Cập nhật một Note trong bảng mind_notes
 */
export async function updateMindNote(id: string, updates: { title?: string, content?: any }): Promise<{ data: any | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  const now = new Date().toISOString()

  // Đồng bộ tiêu đề sang workspace_nodes nếu có cập nhật title
  if (updates.title) {
    await supabase
      .from('workspace_nodes')
      .update({ title: updates.title, updated_at: now })
      .eq('note_id', id)
      .eq('user_id', user.id)
  }

  const { data, error } = await supabase
    .from('mind_notes')
    .update({ ...updates, updated_at: now })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error: error?.message || null }
}

/**
 * Xóa một Note trong bảng mind_notes
 */
export async function deleteMindNote(id: string): Promise<{ error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  const supabase = await createClient()

  // Xóa node liên quan trong workspace_nodes trước
  await supabase
    .from('workspace_nodes')
    .delete()
    .eq('note_id', id)
    .eq('user_id', user.id)

  const { error } = await supabase
    .from('mind_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return { error: error?.message || null }
}

export interface Mindmap {
  id: string
  user_id: string
  title: string
  nodes: any
  edges: any
  created_at: string
  updated_at: string
}

export async function createMindmap(title: string = 'Untitled Canvas', id?: string): Promise<{ data: Mindmap | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  const insertData: any = { title, user_id: user.id }
  if (id) insertData.id = id

  const { data, error } = await supabase
    .from('mindmaps')
    .insert(insertData)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/workspace')
  return { data: data as Mindmap, error: null }
}

export async function loadMindmap(id: string): Promise<{ data: Mindmap | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mindmaps')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Mindmap, error: null }
}

export async function updateMindmap(
  id: string,
  updates: { nodes?: any; edges?: any; title?: string }
): Promise<{ data: Mindmap | null; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: null, error: 'Not authenticated' }
  const supabase = await createClient()

  const now = new Date().toISOString()

  // Đồng bộ tiêu đề sang workspace_nodes nếu đổi tên
  if (updates.title) {
    await supabase
      .from('workspace_nodes')
      .update({ title: updates.title, updated_at: now })
      .eq('map_id', id)
      .eq('user_id', user.id)
  }

  const { data, error } = await supabase
    .from('mindmaps')
    .update({ ...updates, updated_at: now })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  
  if (updates.title) {
    revalidatePath('/workspace')
  }
  return { data: data as Mindmap, error: null }
}

export async function deleteMindmap(id: string): Promise<{ error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }
  const supabase = await createClient()

  // Xóa node liên quan trong workspace_nodes trước
  await supabase
    .from('workspace_nodes')
    .delete()
    .eq('map_id', id)
    .eq('user_id', user.id)

  const { error } = await supabase
    .from('mindmaps')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/workspace')
  return { error: null }
}

/**
 * Kiểm tra xem một trang web có cho phép nhúng qua iframe hay không
 */
export async function checkUrlEmbeddable(url: string): Promise<{ embeddable: boolean; error: string | null }> {
  try {
    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('/')) {
      formattedUrl = `https://${formattedUrl}`
    }

    if (formattedUrl.startsWith('/')) {
      return { embeddable: true, error: null }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(formattedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    const xFrameOptions = response.headers.get('x-frame-options')?.toLowerCase()
    const csp = response.headers.get('content-security-policy')?.toLowerCase()

    let embeddable = true

    if (xFrameOptions) {
      if (xFrameOptions.includes('deny') || xFrameOptions.includes('sameorigin')) {
        embeddable = false
      }
    }

    if (csp) {
      if (csp.includes('frame-ancestors')) {
        if (!csp.includes('frame-ancestors *')) {
          embeddable = false
        }
      }
    }

    return { embeddable, error: null }
  } catch (err: any) {
    console.error(`Error checking embeddability for ${url}:`, err)
    // Nếu bị lỗi (chặn bot, DNS, Timeout), ta trả về embeddable = false để an toàn
    return { embeddable: false, error: err.message || 'Error occurred' }
  }
}

/**
 * Kiểm tra xem người dùng hiện tại đã đăng nhập phía máy chủ (cookie an toàn) chưa
 */
export async function checkAuth(): Promise<boolean> {
  const user = await getAuthUser()
  return !!user
}



/**
 * Tải toàn bộ nội dung tất cả Note của người dùng (dùng trong Sync Engine để bulk pull)
 */
export async function getAllNotes(): Promise<{ data: { id: string; user_id: string; title: string; content: any; created_at: string; updated_at: string }[]; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: [], error: 'Not authenticated' }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mind_notes')
    .select('id, user_id, title, content, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return { data: data || [], error: error?.message || null }
}

/**
 * Tải toàn bộ nội dung tất cả Mindmap của người dùng (dùng trong Sync Engine để bulk pull)
 */
export async function getAllMindmaps(): Promise<{ data: { id: string; user_id: string; title: string; nodes: any; edges: any; created_at: string; updated_at: string }[]; error: string | null }> {
  const user = await getAuthUser()
  if (!user) return { data: [], error: 'Not authenticated' }
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mindmaps')
    .select('id, user_id, title, nodes, edges, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return { data: data || [], error: error?.message || null }
}
