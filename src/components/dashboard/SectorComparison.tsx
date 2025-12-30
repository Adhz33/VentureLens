import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageCode } from '@/lib/constants';
import { translations } from '@/lib/localization';

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
  selectedLanguage?: LanguageCode;
}

// Distinct color palette for sector comparison - vibrant and easily distinguishable
const SECTOR_COLORS: Record<string, string> = {
  'FinTech': '#F97316',        // Orange
  'Fintech': '#F97316',        // Orange (alt case)
  'E-commerce': '#3B82F6',     // Blue
  'HealthTech': '#10B981',     // Emerald
  'Healthtech': '#10B981',     // Emerald (alt case)
  'EdTech': '#8B5CF6',         // Violet
  'Edtech': '#8B5CF6',         // Violet (alt case)
  'AgriTech': '#EAB308',       // Yellow
  'Agritech': '#EAB308',       // Yellow (alt case)
  'Logistics': '#14B8A6',      // Teal
  'SaaS': '#EC4899',           // Pink
  'Enterprise/SaaS': '#EC4899', // Pink
  'CleanTech': '#22C55E',      // Green
  'DeepTech/AI': '#6366F1',    // Indigo
  'DeepTech': '#6366F1',       // Indigo (alt)
  'AI/ML': '#A855F7',          // Purple
  'Consumer': '#F43F5E',       // Rose
  'Gaming': '#06B6D4',         // Cyan
  'Media': '#FB923C',          // Light Orange
  'Real Estate': '#84CC16',    // Lime
  'Travel': '#0EA5E9',         // Sky
  'Others': '#64748B',         // Slate
};

// Fallback colors for sectors not in the predefined list
const FALLBACK_COLORS = [
  '#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EAB308',
  '#14B8A6', '#EC4899', '#22C55E', '#6366F1', '#F43F5E',
];

const getSectorColor = (sector: string, index: number): string => {
  return SECTOR_COLORS[sector] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export const SectorComparison = ({ data = [], isLoading, selectedLanguage = 'en' }: SectorComparisonProps) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const t = translations[selectedLanguage];

  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    data.forEach(record => {
      if (record.sector) sectors.add(record.sector);
    });
    const result = Array.from(sectors).sort();
    console.log('SectorComparison - data length:', data.length, 'available sectors:', result);
    return result;
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
      
      const sectorIndex = selectedSectors.indexOf(sector);
      
      return {
        sector,
        totalFunding: totalFunding / 1000000,
        dealCount,
        avgDealSize: avgDealSize / 1000000,
        color: getSectorColor(sector, sectorIndex),
      };
    });

    return { monthly, summary };
  }, [data, selectedSectors]);

  const toggleSector = (sector: string, checked: boolean | 'indeterminate') => {
    if (checked === 'indeterminate') return;
    
    setSelectedSectors(prev => {
      if (checked) {
        // Adding sector
        return prev.length < 5 ? [...prev, sector] : prev;
      } else {
        // Removing sector
        return prev.filter(s => s !== sector);
      }
    });
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
        <h3 className="text-lg font-semibold text-foreground">{t.sectorComparison}</h3>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">{t.selectSectorsToCompare}</p>
        <div className="flex flex-wrap gap-3">
          {availableSectors.map(sector => (
            <div key={sector} className="flex items-center space-x-2">
              <Checkbox
                id={`sector-${sector}`}
                checked={selectedSectors.includes(sector)}
                onCheckedChange={(checked) => toggleSector(sector, checked)}
                disabled={!selectedSectors.includes(sector) && selectedSectors.length >= 5}
              />
              <Label
                htmlFor={`sector-${sector}`}
                className="text-sm cursor-pointer font-medium"
                style={{ color: getSectorColor(sector, availableSectors.indexOf(sector)) }}
              >
                {sector}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedSectors.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          {t.selectSectorsPrompt}
        </div>
      ) : (
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">{t.monthlyTrends}</TabsTrigger>
            <TabsTrigger value="total">{t.totalFundingTab}</TabsTrigger>
            <TabsTrigger value="deals">{t.dealAnalysis}</TabsTrigger>
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
                  {selectedSectors.map((sector, index) => (
                  <Line
                    key={sector}
                    type="monotone"
                    dataKey={sector}
                    stroke={getSectorColor(sector, index)}
                    strokeWidth={3}
                    dot={{ r: 5, fill: getSectorColor(sector, index), strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
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
                  formatter={(value: number) => [`$${value.toFixed(2)}M`, t.totalFunding]}
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
                      <span className="text-muted-foreground">{t.totalDeals}</span>
                      <span className="font-medium text-foreground">{sector.dealCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.totalFunding}</span>
                      <span className="font-medium text-foreground">${sector.totalFunding.toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.avgDealSize}</span>
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
