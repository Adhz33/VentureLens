-- Drop existing permissive policies that allow public access

-- data_sources: Drop public read and add authenticated read
DROP POLICY IF EXISTS "Allow public read access to data_sources" ON public.data_sources;
CREATE POLICY "Authenticated users can read data_sources" 
ON public.data_sources 
FOR SELECT 
TO authenticated
USING (true);

-- embeddings: Drop public read and add authenticated read
DROP POLICY IF EXISTS "Allow public read access to embeddings" ON public.embeddings;
CREATE POLICY "Authenticated users can read embeddings" 
ON public.embeddings 
FOR SELECT 
TO authenticated
USING (true);

-- funding_data: Drop public read and add authenticated read
DROP POLICY IF EXISTS "Allow public read access to funding_data" ON public.funding_data;
CREATE POLICY "Authenticated users can read funding_data" 
ON public.funding_data 
FOR SELECT 
TO authenticated
USING (true);

-- investors: Drop public read and add authenticated read
DROP POLICY IF EXISTS "Allow public read access to investors" ON public.investors;
CREATE POLICY "Authenticated users can read investors" 
ON public.investors 
FOR SELECT 
TO authenticated
USING (true);

-- policies: Drop public read and add authenticated read
DROP POLICY IF EXISTS "Allow public read access to policies" ON public.policies;
CREATE POLICY "Authenticated users can read policies" 
ON public.policies 
FOR SELECT 
TO authenticated
USING (true);

-- knowledge_documents: Replace public access with authenticated access
DROP POLICY IF EXISTS "Anyone can read knowledge_documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Anyone can insert knowledge_documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Anyone can update knowledge_documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Anyone can delete knowledge_documents" ON public.knowledge_documents;

CREATE POLICY "Authenticated users can read knowledge_documents" 
ON public.knowledge_documents 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert knowledge_documents" 
ON public.knowledge_documents 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update knowledge_documents" 
ON public.knowledge_documents 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete knowledge_documents" 
ON public.knowledge_documents 
FOR DELETE 
TO authenticated
USING (true);

-- query_history: Replace public access with authenticated user-specific access
DROP POLICY IF EXISTS "Allow public read access to query_history" ON public.query_history;
DROP POLICY IF EXISTS "Allow public insert to query_history" ON public.query_history;

-- Add user_id column to query_history for user-specific access
ALTER TABLE public.query_history ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Users can read their own query_history" 
ON public.query_history 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own query_history" 
ON public.query_history 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);