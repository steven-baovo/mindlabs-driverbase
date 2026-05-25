import { useCallback } from 'react'
import { db } from './db'
import { triggerSync } from './sync-engine'

export function useLocalNotes() {
  /**
   * Cập nhật một Note trong IndexedDB và xếp hàng vào outbox để sync lên Supabase.
   * Dùng useCallback để tham chiếu hàm ổn định, tránh gây vòng lặp render vô hạn
   * khi được sử dụng trong dependency arrays của useEffect/useCallback ở các component con.
   */
  const localUpdateNote = useCallback(async (noteId: string, updates: { title?: string; content?: any }) => {
    const now = new Date().toISOString()

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
      }
    }

    // Đẩy vào outbox để sync lên cloud
    await db.outbox.add({
      action: 'update',
      table_name: 'mind_notes',
      record_id: noteId,
      payload: updates,
      created_at: now
    })

    // Kích hoạt đồng bộ hóa mạng chạy ngầm ngay sau khi cập nhật thành công ở local
    triggerSync()

    return { error: null }
  }, [])

  return {
    updateNote: localUpdateNote
  }
}
