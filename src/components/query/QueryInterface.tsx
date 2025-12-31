import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, ChevronRight, FileText, Globe, Search, FileSearch, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LanguageCode, SAMPLE_QUERIES } from '@/lib/constants';
import { getTranslation, SearchMode } from '@/lib/localization';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useApiKeys } from '@/contexts/ApiKeyContext';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import logo1 from '@/assets/logo1.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  documentSources?: Array<{ name: string; category: string }>;
  showWebSearchPrompt?: boolean;
  originalQuery?: string;
}

interface QueryInterfaceProps {
  language: LanguageCode;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Phrases that indicate the AI doesn't have the answer in documents
const NO_INFO_PHRASES = [
  'i do not have specific details',
  'i don\'t have specific details',
  'i do not have information',
  'i don\'t have information',
  'not in the provided documents',
  'documents don\'t contain',
  'documents do not contain',
  'i would recommend checking',
  'i couldn\'t find specific',
  'i could not find specific',
  'no specific information',
  'information is not available',
  'not available in the documents',
  'cannot find specific details',
  'don\'t have data about',
  'do not have data about',
];

export const QueryInterface = ({ language }: QueryInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('combined');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const { geminiApiKey, cloudApiKey } = useApiKeys();

  const t = getTranslation(language);
  const sampleQueries = SAMPLE_QUERIES[language as keyof typeof SAMPLE_QUERIES] || SAMPLE_QUERIES.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Check if response indicates missing information
  const checkForMissingInfo = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    return NO_INFO_PHRASES.some(phrase => lowerContent.includes(phrase));
  };

  // Perform web search using Perplexity
  const performWebSearch = async (searchQuery: string, messageId?: string) => {
    setIsWebSearching(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/web-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'x-cloud-key': cloudApiKey,
        },
        body: JSON.stringify({
          query: searchQuery,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Web search failed');
      }

      const data = await response.json();

      // Add web search result as a new message
      const webSearchMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || 'No results found from web search.',
        sources: data.citations || [],
      };

      if (messageId) {
        // Remove the web search prompt from the previous message and add the new one
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, showWebSearchPrompt: false } : m
        ).concat(webSearchMessage));
      } else {
        setMessages(prev => [...prev, webSearchMessage]);
      }

      toast({
        title: t.webSearchComplete,
        description: t.foundInfoFromWeb,
      });

      return data;
    } catch (error) {
      console.error('Web search error:', error);
      toast({
        title: t.errorTitle,
        description: error instanceof Error ? error.message : t.webSearchFailed,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsWebSearching(false);
    }
  };

  // Perform RAG query on documents
  const performDocumentSearch = async (searchQuery: string): Promise<{ content: string; documentSources: any[]; hasMissingInfo: boolean }> => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/rag-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'x-gemini-key': geminiApiKey,
      },
      body: JSON.stringify({
        query: searchQuery,
        language: language,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        useKnowledgeBase: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(t.rateLimitError);
      }
      if (response.status === 402) {
        throw new Error(t.creditsExhausted);
      }
      throw new Error(errorData.error || 'Failed to get response');
    }

    // Parse document sources from header
    let documentSources: Array<{ name: string; category: string }> = [];
    try {
      const sourcesHeader = response.headers.get('X-Document-Sources');
      if (sourcesHeader) {
        documentSources = JSON.parse(sourcesHeader);
      }
    } catch (e) {
      console.log('No document sources in header');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';
    let textBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullContent += content;
            setStreamingContent(fullContent);
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullContent += content;
          }
        } catch { /* ignore */ }
      }
    }

    const hasMissingInfo = checkForMissingInfo(fullContent);

    return { content: fullContent, documentSources, hasMissingInfo };
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      if (searchMode === 'web') {
        // Web-only mode
        setIsWebSearching(true);
        await performWebSearch(currentQuery);
        setIsWebSearching(false);
      } else if (searchMode === 'documents') {
        // Documents-only mode
        const result = await performDocumentSearch(currentQuery);
        const messageId = (Date.now() + 1).toString();

        const assistantMessage: Message = {
          id: messageId,
          role: 'assistant',
          content: result.content || 'I apologize, but I could not generate a response. Please try again.',
          documentSources: result.documentSources.length > 0 ? result.documentSources : undefined,
          // In documents-only mode, show web search prompt if missing info
          showWebSearchPrompt: result.hasMissingInfo,
          originalQuery: result.hasMissingInfo ? currentQuery : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
      } else {
        // Combined mode: documents first, then web if needed
        const result = await performDocumentSearch(currentQuery);
        const messageId = (Date.now() + 1).toString();

        const assistantMessage: Message = {
          id: messageId,
          role: 'assistant',
          content: result.content || 'I apologize, but I could not generate a response. Please try again.',
          documentSources: result.documentSources.length > 0 ? result.documentSources : undefined,
          showWebSearchPrompt: result.hasMissingInfo,
          originalQuery: result.hasMissingInfo ? currentQuery : undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
      }
    } catch (error) {
      console.error('Query error:', error);
      toast({
        title: t.errorTitle,
        description: error instanceof Error ? error.message : t.failedToProcess,
        variant: 'destructive',
      });
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, language, messages, toast, searchMode, t]);

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const clearConversation = () => {
    setMessages([]);
    setStreamingContent('');
  };

  const searchModeOptions = [
    { value: 'documents' as SearchMode, label: t.documentsOnly, icon: FileSearch, desc: t.documentsOnlyDesc },
    { value: 'web' as SearchMode, label: t.webOnly, icon: Globe, desc: t.webOnlyDesc },
    { value: 'combined' as SearchMode, label: t.combined, icon: Layers, desc: t.combinedDesc },
  ];

  return (
    <section id="query" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            <span className="text-gradient">{t.intelligentQuery}</span> Query Interface
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.queryDescription}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Mode Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t.searchMode}
            </label>
            <div className="flex flex-wrap gap-2">
              {searchModeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSearchMode(option.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${searchMode === option.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                      }`}
                    title={option.desc}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Container */}
          <div className="glass rounded-2xl overflow-hidden">
            {/* Messages Area */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.length === 0 && !streamingContent ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 flex items-center justify-center mb-4">
                    <img src={logo1} alt="VentureLens" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-6">
                    {t.startExploring}
                  </h3>

                  {/* Sample Queries */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {sampleQueries.slice(0, 3).map((sample, index) => (
                      <button
                        key={index}
                        onClick={() => handleSampleQuery(sample)}
                        className="px-4 py-2 text-sm bg-secondary/50 rounded-full text-muted-foreground 
                                   hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        {sample.length > 40 ? sample.substring(0, 40) + '...' : sample}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3 ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/70 text-foreground'
                          }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}

                        {/* Web Search Prompt */}
                        {message.showWebSearchPrompt && message.originalQuery && (
                          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <div className="flex items-start gap-3">
                              <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-2">
                                  {t.documentsNoInfo}
                                </p>
                                <p className="text-xs text-muted-foreground mb-3">
                                  {t.wouldYouLikeWebSearch}
                                </p>
                                <Button
                                  size="sm"
                                  onClick={() => performWebSearch(message.originalQuery!, message.id)}
                                  disabled={isWebSearching}
                                  className="gap-2"
                                >
                                  {isWebSearching ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      {t.searching}
                                    </>
                                  ) : (
                                    <>
                                      <Search className="w-4 h-4" />
                                      {t.searchTheWeb}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Document Sources */}
                        {message.documentSources && message.documentSources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {t.fromKnowledgeBase}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.documentSources.map((doc, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                >
                                  {doc.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Web Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {t.webSources}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-info hover:underline flex items-center gap-1"
                                >
                                  {source.title}
                                  <ChevronRight className="w-3 h-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Streaming content */}
                  {streamingContent && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-secondary/70 text-foreground">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Web Search Loading */}
                  {isWebSearching && (
                    <div className="flex justify-start">
                      <div className="bg-secondary/70 rounded-2xl px-6 py-4">
                        <div className="flex items-center gap-4">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-muted-foreground">{t.searchingWeb}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isLoading && !streamingContent && !isWebSearching && (
                    <div className="flex justify-start">
                      <div className="bg-secondary/70 rounded-2xl px-6 py-4">
                        <div className="flex items-center gap-4">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-muted-foreground">{t.searchingKnowledgeBase}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.askPlaceholder}
                  className="query-input flex-1"
                  disabled={isLoading || isWebSearching}
                />
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isLoading || isWebSearching || !query.trim()}
                  title={t.send}
                >
                  {isLoading || isWebSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
              {messages.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.clearConversation}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
