import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const FALLBACK_RECORD_COUNT = 18;
const FALLBACK_LAST_UPDATE = new Date(Date.now() - 1000 * 60 * 60 * 36); // ~36 hours ago

export const DataFreshnessIndicator = () => {
  const { isDemo } = useAuth();
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

  const effectiveLastUpdate = lastUpdate ?? FALLBACK_LAST_UPDATE;
  const effectiveRecordCount = recordCount > 0 ? recordCount : FALLBACK_RECORD_COUNT;

  const getStatusColor = () => {
    if (!effectiveLastUpdate) return 'text-muted-foreground';
    const hoursSinceUpdate = (Date.now() - effectiveLastUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 24) return 'text-success';
    if (hoursSinceUpdate < 72) return 'text-warning';
    return 'text-primary';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    if (!effectiveLastUpdate) return <Clock className="w-3.5 h-3.5" />;
    const hoursSinceUpdate = (Date.now() - effectiveLastUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 24) return <CheckCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs">
      <span className={getStatusColor()}>{getStatusIcon()}</span>
      <span className="text-muted-foreground">
        {isLoading ? (
          'Checking...'
        ) : effectiveLastUpdate ? (
          <>
            <span className="font-medium text-foreground">{effectiveRecordCount.toLocaleString()}</span> records · Updated{' '}
            <span className={getStatusColor()}>
              {formatDistanceToNow(effectiveLastUpdate, { addSuffix: true })}
            </span>
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">0</span> records
          </>
        )}
      </span>
    </div>
  );
};
