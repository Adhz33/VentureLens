import { useState } from 'react';
import { MessageSquare, BarChart3, Building2, FileText, Database, Globe, ChevronLeft, ChevronRight, BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/constants';
import { getTranslation } from '@/lib/localization';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface AppSidebarProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onToggleKnowledgeBase?: () => void;
  isKnowledgeBaseOpen?: boolean;
}

export const AppSidebar = ({ selectedLanguage, onLanguageChange, onToggleKnowledgeBase, isKnowledgeBaseOpen }: AppSidebarProps) => {
  const [activeItem, setActiveItem] = useState('query');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = getTranslation(selectedLanguage);
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  const menuItems = [
    { id: 'query', label: t.askVentureLens, icon: MessageSquare, href: '#query' },
    { id: 'dashboard', label: t.marketInsights, icon: BarChart3, href: '#dashboard' },
    { id: 'investors', label: t.findInvestors, icon: Building2, href: '#investors' },
    { id: 'policies', label: t.governmentSchemes, icon: FileText, href: '#policies' },
    { id: 'sources', label: t.dataSources, icon: Database, href: '#sources' },
  ];

  const handleNavClick = (id: string) => {
    setActiveItem(id);
    setIsMobileMenuOpen(false); // Close mobile menu on nav click
  };

  // Check if should show collapsed state (on tablet or when manually collapsed on desktop)
  const showCollapsed = isCollapsed;
  const showFullSidebar = !isCollapsed;

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50 md:hidden">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VentureLens" className="w-8 h-8 object-contain" />
          <h1 className="font-display font-bold text-lg text-foreground">
            Venture<span className="text-brand-orange">Lens</span>
          </h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <aside 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 w-64 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        
        {/* Mobile Language Selector */}
        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LANGUAGES.slice(0, 4).map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  selectedLanguage === lang.code
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-foreground'
                )}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border flex-col z-50 transition-all duration-300",
          "hidden md:flex",
          showCollapsed ? "w-20" : "w-64"
        )}
      >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {showCollapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {/* Logo */}
      <div className={cn("p-6 border-b border-border", showCollapsed && "px-4")}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img src={logo} alt="VentureLens" className="w-10 h-10 object-contain" />
          </div>
          {showFullSidebar && (
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Venture<span className="text-brand-orange">Lens</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {t.startupIntelligence}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Label */}
      {showFullSidebar && (
        <div className="px-6 pt-6 pb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t.menu}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 px-3 py-4 space-y-1", showCollapsed && "px-2")}>
        {menuItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                showCollapsed && "justify-center px-3"
              )}
              title={showCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {showFullSidebar && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Knowledge Base Toggle */}
      <div className={cn("px-3 pb-2", showCollapsed && "px-2")}>
        <button
          onClick={onToggleKnowledgeBase}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full",
            isKnowledgeBaseOpen
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            showCollapsed && "justify-center px-3"
          )}
          title={showCollapsed ? t.knowledgeBase : undefined}
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          {showFullSidebar && <span>{t.knowledgeBase}</span>}
        </button>
      </div>

      {/* Language Selector */}
      <div className={cn("p-4 border-t border-border", showCollapsed && "px-2")}>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full gap-2 justify-start", showCollapsed && "justify-center px-2")}
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            {showFullSidebar && <span>{currentLang?.nativeName}</span>}
          </Button>
          
          {isLangOpen && (
            <div className={cn(
              "absolute bottom-full mb-2 w-48 bg-card border border-border rounded-xl p-2 shadow-lg z-50",
              showCollapsed ? "left-full ml-2 bottom-0" : "left-0"
            )}>
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
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={cn("p-4 border-t border-border", showCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-3", showCollapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">AI</span>
          </div>
          {showFullSidebar && (
            <div>
              <p className="text-sm font-medium text-foreground">{t.poweredByRag}</p>
              <p className="text-[10px] text-muted-foreground">{t.retrievalAugmented}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};
