-- Enable the pgvector extension first
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create enum for data source types
CREATE TYPE public.source_type AS ENUM ('web', 'pdf', 'table', 'report', 'api');

-- Create enum for supported languages
CREATE TYPE public.supported_language AS ENUM ('en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa');

-- Create table for ingested data sources
CREATE TABLE public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    title TEXT,
    source_type source_type NOT NULL DEFAULT 'web',
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for funding data (structured)
CREATE TABLE public.funding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_name TEXT NOT NULL,
    investor_name TEXT,
    funding_amount DECIMAL(15,2),
    funding_round TEXT,
    sector TEXT,
    location TEXT,
    funding_date DATE,
    source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for investors
CREATE TABLE public.investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    investor_type TEXT,
    portfolio_focus TEXT[],
    total_investments DECIMAL(15,2),
    notable_investments TEXT[],
    location TEXT,
    website TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for policy data
CREATE TABLE public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name TEXT NOT NULL,
    issuing_body TEXT,
    description TEXT,
    eligibility_criteria TEXT,
    benefits TEXT,
    application_process TEXT,
    deadline DATE,
    source_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user queries/chat history
CREATE TABLE public.query_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    language supported_language NOT NULL DEFAULT 'en',
    response TEXT,
    sources JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for embeddings (for RAG) - using TEXT for now, embedding handled in edge function
CREATE TABLE public.embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    embedding_data JSONB,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- Create public read policies (this is public data for all users)
CREATE POLICY "Allow public read access to data_sources" ON public.data_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read access to funding_data" ON public.funding_data FOR SELECT USING (true);
CREATE POLICY "Allow public read access to investors" ON public.investors FOR SELECT USING (true);
CREATE POLICY "Allow public read access to policies" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Allow public read access to query_history" ON public.query_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access to embeddings" ON public.embeddings FOR SELECT USING (true);

-- Allow public insert for query history (tracking user questions)
CREATE POLICY "Allow public insert to query_history" ON public.query_history FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON public.data_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON public.investors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();