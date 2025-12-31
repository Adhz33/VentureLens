import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StartupProfile {
  name: string;
  sector: string;
  stage: string;
  fundingNeeded: string;
  location: string;
  description: string;
}

interface Investor {
  id: string;
  name: string;
  investor_type: string | null;
  portfolio_focus: string[] | null;
  total_investments: number | null;
  notable_investments: string[] | null;
  location: string | null;
  website: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startupProfile } = await req.json() as { startupProfile: StartupProfile };

    console.log('Matching investors for startup:', startupProfile.name, 'Sector:', startupProfile.sector);

    const headerApiKey = req.headers.get('x-gemini-key');
    const GEMINI_API_KEY = headerApiKey || Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('AI service (Gemini) is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all investors from database
    const { data: investors, error: investorsError } = await supabase
      .from('investors')
      .select('*');

    if (investorsError) {
      console.error('Error fetching investors:', investorsError);
      throw new Error('Failed to fetch investors');
    }

    console.log('Found investors in database:', investors?.length || 0);

    // Use sample investors if database is empty
    const investorPool: Investor[] = investors && investors.length > 0 ? investors : [
      {
        id: '1',
        name: 'Sequoia Capital India',
        investor_type: 'Venture Capital',
        location: 'Bangalore, India',
        total_investments: 3200000000,
        portfolio_focus: ['FinTech', 'SaaS', 'Consumer Tech', 'HealthTech'],
        notable_investments: ["BYJU's", 'Zomato', 'Razorpay', 'Unacademy'],
        website: 'https://www.sequoiacap.com/india/',
      },
      {
        id: '2',
        name: 'Accel Partners',
        investor_type: 'Venture Capital',
        location: 'Bangalore, India',
        total_investments: 2800000000,
        portfolio_focus: ['Enterprise', 'Consumer', 'FinTech', 'B2B SaaS'],
        notable_investments: ['Flipkart', 'Swiggy', 'Freshworks', 'BrowserStack'],
        website: 'https://www.accel.com/',
      },
      {
        id: '3',
        name: 'Tiger Global',
        investor_type: 'Private Equity',
        location: 'New York, USA',
        total_investments: 4500000000,
        portfolio_focus: ['E-commerce', 'FinTech', 'EdTech', 'SaaS'],
        notable_investments: ['Flipkart', 'Ola', 'Lenskart', 'Groww'],
        website: 'https://www.tigerglobal.com/',
      },
      {
        id: '4',
        name: 'Blume Ventures',
        investor_type: 'Venture Capital',
        location: 'Mumbai, India',
        total_investments: 450000000,
        portfolio_focus: ['Deep Tech', 'Consumer', 'HealthTech', 'FinTech'],
        notable_investments: ['Unacademy', 'Dunzo', 'Slice', 'Carbon Clean'],
        website: 'https://blume.vc/',
      },
      {
        id: '5',
        name: 'Matrix Partners India',
        investor_type: 'Venture Capital',
        location: 'Bangalore, India',
        total_investments: 1200000000,
        portfolio_focus: ['SaaS', 'Consumer', 'FinTech', 'Healthcare'],
        notable_investments: ['Ola', 'Razorpay', 'Country Delight', 'Five Star'],
        website: 'https://www.matrixpartners.in/',
      },
      {
        id: '6',
        name: 'Kalaari Capital',
        investor_type: 'Venture Capital',
        location: 'Bangalore, India',
        total_investments: 650000000,
        portfolio_focus: ['Consumer Tech', 'SaaS', 'HealthTech', 'EdTech'],
        notable_investments: ['Dream11', 'Cure.fit', 'Myntra', 'Urban Ladder'],
        website: 'https://www.kalaari.com/',
      },
      {
        id: '7',
        name: 'Lightspeed India',
        investor_type: 'Venture Capital',
        location: 'Bangalore, India',
        total_investments: 900000000,
        portfolio_focus: ['Enterprise', 'Consumer', 'FinTech', 'Gaming'],
        notable_investments: ['Oyo', 'Udaan', 'ShareChat', 'Byju\'s'],
        website: 'https://lsvp.com/',
      },
      {
        id: '8',
        name: 'Peak XV Partners',
        investor_type: 'Venture Capital',
        location: 'Bangalore, India',
        total_investments: 2500000000,
        portfolio_focus: ['Consumer', 'SaaS', 'FinTech', 'HealthTech', 'EdTech'],
        notable_investments: ['Zomato', 'Urban Company', 'Meesho', 'Mamaearth'],
        website: 'https://www.peakxv.com/',
      },
    ];

    const investorContext = investorPool.map(inv =>
      `- ${inv.name} (${inv.investor_type}): Focus areas: ${inv.portfolio_focus?.join(', ') || 'Various'}. Location: ${inv.location}. Notable investments: ${inv.notable_investments?.join(', ') || 'N/A'}. Total invested: $${((inv.total_investments || 0) / 1000000000).toFixed(1)}B`
    ).join('\n');

    const systemPrompt = `You are an expert startup investment advisor. Your task is to analyze a startup profile and match it with the most suitable investors from the available pool.

Available Investors:
${investorContext}

For each recommended investor, provide:
1. A match score (1-100) based on sector fit, stage alignment, and location
2. A brief explanation of why this investor is a good match
3. Key talking points the startup should emphasize when pitching

Return your response as a valid JSON object with this structure:
{
  "matches": [
    {
      "investorName": "Investor Name",
      "matchScore": 85,
      "matchReason": "Brief explanation",
      "talkingPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "overallAdvice": "General advice for the startup when approaching investors"
}

Focus on quality over quantity. Return the top 3-5 most suitable investors.`;

    const userPrompt = `Analyze this startup and recommend the best matching investors:

Startup Name: ${startupProfile.name}
Sector: ${startupProfile.sector}
Funding Stage: ${startupProfile.stage}
Funding Needed: ${startupProfile.fundingNeeded}
Location: ${startupProfile.location}
Description: ${startupProfile.description}

Provide investor matches with scores and explanations.`;

    console.log('Calling Gemini API for investor matching...');

    // Using Google's OpenAI-compatible endpoint for Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response received, parsing...');

    // Parse JSON from the response
    let matchResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        matchResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a formatted error response
      matchResult = {
        matches: [],
        overallAdvice: content,
        parseError: true
      };
    }

    // Enrich matches with full investor data
    const enrichedMatches = matchResult.matches?.map((match: any) => {
      const investor = investorPool.find(inv =>
        inv.name.toLowerCase().includes(match.investorName.toLowerCase()) ||
        match.investorName.toLowerCase().includes(inv.name.toLowerCase())
      );
      return {
        ...match,
        investorDetails: investor ? {
          name: investor.name,
          type: investor.investor_type,
          location: investor.location,
          portfolioFocus: investor.portfolio_focus,
          totalInvestments: investor.total_investments,
          notableInvestments: investor.notable_investments,
          website: investor.website,
        } : null
      };
    }) || [];

    console.log('Returning', enrichedMatches.length, 'investor matches');

    return new Response(JSON.stringify({
      matches: enrichedMatches,
      overallAdvice: matchResult.overallAdvice,
      startupProfile,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Investor matching error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
