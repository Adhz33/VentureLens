import { Building2, MapPin, Globe, TrendingUp } from 'lucide-react';
import { formatUSD } from '@/lib/constants';

interface InvestorCardProps {
  name: string;
  type: string;
  location: string;
  totalInvestments: number;
  portfolioFocus: string[];
  notableInvestments: string[];
  website?: string;
  delay?: number;
}

export const InvestorCard = ({
  name,
  type,
  location,
  totalInvestments,
  portfolioFocus,
  notableInvestments,
  website,
  delay = 0,
}: InvestorCardProps) => {
  return (
    <div 
      className="insight-card opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
        </div>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Globe className="w-5 h-5" />
          </a>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-success font-medium">{formatUSD(totalInvestments)}</span>
          <span className="text-muted-foreground">total invested</span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Focus Areas</p>
          <div className="flex flex-wrap gap-1.5">
            {portfolioFocus.slice(0, 4).map((focus, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded-full bg-secondary/70 text-foreground"
              >
                {focus}
              </span>
            ))}
          </div>
        </div>

        {notableInvestments.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Notable Investments</p>
            <p className="text-sm text-foreground">
              {notableInvestments.slice(0, 3).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
