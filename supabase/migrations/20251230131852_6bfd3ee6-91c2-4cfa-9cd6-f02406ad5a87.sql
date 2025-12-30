-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can delete knowledge_documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Authenticated users can insert knowledge_documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Authenticated users can read knowledge_documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Authenticated users can update knowledge_documents" ON public.knowledge_documents;

-- Create new permissive policies that allow public access for the knowledge base
-- Since this is a shared knowledge base, we'll allow public read/write access
CREATE POLICY "Anyone can read knowledge_documents" 
ON public.knowledge_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert knowledge_documents" 
ON public.knowledge_documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update knowledge_documents" 
ON public.knowledge_documents 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete knowledge_documents" 
ON public.knowledge_documents 
FOR DELETE 
USING (true);