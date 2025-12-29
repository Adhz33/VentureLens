import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, isWithinInterval } from 'date-fns';

export interface FundingRecord {
  id: string;
  startup_name: string;
  funding_amount: number | null;
  funding_round: string | null;
  sector: string | null;
  investor_name: string | null;
  location: string | null;
  funding_date: string | null;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export const useFundingData = (dateRange?: DateRange) => {
  const [data, setData] = useState<FundingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('funding_data')
          .select('*')
          .order('funding_date', { ascending: false });

        if (dateRange?.from && dateRange?.to) {
          query = query
            .gte('funding_date', format(dateRange.from, 'yyyy-MM-dd'))
            .lte('funding_date', format(dateRange.to, 'yyyy-MM-dd'));
        }

        const { data: fundingData, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setData(fundingData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching funding data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange?.from?.getTime(), dateRange?.to?.getTime()]);

  const stats = useMemo(() => {
    const totalFunding = data.reduce((sum, d) => sum + (d.funding_amount || 0), 0);
    const uniqueStartups = new Set(data.map(d => d.startup_name)).size;
    const uniqueInvestors = new Set(data.filter(d => d.investor_name).map(d => d.investor_name)).size;
    
    return {
      totalFunding,
      totalDeals: data.length,
      uniqueStartups,
      uniqueInvestors,
    };
  }, [data]);

  const monthlyTrends = useMemo(() => {
    const monthMap = new Map<string, { amount: number; deals: number }>();
    
    data.forEach(record => {
      if (record.funding_date) {
        const monthKey = format(parseISO(record.funding_date), 'MMM yyyy');
        const existing = monthMap.get(monthKey) || { amount: 0, deals: 0 };
        monthMap.set(monthKey, {
          amount: existing.amount + (record.funding_amount || 0),
          deals: existing.deals + 1,
        });
      }
    });

    return Array.from(monthMap.entries())
      .map(([month, values]) => ({
        month,
        amount: values.amount / 1000000, // Convert to millions
        deals: values.deals,
      }))
      .slice(-12);
  }, [data]);

  const sectorBreakdown = useMemo(() => {
    const sectorMap = new Map<string, { amount: number; deals: number; startups: FundingRecord[] }>();
    
    data.forEach(record => {
      const sector = record.sector || 'Others';
      const existing = sectorMap.get(sector) || { amount: 0, deals: 0, startups: [] };
      sectorMap.set(sector, {
        amount: existing.amount + (record.funding_amount || 0),
        deals: existing.deals + 1,
        startups: [...existing.startups, record],
      });
    });

    const colors = [
      'hsl(32, 95%, 55%)',
      'hsl(199, 89%, 48%)',
      'hsl(142, 76%, 36%)',
      'hsl(280, 65%, 60%)',
      'hsl(38, 92%, 50%)',
      'hsl(172, 66%, 50%)',
      'hsl(340, 75%, 55%)',
      'hsl(215, 20%, 55%)',
    ];

    return Array.from(sectorMap.entries())
      .map(([name, values], index) => ({
        name,
        value: values.amount / 1000000,
        deals: values.deals,
        startups: values.startups,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [data]);

  return {
    data,
    isLoading,
    error,
    stats,
    monthlyTrends,
    sectorBreakdown,
  };
};
