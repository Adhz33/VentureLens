import { useState, useEffect } from 'react';
import { Globe, FileText, Database, RefreshCw, Plus, Check, AlertCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CrawlScheduler } from './CrawlScheduler';
import { LanguageCode } from '@/lib/constants';
import { getTranslation } from '@/lib/localization';
import { formatDistanceToNow, format } from 'date-fns';

interface DataSource {
  id: string;
  url: string;
  title: string;
  sourceType: 'web' | 'pdf' | 'table' | 'report' | 'api';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface DataSourcePanelProps {
  selectedLanguage?: LanguageCode;
}

export const DataSourcePanel = ({ selectedLanguage = 'en' }: DataSourcePanelProps) => {
  const [url, setUrl] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const { toast } = useToast();
  const t = getTranslation(selectedLanguage);

  // Fetch data sources from database
  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        const { data, error } = await supabase
          .from('data_sources')
          .select('id, url, title, source_type, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data) {
          setDataSources(
            data.map((s) => ({
              id: s.id,
              url: s.url,
              title: s.title || s.url,
              sourceType: s.source_type as DataSource['sourceType'],
              status: 'completed' as const,
              createdAt: s.created_at,
              updatedAt: s.updated_at,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching data sources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataSources();
  }, []);

  const t_local = getTranslation(selectedLanguage);

  const handleIngest = async () => {
    if (!url.trim()) return;

    setIsIngesting(true);

    const newSource: DataSource = {
      id: Date.now().toString(),
      url: url.trim(),
      title: t.processing + '...',
      sourceType: 'web',
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
                  updatedAt: new Date().toISOString(),
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
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Loading sources...</p>
              </div>
            ) : dataSources.length === 0 ? (
              <div className="p-8 text-center">
                <Globe className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No data sources yet. Add a URL above to get started.</p>
              </div>
            ) : (
              dataSources.map((source, index) => (
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
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span 
                        className="text-xs text-muted-foreground" 
                        title={`Updated: ${format(new Date(source.updatedAt), 'PPpp')}`}
                      >
                        {formatDistanceToNow(new Date(source.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    {source.createdAt !== source.updatedAt && (
                      <span 
                        className="text-xs text-muted-foreground/60"
                        title={`Created: ${format(new Date(source.createdAt), 'PPpp')}`}
                      >
                        Created {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {getStatusIcon(source.status)}
                </div>
              ))
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
