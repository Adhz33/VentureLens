import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { SectorDrilldown } from './SectorDrilldown';

interface SectorData {
  name: string;
  value: number;
  deals: number;
  startups: any[];
  color: string;
}

interface SectorAnalysisProps {
  data?: SectorData[];
  isLoading?: boolean;
}

const fallbackData: SectorData[] = [
  { name: 'FinTech', deals: 156, value: 3200, startups: [], color: 'hsl(32, 95%, 55%)' },
  { name: 'HealthTech', deals: 98, value: 2400, startups: [], color: 'hsl(199, 89%, 48%)' },
  { name: 'EdTech', deals: 72, value: 1800, startups: [], color: 'hsl(142, 76%, 36%)' },
  { name: 'E-commerce', deals: 64, value: 1500, startups: [], color: 'hsl(280, 65%, 60%)' },
  { name: 'SaaS', deals: 89, value: 1200, startups: [], color: 'hsl(38, 92%, 50%)' },
  { name: 'CleanTech', deals: 45, value: 900, startups: [], color: 'hsl(172, 66%, 50%)' },
];

export const SectorAnalysis = ({ data, isLoading }: SectorAnalysisProps) => {
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  
  const sectorData = data && data.length > 0 ? data : fallbackData;
  const totalDeals = sectorData.reduce((sum, s) => sum + s.deals, 0);
  const totalAmount = sectorData.reduce((sum, s) => sum + s.value, 0);

  const handleSectorClick = (sector: SectorData) => {
    setSelectedSector(sector);
  };

  return (
    <>
      <div className="glass rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}>
        <div className="mb-6">
          <h3 className="font-display font-semibold text-lg text-foreground">Sector Analysis</h3>
          <p className="text-sm text-muted-foreground">
            {totalDeals} deals · ${(totalAmount / 1000).toFixed(1)}B total
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
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
                    formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Funding']}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]}
                    onClick={(data) => handleSectorClick(data)}
                    className="cursor-pointer"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity"
                      />
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
                  className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer"
                  onClick={() => handleSectorClick(sector)}
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
                    <p className="text-sm font-medium text-foreground">
                      ${sector.value >= 1000 ? `${(sector.value / 1000).toFixed(1)}B` : `${sector.value.toFixed(0)}M`}
                    </p>
                  </div>
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
