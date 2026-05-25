-- Create focus_settings table
CREATE TABLE IF NOT EXISTS public.focus_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  pomodoro_duration SMALLINT NOT NULL DEFAULT 25 CHECK (pomodoro_duration > 0),
  short_break_duration SMALLINT NOT NULL DEFAULT 5 CHECK (short_break_duration > 0),
  long_break_duration SMALLINT NOT NULL DEFAULT 15 CHECK (long_break_duration > 0),
  auto_start_breaks BOOLEAN NOT NULL DEFAULT true,
  auto_start_pomodoros BOOLEAN NOT NULL DEFAULT true,
  long_break_interval SMALLINT NOT NULL DEFAULT 4 CHECK (long_break_interval > 0),
  alarm_sound TEXT NOT NULL DEFAULT 'bell',
  ticking_sound TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own focus settings"
  ON public.focus_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create focus_tasks table
CREATE TABLE IF NOT EXISTS public.focus_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  estimated_pomodoros SMALLINT NOT NULL DEFAULT 1,
  completed_pomodoros SMALLINT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own focus tasks"
  ON public.focus_tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create focus_sessions table (for logging)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.focus_tasks(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('pomodoro', 'short_break', 'long_break')),
  duration_minutes SMALLINT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own focus sessions"
  ON public.focus_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_focus_settings_modtime
    BEFORE UPDATE ON public.focus_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_focus_tasks_modtime
    BEFORE UPDATE ON public.focus_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
