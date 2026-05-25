-- Create projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'planned' check (status in ('planned', 'active', 'paused', 'completed', 'canceled')),
  start_date timestamp with time zone,
  target_date timestamp with time zone,
  icon text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create cycles table
create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number integer not null,
  name text not null,
  is_active boolean not null default false,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create issues table
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number integer not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('backlog', 'todo', 'in_progress', 'done', 'canceled')),
  priority text not null default 'none' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  project_id uuid references public.projects(id) on delete set null,
  cycle_id uuid references public.cycles(id) on delete set null,
  parent_id uuid references public.issues(id) on delete set null,
  due_date timestamp with time zone,
  labels text[] default '{}'::text[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.cycles enable row level security;
alter table public.issues enable row level security;

-- Create policies
create policy "Users can view their own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on public.projects for delete using (auth.uid() = user_id);

create policy "Users can view their own cycles" on public.cycles for select using (auth.uid() = user_id);
create policy "Users can insert their own cycles" on public.cycles for insert with check (auth.uid() = user_id);
create policy "Users can update their own cycles" on public.cycles for update using (auth.uid() = user_id);
create policy "Users can delete their own cycles" on public.cycles for delete using (auth.uid() = user_id);

create policy "Users can view their own issues" on public.issues for select using (auth.uid() = user_id);
create policy "Users can insert their own issues" on public.issues for insert with check (auth.uid() = user_id);
create policy "Users can update their own issues" on public.issues for update using (auth.uid() = user_id);
create policy "Users can delete their own issues" on public.issues for delete using (auth.uid() = user_id);

-- Create indexes
create index projects_user_id_idx on public.projects(user_id);
create index cycles_user_id_idx on public.cycles(user_id);
create index issues_user_id_idx on public.issues(user_id);
create index issues_project_id_idx on public.issues(project_id);
create index issues_cycle_id_idx on public.issues(cycle_id);
