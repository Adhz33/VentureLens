import { X, ExternalLink, TrendingUp, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FundingRecord } from '@/hooks/useFundingData';

interface SectorDrilldownProps {
  isOpen: boolean;
  onClose: () => void;
  sectorName: string;
  sectorColor: string;
  startups: FundingRecord[];
  totalAmount: number;
  totalDeals: number;
}

const formatCurrency = (amount: number | null): string => {
  if (!amount) return 'Undisclosed';
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
};

export const SectorDrilldown = ({
  isOpen,
  onClose,
  sectorName,
  sectorColor,
  startups,
  totalAmount,
  totalDeals,
}: SectorDrilldownProps) => {
  const sortedStartups = [...startups].sort(
    (a, b) => (b.funding_amount || 0) - (a.funding_amount || 0)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: sectorColor }}
            />
            <DialogTitle className="text-xl font-display">
              {sectorName} Sector
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Funding</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalAmount * 1000000)}
            </p>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Total Deals</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalDeals}</p>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedStartups.length > 0 ? (
              sortedStartups.map((startup, index) => (
                <div
                  key={startup.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                      <h4 className="font-medium text-foreground">
                        {startup.startup_name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {startup.funding_round && (
                        <Badge variant="outline" className="text-xs">
                          {startup.funding_round}
                        </Badge>
                      )}
                      {startup.location && (
                        <span className="text-xs text-muted-foreground">
                          📍 {startup.location}
                        </span>
                      )}
                      {startup.investor_name && (
                        <span className="text-xs text-muted-foreground">
                          👤 {startup.investor_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(startup.funding_amount)}
                    </p>
                    {startup.funding_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(startup.funding_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No startups found in this sector</p>
                <p className="text-sm">Try adjusting the date range filter</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
