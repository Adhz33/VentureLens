import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FundingRecord {
  id: string;
  startup_name: string;
  funding_amount: number | null;
  funding_round: string | null;
  sector: string | null;
  investor_name: string | null;
  location: string | null;
  funding_date: string | null;
}

interface SectorComparisonProps {
  data?: FundingRecord[];
  isLoading?: boolean;
}

const SECTOR_COLORS: Record<string, string> = {
  'Fintech': 'hsl(32, 95%, 55%)',
  'E-commerce': 'hsl(199, 89%, 48%)',
  'Healthtech': 'hsl(142, 76%, 36%)',
  'Edtech': 'hsl(280, 65%, 60%)',
  'Agritech': 'hsl(38, 92%, 50%)',
  'Logistics': 'hsl(172, 66%, 50%)',
  'SaaS': 'hsl(340, 75%, 55%)',
  'Others': 'hsl(215, 20%, 55%)',
};

export const SectorComparison = ({ data = [], isLoading }: SectorComparisonProps) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    data.forEach(record => {
      if (record.sector) sectors.add(record.sector);
    });
    return Array.from(sectors).sort();
  }, [data]);

  const comparisonData = useMemo(() => {
    if (selectedSectors.length === 0) return { monthly: [], summary: [] };

    const monthlyMap = new Map<string, Record<string, number>>();
    
    data.forEach(record => {
      if (!record.sector || !selectedSectors.includes(record.sector)) return;
      if (!record.funding_date) return;
      
      const date = new Date(record.funding_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {});
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData[record.sector] = (monthData[record.sector] || 0) + (record.funding_amount || 0);
    });

    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, sectors]) => {
        const formatted = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return {
          month: formatted,
          ...Object.fromEntries(
            Object.entries(sectors).map(([k, v]) => [k, v / 1000000])
          ),
        };
      });

    const summary = selectedSectors.map(sector => {
      const sectorData = data.filter(d => d.sector === sector);
      const totalFunding = sectorData.reduce((sum, d) => sum + (d.funding_amount || 0), 0);
      const dealCount = sectorData.length;
      const avgDealSize = dealCount > 0 ? totalFunding / dealCount : 0;
      
      return {
        sector,
        totalFunding: totalFunding / 1000000,
        dealCount,
        avgDealSize: avgDealSize / 1000000,
        color: SECTOR_COLORS[sector] || 'hsl(215, 20%, 55%)',
      };
    });

    return { monthly, summary };
  }, [data, selectedSectors]);

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : prev.length < 5 ? [...prev, sector] : prev
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Sector Comparison</h3>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">Select up to 5 sectors to compare:</p>
        <div className="flex flex-wrap gap-3">
          {availableSectors.map(sector => (
            <div key={sector} className="flex items-center space-x-2">
              <Checkbox
                id={`sector-${sector}`}
                checked={selectedSectors.includes(sector)}
                onCheckedChange={() => toggleSector(sector)}
                disabled={!selectedSectors.includes(sector) && selectedSectors.length >= 5}
              />
              <Label
                htmlFor={`sector-${sector}`}
                className="text-sm cursor-pointer"
                style={{ color: SECTOR_COLORS[sector] || 'hsl(215, 20%, 55%)' }}
              >
                {sector}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedSectors.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Select sectors above to compare funding trends
        </div>
      ) : (
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="total">Total Funding</TabsTrigger>
            <TabsTrigger value="deals">Deal Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData.monthly}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}M`, '']}
                />
                <Legend />
                {selectedSectors.map(sector => (
                  <Line
                    key={sector}
                    type="monotone"
                    dataKey={sector}
                    stroke={SECTOR_COLORS[sector] || 'hsl(215, 20%, 55%)'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="total" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData.summary} layout="vertical">
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}M`} />
                <YAxis type="category" dataKey="sector" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}M`, 'Total Funding']}
                />
                <Bar dataKey="totalFunding" radius={[0, 4, 4, 0]}>
                  {comparisonData.summary.map((entry, index) => (
                    <rect key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="deals" className="h-72">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-auto">
              {comparisonData.summary.map(sector => (
                <Card key={sector.sector} className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: sector.color }}
                    />
                    <h4 className="font-medium text-foreground">{sector.sector}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Deals</span>
                      <span className="font-medium text-foreground">{sector.dealCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Funding</span>
                      <span className="font-medium text-foreground">${sector.totalFunding.toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Deal Size</span>
                      <span className="font-medium text-foreground">${sector.avgDealSize.toFixed(2)}M</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};
