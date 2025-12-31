import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, language = 'en' } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headerApiKey = req.headers.get('x-cloud-key');
    const PERPLEXITY_API_KEY = headerApiKey || Deno.env.get('PERPLEXITY_API_KEY');

    if (!PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY (Cloud API Key) not configured');
      return new Response(
        JSON.stringify({ error: 'Web search service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

    const systemPrompt = `You are VentureLens, an expert AI assistant specializing in Indian startup funding intelligence. You are now searching the web for real-time information.

Your role is to provide accurate, up-to-date insights about:
1. **Startup Funding**: Investment rounds, valuations, funding trends, deal sizes
2. **Investors**: VCs, angel investors, PE firms, their portfolios and investment patterns  
3. **Government Policies**: State-specific startup missions, tax benefits, grants, subsidies
4. **Ecosystem Trends**: Sector-wise analysis, emerging opportunities, market dynamics

Guidelines:
- Provide specific, actionable information from web search results
- When discussing funding amounts, use appropriate units (₹Cr, $M, etc.)
- Always cite your sources clearly
- Focus on the most recent and relevant information
- For policy questions, mention eligibility criteria and official links when available

${langConfig.prompt}`;

    console.log('Performing web search for:', query.substring(0, 100), 'Language:', language);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        search_recency_filter: 'month', // Get recent results
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to perform web search' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    console.log('Web search completed, citations:', citations.length);

    return new Response(
      JSON.stringify({
        content,
        citations: citations.map((url: string, index: number) => ({
          title: `Source ${index + 1}`,
          url
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Web search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
