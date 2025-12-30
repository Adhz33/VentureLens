import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { LanguageCode } from '@/lib/constants';
import { translations } from '@/lib/localization';

interface MonthlyData {
  month: string;
  amount: number;
  deals: number;
}

interface FundingChartProps {
  data?: MonthlyData[];
  isLoading?: boolean;
  selectedLanguage?: LanguageCode;
}

const fallbackData: MonthlyData[] = [
  { month: 'Jan', amount: 2400, deals: 45 },
  { month: 'Feb', amount: 1398, deals: 32 },
  { month: 'Mar', amount: 9800, deals: 78 },
  { month: 'Apr', amount: 3908, deals: 56 },
  { month: 'May', amount: 4800, deals: 62 },
  { month: 'Jun', amount: 3800, deals: 48 },
  { month: 'Jul', amount: 4300, deals: 51 },
  { month: 'Aug', amount: 5600, deals: 67 },
  { month: 'Sep', amount: 4200, deals: 54 },
  { month: 'Oct', amount: 6100, deals: 72 },
  { month: 'Nov', amount: 5400, deals: 65 },
  { month: 'Dec', amount: 7200, deals: 82 },
];

export const FundingChart = ({ data, isLoading, selectedLanguage = 'en' }: FundingChartProps) => {
  const chartData = data && data.length > 0 ? data : fallbackData;
  const t = translations[selectedLanguage];

  return (
    <div className="glass rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">{t.fundingTrends}</h3>
          <p className="text-sm text-muted-foreground">{t.monthlyFundingTrends}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">{t.totalFunding}</span>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[280px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" vertical={false} />
              <XAxis 
                dataKey="month" 
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
                itemStyle={{ color: 'hsl(32, 95%, 55%)' }}
                formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Investment']}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(32, 95%, 55%)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
