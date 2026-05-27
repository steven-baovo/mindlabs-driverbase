import { useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, LocalWorkspaceNode } from './db'
import { scheduleSync } from './sync-engine'
import { WorkspaceNode } from '@/lib/node-utils'

export function useLocalWorkspace() {
  // Query trực tiếp từ database thực tế bằng useLiveQuery
  const liveNodes = useLiveQuery(() => db.workspace_nodes.where({ is_deleted: 0 }).toArray())

  // Dùng liveNodes nếu đã sẵn sàng, nếu chưa thì dùng mảng rỗng
  const nodes = liveNodes !== undefined ? liveNodes : []

  /**
   * Tạo node mới trong IndexedDB và xếp hàng vào outbox.
   * Dùng useCallback để tham chiếu hàm ổn định, tránh re-render vô hạn.
   */
  const localCreateNode = useCallback(async (node: Partial<WorkspaceNode>) => {
    const id = node.id || crypto.randomUUID()
    const now = new Date().toISOString()

    let noteId = node.note_id
    let mapId = node.map_id

    // Tạo tiêu đề không trùng lặp locally (tránh bị nhảy tên khi đồng bộ hóa)
    let titleToUse = node.title || 'Untitled'
    const existingNodes = await db.workspace_nodes.where({ is_deleted: 0 }).toArray()
    const existingTitles = new Set(existingNodes.map(n => n.title))
    if (existingTitles.has(titleToUse)) {
      let counter = 1
      while (existingTitles.has(`${titleToUse} (${counter})`)) {
        counter++
      }
      titleToUse = `${titleToUse} (${counter})`
    }

    // Tự động tạo note cục bộ nếu loại node là 'note' và chưa có note_id
    if (node.type === 'note' && !noteId) {
      noteId = crypto.randomUUID()
      const newNote = {
        id: noteId,
        user_id: node.user_id || '',
        title: titleToUse,
        content: null,
        created_at: now,
        updated_at: now,
        is_synced: 0,
        is_deleted: 0,
      }
      await db.mind_notes.put(newNote)
      await db.outbox.add({
        action: 'create',
        table_name: 'mind_notes',
        record_id: noteId,
        created_at: now,
        status: 'pending',
      })
    }

    // Tự động tạo canvas cục bộ nếu loại node là 'map' và chưa có map_id
    if (node.type === 'map' && !mapId) {
      mapId = crypto.randomUUID()
      const newMap = {
        id: mapId,
        user_id: node.user_id || '',
        title: titleToUse,
        nodes: [],
        edges: [],
        created_at: now,
        updated_at: now,
        is_synced: 0,
        is_deleted: 0,
      }
      await db.mindmaps.put(newMap)
      await db.outbox.add({
        action: 'create',
        table_name: 'mindmaps',
        record_id: mapId,
        created_at: now,
        status: 'pending',
      })
    }

    const newNode: LocalWorkspaceNode = {
      id,
      created_at: now,
      updated_at: now,
      user_id: node.user_id || '',
      title: titleToUse,
      type: node.type || 'folder',
      url: node.url || null,
      parent_id: node.parent_id || null,
      order: node.order || 0,
      note_id: noteId || null,
      map_id: mapId || null,
      connected_node_ids: node.connected_node_ids || null,
      is_synced: 0,
      is_deleted: 0
    }

    await db.workspace_nodes.put(newNode)

    await db.outbox.add({
      action: 'create',
      table_name: 'workspace_nodes',
      record_id: id,
      created_at: now,
      status: 'pending',
    })

    // Kích hoạt đồng bộ hóa mạng chạy ngầm ngay sau khi tạo thành công ở local
    scheduleSync()

    return { data: newNode, error: null }
  }, [])

  /**
   * Cập nhật node trong IndexedDB và xếp hàng vào outbox.
   * Dùng useCallback để tham chiếu hàm ổn định.
   */
  const localUpdateNode = useCallback(async (id: string, updates: Partial<WorkspaceNode>) => {
    const now = new Date().toISOString()

    await db.transaction('rw', [db.workspace_nodes, db.outbox], async () => {
      await db.workspace_nodes.update(id, {
        ...updates,
        updated_at: now,
        is_synced: 0
      })

      await db.outbox.add({
        action: 'update',
        table_name: 'workspace_nodes',
        record_id: id,
        created_at: now,
        status: 'pending',
      })
    })

    // Kích hoạt đồng bộ hóa mạng chạy ngầm ngay sau khi cập nhật thành công ở local
    scheduleSync()

    return { error: null }
  }, [])

  /**
   * Xóa node và toàn bộ con cháu trong IndexedDB (soft-delete).
   * Tất cả thao tác được thực hiện trong một transaction duy nhất để đảm bảo atomicity.
   */
  const localDeleteNode = useCallback(async (id: string) => {
    const now = new Date().toISOString()

    // Thu thập tất cả node cần xóa TRƯỚC khi vào transaction (transaction không cho phép async nesting phức tạp)
    const getDescendants = async (nodeId: string): Promise<LocalWorkspaceNode[]> => {
      let result: LocalWorkspaceNode[] = []
      const children = await db.workspace_nodes.where({ parent_id: nodeId }).toArray()
      for (const child of children) {
        result.push(child)
        const childDescendants = await getDescendants(child.id)
        result = result.concat(childDescendants)
      }
      return result
    }

    const descendants = await getDescendants(id)
    const targetNode = await db.workspace_nodes.get(id)
    const allToDelete = [targetNode, ...descendants].filter(Boolean) as LocalWorkspaceNode[]

    // Thu thập các note/canvas ID liên quan
    const noteIds = allToDelete.filter(n => n.type === 'note' && n.note_id).map(n => n.note_id!)
    const mapIds = allToDelete.filter(n => n.type === 'map' && n.map_id).map(n => n.map_id!)

    // Một transaction duy nhất cho toàn bộ thao tác xóa để đảm bảo tính nguyên vẹn
    await db.transaction('rw', [db.workspace_nodes, db.mind_notes, db.mindmaps, db.outbox], async () => {
      // Soft-delete tất cả workspace nodes
      for (const node of allToDelete) {
        await db.workspace_nodes.update(node.id, {
          is_deleted: 1,
          is_synced: 0,
          updated_at: now
        })
        await db.outbox.add({
          action: 'delete',
          table_name: 'workspace_nodes',
          record_id: node.id,
          created_at: now,
          status: 'pending',
        })
      }

      // Soft-delete các mind_notes liên quan
      for (const noteId of noteIds) {
        await db.mind_notes.update(noteId, { is_deleted: 1, is_synced: 0, updated_at: now })
        await db.outbox.add({
          action: 'delete',
          table_name: 'mind_notes',
          record_id: noteId,
          created_at: now,
          status: 'pending',
        })
      }

      // Soft-delete các mindmaps liên quan
      for (const mapId of mapIds) {
        await db.mindmaps.update(mapId, { is_deleted: 1, is_synced: 0, updated_at: now })
        await db.outbox.add({
          action: 'delete',
          table_name: 'mindmaps',
          record_id: mapId,
          created_at: now,
          status: 'pending',
        })
      }
    })

    // Kích hoạt đồng bộ hóa mạng chạy ngầm ngay sau khi xóa thành công ở local
    scheduleSync()

    return { error: null }
  }, [])

  return {
    nodes,
    liveNodesReady: liveNodes !== undefined,
    createNode: localCreateNode,
    updateNode: localUpdateNode,
    deleteNode: localDeleteNode
  }
}
