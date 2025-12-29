import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORTED_LANGUAGES: Record<string, { name: string; prompt: string }> = {
  en: { name: 'English', prompt: 'Respond in English.' },
  hi: { name: 'Hindi', prompt: 'कृपया हिंदी में जवाब दें। Respond in Hindi.' },
  ta: { name: 'Tamil', prompt: 'தமிழில் பதிலளிக்கவும். Respond in Tamil.' },
  te: { name: 'Telugu', prompt: 'తెలుగులో సమాధానం ఇవ్వండి. Respond in Telugu.' },
  bn: { name: 'Bengali', prompt: 'বাংলায় উত্তর দিন. Respond in Bengali.' },
  mr: { name: 'Marathi', prompt: 'मराठीत उत्तर द्या. Respond in Marathi.' },
  gu: { name: 'Gujarati', prompt: 'ગુજરાતીમાં જવાબ આપો. Respond in Gujarati.' },
  kn: { name: 'Kannada', prompt: 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. Respond in Kannada.' },
  ml: { name: 'Malayalam', prompt: 'മലയാളത്തിൽ മറുപടി നൽകുക. Respond in Malayalam.' },
  pa: { name: 'Punjabi', prompt: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ. Respond in Punjabi.' },
};

// Simple keyword-based retrieval (in production, use vector similarity)
function retrieveRelevantChunks(query: string, chunks: any[], maxChunks = 5): any[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const scored = chunks.map(chunk => {
    const content = (chunk.content_chunk || '').toLowerCase();
    let score = 0;
    queryWords.forEach(word => {
      if (content.includes(word)) score++;
    });
    return { ...chunk, score };
  });

  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, language = 'en', conversationHistory = [], useKnowledgeBase = true } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;
    
    // Retrieve relevant context from knowledge base
    let contextChunks: any[] = [];
    let documentSources: any[] = [];
    
    if (useKnowledgeBase) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get all embeddings/chunks
      const { data: embeddings, error: embError } = await supabase
        .from('embeddings')
        .select('content_chunk, metadata, source_id')
        .limit(500);

      if (!embError && embeddings && embeddings.length > 0) {
        console.log('Found embeddings:', embeddings.length);
        contextChunks = retrieveRelevantChunks(query, embeddings);
        console.log('Retrieved relevant chunks:', contextChunks.length);

        // Get document names for sources
        if (contextChunks.length > 0) {
          const { data: docs } = await supabase
            .from('knowledge_documents')
            .select('id, file_name, category')
            .in('id', contextChunks.map(c => c.metadata?.documentId).filter(Boolean));
          
          if (docs) {
            documentSources = docs;
          }
        }
      }
    }

    // Build context string from retrieved chunks
    const contextText = contextChunks.length > 0
      ? `\n\nRelevant context from uploaded documents:\n${contextChunks.map((c, i) => `[${i + 1}] ${c.content_chunk}`).join('\n\n')}`
      : '';

    const systemPrompt = `You are FundingIQ, an expert AI assistant specializing in Indian startup funding intelligence. Your role is to provide accurate, grounded insights about:

1. **Startup Funding**: Investment rounds, valuations, funding trends, deal sizes
2. **Investors**: VCs, angel investors, PE firms, their portfolios and investment patterns  
3. **Government Policies**: Startup India schemes, tax benefits, grants, subsidies
4. **Ecosystem Trends**: Sector-wise analysis, emerging opportunities, market dynamics

Guidelines:
- Always provide specific, actionable information
- When discussing funding amounts, use appropriate units (₹Cr, $M, etc.)
- Cite sources when possible and mention if data might be outdated
- Be transparent about limitations of your knowledge
- For policy questions, mention eligibility criteria and deadlines when known
- If context from uploaded documents is provided, prioritize that information and cite it

${langConfig.prompt}
${contextText}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: query }
    ];

    console.log('Processing RAG query:', query.substring(0, 100), 'Language:', language, 'Context chunks:', contextChunks.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'X-Document-Sources': JSON.stringify(documentSources.map(d => ({ 
          name: d.file_name, 
          category: d.category 
        })))
      },
    });

  } catch (error) {
    console.error('RAG query error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
