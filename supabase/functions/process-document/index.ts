import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, filePath } = await req.json();

    if (!documentId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'documentId and filePath are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing document:', documentId, filePath);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update document status to processing
    await supabase
      .from('knowledge_documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('knowledge-base')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      await supabase
        .from('knowledge_documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text content based on file type
    let textContent = '';
    const fileName = filePath.toLowerCase();
    
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      textContent = await fileData.text();
    } else if (fileName.endsWith('.json')) {
      const jsonContent = await fileData.text();
      textContent = JSON.stringify(JSON.parse(jsonContent), null, 2);
    } else {
      // For PDFs and other files, we'd need specialized libraries
      // For now, treat as text
      textContent = await fileData.text();
    }

    console.log('Extracted text length:', textContent.length);

    // Chunk the text
    const chunks = chunkText(textContent);
    console.log('Created chunks:', chunks.length);

    // Create a data source entry
    const { data: sourceData, error: sourceError } = await supabase
      .from('data_sources')
      .insert({
        source_type: 'document',
        url: filePath,
        title: filePath.split('/').pop(),
        content: textContent.substring(0, 5000), // Store first 5000 chars as preview
        metadata: { documentId, chunksCount: chunks.length }
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Error creating data source:', sourceError);
    }

    const sourceId = sourceData?.id;

    // Store chunks as embeddings (without actual embedding vectors for simplicity)
    // In production, you'd call an embedding API here
    const embeddingInserts = chunks.map((chunk, index) => ({
      source_id: sourceId,
      content_chunk: chunk,
      chunk_index: index,
      metadata: { documentId, fileName: filePath }
    }));

    const { error: embedError } = await supabase
      .from('embeddings')
      .insert(embeddingInserts);

    if (embedError) {
      console.error('Error storing embeddings:', embedError);
    }

    // Update document status to ready
    await supabase
      .from('knowledge_documents')
      .update({ 
        status: 'ready',
        chunks_count: chunks.length
      })
      .eq('id', documentId);

    console.log('Document processing completed:', documentId);

    return new Response(
      JSON.stringify({ 
        success: true,
        chunksCreated: chunks.length,
        documentId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
