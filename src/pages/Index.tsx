import { useState } from 'react';
import { TrendingUp, Users, Database, DollarSign, Building2 } from 'lucide-react';
import { subMonths } from 'date-fns';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { StatCard } from '@/components/dashboard/StatCard';
import { FundingChart } from '@/components/dashboard/FundingChart';
import { SectorBreakdown } from '@/components/dashboard/SectorBreakdown';
import { FundingComparison } from '@/components/dashboard/FundingComparison';
import { SectorAnalysis } from '@/components/dashboard/SectorAnalysis';
import { SectorComparison } from '@/components/dashboard/SectorComparison';
import { ExportPanel } from '@/components/dashboard/ExportPanel';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { QueryInterface } from '@/components/query/QueryInterface';
import { InvestorCard } from '@/components/investors/InvestorCard';
import { PolicyCard } from '@/components/policies/PolicyCard';
import { DataSourcePanel } from '@/components/data/DataSourcePanel';
import { LanguageCode } from '@/lib/constants';
import { useFundingData, DateRange } from '@/hooks/useFundingData';

const SAMPLE_INVESTORS = [
  {
    name: 'Sequoia Capital India',
    type: 'Venture Capital',
    location: 'Bangalore, India',
    totalInvestments: 3200000000,
    portfolioFocus: ['FinTech', 'SaaS', 'Consumer Tech', 'HealthTech'],
    notableInvestments: ['BYJU\'s', 'Zomato', 'Razorpay', 'Unacademy'],
    website: 'https://www.sequoiacap.com/india/',
  },
  {
    name: 'Accel Partners',
    type: 'Venture Capital',
    location: 'Bangalore, India',
    totalInvestments: 2800000000,
    portfolioFocus: ['Enterprise', 'Consumer', 'FinTech', 'B2B SaaS'],
    notableInvestments: ['Flipkart', 'Swiggy', 'Freshworks', 'BrowserStack'],
    website: 'https://www.accel.com/',
  },
  {
    name: 'Tiger Global',
    type: 'Private Equity',
    location: 'New York, USA',
    totalInvestments: 4500000000,
    portfolioFocus: ['E-commerce', 'FinTech', 'EdTech', 'SaaS'],
    notableInvestments: ['Flipkart', 'Ola', 'Lenskart', 'Groww'],
    website: 'https://www.tigerglobal.com/',
  },
];

const SAMPLE_POLICIES = [
  {
    name: 'Startup India Seed Fund Scheme',
    issuingBody: 'Department for Promotion of Industry and Internal Trade',
    description: 'Provides financial assistance to startups for proof of concept, prototype development, product trials, and market-entry.',
    benefits: 'Up to ₹50 Lakhs for early-stage startups through incubators',
    deadline: 'Ongoing',
    sourceUrl: 'https://startupindia.gov.in/content/sih/en/government-schemes/seed-fund-scheme.html',
  },
  {
    name: 'Credit Guarantee Scheme for Startups',
    issuingBody: 'SIDBI',
    description: 'Offers credit guarantees to banks and financial institutions for loans to startups.',
    benefits: 'Credit guarantee up to ₹10 Crores for eligible startups',
    sourceUrl: 'https://www.sidbi.in/',
  },
  {
    name: 'Fund of Funds for Startups',
    issuingBody: 'Small Industries Development Bank of India',
    description: 'A ₹10,000 crore corpus to provide funding support to startups through AIFs.',
    benefits: 'Access to venture capital through SEBI-registered AIFs',
    sourceUrl: 'https://startupindia.gov.in/',
  },
];

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
};

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 12),
    to: new Date(),
  });

  const { data, isLoading, stats, monthlyTrends, sectorBreakdown } = useFundingData(dateRange);

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar 
        selectedLanguage={selectedLanguage} 
        onLanguageChange={setSelectedLanguage} 
      />
      
      <main className="flex-1 ml-64 lg:ml-64">
        {/* Dashboard Section */}
        <section id="dashboard" className="py-12 bg-background relative">
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
              <div>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
                  Funding <span className="text-gradient">Dashboard</span>
                </h2>
                <p className="text-muted-foreground">
                  Real-time insights into startup ecosystem funding activity
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
                <ExportPanel />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Funding"
                value={stats.totalFunding > 0 ? formatCurrency(stats.totalFunding) : "$12.4B"}
                change={stats.totalDeals > 0 ? `${stats.totalDeals} deals in period` : "+23% from 2023"}
                changeType="positive"
                icon={DollarSign}
                delay={100}
              />
              <StatCard
                title="Unique Investors"
                value={stats.uniqueInvestors > 0 ? stats.uniqueInvestors.toString() : "847"}
                change={stats.uniqueInvestors > 0 ? "Active in period" : "+12% this quarter"}
                changeType="positive"
                icon={Users}
                delay={200}
              />
              <StatCard
                title="Funded Startups"
                value={stats.uniqueStartups > 0 ? stats.uniqueStartups.toString() : "1,234"}
                change={stats.uniqueStartups > 0 ? "In selected range" : "156 new this month"}
                changeType="neutral"
                icon={Building2}
                delay={300}
              />
              <StatCard
                title="Data Sources"
                value="89"
                change="15 new sources added"
                changeType="positive"
                icon={Database}
                delay={400}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <FundingChart data={monthlyTrends} isLoading={isLoading} />
              </div>
              <SectorBreakdown data={sectorBreakdown} isLoading={isLoading} />
            </div>

            {/* Comparison and Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FundingComparison />
              <SectorAnalysis data={sectorBreakdown} isLoading={isLoading} />
            </div>

            {/* Sector Comparison Tool */}
            <SectorComparison data={data} isLoading={isLoading} />
          </div>
        </section>

        {/* Query Interface */}
        <QueryInterface language={selectedLanguage} />

        {/* Investors Section */}
        <section id="investors" className="py-16 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Top <span className="text-gradient">Investors</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Leading venture capital and private equity firms active in the Indian startup ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {SAMPLE_INVESTORS.map((investor, index) => (
                <InvestorCard
                  key={investor.name}
                  {...investor}
                  delay={index * 150}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Policies Section */}
        <section id="policies" className="py-16 bg-background relative">
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-15" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Government <span className="text-gradient">Policies</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Schemes and initiatives supporting startups and entrepreneurs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {SAMPLE_POLICIES.map((policy, index) => (
                <PolicyCard
                  key={policy.name}
                  {...policy}
                  delay={index * 150}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <DataSourcePanel />

        {/* Footer */}
        <footer className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display font-semibold text-foreground">FundingIQ</span>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Multilingual RAG-based Startup Funding Intelligence System
              </p>
              
              <p className="text-sm text-muted-foreground">
                © 2024 FundingIQ. Built with ❤️
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
