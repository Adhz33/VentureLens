import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart2, Loader2 } from 'lucide-react';
import { SectorDrilldown } from './SectorDrilldown';

interface SectorData {
  name: string;
  value: number;
  deals: number;
  startups: any[];
  color: string;
}

interface SectorBreakdownProps {
  data?: SectorData[];
  isLoading?: boolean;
}

const fallbackData: SectorData[] = [
  { name: 'CleanTech', value: 2100, deals: 28, startups: [], color: '#EF4444' },
  { name: 'DeepTech/AI', value: 1800, deals: 35, startups: [], color: '#F97316' },
  { name: 'E-commerce', value: 1500, deals: 22, startups: [], color: '#3B82F6' },
  { name: 'Enterprise/SaaS', value: 3200, deals: 45, startups: [], color: '#06B6D4' },
  { name: 'FinTech', value: 2800, deals: 38, startups: [], color: '#2563EB' },
  { name: 'HealthTech', value: 2400, deals: 32, startups: [], color: '#A855F7' },
  { name: 'Others', value: 900, deals: 15, startups: [], color: '#6B7280' },
];

export const SectorBreakdown = ({ data, isLoading }: SectorBreakdownProps) => {
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  
  const chartData = data && data.length > 0 ? data : fallbackData;

  const handleSectorClick = (sector: SectorData) => {
    setSelectedSector(sector);
  };

  return (
    <>
      <div className="bg-card rounded-2xl p-6 border border-border opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">Sector Distribution</h3>
            <p className="text-sm text-muted-foreground">Where the money is flowing (2024)</p>
          </div>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <BarChart2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[280px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex items-center gap-8">
            {/* Donut Chart with Center Label */}
            <div className="relative w-[220px] h-[220px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    onClick={(_, index) => handleSectorClick(chartData[index])}
                    className="cursor-pointer"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Investment']}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-foreground">2024</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Focus</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex-1 space-y-3">
              {chartData.map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 rounded-lg py-1.5 px-2 -mx-2 transition-colors"
                  onClick={() => handleSectorClick(item)}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium" style={{ color: item.color }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedSector && (
        <SectorDrilldown
          isOpen={!!selectedSector}
          onClose={() => setSelectedSector(null)}
          sectorName={selectedSector.name}
          sectorColor={selectedSector.color}
          startups={selectedSector.startups}
          totalAmount={selectedSector.value}
          totalDeals={selectedSector.deals}
        />
      )}
    </>
  );
};
