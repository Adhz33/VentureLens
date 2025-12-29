import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, content, title, sourceType = 'web', metadata = {} } = await req.json();

    if (!url || !content) {
      return new Response(
        JSON.stringify({ error: 'URL and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Ingesting data from:', url);

    // Insert the data source
    const { data: dataSource, error: sourceError } = await supabase
      .from('data_sources')
      .insert({
        url,
        title: title || url,
        source_type: sourceType,
        content,
        metadata,
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Error inserting data source:', sourceError);
      throw sourceError;
    }

    console.log('Data source created:', dataSource.id);

    // Chunk the content for embeddings (simple chunking by paragraphs)
    const chunks = chunkContent(content, 1000);
    console.log(`Created ${chunks.length} chunks for embedding`);

    // Insert chunks as embeddings (without actual vector - would need embedding API)
    const embeddingRecords = chunks.map((chunk, index) => ({
      source_id: dataSource.id,
      content_chunk: chunk,
      chunk_index: index,
      metadata: { source_url: url, title },
    }));

    if (embeddingRecords.length > 0) {
      const { error: embeddingError } = await supabase
        .from('embeddings')
        .insert(embeddingRecords);

      if (embeddingError) {
        console.error('Error inserting embeddings:', embeddingError);
        // Don't throw - data source is still saved
      }
    }

    // Try to extract funding data from content
    const fundingData = extractFundingData(content, dataSource.id);
    if (fundingData.length > 0) {
      console.log(`Extracted ${fundingData.length} funding records`);
      
      const { error: fundingError } = await supabase
        .from('funding_data')
        .insert(fundingData);

      if (fundingError) {
        console.error('Error inserting funding data:', fundingError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        dataSourceId: dataSource.id,
        chunksCreated: chunks.length,
        fundingRecordsExtracted: fundingData.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Ingest error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to ingest data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function chunkContent(content: string, maxChunkSize: number): string[] {
  const paragraphs = content.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If single paragraph is too long, split by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let sentenceChunk = '';
        for (const sentence of sentences) {
          if ((sentenceChunk + sentence).length > maxChunkSize) {
            if (sentenceChunk) chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          } else {
            sentenceChunk += ' ' + sentence;
          }
        }
        if (sentenceChunk) chunks.push(sentenceChunk.trim());
        currentChunk = '';
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += '\n\n' + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(c => c.length > 50); // Filter out very short chunks
}

function extractFundingData(content: string, sourceId: string): any[] {
  const fundingRecords: any[] = [];
  
  // Simple regex patterns to extract funding information
  const patterns = [
    /(\w+(?:\s+\w+)*)\s+(?:raises?|raised|secures?|secured)\s+\$?([\d.]+)\s*(million|mn|m|crore|cr|billion|bn|b)/gi,
    /\$?([\d.]+)\s*(million|mn|m|crore|cr|billion|bn|b)\s+(?:funding|investment|round)\s+(?:for|in|by)\s+(\w+(?:\s+\w+)*)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      try {
        let startupName: string;
        let amount: number;
        let unit: string;

        if (match[3] && !isNaN(parseFloat(match[2]))) {
          // Pattern 1: Startup raises $X million
          startupName = match[1];
          amount = parseFloat(match[2]);
          unit = match[3].toLowerCase();
        } else if (match[3] && !isNaN(parseFloat(match[1]))) {
          // Pattern 2: $X million funding for Startup
          amount = parseFloat(match[1]);
          unit = match[2].toLowerCase();
          startupName = match[3];
        } else {
          continue;
        }

        // Convert to standard amount (USD millions)
        let standardAmount = amount;
        if (unit.includes('b')) standardAmount = amount * 1000;
        else if (unit.includes('cr')) standardAmount = amount * 12; // Approximate INR Cr to USD M

        fundingRecords.push({
          startup_name: startupName.trim(),
          funding_amount: standardAmount * 1000000, // Store in actual USD
          source_id: sourceId,
          metadata: { raw_match: match[0], extracted_at: new Date().toISOString() },
        });
      } catch (e) {
        console.error('Error parsing funding data:', e);
      }
    }
  }

  return fundingRecords;
}
