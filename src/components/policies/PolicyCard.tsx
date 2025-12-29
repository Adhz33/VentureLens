import { FileText, Calendar, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PolicyCardProps {
  name: string;
  issuingBody: string;
  description: string;
  benefits: string;
  deadline?: string;
  sourceUrl?: string;
  delay?: number;
}

export const PolicyCard = ({
  name,
  issuingBody,
  description,
  benefits,
  deadline,
  sourceUrl,
  delay = 0,
}: PolicyCardProps) => {
  return (
    <div 
      className="insight-card opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-info" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground leading-tight">{name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{issuingBody}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{benefits}</p>
        </div>

        {deadline && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning">Deadline: {deadline}</span>
          </div>
        )}
      </div>

      {sourceUrl && (
        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Learn More <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      )}
    </div>
  );
};
