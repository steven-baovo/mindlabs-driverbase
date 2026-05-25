import { useCallback } from 'react'
import { db } from './db'
import { triggerSync } from './sync-engine'


export function useLocalCanvas() {
  /**
   * Tải canvas từ IndexedDB hoặc Server.
   * Dùng useCallback để tham chiếu hàm ổn định, tránh re-render vô hạn.
   */
  const getLocalCanvas = useCallback(async (mapId: string) => {
    // 1. Kiểm tra local
    const canvas = await db.mindmaps.get(mapId)
    if (canvas) {
      console.log(`[Local Canvas] Loaded canvas ${mapId} từ IndexedDB.`)
      return { data: canvas, error: null }
    }

    // 2. Not found in local DB
    console.log(`[Local Canvas] Canvas ${mapId} chưa có ở local. Vui lòng đợi đồng bộ từ Server.`)
    return { data: null, error: 'Canvas not found locally' }
    return { data: null, error: 'Canvas not found' }
  }, [])

  /**
   * Cập nhật canvas trong IndexedDB và xếp hàng vào outbox.
   * Dùng useCallback để tham chiếu hàm ổn định.
   */
  const localUpdateCanvas = useCallback(async (mapId: string, updates: { title?: string; nodes?: any; edges?: any }) => {
    const now = new Date().toISOString()

    // Cập nhật local
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
      }
    }

    // Đẩy vào outbox
    await db.outbox.add({
      action: 'update',
      table_name: 'mindmaps',
      record_id: mapId,
      payload: updates,
      created_at: now
    })

    // Kích hoạt đồng bộ hóa mạng chạy ngầm ngay sau khi cập nhật thành công ở local
    triggerSync()

    return { error: null }
  }, [])

  return {
    getCanvas: getLocalCanvas,
    updateCanvas: localUpdateCanvas
  }
}
