-- Xóa cột sidebar_order khỏi bảng profiles vì không còn dùng chức năng sắp xếp sidebar phải nữa
ALTER TABLE profiles DROP COLUMN IF EXISTS sidebar_order;
