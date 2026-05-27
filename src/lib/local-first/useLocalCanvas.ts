import { useCallback } from 'react'
import { db } from './db'
import { scheduleSync } from './sync-engine'


export function useLocalCanvas() {
  /**
   * Tải canvas từ IndexedDB.
   * Dùng useCallback để tham chiếu hàm ổn định, tránh re-render vô hạn.
   */
  const getLocalCanvas = useCallback(async (mapId: string) => {
    const canvas = await db.mindmaps.get(mapId)
    if (canvas) {
      console.log(`[Local Canvas] Loaded canvas ${mapId} từ IndexedDB.`)
      return { data: canvas, error: null }
    }

    console.log(`[Local Canvas] Canvas ${mapId} chưa có ở local. Vui lòng đợi đồng bộ từ Server.`)
    return { data: null, error: 'Canvas not found locally' }
  }, [])

  /**
   * Cập nhật canvas trong IndexedDB và xếp hàng vào outbox.
   * Toàn bộ thao tác được bọc trong transaction để đảm bảo tính nguyên vẹn.
   */
  const localUpdateCanvas = useCallback(async (mapId: string, updates: { title?: string; nodes?: any; edges?: any }) => {
    const now = new Date().toISOString()

    await db.transaction('rw', [db.mindmaps, db.workspace_nodes, db.outbox], async () => {
      await db.mindmaps.update(mapId, {
        ...updates,
        updated_at: now,
        is_synced: 0
      })

      // Nếu đổi tên, tự động cập nhật tiêu đề Node tương ứng trong cây thư mục
      if (updates.title) {
        const matchingNode = await db.workspace_nodes.where({ map_id: mapId }).first()
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

      await db.outbox.add({
        action: 'update',
        table_name: 'mindmaps',
        record_id: mapId,
        created_at: now,
        status: 'pending',
      })
    })

    // Kích hoạt đồng bộ hóa mạng chạy ngầm ngay sau khi cập nhật thành công ở local
    scheduleSync()

    return { error: null }
  }, [])

  return {
    getCanvas: getLocalCanvas,
    updateCanvas: localUpdateCanvas
  }
}
