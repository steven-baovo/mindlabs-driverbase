-- Migration: Remove 'project' type from workspace_nodes completely and bubble up children nodes to root
-- Step 1: Bubble up all direct children of 'project' nodes to the root level (parent_id = null)
UPDATE public.workspace_nodes
SET parent_id = NULL
WHERE parent_id IN (
    SELECT id FROM public.workspace_nodes WHERE type = 'project'
);

-- Step 2: Delete the 'project' nodes themselves
DELETE FROM public.workspace_nodes
WHERE type = 'project';

-- Step 3: Drop the old check constraint which included 'project'
ALTER TABLE public.workspace_nodes 
DROP CONSTRAINT IF EXISTS workspace_nodes_type_check;

-- Step 4: Add the new check constraint allowing only 'folder', 'note', 'map', 'link'
ALTER TABLE public.workspace_nodes
ADD CONSTRAINT workspace_nodes_type_check CHECK (type IN ('folder', 'note', 'map', 'link'));
