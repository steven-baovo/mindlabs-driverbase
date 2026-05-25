# 🗺️ Bản đồ Kỹ thuật (Technical Map) - Mindlabs

Tài liệu này tóm tắt cấu trúc kỹ thuật, sơ đồ tính năng thực tế và bản đồ thư mục hiện tại của hệ sinh thái **Mindlabs**, giúp nhà phát triển nhanh chóng nắm bắt hệ thống.

> [!TIP]
> **Tài liệu hướng dẫn chuyên sâu**:
> Để xem chi tiết cấu trúc code, sơ đồ đồng bộ hóa của Sync Engine, cấu hình PWA/Middleware và hướng dẫn viết code chi tiết cho AI Agents, hãy đọc **[TECHNICAL_GUIDE.md](file:///d:/mindlabs/TECHNICAL_GUIDE.md)**.

---

## 🏗️ Tổng quan Kiến trúc

Dự án Mindlabs được thiết kế theo mô hình **Offline-First Hybrid Sync (Local-First)**:
*   **Frontend Framework**: Next.js 16 (App Router) tối ưu hóa bằng Webpack / Turbopack.
*   **Database & Auth**: Supabase (PostgreSQL) đóng vai trò Cloud Store & Authentication.
*   **Local Database**: IndexedDB thông qua thư viện **Dexie.js** đóng vai trò Client Store chính (tốc độ đọc ghi 0ms).
*   **Sync Engine**: Bộ đồng bộ hóa nền chạy ngầm chuyên nghiệp sử dụng Outbox pattern để truyền tải dữ liệu hai chiều bất đối xứng giữa Dexie.js và Supabase, hỗ trợ tự chữa lành dữ liệu (Self-Healing).
*   **PWA Capabilities**: Hỗ trợ Service Worker qua `@ducanh2912/next-pwa` để cache tài nguyên tĩnh, cho phép cài đặt ứng dụng (Installable PWA) và hoạt động hoàn toàn ngoại tuyến.
*   **Styling**: Tailwind CSS v4 kết hợp PostCSS và các biến cấu trúc CSS chuẩn.
*   **State Management**: React Context (`FocusContext`, `WorkspaceContext`) kết hợp `TasksProvider` để quản lý các live queries từ Dexie DB.

---

## 🗺️ Sơ đồ Tính năng (Feature Map)

### 1. Project Workspace (Không gian làm việc & Sơ đồ Tri thức)
*   **Mô tả**: Quản lý ghi chú (Notes), sơ đồ tư duy (Mindmap) và kết nối kiến trúc tri thức hợp nhất trong dự án.
*   **Kỹ thuật chính**:
    *   **Local-First Tree Nodes**: Toàn bộ cây tài liệu được biểu diễn dưới dạng các `workspace_nodes` lưu trực tiếp vào local IndexedDB thông qua hook `useLocalWorkspace`.
    *   **Tiptap Editor (ZenEditor)**: Trình soạn thảo văn bản phong phú (Rich Text) được tích hợp tối ưu tại `ZenEditor.tsx`, tự động lưu (autosave) và đồng bộ thông qua bảng `mind_notes`.
    *   **Mindmap Board (@xyflow/react)**: Vẽ sơ đồ tư duy tương tác kéo thả linh hoạt, các nodes và edges được lưu động dưới dạng JSON trong bảng `mindmaps`.
    *   **Obsidian-style Knowledge Graph**: Biểu đồ mạng (`GraphView.tsx`) sử dụng thư viện `react-force-graph-2d` để kết nối trực quan, thu phóng và tương tác giữa các Note và Canvas.
*   **Files chính**: `src/app/(frontend)/workspace/*`, `src/lib/local-first/useLocalWorkspace.ts`, `src/components/mindnote/*`, `src/components/mindmap/*`, `src/components/workspace/GraphView.tsx`.

### 2. Linear-style Agile Tasks (Quản lý Dự án & Sprint)
*   **Mô tả**: Bộ quản lý công việc hiệu suất cao dành cho freelancer và văn phòng, mô phỏng luồng làm việc Agile chuyên nghiệp của Linear.
*   **Kỹ thuật chính**:
    *   **Projects**: Phân loại và theo dõi tiến độ các dự án riêng biệt (`projects` table).
    *   **Cycles**: Các chu kỳ sprint tự động gối đầu (`cycles` table) thông qua `cycle-engine.ts`, tự động chuyển giao (auto-roll) các Issue chưa hoàn thành sang chu kỳ mới và tự duy trì 2 chu kỳ tương lai.
    *   **Issues**: Các đầu việc chi tiết (`issues` table) hỗ trợ nhiều trạng thái (`backlog`, `todo`, `in_progress`, `done`, `canceled`), mức độ ưu tiên, nhãn dán, hạn chót và nhiệm vụ con.
    *   **SPA Query Router**: Định tuyến thông minh bằng query parameters (`?issue=`, `?project=`, `?cycle=`, `?view=`) giúp chuyển đổi các góc nhìn lập tức mà không tải lại trang.
    *   **Đường dẫn tích hợp**: Giao diện `/kanban` và `/todo` tự động định tuyến (redirect) về `/tasks` để mang lại trải nghiệm quản trị tập trung.
*   **Files chính**: `src/app/(frontend)/tasks/*`, `src/lib/local-first/useLocalTasks.ts`, `src/lib/local-first/cycle-engine.ts`, `src/components/tasks/*`.

### 3. MindFocus (Pomodoro Timer & Focus Sessions)
*   **Mô tả**: Quản lý thời gian tập trung nâng cao kết hợp theo dõi lịch sử phiên làm việc.
*   **Kỹ thuật chính**:
    *   `FocusContext.tsx`: Quản lý thời gian, trạng thái chạy/dừng toàn cục.
    *   **Focus Sessions History**: Ghi lại lịch sử từng phiên tập trung (`focus_sessions` table) và đồng bộ lên Supabase.
    *   **Focus Settings**: Cho phép cá nhân hóa độ dài Pomodoro, nghỉ ngắn, nghỉ dài, tự động chạy breaks và âm thanh thông báo (`focus_settings` table).
*   **Files chính**: `src/app/(frontend)/pomodoro/*`, `src/components/focus/*`, `src/contexts/FocusContext.tsx`.

---

## 📂 Cấu trúc Thư mục Dự án Thực tế

```text
mindlabs/
├── public/                     # Tài nguyên tĩnh và cấu hình PWA (manifest.json, sw.js)
├── supabase/                   # Cấu trúc SQL Database Migrations của Supabase
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group đăng nhập/đăng ký (/login, /register)
│   │   ├── (frontend)/         # Route group giao diện chính
│   │   │   ├── workspace/      # Không gian làm việc, tài liệu và Mindmap
│   │   │   ├── tasks/          # Quản lý Agile Projects, Cycles và Issues
│   │   │   ├── pomodoro/       # Công cụ đếm giờ Pomodoro tập trung
│   │   │   ├── kanban/         # Tự động redirect sang /tasks
│   │   │   ├── todo/           # Tự động redirect sang /tasks
│   │   │   ├── changelog/      # Nhật ký thay đổi sản phẩm
│   │   │   ├── docs/           # Tài liệu hướng dẫn sử dụng
│   │   │   └── layout.tsx      # Bọc trạng thái đồng bộ và xác thực chính
│   │   ├── api/                # Các endpoint API phụ trợ (hiện trống)
│   │   └── layout.tsx          # Layout gốc HTML/Head
│   ├── components/             # Các React UI Components phân chia theo module
│   │   ├── focus/              # Timer, TaskList và Settings của Pomodoro
│   │   ├── mindmap/            # Canvas kéo thả sơ đồ tư duy bằng @xyflow/react
│   │   ├── mindnote/           # ZenEditor soạn thảo tài liệu bằng Tiptap
│   │   ├── tasks/              # Các views quản lý dự án, chu kỳ và chi tiết task
│   │   └── workspace/          # Cây thư mục sidebar và Obsidian-style GraphView
│   ├── contexts/               # React Contexts toàn cục (Focus, Workspace)
│   ├── hooks/                  # Custom Hooks tiện ích dùng chung
│   ├── lib/                    # Cấu hình các thư viện cốt lõi
│   │   ├── local-first/        # Trọng tâm Local-First Layer (db.ts, sync-engine.ts, custom hooks)
│   │   └── supabase/           # Cấu hình Supabase Client và Auth Middleware
│   └── proxy.ts                # Định tuyến Proxy và cấu hình Middleware Bypass PWA
├── TECHNICAL_MAP.md            # Tài liệu này (Bản đồ tổng quan thực tế)
├── TECHNICAL_GUIDE.md          # Hướng dẫn kỹ thuật chi tiết dành cho code và Agent
└── package.json                # Quản lý thư viện và script khởi chạy
```
