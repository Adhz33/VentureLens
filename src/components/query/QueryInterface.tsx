import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageCode, SAMPLE_QUERIES } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
}

interface QueryInterfaceProps {
  language: LanguageCode;
}

export const QueryInterface = ({ language }: QueryInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const sampleQueries = SAMPLE_QUERIES[language as keyof typeof SAMPLE_QUERIES] || SAMPLE_QUERIES.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('rag-query', {
        body: { 
          query: query,
          language: language,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.response || 'I apologize, but I could not generate a response. Please try again.',
        sources: response.data?.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Query error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your query. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  return (
    <section id="query" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            <span className="text-gradient">Intelligent</span> Query Interface
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ask questions about startup funding in your preferred language. 
            Get grounded insights backed by real data sources.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Chat Container */}
          <div className="glass rounded-2xl overflow-hidden">
            {/* Messages Area */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    Start Exploring
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    Ask any question about startup funding, investors, or government policies
                  </p>
                  
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
                        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary/70 text-foreground'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Sources:
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
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-secondary/70 rounded-2xl px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
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
                  placeholder={
                    language === 'hi' 
                      ? 'अपना प्रश्न यहाँ पूछें...' 
                      : language === 'ta'
                      ? 'உங்கள் கேள்வியை இங்கே கேளுங்கள்...'
                      : 'Ask your question here...'
                  }
                  className="query-input flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isLoading || !query.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
