import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';
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
  { name: 'FinTech', value: 3200, deals: 45, startups: [], color: 'hsl(32, 95%, 55%)' },
  { name: 'HealthTech', value: 2400, deals: 32, startups: [], color: 'hsl(199, 89%, 48%)' },
  { name: 'EdTech', value: 1800, deals: 28, startups: [], color: 'hsl(142, 76%, 36%)' },
  { name: 'E-commerce', value: 1500, deals: 22, startups: [], color: 'hsl(280, 65%, 60%)' },
  { name: 'SaaS', value: 1200, deals: 18, startups: [], color: 'hsl(38, 92%, 50%)' },
  { name: 'Others', value: 900, deals: 15, startups: [], color: 'hsl(215, 20%, 55%)' },
];

export const SectorBreakdown = ({ data, isLoading }: SectorBreakdownProps) => {
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  
  const chartData = data && data.length > 0 ? data : fallbackData;

  const handleSectorClick = (sector: SectorData) => {
    setSelectedSector(sector);
  };

  return (
    <>
      <div className="glass rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
        <div className="mb-6">
          <h3 className="font-display font-semibold text-lg text-foreground">Sector Breakdown</h3>
          <p className="text-sm text-muted-foreground">Click a sector to view details</p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[180px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(_, index) => handleSectorClick(chartData[index])}
                    className="cursor-pointer"
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
                      backgroundColor: 'hsl(222, 47%, 10%)', 
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Investment']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex-1 space-y-3">
              {chartData.map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between cursor-pointer hover:bg-background/30 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => handleSectorClick(item)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    ${item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}B` : `${item.value.toFixed(0)}M`}
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
