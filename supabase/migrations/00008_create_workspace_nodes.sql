-- Migration: Tạo bảng workspace_nodes để quản lý cấu trúc cây quan hệ
CREATE TABLE IF NOT EXISTS workspace_nodes (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('project', 'folder', 'note', 'map', 'link')),
    url TEXT, -- Lưu link Google Docs, Sheets nếu type là 'link'
    
    parent_id UUID REFERENCES workspace_nodes(id) ON DELETE CASCADE, -- Trỏ đến node cha
    "order" INTEGER DEFAULT 0, -- Thứ tự sắp xếp hiển thị
    
    -- Liên kết tới các bảng hiện có (để không bị xung đột)
    note_id UUID REFERENCES mind_notes(id) ON DELETE SET NULL,
    map_id UUID REFERENCES mindmaps(id) ON DELETE SET NULL
);

-- Bật Row Level Security (RLS)
ALTER TABLE workspace_nodes ENABLE ROW LEVEL SECURITY;

-- Policy: Người dùng chỉ được xem và sửa dữ liệu của chính mình
CREATE POLICY "Users can manage their own workspace nodes"
    ON workspace_nodes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
