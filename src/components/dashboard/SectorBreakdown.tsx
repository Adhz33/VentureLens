import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'FinTech', value: 3200, color: 'hsl(32, 95%, 55%)' },
  { name: 'HealthTech', value: 2400, color: 'hsl(199, 89%, 48%)' },
  { name: 'EdTech', value: 1800, color: 'hsl(142, 76%, 36%)' },
  { name: 'E-commerce', value: 1500, color: 'hsl(280, 65%, 60%)' },
  { name: 'SaaS', value: 1200, color: 'hsl(38, 92%, 50%)' },
  { name: 'Others', value: 900, color: 'hsl(215, 20%, 55%)' },
];

export const SectorBreakdown = () => {
  return (
    <div className="glass rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg text-foreground">Sector Breakdown</h3>
        <p className="text-sm text-muted-foreground">Investment distribution by sector</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="w-[180px] h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 10%)', 
                  border: '1px solid hsl(222, 30%, 18%)',
                  borderRadius: '12px',
                }}
                formatter={(value: number) => [`$${value}M`, 'Investment']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                ${(item.value / 1000).toFixed(1)}B
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
