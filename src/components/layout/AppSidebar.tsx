import { useState } from 'react';
import { MessageSquare, BarChart3, Building2, FileText, Database, Globe, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onToggleKnowledgeBase?: () => void;
  isKnowledgeBaseOpen?: boolean;
}

const menuItems = [
  { id: 'query', label: 'Ask FundingIQ', icon: MessageSquare, href: '#query' },
  { id: 'dashboard', label: 'Market Insights', icon: BarChart3, href: '#dashboard' },
  { id: 'investors', label: 'Find Investors', icon: Building2, href: '#investors' },
  { id: 'policies', label: 'Government Schemes', icon: FileText, href: '#policies' },
  { id: 'sources', label: 'Data Sources', icon: Database, href: '#sources' },
];

export const AppSidebar = ({ selectedLanguage, onLanguageChange, onToggleKnowledgeBase, isKnowledgeBaseOpen }: AppSidebarProps) => {
  const [activeItem, setActiveItem] = useState('query');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  const handleNavClick = (id: string) => {
    setActiveItem(id);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {/* Logo */}
      <div className={cn("p-6 border-b border-border", isCollapsed && "px-4")}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                FundingIQ
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Startup Intelligence
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Label */}
      {!isCollapsed && (
        <div className="px-6 pt-6 pb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Menu
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 px-3 py-4 space-y-1", isCollapsed && "px-2")}>
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
                isCollapsed && "justify-center px-3"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Knowledge Base Toggle */}
      <div className={cn("px-3 pb-2", isCollapsed && "px-2")}>
        <button
          onClick={onToggleKnowledgeBase}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full",
            isKnowledgeBaseOpen
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            isCollapsed && "justify-center px-3"
          )}
          title={isCollapsed ? "Knowledge Base" : undefined}
        >
          <BookOpen className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Knowledge Base</span>}
        </button>
      </div>

      {/* Language Selector */}
      <div className={cn("p-4 border-t border-border", isCollapsed && "px-2")}>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full gap-2 justify-start", isCollapsed && "justify-center px-2")}
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>{currentLang?.nativeName}</span>}
          </Button>
          
          {isLangOpen && (
            <div className={cn(
              "absolute bottom-full mb-2 w-48 bg-card border border-border rounded-xl p-2 shadow-lg",
              isCollapsed ? "left-full ml-2 bottom-0" : "left-0"
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
      <div className={cn("p-4 border-t border-border", isCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">AI</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium text-foreground">Powered by RAG</p>
              <p className="text-[10px] text-muted-foreground">Retrieval Augmented GenAI</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
