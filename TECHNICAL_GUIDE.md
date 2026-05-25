# Hướng Dẫn Kỹ Thuật Chi Tiết (Mindlabs Tech Guide for AI Agents)

Tài liệu này cung cấp sơ đồ kiến trúc, nguyên tắc thiết kế và hướng dẫn phát triển chi tiết cho hệ thống **Mindlabs**, đặc biệt tập trung vào cơ chế **Local-First**, **Sync Engine**, **Cycle Engine (Agile)**, **State Management / Focus Engine**, và **Routing**. 

Bất kỳ AI Agent nào khi tiếp quản dự án này chỉ cần đọc kỹ tài liệu này là có thể nắm bắt và triển khai các tác vụ phát triển tiếp theo mà không cần quét lại toàn bộ codebase.

> [!TIP]
> **Bản đồ Tính năng & Thư mục**:
> Để xem sơ đồ tính năng tổng quan, danh sách công nghệ và bản đồ cấu trúc thư mục của dự án Mindlabs, hãy đọc **[TECHNICAL_MAP.md](file:///d:/mindlabs/TECHNICAL_MAP.md)**.

---

## 🏗️ 1. Nguyên Tắc Thiết Kế Cốt Lõi (Architecture Principles)

Hệ thống hoạt động theo mô hình **Local-First Hybrid Sync**:
1. **Local-First**: Mọi hoạt động của người dùng (tạo mới, sửa, xóa dự án, note, canvas, tasks, issues) được ghi trực tiếp vào cơ sở dữ liệu local (**IndexedDB** thông qua thư viện **Dexie.js**) lập tức. Trải nghiệm người dùng đạt tốc độ tức thì (0ms latency).
2. **Outbox Pattern**: Mọi hành động ghi (create, update, delete) đều sinh ra một bản ghi trong bảng `outbox` cục bộ.
3. **Background Sync**: Một **Sync Engine** chạy nền sẽ tuần tự quét bảng `outbox` và thực thi đồng bộ hai chiều bất đối xứng lên **Supabase (PostgreSQL)**, đồng thời kéo các thay đổi mới nhất từ server về local.
4. **Conflict Resolution**: Giải quyết xung đột theo nguyên tắc **Last-Write-Wins (LWW)** dựa trên trường `updated_at` (timestamp UTC) ở cấp độ bản ghi.

---

## 💾 2. Cơ Sở Dữ Liệu Local (Dexie.js & IndexedDB)

Mọi cấu hình schema và phiên bản của cơ sở dữ liệu cục bộ nằm tại `src/lib/local-first/db.ts`.

### A. Lịch sử Phiên bản Bảng (DB Schema Versions)
*   **Version 3**: Khởi chạy cơ bản `workspace_nodes`, `mind_notes`, `mindmaps`, `focus_tasks`, và `outbox`.
*   **Version 4**: Thêm các bảng Agile Linear-style (`projects`, `cycles`, `issues`).
*   **Version 5**: Bổ sung hệ thống đếm giờ tập trung nâng cao (`focus_sessions`, `focus_settings`).

### B. Interface Đầy Đủ của 9 Bảng Dữ Liệu Thực Tế (`db.ts`):

```typescript
// 1. Quản lý cây thư mục và nodes liên kết
export interface LocalWorkspaceNode {
  id: string; // UUID v4 tạo lập tức tại client
  user_id: string;
  title: string;
  type: 'folder' | 'note' | 'map' | 'link';
  url?: string | null;
  parent_id: string | null; // Cây phân cấp lồng nhau
  order: number;
  note_id: string | null; // Tham chiếu đến bảng mind_notes
  map_id: string | null;  // Tham chiếu đến bảng mindmaps
  connected_node_ids?: string[] | null; // Liên kết đồ thị kiến thức (Graph View)
  created_at: string;
  updated_at: string;
  is_synced: number; // 0: Chưa đồng bộ, 1: Đã đồng bộ
  is_deleted: number; // 0: Bình thường, 1: Đã đánh dấu xóa (Soft Delete)
}

// 2. Nội dung văn bản phong phú của Tiptap Editor
export interface LocalMindNote {
  id: string;
  user_id: string;
  title: string;
  content: any; // JSON của editor content
  created_at: string;
  updated_at: string;
  is_synced: number;
}

// 3. Toạ độ các Node & Edge trên Canvas sơ đồ tư duy
export interface LocalMindmap {
  id: string;
  user_id: string;
  title: string;
  nodes: any; // JSON array của nodes
  edges: any; // JSON array của edges
  created_at: string;
  updated_at: string;
  is_synced: number;
}

// 4. Các nhiệm vụ tập trung đi kèm Pomodoro
export interface LocalFocusTask {
  id: string;
  user_id: string;
  title: string;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_synced: number;
}

// 5. Dự án Agile Linear-style
export interface LocalProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'canceled';
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  target_date?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  is_synced: number;
  is_deleted: number;
}

// 6. Các chu kỳ sprint phát triển dự án
export interface LocalCycle {
  id: string;
  user_id: string;
  number: number; // Số thứ tự chu kỳ tự tăng cục bộ
  name: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  is_synced: number;
  is_deleted: number;
}

// 7. Các Issues chi tiết thuộc dự án/chu kỳ
export interface LocalIssue {
  id: string;
  user_id: string;
  number: number; // Số issue tự tăng cục bộ
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  project_id?: string | null;
  cycle_id?: string | null;
  parent_id?: string | null;
  due_date?: string | null;
  labels: string[];
  created_at: string;
  updated_at: string;
  is_synced: number;
  is_deleted: number;
}

// 8. Lịch sử chi tiết các phiên đếm giờ tập trung
export interface LocalFocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  session_type: 'pomodoro' | 'short_break' | 'long_break';
  duration_minutes: number;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
  is_synced: number;
}

// 9. Cài đặt cá nhân hóa Pomodoro
export interface LocalFocusSetting {
  id: string;
  user_id: string;
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  auto_start_breaks: boolean;
  auto_start_pomodoros: boolean;
  long_break_interval: number;
  alarm_sound: string;
  ticking_sound: string;
  created_at: string;
  updated_at: string;
  is_synced: number;
}

// Hàng đợi đồng bộ hóa các lệnh thay đổi
export interface LocalOutboxItem {
  id?: number;
  action: 'create' | 'update' | 'delete';
  table_name: 'workspace_nodes' | 'mind_notes' | 'mindmaps' | 'focus_tasks' | 'projects' | 'cycles' | 'issues' | 'focus_sessions' | 'focus_settings';
  record_id: string;
  payload: any;
  created_at: string;
  status?: 'pending' | 'failed';
  retry_count?: number;
  error_msg?: string;
}
```

> [!IMPORTANT]
> **Soft Delete (`is_deleted = 1`)**:
> Để tránh mất mát dữ liệu và đảm bảo tính nhất quán của Sync Engine, chúng ta **không thực hiện xóa cứng (hard delete)** các bản ghi chính (Nodes, Projects, Cycles, Issues) trên local. Thay vào đó, cập nhật `is_deleted = 1` và `is_synced = 0`. Sync Engine sẽ đồng bộ trạng thái xóa này lên server, sau đó server mới tiến hành xóa hoặc cập nhật trạng thái tương ứng.

---

## 🔄 3. Cơ Chế Đồng Bộ Hóa Tự Phục Hồi (Self-Healing Sync Engine)

Sync Engine được triển khai tại `src/lib/local-first/sync-engine.ts`. Đây là thành phần cốt lõi đảm bảo khả năng hoạt động offline-first ổn định.

### Sơ đồ Luồng Đồng Bộ (Sync Engine Flow):

```mermaid
sequenceDiagram
    participant UI as Giao diện UI & Hooks
    participant LDB as Local IndexedDB
    participant OUT as Outbox Table
    participant SE as Sync Engine
    participant SUP as Supabase (Server)

    UI->>LDB: Viết dữ liệu (is_synced = 0)
    UI->>OUT: Ghi lệnh thay đổi (create/update/delete) vào outbox
    UI->>SE: Trigger Sync (syncEngine.triggerSync())
    Note over SE: Kiểm tra mạng (navigator.onLine) và phiên đăng nhập (Auth Session)
    SE->>LDB: Quét và tự vá các node mồ côi (Self-Healing Orphan Recovery)
    SE->>OUT: Đọc bản ghi outbox tuần tự theo ID tăng dần
    SE->>SE: Kiểm tra & Đồng bộ trước các Note/Map phụ thuộc (Foreign Key Check)
    SE->>SUP: Thực thi server actions tương ứng
    alt Thành công hoặc Bị trùng (Duplicate Key)
        SE->>LDB: Cập nhật is_synced = 1
        SE->>OUT: Xóa bản ghi lệnh trong outbox
    alt Server Báo Lỗi "Không Tìm Thấy Bản Ghi" (Stale Update)
        SE->>SE: handleSelfHealingUpdate() tự tạo lại bản ghi trên server
        SE->>SUP: Thực hiện lại lệnh update
        SE->>LDB: Cập nhật is_synced = 1
        SE->>OUT: Xóa outbox item
    end
    SE->>SUP: Kéo (Pull) dữ liệu mới có updated_at > local_last_sync
    SUP-->>SE: Trả về danh sách dữ liệu mới từ các thiết bị khác
    SE->>LDB: Ghi đè vào cục bộ nếu dữ liệu server mới hơn (Last-Write-Wins)
```

### Các Hàm Tự Phục Hồi Đặc Biệt:
*   `handleSelfHealingUpdate`: Nếu server báo lỗi không tìm thấy bản ghi khi thực hiện lệnh `update` (ví dụ do server bị mất dữ liệu hoặc outbox lỗi thời), hàm này sẽ tự động truy vấn dữ liệu cục bộ hiện tại, gọi action tạo mới (`create`) trên server để tái tạo bản ghi, sau đó chạy lại lệnh `update` ban đầu.
*   `recoverOrphanedItems`: Quét toàn bộ cơ sở dữ liệu local để tìm các bản ghi có trạng thái `is_synced = 0` nhưng bị thiếu hàng đợi tương ứng trong bảng `outbox` (ví dụ do tab bị tắt đột ngột trước khi hoàn tất transaction ghi). Hàm này sẽ tự phục hồi bằng cách sinh lại các outbox items tương ứng để đảm bảo dữ liệu không bao giờ bị kẹt lại local.
*   `ensureReferencedEntitiesSynced`: Trước khi tạo hoặc cập nhật một `WorkspaceNode` dạng Note hoặc Mindmap, hàm này sẽ quét kiểm tra xem Note/Mindmap đi kèm đã được đồng bộ lên server chưa. Nếu chưa, nó sẽ tiến hành đồng bộ Note/Mindmap đó trước để tránh lỗi vi phạm ràng buộc khóa ngoại (foreign key constraints) trên Postgres của Supabase.

---

## 🎣 4. Các Custom Hooks & Contexts Sử Dụng Trong UI

Để tương tác trực quan với dữ liệu cục bộ một cách reactive, hãy sử dụng các hooks tại `src/lib/local-first/`:

### 1. `useLocalWorkspace()`
Quản lý cây thư mục và cấu trúc nodes của dự án.
*   `nodes`: Danh sách cây node hiện tại (được cache qua `localStorage` cho khung hình đầu tiên để tải tức thì, sau đó tự cập nhật reactive từ live query IndexedDB).
*   `createNode(nodeData)`: Tạo node mới (tự động khởi tạo `mind_notes` hoặc `mindmaps` cục bộ nếu loại node là `note` hoặc `map`).
*   `updateNode(id, updates)`: Cập nhật thông tin node.
*   `deleteNode(id)`: Thực hiện đệ quy đánh dấu soft delete cho node mục tiêu cùng toàn bộ con cháu trong cây phân cấp và các tài liệu đính kèm.

### 2. `useLocalNotes()`
Quản lý chỉnh sửa nội dung rich-text của ghi chú.
*   `updateNote(noteId, updates)`: Cập nhật nội dung văn bản. Nếu tài liệu bị đổi tên, hàm tự động đổi tên node hiển thị tương ứng trong cây thư mục để giữ tính nhất quán.

### 3. `useLocalCanvas()`
Quản lý tải và lưu sơ đồ tư duy kéo thả.
*   `getCanvas(mapId)`: Ưu tiên tải từ IndexedDB, nếu không có sẽ tự động gửi yêu cầu bất đồng bộ lên Server, tải về và lưu vào IndexedDB.
*   `updateCanvas(mapId, updates)`: Cập nhật nodes, edges của canvas, đồng thời tự động cập nhật tiêu đề Node tương quan trong thư mục nếu canvas được đổi tên.

### 4. `useLocalTasks()` (Projects, Cycles, Issues)
Cung cấp bộ 3 hooks phục vụ hệ thống quản trị Agile Linear-style dưới sự hỗ trợ của `TasksProvider`:
*   `useLocalProjects()`: CRUD dự án cục bộ (`addProject`, `updateProject`, `deleteProject`).
*   `useLocalCycles()`: CRUD chu kỳ cục bộ (`addCycle`, `updateCycle`, `deleteCycle`).
*   `useLocalIssues()`: CRUD các đầu việc chi tiết cục bộ (`addIssue`, `updateIssue`, `deleteIssue`).

### 5. `useFocus()` & `FocusProvider` (`src/contexts/FocusContext.tsx`)
Bộ đếm thời gian tập trung Pomodoro tích hợp:
*   **Tốc độ Perceived Performance**: Tải cài đặt Pomodoro từ `localStorage` đồng bộ ngay frame đầu tiên để tránh chớp màn hình, sau đó dùng cơ chế SWR gọi async action `loadFocusSettings()` chạy ngầm cập nhật sau 1 giây.
*   **Logic Hoàn Thành Phiên**: 
    *   Tự động phát âm thanh báo thức (`alarm.wav`) và bắn thông báo trình duyệt (Browser Notification).
    *   Ghi vết lịch sử vào bảng `focus_sessions` cục bộ + Outbox.
    *   Tự động tăng số Pomodoro hoàn thành trong `focus_tasks` trực tiếp tại local DB + Outbox.
    *   Tự động chuyển đổi chế độ gối đầu: `pomodoro` -> `short_break` -> `pomodoro` -> `long_break` (dựa trên tham số `long_break_interval`).

---

## ⏱️ 5. Bộ Tự Động Hóa Chu Kỳ (Cycle Engine)

Quy trình tự động hóa chu kỳ được quản lý hoàn toàn ở client thông qua `runAutoCycleEngine` tại `src/lib/local-first/cycle-engine.ts`:

1.  **Khởi tạo chu kỳ gối đầu**: Nếu dự án chưa có chu kỳ nào, hệ thống tự động khởi tạo gối đầu 3 chu kỳ đầu tiên với độ dài xác định (mặc định là 1 tuần cho mỗi chu kỳ) bắt đầu từ ngày đầu tuần quy định (mặc định thứ Hai).
2.  **Tự động chuyển giao (Auto-Rollover)**: Khi chu kỳ hiện tại hết hạn, Cycle Engine sẽ tự động:
    *   Tắt kích hoạt chu kỳ cũ.
    *   Kích hoạt chu kỳ tiếp theo trong hàng đợi.
    *   Tự động di chuyển (transfer) toàn bộ các Issues chưa hoàn thành (trạng thái khác `done` và `canceled`) sang chu kỳ mới để đảm bảo tính liên tục của công việc.
3.  **Duy trì chu kỳ tương lai**: Hệ thống luôn đảm bảo duy trì tối thiểu ít nhất 2 chu kỳ tương lai gối đầu sẵn sàng trong cơ sở dữ liệu.

---

## 🚦 6. State Management & Định Tuyến (Routing)

### SPA Query Router trong Tasks:
Module `/tasks` sử dụng định tuyến Single Page Application (SPA) thông qua các tham số truy vấn (URL Query Parameters) giúp phản hồi tức thì 0ms mà không load lại trang:
*   `?issue=<id>`: Hiển thị chi tiết công việc.
*   `?project=<id>`: Hiển thị chi tiết và danh sách Issue thuộc dự án.
*   `?cycle=<id>`: Hiển thị chi tiết và tiến độ chu kỳ.
*   `?view=cycles`: Hiển thị danh sách toàn bộ chu kỳ hiện có.
*   `?view=projects`: Hiển thị danh sách dự án.
*   *Mặc định*: Hiển thị danh sách tổng quan các Issues.

### Lỗi Kẹt Định Tuyến Next.js (Silent Router Hang):
Trong Next.js App Router, đôi khi việc gọi `router.replace()` hoặc `router.push()` trong các component lồng nhau quá sâu hoặc chạy dưới middleware đặc biệt có thể gây ra hiện tượng **kẹt định tuyến** (trang bị đơ, không chuyển hướng, console không báo lỗi).
*   **Giải pháp**: Thay thế `router.replace('/workspace')` bằng `window.location.replace('/workspace')` ở các trang điều hướng trung gian như `src/app/(frontend)/workspace/page.tsx` để đảm bảo trình duyệt giải phóng bộ nhớ và tải lại router sạch sẽ.

---

## 🌐 7. Cấu Hình PWA & Vượt Qua Middleware (Bypass Auth Middleware)

Mindlabs là ứng dụng Progressive Web App (PWA) có khả năng cài đặt lên màn hình điện thoại/máy tính và hoạt động offline nhờ Service Worker (`sw.js`).

### Xung Đột Middleware & Cách Giải Quyết:
Thông thường, Next.js Middleware (cấu hình tại `src/proxy.ts` hoặc `src/lib/supabase/middleware.ts`) sẽ chặn tất cả các yêu cầu không có session đăng nhập và chuyển hướng về `/login`.
Tuy nhiên, trình duyệt cần truy cập các tệp tĩnh phục vụ PWA như `/manifest.json`, `/sw.js`, và các tệp script Service Worker trước khi người dùng đăng nhập để đăng ký. Nếu các tệp này bị chuyển hướng sang `/login`, trình duyệt sẽ parse lỗi cú pháp JSON (`SyntaxError`) hoặc Service Worker không hoạt động.

### Danh Sách Ngoại Lệ (Bypass Rules):
Khi thêm tệp tĩnh mới phục vụ PWA hoặc asset, bắt buộc phải cập nhật 2 nơi:

1.  **Trong `src/lib/supabase/middleware.ts`**:
    Thêm tên tệp tĩnh vào hàm kiểm tra ngoại lệ `isStaticOrNextPath`:
    ```typescript
    const isStaticOrNextPath = (pathname: string) => {
      return (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') || // Bỏ qua các tệp có đuôi mở rộng như .json, .js, .png
        pathname === '/manifest.json' ||
        pathname === '/sw.js' ||
        pathname.startsWith('/workbox-') ||
        pathname.startsWith('/swe-worker-')
      );
    };
    ```

2.  **Trong `src/proxy.ts`**:
    Cấu hình biểu thức chính quy (Matcher regex) chuẩn xác để bỏ qua các tài nguyên PWA và ảnh tĩnh:
    ```typescript
    export const config = {
      matcher: [
        /*
         * Khớp tất cả các request ngoại trừ:
         * - _next/static, _next/image (tệp tĩnh/ảnh)
         * - favicon.ico, manifest.json, sw.js (tệp cấu hình PWA)
         * - workbox-*.js, swe-worker-*.js (scripts bổ trợ của next-pwa)
         * - tất cả các asset ảnh tĩnh (.svg, .png, .jpg, .jpeg, .gif, .webp)
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|workbox-.*\\.js|swe-worker-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      ],
    };
    ```

---

## 🛠️ 8. Hướng Dẫn Phát Triển Tác Vụ Mới (Quick Runbook for Future Agents)

Khi nhận yêu cầu thêm bảng dữ liệu mới hoặc phát triển tính năng mới, hãy tuân thủ quy trình 7 bước sau:

1.  **Bước 1 (Schema local)**: Khai báo thực thể và định nghĩa schema IndexedDB trong hàm `stores` của class `MindlabsOfflineDatabase` tại `src/lib/local-first/db.ts`.
2.  **Bước 2 (Outbox Registry)**: Cập nhật kiểu union `table_name` trong cấu trúc `LocalOutboxItem` của `db.ts`.
3.  **Bước 3 (Reactive Hook)**: Tạo hook trong `src/lib/local-first/` sử dụng `useLiveQuery` của Dexie hoặc liên kết thông qua một React Context Provider chung để đảm bảo UI phản hồi tức thì (Optimistic UI).
4.  **Bước 4 (Sync Handlers)**: Viết hàm đồng bộ `sync[EntityName]` và đăng ký vào đối tượng `SyncHandlers` trong `src/lib/local-first/sync-engine.ts`.
5.  **Bước 5 (Self-Healing Recovery)**: Cập nhật hàm `recoverOrphanedItems` trong `sync-engine.ts` để đảm bảo hệ thống quét và phục hồi các lệnh outbox bị rớt của thực thể mới.
6.  **Bước 6 (Supabase Table & Migrations)**: Tạo bảng tương ứng trên Supabase thông qua SQL Migration với đầy đủ cột `id` (UUID), `updated_at` (timestamptz), và thiết lập Row Level Security (RLS) gắn với `auth.uid()`.
7.  **Bước 7 (UI Integration)**: Kết nối giao diện trực tiếp vào hook đã viết ở Bước 3. Luôn đảm bảo tương tác đi qua **Local-First Layer** thay vì gọi trực tiếp API từ bên ngoài.

---

Tài liệu được cập nhật toàn diện vào ngày **25-05-2026** để phản ánh chính xác cấu trúc Agile Sprint & Knowledge Graph thế hệ mới của Mindlabs!
