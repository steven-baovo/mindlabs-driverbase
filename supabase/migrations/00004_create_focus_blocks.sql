-- Create focus_blocks table for Focus Protocol
CREATE TABLE IF NOT EXISTS public.focus_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 0=Monday, 1=Tuesday, ..., 6=Sunday
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- Minutes from 00:00. e.g. 480 = 08:00 AM, 1320 = 22:00
  start_minutes SMALLINT NOT NULL CHECK (start_minutes >= 0 AND start_minutes < 1440),
  -- Duration in minutes, snapped to 30-min increments
  duration_minutes SMALLINT NOT NULL DEFAULT 90 CHECK (duration_minutes > 0),
  -- Predefined block types: morning_routine, deep_work, light_work, break, lunch, exercise, wind_down, sleep
  block_type TEXT NOT NULL DEFAULT 'deep_work',
  -- Optional short label, e.g. "Xử lý dự án A-B"
  custom_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security: each user only sees their own blocks
ALTER TABLE public.focus_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own focus blocks"
  ON public.focus_blocks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast queries by user + day
CREATE INDEX idx_focus_blocks_user_day ON public.focus_blocks(user_id, day_of_week);
