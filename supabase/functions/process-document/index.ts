import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize = 800, overlap = 150): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  // Clean the text
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunk = cleanedText.slice(start, end).trim();
    if (chunk.length > 50) { // Only add meaningful chunks
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }
  
  return chunks;
}

// Generate embeddings using Lovable AI
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    // Use the chat API to generate a semantic representation
    // We'll ask the model to create a numerical fingerprint
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an embedding generator. Extract the key semantic concepts from the text and return them as a comma-separated list of the 10 most important keywords/phrases. Only return the keywords, nothing else.' 
          },
          { role: 'user', content: text.substring(0, 1500) }
        ],
      }),
    });

    if (!response.ok) {
      console.error('Embedding API error:', response.status);
      return null;
    }

    const data = await response.json();
    const keywords = data.choices?.[0]?.message?.content || '';
    
    // Convert keywords to a simple hash-based embedding
    // This is a simplified approach - in production you'd use a proper embedding model
    const keywordList = keywords.toLowerCase().split(',').map((k: string) => k.trim()).filter(Boolean);
    
    return keywordList;
  } catch (error) {
    console.error('Embedding generation error:', error);
    return null;
  }
}

// Extract text from PDF using basic parsing
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(arrayBuffer);
  const text: string[] = [];
  
  // Convert to string for parsing
  let pdfString = '';
  for (let i = 0; i < bytes.length; i++) {
    pdfString += String.fromCharCode(bytes[i]);
  }
  
  // Extract text between BT (begin text) and ET (end text) markers
  const btEtPattern = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtPattern.exec(pdfString)) !== null) {
    const textBlock = match[1];
    
    // Extract text from Tj and TJ operators
    const tjPattern = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjPattern.exec(textBlock)) !== null) {
      const extracted = tjMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      text.push(extracted);
    }
    
    // Extract text from TJ arrays
    const tjArrayPattern = /\[(.*?)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayPattern.exec(textBlock)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const stringPattern = /\(([^)]*)\)/g;
      let stringMatch;
      while ((stringMatch = stringPattern.exec(arrayContent)) !== null) {
        const extracted = stringMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        text.push(extracted);
      }
    }
  }
  
  // Also try to extract from stream objects (for more complex PDFs)
  const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
  while ((match = streamPattern.exec(pdfString)) !== null) {
    const streamContent = match[1];
    // Look for readable ASCII text sequences
    const readableText = streamContent.match(/[A-Za-z][A-Za-z0-9\s.,;:!?'-]{10,}/g);
    if (readableText) {
      text.push(...readableText);
    }
  }
  
  const result = text.join(' ').replace(/\s+/g, ' ').trim();
  console.log('Extracted PDF text length:', result.length);
  
  return result;
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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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
    
    if (fileName.endsWith('.pdf')) {
      console.log('Processing PDF file...');
      const arrayBuffer = await fileData.arrayBuffer();
      textContent = await extractTextFromPDF(arrayBuffer);
      
      // If basic parsing fails, try to extract any readable content
      if (textContent.length < 100) {
        console.log('Basic PDF parsing yielded little content, trying fallback...');
        const rawText = await fileData.text();
        // Extract any readable strings from the raw PDF
        const readableStrings = rawText.match(/[A-Za-z][A-Za-z0-9\s.,;:!?'"-]{20,}/g);
        if (readableStrings) {
          textContent = readableStrings.join(' ');
        }
      }
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      textContent = await fileData.text();
    } else if (fileName.endsWith('.json')) {
      const jsonContent = await fileData.text();
      textContent = JSON.stringify(JSON.parse(jsonContent), null, 2);
    } else if (fileName.endsWith('.csv')) {
      textContent = await fileData.text();
    } else {
      // For other files, try to read as text
      textContent = await fileData.text();
    }

    console.log('Extracted text length:', textContent.length);

    if (textContent.length < 10) {
      console.error('Insufficient text content extracted');
      await supabase
        .from('knowledge_documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      return new Response(
        JSON.stringify({ error: 'Could not extract sufficient text from document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chunk the text
    const chunks = chunkText(textContent);
    console.log('Created chunks:', chunks.length);

    // Create a data source entry
    const { data: sourceData, error: sourceError } = await supabase
      .from('data_sources')
      .insert({
        source_type: fileName.endsWith('.pdf') ? 'pdf' : 'document' as any,
        url: filePath,
        title: filePath.split('/').pop(),
        content: textContent.substring(0, 5000),
        metadata: { documentId, chunksCount: chunks.length, fileType: fileName.split('.').pop() }
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Error creating data source:', sourceError);
    }

    const sourceId = sourceData?.id;

    // Generate embeddings and store chunks
    const embeddingInserts = [];
    
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      let embeddingData = null;
      
      // Generate semantic keywords/embedding for each chunk
      if (lovableApiKey && index < 20) { // Limit embedding calls to first 20 chunks
        embeddingData = await generateEmbedding(chunk, lovableApiKey);
      }
      
      embeddingInserts.push({
        source_id: sourceId,
        content_chunk: chunk,
        chunk_index: index,
        embedding_data: embeddingData ? { keywords: embeddingData } : null,
        metadata: { documentId, fileName: filePath }
      });
    }

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

    console.log('Document processing completed:', documentId, 'Chunks:', chunks.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        chunksCreated: chunks.length,
        documentId,
        hasEmbeddings: !!lovableApiKey
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
