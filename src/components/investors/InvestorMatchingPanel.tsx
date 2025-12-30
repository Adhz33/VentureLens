import { useState } from 'react';
import { Sparkles, Building2, MapPin, TrendingUp, Target, Lightbulb, Loader2, ChevronRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatUSD, SECTORS } from '@/lib/constants';
import { LanguageCode } from '@/lib/constants';
import { getTranslation } from '@/lib/localization';

interface StartupProfile {
  name: string;
  sector: string;
  stage: string;
  fundingNeeded: string;
  location: string;
  description: string;
}

interface InvestorMatch {
  investorName: string;
  matchScore: number;
  matchReason: string;
  talkingPoints: string[];
  investorDetails: {
    name: string;
    type: string;
    location: string;
    portfolioFocus: string[];
    totalInvestments: number;
    notableInvestments: string[];
    website: string;
  } | null;
}

interface MatchResult {
  matches: InvestorMatch[];
  overallAdvice: string;
  startupProfile: StartupProfile;
}

interface InvestorMatchingPanelProps {
  selectedLanguage: LanguageCode;
}

const FUNDING_STAGES = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'Growth',
];

const FUNDING_AMOUNTS = [
  'Under $500K',
  '$500K - $1M',
  '$1M - $5M',
  '$5M - $10M',
  '$10M - $25M',
  '$25M - $50M',
  '$50M+',
];

export const InvestorMatchingPanel = ({ selectedLanguage }: InvestorMatchingPanelProps) => {
  const t = getTranslation(selectedLanguage);
  
  const [startupProfile, setStartupProfile] = useState<StartupProfile>({
    name: '',
    sector: '',
    stage: '',
    fundingNeeded: '',
    location: '',
    description: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const handleInputChange = (field: keyof StartupProfile, value: string) => {
    setStartupProfile(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return startupProfile.name && 
           startupProfile.sector && 
           startupProfile.stage && 
           startupProfile.fundingNeeded && 
           startupProfile.description;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setMatchResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('investor-match', {
        body: { startupProfile },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setMatchResult(data);
      toast({
        title: 'Matches Found!',
        description: `Found ${data.matches?.length || 0} potential investor matches.`,
      });
    } catch (error) {
      console.error('Error matching investors:', error);
      toast({
        title: 'Matching Failed',
        description: error instanceof Error ? error.message : 'Failed to find investor matches.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  return (
    <section id="investor-matching" className="py-16 bg-background relative">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Investor <span className="text-gradient">Matching</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered recommendations for investors that best match your startup's profile, sector, and funding stage.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Input Form */}
          <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Your Startup Profile
              </CardTitle>
              <CardDescription>
                Enter your startup details to find the best matching investors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Startup Name *</label>
                  <Input
                    placeholder="e.g., TechVenture AI"
                    value={startupProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <Input
                    placeholder="e.g., Bangalore, India"
                    value={startupProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sector *</label>
                  <Select 
                    value={startupProfile.sector} 
                    onValueChange={(value) => handleInputChange('sector', value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Funding Stage *</label>
                  <Select 
                    value={startupProfile.stage} 
                    onValueChange={(value) => handleInputChange('stage', value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Funding Needed *</label>
                  <Select 
                    value={startupProfile.fundingNeeded} 
                    onValueChange={(value) => handleInputChange('fundingNeeded', value)}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_AMOUNTS.map((amount) => (
                        <SelectItem key={amount} value={amount}>{amount}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Startup Description *</label>
                <Textarea
                  placeholder="Describe your startup, product/service, target market, and unique value proposition..."
                  value={startupProfile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !isFormValid()}
                className="w-full md:w-auto"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find Matching Investors
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {matchResult && (
            <div className="space-y-6 animate-fade-in">
              {/* Overall Advice */}
              {matchResult.overallAdvice && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">AI Investment Advisor</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {matchResult.overallAdvice}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Investor Matches */}
              <div className="grid gap-4">
                {matchResult.matches.map((match, index) => (
                  <Card 
                    key={match.investorName}
                    className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => setExpandedMatch(
                      expandedMatch === match.investorName ? null : match.investorName
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-display font-semibold text-foreground">
                                {match.investorDetails?.name || match.investorName}
                              </h3>
                              {match.investorDetails?.website && (
                                <a 
                                  href={match.investorDetails.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Globe className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {match.investorDetails?.type}
                            </p>
                            <p className="text-sm text-foreground/80 line-clamp-2">
                              {match.matchReason}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
                            {match.matchScore}%
                          </div>
                          <p className={`text-xs ${getScoreColor(match.matchScore)}`}>
                            {getScoreLabel(match.matchScore)}
                          </p>
                          <Progress 
                            value={match.matchScore} 
                            className="w-20 h-1.5 mt-2"
                          />
                        </div>

                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                          expandedMatch === match.investorName ? 'rotate-90' : ''
                        }`} />
                      </div>

                      {/* Expanded Content */}
                      {expandedMatch === match.investorName && (
                        <div className="mt-6 pt-6 border-t border-border/50 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Investor Details */}
                            {match.investorDetails && (
                              <div className="space-y-4">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                  <Target className="w-4 h-4 text-primary" />
                                  Investor Profile
                                </h4>
                                
                                <div className="space-y-3">
                                  {match.investorDetails.location && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <MapPin className="w-4 h-4" />
                                      {match.investorDetails.location}
                                    </div>
                                  )}
                                  
                                  {match.investorDetails.totalInvestments && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <TrendingUp className="w-4 h-4 text-success" />
                                      <span className="text-success font-medium">
                                        {formatUSD(match.investorDetails.totalInvestments)}
                                      </span>
                                      <span className="text-muted-foreground">total invested</span>
                                    </div>
                                  )}
                                  
                                  {match.investorDetails.portfolioFocus && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-2">Focus Areas</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {match.investorDetails.portfolioFocus.slice(0, 5).map((focus, idx) => (
                                          <Badge 
                                            key={idx} 
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {focus}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {match.investorDetails.notableInvestments && (
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-2">Notable Investments</p>
                                      <p className="text-sm text-foreground">
                                        {match.investorDetails.notableInvestments.slice(0, 4).join(', ')}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Talking Points */}
                            {match.talkingPoints && match.talkingPoints.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-primary" />
                                  Key Talking Points
                                </h4>
                                <ul className="space-y-2">
                                  {match.talkingPoints.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs text-primary font-medium">{idx + 1}</span>
                                      </span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
