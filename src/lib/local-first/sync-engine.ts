import { db, LocalOutboxItem } from './db'
import { findOrCreateSyncFile, downloadSyncData, uploadSyncData } from '../gdrive-api'

let activeSyncPromise: Promise<void> | null = null
let lastSyncFinishedTime = 0

// State variables for dynamic sync optimization
let syncTimeout: ReturnType<typeof setTimeout> | null = null
let activeContinuousSyncTimeout: ReturnType<typeof setTimeout> | null = null
let lastActivityTime = Date.now()
let lastSuccessfulSyncTime = Date.now()
let lastActivityThrottleTime = 0


async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return null;
    const session = await res.json();
    return session?.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * Quét toàn bộ các table để tìm record có is_synced=0 nhưng chưa có outbox entry.
 * Điều này xảy ra khi app crash sau khi write local nhưng trước khi add outbox.
 */
async function recoverOrphanedItems(): Promise<number> {
  let recoveredCount = 0;
  try {
    const allOutboxItems = await db.outbox.toArray()
    const outboxLookup = new Set(
      allOutboxItems.map(item => `${item.table_name}:${item.record_id}`)
    )
    const outboxItemsToAdd: Omit<LocalOutboxItem, 'id'>[] = []

    const checkAndAdd = async (table: any, tableName: string) => {
      const unsynced = await table.where({ is_synced: 0 }).toArray()
      for (const item of unsynced) {
        const lookupKey = `${tableName}:${item.id}`
        if (!outboxLookup.has(lookupKey)) {
          outboxItemsToAdd.push({
            action: item.is_deleted === 1 ? 'delete' : 'update',
            table_name: tableName,
            record_id: item.id,
            created_at: new Date().toISOString(),
            status: 'pending',
          })
          recoveredCount++
        }
      }
    }

    await checkAndAdd(db.mind_notes, 'mind_notes');
    await checkAndAdd(db.mindmaps, 'mindmaps');
    await checkAndAdd(db.workspace_nodes, 'workspace_nodes');
    await checkAndAdd(db.focus_tasks, 'focus_tasks');
    await checkAndAdd(db.projects, 'projects');
    await checkAndAdd(db.cycles, 'cycles');
    await checkAndAdd(db.issues, 'issues');
    await checkAndAdd(db.focus_sessions, 'focus_sessions');
    await checkAndAdd(db.focus_settings, 'focus_settings');

    if (outboxItemsToAdd.length > 0) {
      console.log(`[Sync Engine] Recovered ${recoveredCount} orphaned item(s) into outbox.`)
      await db.outbox.bulkAdd(outboxItemsToAdd)
    }
  } catch (err) {
    console.error('[Sync Engine] Failed to recover orphaned items:', err)
  }
  return recoveredCount;
}

export function triggerSync(): Promise<void> {
  if (activeSyncPromise) {
    return activeSyncPromise
  }

  // Lưu vào biến tạm trước khi assign để tránh race condition style issue
  const promise = (async () => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.log('[Sync Engine] Offline - Tạm dừng đồng bộ.');
      return
    }

    // Tránh đồng bộ dồn dập khi mới khởi động/re-render liên tục mà không có thay đổi mới
    const now = Date.now();
    try {
      const outboxCount = await db.outbox.count();
      if (outboxCount === 0 && now - lastSyncFinishedTime < 15000) {
        return;
      }
    } catch (e) {
      console.error('[Sync Engine] Lỗi kiểm tra Outbox:', e);
    }

    console.log('[Sync Engine] Bắt đầu quá trình đồng bộ hóa...');
    const accessToken = await getAccessToken()
    if (!accessToken) {
      console.warn('[Sync Engine] Không tìm thấy mã thông báo (Access Token). Xin vui lòng ĐĂNG XUẤT và ĐĂNG NHẬP LẠI tài khoản Google của bạn để kích hoạt đồng bộ hóa với Google Drive.');
      return
    }

    try {
      console.log('[Sync Engine] Đang kết nối với Google Drive...');
      const fileId = await findOrCreateSyncFile(accessToken)
      if (!fileId) throw new Error("Không thể tạo hoặc tìm thấy tệp tin đồng bộ trên Google Drive.")
      console.log(`[Sync Engine] Kết nối Google Drive thành công. File ID: ${fileId}`);

      // 1. Recover orphaned items (record is_synced=0 nhưng không có outbox entry)
      await recoverOrphanedItems()

      // 2. Download remote JSON snapshot
      console.log('[Sync Engine] Đang tải dữ liệu từ Google Drive...');
      let remoteData = await downloadSyncData(accessToken, fileId) || {}

      // 3. Pull: Merge remote to local (Last-Write-Wins based on updated_at)
      console.log('[Sync Engine] Đang gộp dữ liệu từ mây xuống thiết bị cục bộ...');
      await pullRemoteChanges(remoteData)

      // 4. Push: Đọc outbox và apply lên remoteData
      const outboxItems = await db.outbox.orderBy('id').filter(i => i.status !== 'failed').toArray()
      if (outboxItems.length > 0) {
        // Dedup: Với mỗi (table_name, record_id), chỉ giữ entry mới nhất (id cao nhất).
        // Items đã được orderBy('id') ascending, nên entry sau sẽ ghi đè entry trước trong map.
        const dedupMap = new Map<string, LocalOutboxItem>()
        for (const item of outboxItems) {
          dedupMap.set(`${item.table_name}:${item.record_id}`, item)
        }
        const dedupedItems = Array.from(dedupMap.values())
        // Lưu TẤT CẢ id gốc để cleanup cả duplicate entries
        const allOutboxIds = outboxItems.map(i => i.id as number)

        console.log(`[Sync Engine] Phát hiện ${outboxItems.length} thay đổi (${dedupedItems.length} record duy nhất). Đang tiến hành tải lên...`);
        let modifiedRemote = false;

        for (const item of dedupedItems) {
          const table = item.table_name;
          if (!remoteData[table]) remoteData[table] = {};

          if (item.action === 'delete') {
            if (remoteData[table][item.record_id]) {
              delete remoteData[table][item.record_id];
              modifiedRemote = true;
            }
          } else {
            // Update / Create: luôn đọc state mới nhất từ local DB (không dùng payload từ outbox)
            const localRecord = await (db as any)[table].get(item.record_id);
            if (localRecord) {
              remoteData[table][item.record_id] = { ...localRecord, is_synced: 1 };
              modifiedRemote = true;
            }
          }
        }

        /**
         * Áp dụng trạng thái local sau khi sync và dọn sạch outbox.
         * - Delete actions: hard-delete local record (soft-delete đã được push lên remote thành công)
         * - Update/Create actions: đánh dấu is_synced = 1
         * - Xóa TẤT CẢ outbox entries gốc kể cả duplicates
         */
        const finalizeLocalState = async () => {
          for (const item of dedupedItems) {
            if (item.action === 'delete') {
              // Record đã được xóa khỏi remote → hard-delete local để dọn sạch
              await (db as any)[item.table_name].delete(item.record_id)
            } else {
              await (db as any)[item.table_name].update(item.record_id, { is_synced: 1 })
            }
          }
          await db.outbox.bulkDelete(allOutboxIds)
        }

        if (modifiedRemote) {
          // Upload the new merged JSON snapshot
          console.log('[Sync Engine] Đang tải Snapshot hợp nhất mới lên Google Drive...');
          const success = await uploadSyncData(accessToken, fileId, remoteData);
          if (success) {
            await finalizeLocalState()
            console.log('[Sync Engine] Đã tải lên và đánh dấu đồng bộ các tệp tin cục bộ thành công.');
          } else {
            console.error('[Sync Engine] Lỗi khi tải Snapshot mới lên Google Drive.');
          }
        } else {
          // Không có thay đổi cần đẩy lên remote, nhưng vẫn phải dọn sạch outbox
          await finalizeLocalState()
          console.log('[Sync Engine] Tất cả outbox items là no-op. Đã dọn sạch outbox.');
        }
      } else {
        console.log('[Sync Engine] Không có thay đổi cục bộ nào mới cần tải lên.');
      }

      // NOTE: Key này được đọc bởi cycle-engine.ts để tránh sinh chu kỳ trùng lặp
      // khi app khởi động lần đầu và đang đợi pull dữ liệu từ server về.
      if (typeof window !== 'undefined') {
        localStorage.setItem('mindlabs_initial_pull_done', 'true')
        window.dispatchEvent(new CustomEvent('mindlabs-sync-complete'))
      }
      lastSuccessfulSyncTime = Date.now()
      console.log('[Sync Engine] Đồng bộ hóa hoàn tất thành công!');
    } catch (err) {
      console.error('[Sync Engine] Đồng bộ hóa thất bại:', err)
    } finally {
      lastSyncFinishedTime = Date.now()
      // Nếu sync chạy thành công, dọn dẹp các timeouts pending vì dữ liệu đã được đồng bộ
      if (syncTimeout) {
        clearTimeout(syncTimeout)
        syncTimeout = null
      }
      clearContinuousSync()
    }
  })().finally(() => {
    activeSyncPromise = null
  })

  activeSyncPromise = promise
  return activeSyncPromise
}

async function pullRemoteChanges(remoteData: any) {
  // remoteData: { workspace_nodes: { id1: {...}, id2: {...} }, mind_notes: {...} }
  const tables = ['mind_notes', 'mindmaps', 'workspace_nodes', 'focus_tasks', 'projects', 'cycles', 'issues', 'focus_sessions', 'focus_settings'];

  for (const tableName of tables) {
    const tableRemoteData = remoteData[tableName];
    if (!tableRemoteData) continue;

    const localTable = (db as any)[tableName];
    const remoteRecords = Object.values(tableRemoteData) as any[];

    await db.transaction('rw', [localTable, db.outbox], async () => {
      for (const rItem of remoteRecords) {
        const localItem = await localTable.get(rItem.id);
        if (!localItem) {
          // Record chưa có ở local — thêm vào từ remote
          await localTable.put({ ...rItem, is_synced: 1 });
        } else {
          // Record đã có — chỉ update nếu không có pending local change VÀ remote mới hơn
          const pendingUpdates = await db.outbox.where({ record_id: rItem.id, table_name: tableName }).count();
          if (pendingUpdates === 0) {
            const remoteTime = new Date(rItem.updated_at).getTime() || 0;
            const localTime = new Date(localItem.updated_at).getTime() || 0;
            if (remoteTime > localTime) {
              await localTable.put({ ...rItem, is_synced: 1 });
            }
          }
        }
      }

      // Xử lý remote deletions: nếu record tồn tại local (is_synced=1) mà không có trên remote → xóa local.
      // FIX: Chỉ xóa nếu KHÔNG có outbox entry pending để tránh xóa nhầm thay đổi chưa được push.
      const remoteIds = new Set(remoteRecords.map(r => r.id));
      const localSyncedItems = await localTable.where({ is_synced: 1 }).toArray();
      for (const localItem of localSyncedItems) {
        if (!remoteIds.has(localItem.id)) {
          const pendingCount = await db.outbox
            .where({ record_id: localItem.id, table_name: tableName })
            .count();
          if (pendingCount === 0) {
            await localTable.delete(localItem.id);
          }
        }
      }
    });
  }
}

// Debouncer: giới hạn tần suất sync khi có nhiều thay đổi liên tiếp (ví dụ: live editing)
function clearContinuousSync() {
  if (activeContinuousSyncTimeout) {
    clearTimeout(activeContinuousSyncTimeout)
    activeContinuousSyncTimeout = null
  }
}

export function scheduleSync() {
  // 1. Debounce 15 giây (chờ dừng gõ hoàn toàn)
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    clearContinuousSync()
    triggerSync()
  }, 15000)

  // 2. Force Active Sync 1 phút (gõ liên tục không nghỉ)
  if (!activeContinuousSyncTimeout) {
    activeContinuousSyncTimeout = setTimeout(() => {
      console.log('[Sync Engine] Đang thao tác liên tục quá 1 phút. Kích hoạt Force Sync để đảm bảo an toàn...')
      if (syncTimeout) {
        clearTimeout(syncTimeout)
        syncTimeout = null
      }
      activeContinuousSyncTimeout = null
      triggerSync()
    }, 60000)
  }
}

function handleUserActivity() {
  const now = Date.now()
  const idleDuration = now - lastActivityTime
  lastActivityTime = now

  // Nếu không tương tác quá 10 phút (Idle) và vừa chạm chuột lại (Wake-up Pull)
  if (idleDuration >= 10 * 60 * 1000) {
    console.log('[Sync Engine] Tương tác trở lại sau hơn 10 phút nhàn rỗi. Kích hoạt Wake-up Pull...')
    triggerSync()
  }
}

// Throttle tương tác người dùng 5 giây để tránh quá tải CPU
export function handleUserActivityThrottled() {
  const now = Date.now()
  if (now - lastActivityThrottleTime > 5000) {
    lastActivityThrottleTime = now
    handleUserActivity()
  }
}

export function handleVisibilityChange() {
  if (typeof window === 'undefined') return

  if (document.visibilityState === 'visible') {
    console.log('[Sync Engine] Tab ứng dụng hiển thị trở lại.')
    
    // Tự động reload trang nếu hơn 12 giờ chưa sync thành công
    const now = Date.now()
    const timeSinceLastSync = now - lastSuccessfulSyncTime
    if (timeSinceLastSync > 12 * 60 * 60 * 1000) {
      console.log('[Sync Engine] Đã quá 12 giờ chưa đồng bộ thành công. Tải lại trang để làm sạch dữ liệu...')
      window.location.reload()
      return
    }

    // Chỉ đồng bộ kéo dữ liệu về nếu lần sync thành công gần nhất cách đây quá 1 phút
    if (timeSinceLastSync > 60000) {
      console.log('[Sync Engine] Đã quá 1 phút kể từ lần đồng bộ trước. Kích hoạt kéo dữ liệu mới...')
      triggerSync()
    } else {
      console.log(`[Sync Engine] Vừa đồng bộ thành công cách đây ${Math.round(timeSinceLastSync / 1000)}s. Bỏ qua kéo dữ liệu trùng lặp.`)
    }
    
    // Khôi phục trạng thái active
    lastActivityTime = now
  }
}

export function startSyncEngine() {
  if (typeof window === 'undefined') return () => {}

  // 1. Initial sync khi mount
  triggerSync()

  // 2. Khởi tạo trạng thái hoạt động
  lastActivityTime = Date.now()
  lastSuccessfulSyncTime = Date.now()

  // 3. Đăng ký các sự kiện tương tác để theo dõi hoạt động (Wake-up Pull)
  const activityEvents = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart']
  activityEvents.forEach(event => {
    window.addEventListener(event, handleUserActivityThrottled, { passive: true })
  })

  // 4. Đăng ký sự kiện chuyển tab (Visibility)
  window.addEventListener('visibilitychange', handleVisibilityChange)

  // 5. Đăng ký sự kiện tắt tab / trình duyệt để đồng bộ khẩn cấp
  const handleBeforeUnloadOrPageHide = () => {
    db.outbox.count().then(count => {
      if (count > 0) {
        console.log(`[Sync Engine] Đóng tab khi có ${count} thay đổi chưa lưu. Kích hoạt đồng bộ khẩn cấp...`)
        triggerSync()
      }
    }).catch(err => {
      console.error('[Sync Engine] Lỗi kiểm tra outbox khi đóng tab:', err)
    })
  }
  window.addEventListener('beforeunload', handleBeforeUnloadOrPageHide)
  window.addEventListener('pagehide', handleBeforeUnloadOrPageHide)

  // 6. Sync ngay khi có kết nối mạng trở lại
  const onOnline = () => {
    console.log('[Sync Engine] Thiết bị online trở lại. Đồng bộ ngay...')
    triggerSync()
  }
  window.addEventListener('online', onOnline)

  // 7. Debounced sync khi có thay đổi local (manual trigger)
  const onTrigger = () => scheduleSync()
  window.addEventListener('mindlabs-trigger-sync', onTrigger)

  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleUserActivityThrottled)
    })
    window.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnloadOrPageHide)
    window.removeEventListener('pagehide', handleBeforeUnloadOrPageHide)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('mindlabs-trigger-sync', onTrigger)
    
    clearContinuousSync()
    if (syncTimeout) {
      clearTimeout(syncTimeout)
      syncTimeout = null
    }
  }
}
