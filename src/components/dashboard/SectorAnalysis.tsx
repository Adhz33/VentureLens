import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const sectorData = [
  { name: 'FinTech', deals: 156, amount: 3200, growth: 28, color: 'hsl(32, 95%, 55%)' },
  { name: 'HealthTech', deals: 98, amount: 2400, growth: 45, color: 'hsl(199, 89%, 48%)' },
  { name: 'EdTech', deals: 72, amount: 1800, growth: -12, color: 'hsl(142, 76%, 36%)' },
  { name: 'E-commerce', deals: 64, amount: 1500, growth: 8, color: 'hsl(280, 65%, 60%)' },
  { name: 'SaaS', deals: 89, amount: 1200, growth: 52, color: 'hsl(38, 92%, 50%)' },
  { name: 'CleanTech', deals: 45, amount: 900, growth: 67, color: 'hsl(172, 66%, 50%)' },
];

const GrowthIndicator = ({ growth }: { growth: number }) => {
  if (growth > 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <TrendingUp className="w-3 h-3" />
        +{growth}%
      </span>
    );
  } else if (growth < 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <TrendingDown className="w-3 h-3" />
        {growth}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="w-3 h-3" />
      0%
    </span>
  );
};

export const SectorAnalysis = () => {
  const totalDeals = sectorData.reduce((sum, s) => sum + s.deals, 0);
  const totalAmount = sectorData.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="glass rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}>
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg text-foreground">Sector Analysis</h3>
        <p className="text-sm text-muted-foreground">
          {totalDeals} deals · ${(totalAmount / 1000).toFixed(1)}B total
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sectorData} 
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" horizontal={false} />
              <XAxis 
                type="number"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}M`}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 10%)', 
                  border: '1px solid hsl(222, 30%, 18%)',
                  borderRadius: '12px',
                }}
                formatter={(value: number, name: string) => [`$${value}M`, 'Funding']}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector List */}
        <div className="space-y-3">
          {sectorData.map((sector) => (
            <div 
              key={sector.name} 
              className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-8 rounded-full" 
                  style={{ backgroundColor: sector.color }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{sector.name}</p>
                  <p className="text-xs text-muted-foreground">{sector.deals} deals</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">${sector.amount}M</p>
                <GrowthIndicator growth={sector.growth} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
