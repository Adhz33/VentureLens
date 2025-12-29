import { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle, AlertCircle, Play, Calendar, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CrawlResult {
  source: string;
  status: 'success' | 'skipped' | 'error';
  contentLength?: number;
  chunks?: number;
  fundingRecords?: number;
  reason?: string;
}

interface CrawlStatus {
  isRunning: boolean;
  lastRun?: string;
  nextRun?: string;
  results?: CrawlResult[];
}

const SOURCES = [
  { name: 'Inc42 Funding Galore', url: 'https://inc42.com/buzz/funding-galore' },
  { name: 'YourStory Funding', url: 'https://yourstory.com/companies/funding' },
  { name: 'Entrackr Funding', url: 'https://entrackr.com/category/funding/' },
  { name: 'VCCircle Deals', url: 'https://www.vccircle.com/deals' },
  { name: 'Startup India Schemes', url: 'https://startupindia.gov.in/content/sih/en/government-schemes.html' },
];

export const CrawlScheduler = () => {
  const [status, setStatus] = useState<CrawlStatus>({ isRunning: false });
  const [isManualRunning, setIsManualRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Calculate next run time (6 AM UTC daily)
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(6, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    setStatus(prev => ({ ...prev, nextRun: nextRun.toISOString() }));
  }, []);

  const triggerManualCrawl = async () => {
    setIsManualRunning(true);
    setStatus(prev => ({ ...prev, isRunning: true }));

    try {
      toast({
        title: 'Crawl Started',
        description: 'Fetching latest funding data from all sources...',
      });

      const { data, error } = await supabase.functions.invoke('scheduled-crawl', {
        body: { manual: true },
      });

      if (error) throw error;

      setStatus(prev => ({
        ...prev,
        isRunning: false,
        lastRun: new Date().toISOString(),
        results: data.results,
      }));

      const successCount = data.results?.filter((r: CrawlResult) => r.status === 'success').length || 0;

      toast({
        title: 'Crawl Completed',
        description: `Successfully processed ${successCount} sources in ${data.duration}`,
      });
    } catch (error) {
      console.error('Manual crawl error:', error);
      setStatus(prev => ({ ...prev, isRunning: false }));
      toast({
        title: 'Crawl Failed',
        description: error instanceof Error ? error.message : 'Failed to run crawl',
        variant: 'destructive',
      });
    } finally {
      setIsManualRunning(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Scheduled Data Ingestion
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically crawls funding sources daily at 6:00 AM UTC
          </p>
        </div>
        <Button
          variant="hero"
          size="sm"
          onClick={triggerManualCrawl}
          disabled={isManualRunning}
          className="gap-2"
        >
          {isManualRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Run Now
        </Button>
      </div>

      {/* Schedule Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Last Run</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {formatDate(status.lastRun)}
          </p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Next Scheduled</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {formatDate(status.nextRun)}
          </p>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground mb-2">Configured Sources ({SOURCES.length})</p>
        {SOURCES.map((source, idx) => {
          const result = status.results?.find(r => r.source === source.name);
          return (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{source.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {source.url}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result && (
                  <>
                    {result.status === 'success' && (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle className="w-3 h-3" />
                        {result.chunks} chunks
                      </span>
                    )}
                    {result.status === 'skipped' && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Skipped
                      </span>
                    )}
                    {result.status === 'error' && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </span>
                    )}
                  </>
                )}
                {status.isRunning && !result && (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
