import { useState } from 'react';
import { Database, Plus, Upload, Search, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
}

const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Startup India Seed Fund Scheme (SISFS)',
    category: 'SCHEME',
    description: 'Official guidelines for the 2021-2025 funding cycle',
  },
  {
    id: '2',
    title: 'DPIIT Recognition Framework',
    category: 'POLICY',
    description: 'Eligibility criteria and benefits for startups',
  },
  {
    id: '3',
    title: 'Credit Guarantee Scheme',
    category: 'SCHEME',
    description: 'SIDBI credit guarantee documentation',
  },
  {
    id: '4',
    title: 'Fund of Funds Guidelines',
    category: 'INVESTMENT',
    description: 'AIF registration and compliance requirements',
  },
];

interface KnowledgeBasePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBasePanel = ({ isOpen, onClose }: KnowledgeBasePanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents] = useState<Document[]>(SAMPLE_DOCUMENTS);

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SCHEME':
        return 'bg-primary/20 text-primary';
      case 'POLICY':
        return 'bg-info/20 text-info';
      case 'INVESTMENT':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 h-screen bg-card border-l border-border flex flex-col z-50 transition-all duration-300 shadow-lg",
        isOpen ? "w-80 translate-x-0" : "w-0 translate-x-full"
      )}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="p-6 border-b border-border flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">Knowledge Base</h2>
                <p className="text-xs text-muted-foreground">RAG Context Data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-3 border-b border-border">
            <Button className="w-full gap-2" size="lg">
              <Plus className="w-4 h-4" />
              New Conversation
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats Card */}
          <div className="p-4 border-b border-border">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{documents.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Docs</div>
              </div>
              <div className="border-l border-primary/30 h-10" />
              <div>
                <div className="font-semibold text-foreground">Source Grounded</div>
                <div className="text-xs text-muted-foreground">Strict retrieval from these files.</div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Active Documents
            </h3>
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge className={cn("text-[10px] mb-1.5", getCategoryColor(doc.category))}>
                        {doc.category}
                      </Badge>
                      <h4 className="font-medium text-sm text-foreground leading-tight mb-1">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="text-primary font-medium">Gemini 3 Flash Preview</span>
            </p>
          </div>
        </>
      )}
    </aside>
  );
};
