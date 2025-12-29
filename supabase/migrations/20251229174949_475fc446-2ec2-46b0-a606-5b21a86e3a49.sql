-- Create storage bucket for knowledge base documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-base', 'knowledge-base', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the knowledge-base bucket
CREATE POLICY "Anyone can upload documents to knowledge-base"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'knowledge-base');

CREATE POLICY "Anyone can read documents from knowledge-base"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-base');

CREATE POLICY "Anyone can delete documents from knowledge-base"
ON storage.objects FOR DELETE
USING (bucket_id = 'knowledge-base');

-- Create a table to track knowledge base documents
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT DEFAULT 'DOCUMENT',
  description TEXT,
  status TEXT DEFAULT 'pending',
  chunks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on knowledge_documents
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_documents
CREATE POLICY "Anyone can read knowledge_documents"
ON public.knowledge_documents FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert knowledge_documents"
ON public.knowledge_documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update knowledge_documents"
ON public.knowledge_documents FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete knowledge_documents"
ON public.knowledge_documents FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();