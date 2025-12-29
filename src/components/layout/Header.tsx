import { Database, Globe, Menu, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/constants';

interface HeaderProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const Header = ({ selectedLanguage, onLanguageChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                FundingIQ
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">
                Startup Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="#query" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Query
            </a>
            <a href="#investors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Investors
            </a>
            <a href="#policies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Policies
            </a>
            <a href="#sources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Data Sources
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang?.nativeName}</span>
              </Button>
              
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-strong rounded-xl p-2 shadow-lg animate-scale-in">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedLanguage === lang.code
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-secondary/50 text-foreground'
                      }`}
                    >
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button variant="glass" size="sm" className="hidden sm:flex gap-2">
              <Database className="w-4 h-4" />
              Ingest Data
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <a href="#dashboard" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                Dashboard
              </a>
              <a href="#query" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                Query
              </a>
              <a href="#investors" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                Investors
              </a>
              <a href="#policies" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                Policies
              </a>
              <a href="#sources" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                Data Sources
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
