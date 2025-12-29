import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of startup funding news sources to crawl
const FUNDING_SOURCES = [
  {
    url: 'https://inc42.com/buzz/funding-galore',
    name: 'Inc42 Funding Galore',
    category: 'funding_news',
  },
  {
    url: 'https://yourstory.com/companies/funding',
    name: 'YourStory Funding',
    category: 'funding_news',
  },
  {
    url: 'https://entrackr.com/category/funding/',
    name: 'Entrackr Funding',
    category: 'funding_news',
  },
  {
    url: 'https://www.vccircle.com/deals',
    name: 'VCCircle Deals',
    category: 'deals',
  },
  {
    url: 'https://startupindia.gov.in/content/sih/en/government-schemes.html',
    name: 'Startup India Schemes',
    category: 'government_policy',
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results: any[] = [];
  const errors: any[] = [];

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!firecrawlKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Firecrawl not configured', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting scheduled crawl at ${new Date().toISOString()}`);
    console.log(`Crawling ${FUNDING_SOURCES.length} sources...`);

    // Process each source
    for (const source of FUNDING_SOURCES) {
      try {
        console.log(`Crawling: ${source.name} (${source.url})`);

        // Check if we've crawled this URL recently (within last 12 hours)
        const { data: recentCrawl } = await supabase
          .from('data_sources')
          .select('id, updated_at')
          .eq('url', source.url)
          .gte('updated_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
          .single();

        if (recentCrawl) {
          console.log(`Skipping ${source.name} - crawled recently`);
          results.push({
            source: source.name,
            status: 'skipped',
            reason: 'Recently crawled',
          });
          continue;
        }

        // Scrape using Firecrawl
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000,
          }),
        });

        if (!scrapeResponse.ok) {
          const errorText = await scrapeResponse.text();
          throw new Error(`Firecrawl error: ${scrapeResponse.status} - ${errorText}`);
        }

        const scrapeData = await scrapeResponse.json();
        const content = scrapeData.data?.markdown || scrapeData.markdown || '';
        const title = scrapeData.data?.metadata?.title || source.name;

        if (!content || content.length < 100) {
          console.log(`Skipping ${source.name} - insufficient content`);
          results.push({
            source: source.name,
            status: 'skipped',
            reason: 'Insufficient content',
          });
          continue;
        }

        // Upsert data source
        const { data: dataSource, error: sourceError } = await supabase
          .from('data_sources')
          .upsert({
            url: source.url,
            title,
            source_type: 'web',
            content,
            metadata: {
              category: source.category,
              crawled_at: new Date().toISOString(),
              content_length: content.length,
            },
            updated_at: new Date().toISOString(),
          }, { onConflict: 'url' })
          .select()
          .single();

        if (sourceError) {
          throw sourceError;
        }

        // Chunk and store embeddings
        const chunks = chunkContent(content, 1000);
        
        // Delete old embeddings for this source
        await supabase
          .from('embeddings')
          .delete()
          .eq('source_id', dataSource.id);

        // Insert new chunks
        const embeddingRecords = chunks.map((chunk, index) => ({
          source_id: dataSource.id,
          content_chunk: chunk,
          chunk_index: index,
          metadata: { 
            source_url: source.url, 
            title,
            category: source.category,
          },
        }));

        if (embeddingRecords.length > 0) {
          await supabase.from('embeddings').insert(embeddingRecords);
        }

        // Extract funding data
        const fundingRecords = extractFundingData(content, dataSource.id);
        if (fundingRecords.length > 0) {
          // Insert new funding records (avoiding duplicates)
          for (const record of fundingRecords) {
            await supabase
              .from('funding_data')
              .upsert(record, { 
                onConflict: 'startup_name,funding_round',
                ignoreDuplicates: true 
              });
          }
        }

        results.push({
          source: source.name,
          status: 'success',
          contentLength: content.length,
          chunks: chunks.length,
          fundingRecords: fundingRecords.length,
        });

        console.log(`Completed: ${source.name} - ${chunks.length} chunks, ${fundingRecords.length} funding records`);

        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (sourceError) {
        console.error(`Error crawling ${source.name}:`, sourceError);
        errors.push({
          source: source.name,
          error: sourceError instanceof Error ? sourceError.message : 'Unknown error',
        });
      }
    }

    const duration = Date.now() - startTime;
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      sourcesProcessed: results.filter(r => r.status === 'success').length,
      sourcesSkipped: results.filter(r => r.status === 'skipped').length,
      errorCount: errors.length,
      results,
      errorDetails: errors.length > 0 ? errors : undefined,
    };

    console.log('Scheduled crawl completed:', JSON.stringify(summary, null, 2));

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduled crawl failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Crawl failed',
        results,
        errors,
      }),
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
      if (currentChunk) chunks.push(currentChunk.trim());
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

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks.filter(c => c.length > 50);
}

function extractFundingData(content: string, sourceId: string): any[] {
  const records: any[] = [];
  const patterns = [
    /(\w+(?:\s+\w+){0,3})\s+(?:raises?|raised|secures?|secured|gets?|got)\s+\$?([\d.]+)\s*(million|mn|m|crore|cr|billion|bn|b|lakh|lac|l)/gi,
    /\$?([\d.]+)\s*(million|mn|m|crore|cr|billion|bn|b)\s+(?:funding|investment|round)\s+(?:for|in|by|to)\s+(\w+(?:\s+\w+){0,3})/gi,
  ];

  const seen = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      try {
        let startupName: string;
        let amount: number;
        let unit: string;

        if (!isNaN(parseFloat(match[2]))) {
          startupName = match[1];
          amount = parseFloat(match[2]);
          unit = match[3].toLowerCase();
        } else if (!isNaN(parseFloat(match[1]))) {
          amount = parseFloat(match[1]);
          unit = match[2].toLowerCase();
          startupName = match[3];
        } else continue;

        // Skip common false positives
        if (['the', 'a', 'an', 'this', 'that', 'it'].includes(startupName.toLowerCase())) continue;

        // Normalize amount to USD
        let usdAmount = amount;
        if (unit.includes('b')) usdAmount = amount * 1000000000;
        else if (unit.includes('cr')) usdAmount = amount * 12000000; // INR Cr to USD
        else if (unit.includes('l') || unit.includes('lac')) usdAmount = amount * 12000; // INR Lakh to USD
        else usdAmount = amount * 1000000; // Millions

        const key = `${startupName.toLowerCase()}-${usdAmount}`;
        if (seen.has(key)) continue;
        seen.add(key);

        records.push({
          startup_name: startupName.trim(),
          funding_amount: usdAmount,
          source_id: sourceId,
          funding_date: new Date().toISOString().split('T')[0],
          metadata: { 
            raw_match: match[0], 
            extracted_at: new Date().toISOString(),
            auto_extracted: true,
          },
        });
      } catch (e) {
        console.error('Error parsing funding:', e);
      }
    }
  }

  return records.slice(0, 50); // Limit to 50 records per crawl
}
