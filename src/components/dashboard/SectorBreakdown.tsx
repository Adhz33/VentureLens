import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart2, Loader2, ChevronDown } from 'lucide-react';
import { SectorDrilldown } from './SectorDrilldown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const YEARS = ['2024', '2023', '2022', '2021'];

const fallbackDataByYear: Record<string, SectorData[]> = {
  '2024': [
    { name: 'CleanTech', value: 2100, deals: 28, startups: [], color: '#EF4444' },
    { name: 'DeepTech/AI', value: 1800, deals: 35, startups: [], color: '#F97316' },
    { name: 'E-commerce', value: 1500, deals: 22, startups: [], color: '#3B82F6' },
    { name: 'Enterprise/SaaS', value: 3200, deals: 45, startups: [], color: '#06B6D4' },
    { name: 'FinTech', value: 2800, deals: 38, startups: [], color: '#2563EB' },
    { name: 'HealthTech', value: 2400, deals: 32, startups: [], color: '#A855F7' },
    { name: 'Others', value: 900, deals: 15, startups: [], color: '#6B7280' },
  ],
  '2023': [
    { name: 'CleanTech', value: 1800, deals: 24, startups: [], color: '#EF4444' },
    { name: 'DeepTech/AI', value: 1500, deals: 30, startups: [], color: '#F97316' },
    { name: 'E-commerce', value: 1800, deals: 26, startups: [], color: '#3B82F6' },
    { name: 'Enterprise/SaaS', value: 2800, deals: 40, startups: [], color: '#06B6D4' },
    { name: 'FinTech', value: 2400, deals: 34, startups: [], color: '#2563EB' },
    { name: 'HealthTech', value: 2000, deals: 28, startups: [], color: '#A855F7' },
    { name: 'Others', value: 800, deals: 12, startups: [], color: '#6B7280' },
  ],
  '2022': [
    { name: 'CleanTech', value: 1500, deals: 20, startups: [], color: '#EF4444' },
    { name: 'DeepTech/AI', value: 1200, deals: 25, startups: [], color: '#F97316' },
    { name: 'E-commerce', value: 2000, deals: 28, startups: [], color: '#3B82F6' },
    { name: 'Enterprise/SaaS', value: 2400, deals: 35, startups: [], color: '#06B6D4' },
    { name: 'FinTech', value: 2100, deals: 30, startups: [], color: '#2563EB' },
    { name: 'HealthTech', value: 1700, deals: 24, startups: [], color: '#A855F7' },
    { name: 'Others', value: 700, deals: 10, startups: [], color: '#6B7280' },
  ],
  '2021': [
    { name: 'CleanTech', value: 1200, deals: 16, startups: [], color: '#EF4444' },
    { name: 'DeepTech/AI', value: 900, deals: 18, startups: [], color: '#F97316' },
    { name: 'E-commerce', value: 2200, deals: 30, startups: [], color: '#3B82F6' },
    { name: 'Enterprise/SaaS', value: 2000, deals: 28, startups: [], color: '#06B6D4' },
    { name: 'FinTech', value: 1800, deals: 25, startups: [], color: '#2563EB' },
    { name: 'HealthTech', value: 1400, deals: 20, startups: [], color: '#A855F7' },
    { name: 'Others', value: 600, deals: 8, startups: [], color: '#6B7280' },
  ],
};

export const SectorBreakdown = ({ data, isLoading }: SectorBreakdownProps) => {
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  
  // Use real data if available (has meaningful values), otherwise use fallback
  const hasRealData = data && data.length > 0 && data.some(d => d.value > 0);
  
  // Merge real data with fallback to ensure all sectors are shown
  const chartData = (() => {
    if (!hasRealData) {
      return fallbackDataByYear[selectedYear] || fallbackDataByYear['2024'];
    }
    
    // Create a map of real data by sector name
    const realDataMap = new Map(data.map(d => [d.name, d]));
    
    // Ensure all 7 sectors are present, using real data where available
    const sectors = ['CleanTech', 'DeepTech/AI', 'E-commerce', 'Enterprise/SaaS', 'FinTech', 'HealthTech', 'Others'];
    const colors = ['#EF4444', '#F97316', '#3B82F6', '#06B6D4', '#2563EB', '#A855F7', '#6B7280'];
    
    return sectors.map((sector, index) => {
      const realSector = realDataMap.get(sector);
      if (realSector) {
        return { ...realSector, color: colors[index] };
      }
      // Check for partial matches (e.g., "AI" matches "DeepTech/AI")
      const partialMatch = data.find(d => 
        d.name.toLowerCase().includes(sector.toLowerCase()) || 
        sector.toLowerCase().includes(d.name.toLowerCase())
      );
      if (partialMatch) {
        return { ...partialMatch, name: sector, color: colors[index] };
      }
      return { name: sector, value: 0, deals: 0, startups: [], color: colors[index] };
    });
  })();
  
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

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
            <p className="text-sm text-muted-foreground">Where the money is flowing ({selectedYear})</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] h-9 bg-secondary/50 border-border">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <BarChart2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
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
                    outerRadius={hoveredSector ? 100 : 95}
                    paddingAngle={4}
                    dataKey="value"
                    onClick={(_, index) => handleSectorClick(chartData[index])}
                    onMouseEnter={(_, index) => setHoveredSector(chartData[index].name)}
                    onMouseLeave={() => setHoveredSector(null)}
                    className="cursor-pointer transition-all duration-300"
                    strokeWidth={0}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={hoveredSector && hoveredSector !== entry.name ? 0.4 : 1}
                        style={{
                          filter: hoveredSector === entry.name ? 'brightness(1.1)' : 'none',
                          transition: 'all 0.3s ease',
                          transform: hoveredSector === entry.name ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center',
                        }}
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
                    formatter={(value: number, name: string) => [
                      <span key="value" className="font-semibold">${value.toFixed(0)}M ({((value / totalValue) * 100).toFixed(1)}%)</span>,
                      <span key="name" className="text-muted-foreground">{name}</span>
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-foreground">{selectedYear}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Focus</span>
              </div>
            </div>
            
            {/* Legend with hover effects */}
            <div className="flex-1 space-y-2">
              {chartData.map((item) => {
                const percentage = ((item.value / totalValue) * 100).toFixed(1);
                const isHovered = hoveredSector === item.name;
                
                return (
                  <div 
                    key={item.name} 
                    className={`flex items-center gap-3 cursor-pointer rounded-lg py-2 px-3 -mx-3 transition-all duration-200 ${
                      isHovered ? 'bg-secondary scale-[1.02]' : 'hover:bg-secondary/50'
                    } ${hoveredSector && !isHovered ? 'opacity-50' : 'opacity-100'}`}
                    onClick={() => handleSectorClick(item)}
                    onMouseEnter={() => setHoveredSector(item.name)}
                    onMouseLeave={() => setHoveredSector(null)}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full flex-shrink-0 transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`}
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className={`text-sm font-medium truncate transition-colors duration-200`}
                          style={{ color: isHovered ? item.color : 'hsl(var(--foreground))' }}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {percentage}%
                        </span>
                      </div>
                      {isHovered && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground animate-fade-in">
                          <span>${item.value}M</span>
                          <span>•</span>
                          <span>{item.deals} deals</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
