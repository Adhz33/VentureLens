import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export const DataFreshnessIndicator = () => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    const fetchLastUpdate = async () => {
      try {
        const { data, error } = await supabase
          .from('funding_data')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setLastUpdate(new Date(data.created_at));
        }

        const { count } = await supabase
          .from('funding_data')
          .select('*', { count: 'exact', head: true });
        
        setRecordCount(count || 0);
      } catch (err) {
        console.error('Error fetching data freshness:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastUpdate();
  }, []);

  const getStatusColor = () => {
    if (!lastUpdate) return 'text-muted-foreground';
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 24) return 'text-green-500';
    if (hoursSinceUpdate < 72) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    if (!lastUpdate) return <Clock className="w-3.5 h-3.5" />;
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 24) return <CheckCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs">
      <span className={getStatusColor()}>
        {getStatusIcon()}
      </span>
      <span className="text-muted-foreground">
        {isLoading ? (
          'Checking...'
        ) : lastUpdate ? (
          <>
            <span className="font-medium text-foreground">{recordCount.toLocaleString()}</span> records · Updated{' '}
            <span className={getStatusColor()}>
              {formatDistanceToNow(lastUpdate, { addSuffix: true })}
            </span>
          </>
        ) : (
          'No data available'
        )}
      </span>
    </div>
  );
};
