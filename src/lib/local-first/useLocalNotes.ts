import { useCallback } from 'react'
import { db } from './db'
import { triggerSync } from './sync-engine'

export function useLocalNotes() {
  /**
   * Cập nhật một Note trong IndexedDB và xếp hàng vào outbox để sync lên cloud.
   * Toàn bộ thao tác được bọc trong transaction để đảm bảo tính nguyên vẹn:
   * nếu bất kỳ bước nào fail, tất cả sẽ bị rollback.
   */
  const localUpdateNote = useCallback(async (noteId: string, updates: { title?: string; content?: any }) => {
    const now = new Date().toISOString()

    await db.transaction('rw', [db.mind_notes, db.workspace_nodes, db.outbox], async () => {
      await db.mind_notes.update(noteId, {
        ...updates,
        updated_at: now,
        is_synced: 0
      })

      // Nếu đổi tên, tự động cập nhật tiêu đề Node tương ứng trong cây thư mục
      if (updates.title) {
        const matchingNode = await db.workspace_nodes.where({ note_id: noteId }).first()
        if (matchingNode) {
          await db.workspace_nodes.update(matchingNode.id, {
            title: updates.title,
            updated_at: now,
            is_synced: 0
          })
          // Thêm outbox entry cho workspace_node title change
          await db.outbox.add({
            action: 'update',
            table_name: 'workspace_nodes',
            record_id: matchingNode.id,
            created_at: now,
            status: 'pending',
          })
        }
      }

      // Đẩy vào outbox để sync lên cloud
      await db.outbox.add({
        action: 'update',
        table_name: 'mind_notes',
        record_id: noteId,
        created_at: now,
        status: 'pending',
      })
    })

    // Kích hoạt đồng bộ hóa mạng chạy ngầm ngay sau khi cập nhật thành công ở local
    triggerSync()

    return { error: null }
  }, [])

  return {
    updateNote: localUpdateNote
  }
}
