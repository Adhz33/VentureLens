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
    const { query, language = 'en', conversationHistory = [] } = await req.json();

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

${langConfig.prompt}

Current knowledge includes major Indian startup ecosystem data up to early 2024, including:
- Top funded startups like BYJU's, Swiggy, Razorpay, Zerodha, PhonePe
- Major investors: Sequoia Capital, Accel, Tiger Global, SoftBank, Peak XV
- Government schemes: Startup India Seed Fund, Fund of Funds, Credit Guarantee Scheme
- Key sectors: FinTech, EdTech, HealthTech, E-commerce, SaaS, DeepTech`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: query }
    ];

    console.log('Processing RAG query:', query.substring(0, 100), 'Language:', language);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
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

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';

    // Mock sources for demo - in production, these would come from RAG retrieval
    const sources = [
      { title: 'Inc42 Funding Report', url: 'https://inc42.com/buzz/funding-galore' },
      { title: 'Startup India Portal', url: 'https://startupindia.gov.in' },
    ];

    console.log('RAG query completed successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sources,
        language: langConfig.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG query error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
