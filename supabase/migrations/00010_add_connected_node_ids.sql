-- Migration: Thêm cột connected_node_ids vào bảng workspace_nodes để lưu trữ liên kết giữa các node
ALTER TABLE workspace_nodes ADD COLUMN IF NOT EXISTS connected_node_ids UUID[] DEFAULT '{}';
