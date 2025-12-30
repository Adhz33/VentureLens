import { useState, useEffect } from 'react';
import { Globe, FileText, Database, RefreshCw, Plus, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CrawlScheduler } from './CrawlScheduler';
import { LanguageCode } from '@/lib/constants';
import { getTranslation } from '@/lib/localization';

interface DataSource {
  id: string;
  url: string;
  title: string;
  sourceType: 'web' | 'pdf' | 'table' | 'report' | 'api';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface DataSourcePanelProps {
  selectedLanguage?: LanguageCode;
}

export const DataSourcePanel = ({ selectedLanguage = 'en' }: DataSourcePanelProps) => {
  const [url, setUrl] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      url: 'https://inc42.com/buzz/funding-galore',
      title: 'Inc42 Funding News',
      sourceType: 'web',
      status: 'completed',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      url: 'https://yourstory.com/funding-daily',
      title: 'YourStory Daily Funding',
      sourceType: 'web',
      status: 'completed',
      createdAt: '2024-01-14',
    },
    {
      id: '3',
      url: 'https://startupindia.gov.in/schemes',
      title: 'Startup India Schemes',
      sourceType: 'web',
      status: 'completed',
      createdAt: '2024-01-13',
    },
  ]);
  const { toast } = useToast();
  const t = getTranslation(selectedLanguage);

  const handleIngest = async () => {
    if (!url.trim()) return;

    setIsIngesting(true);

    const newSource: DataSource = {
      id: Date.now().toString(),
      url: url.trim(),
      title: t.processing + '...',
      sourceType: 'web',
      status: 'processing',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setDataSources((prev) => [newSource, ...prev]);
    setUrl('');

    try {
      // Scrape the URL using Firecrawl
      const result = await firecrawlApi.scrape(url.trim(), {
        formats: ['markdown'],
        onlyMainContent: true,
      });

      if (result.success && result.data) {
        // Save to database via edge function
        const { error } = await supabase.functions.invoke('ingest-data', {
          body: {
            url: url.trim(),
            content: result.data.markdown || result.data.content,
            title: result.data.metadata?.title || url.trim(),
            sourceType: 'web',
          },
        });

        if (error) throw error;

        setDataSources((prev) =>
          prev.map((s) =>
            s.id === newSource.id
              ? {
                  ...s,
                  title: result.data.metadata?.title || 'Scraped Content',
                  status: 'completed' as const,
                }
              : s
          )
        );

        toast({
          title: t.dataIngested,
          description: t.contentScraped,
        });
      } else {
        throw new Error(result.error || 'Failed to scrape URL');
      }
    } catch (error) {
      console.error('Ingest error:', error);
      setDataSources((prev) =>
        prev.map((s) =>
          s.id === newSource.id ? { ...s, status: 'failed' as const } : s
        )
      );
      toast({
        title: t.ingestionFailed,
        description: t.failedToScrape,
        variant: 'destructive',
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-info animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSourceIcon = (type: DataSource['sourceType']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'table':
        return <Database className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <section id="sources" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            {t.dataSourcesTitle.split(' ')[0]} <span className="text-gradient">{t.dataSourcesTitle.split(' ')[1] || 'Sources'}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.dataSourcesDescription}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Scheduled Crawler */}
          <CrawlScheduler selectedLanguage={selectedLanguage} />

          {/* Add URL Form */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-foreground mb-4">{t.addCustomSource}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.enterUrlPlaceholder}
                className="query-input flex-1"
              />
              <Button
                onClick={handleIngest}
                variant="hero"
                size="lg"
                disabled={isIngesting || !url.trim()}
                className="gap-2 shrink-0"
              >
                {isIngesting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {t.addSource}
              </Button>
            </div>
          </div>

          {/* Data Sources List */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-display font-semibold text-foreground">{t.ingestedSources}</h3>
              <p className="text-sm text-muted-foreground">
                {dataSources.filter((s) => s.status === 'completed').length} {t.sourcesReady}
              </p>
            </div>

            <div className="divide-y divide-border/30">
              {dataSources.map((source, index) => (
                <div
                  key={source.id}
                  className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                    {getSourceIcon(source.sourceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{source.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {source.createdAt}
                    </span>
                    {getStatusIcon(source.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
