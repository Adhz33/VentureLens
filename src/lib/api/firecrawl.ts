import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions, apiKey?: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
      headers: apiKey ? { 'x-firecrawl-key': apiKey } : undefined,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Search the web
  async search(query: string, options?: SearchOptions, apiKey?: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
      headers: apiKey ? { 'x-firecrawl-key': apiKey } : undefined,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Map a website to discover all URLs
  async map(url: string, options?: MapOptions, apiKey?: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
      headers: apiKey ? { 'x-firecrawl-key': apiKey } : undefined,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
