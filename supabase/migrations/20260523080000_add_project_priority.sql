-- Migration: Add priority column to projects table
alter table public.projects 
add column if not exists priority text not null default 'none' 
check (priority in ('none', 'low', 'medium', 'high', 'urgent'));
