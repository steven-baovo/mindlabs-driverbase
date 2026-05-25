-- Create mindmaps table for native Canvas feature
CREATE TABLE IF NOT EXISTS public.mindmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Canvas',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mindmaps"
  ON public.mindmaps
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast queries by user
CREATE INDEX idx_mindmaps_user_id ON public.mindmaps(user_id);
