import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageCode } from '@/lib/constants';
import { translations } from '@/lib/localization';

const weeklyData = [
  { period: 'Week 1', current: 1200, previous: 980 },
  { period: 'Week 2', current: 1850, previous: 1200 },
  { period: 'Week 3', current: 2100, previous: 1650 },
  { period: 'Week 4', current: 1680, previous: 1900 },
];

const monthlyData = [
  { period: 'Jan', current: 4200, previous: 3800 },
  { period: 'Feb', current: 3100, previous: 2900 },
  { period: 'Mar', current: 5800, previous: 4200 },
  { period: 'Apr', current: 4500, previous: 4100 },
  { period: 'May', current: 6200, previous: 5100 },
  { period: 'Jun', current: 5400, previous: 4800 },
];

const quarterlyData = [
  { period: 'Q1', current: 13100, previous: 10900 },
  { period: 'Q2', current: 16100, previous: 14000 },
  { period: 'Q3', current: 18500, previous: 15200 },
  { period: 'Q4', current: 21200, previous: 17800 },
];

interface FundingComparisonProps {
  selectedLanguage?: LanguageCode;
}

export const FundingComparison = ({ selectedLanguage = 'en' }: FundingComparisonProps) => {
  const [period, setPeriod] = useState('monthly');
  const t = translations[selectedLanguage];

  const getData = () => {
    switch (period) {
      case 'weekly': return weeklyData;
      case 'quarterly': return quarterlyData;
      default: return monthlyData;
    }
  };

  const getLabels = () => {
    switch (period) {
      case 'weekly': return { current: t.thisWeek, previous: t.lastWeek };
      case 'quarterly': return { current: '2024', previous: '2023' };
      default: return { current: '2024', previous: '2023' };
    }
  };

  const data = getData();
  const labels = getLabels();

  const currentTotal = data.reduce((sum, d) => sum + d.current, 0);
  const previousTotal = data.reduce((sum, d) => sum + d.previous, 0);
  const changePercent = ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1);

  return (
    <div className="glass rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">{t.fundingComparison}</h3>
          <p className="text-sm text-muted-foreground">
            {changePercent.startsWith('-') ? '' : '+'}
            {changePercent}% {t.vsPreviousPeriod}
          </p>
        </div>
        
        <Tabs value={period} onValueChange={setPeriod} className="w-auto">
          <TabsList className="bg-background/50">
            <TabsTrigger value="weekly" className="text-xs px-3">{t.weekly}</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs px-3">{t.monthly}</TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs px-3">{t.quarterly}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" vertical={false} />
            <XAxis 
              dataKey="period" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}B` : `${value}M`}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 10%)', 
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
              formatter={(value: number) => [`$${value}M`, '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
            <Bar 
              dataKey="current" 
              name={labels.current}
              fill="hsl(32, 95%, 55%)" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="previous" 
              name={labels.previous}
              fill="hsl(215, 20%, 45%)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
