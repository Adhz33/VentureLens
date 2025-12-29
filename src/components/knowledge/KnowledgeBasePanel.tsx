import { useState, useEffect, useRef } from 'react';
import { Database, Plus, Upload, Search, FileText, X, Loader2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  description: string | null;
  status: string | null;
  chunks_count: number | null;
  created_at: string;
}

interface KnowledgeBasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConversation?: () => void;
}

export const KnowledgeBasePanel = ({ isOpen, onClose, onNewConversation }: KnowledgeBasePanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('knowledge-base')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('knowledge_documents')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          category: getCategoryFromType(file.type),
          status: 'pending',
        })
        .select()
        .single();

      if (docError) throw docError;

      toast({
        title: 'Document uploaded',
        description: 'Processing document for RAG...',
      });

      // Trigger document processing
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: { documentId: docData.id, filePath: uploadData.path }
      });

      if (processError) {
        console.error('Processing error:', processError);
        toast({
          title: 'Processing started',
          description: 'Document will be ready shortly',
        });
      }

      // Refresh documents list
      fetchDocuments();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      // Delete from storage
      await supabase.storage.from('knowledge-base').remove([doc.file_path]);
      
      // Delete document record
      const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast({
        title: 'Document deleted',
        description: doc.file_name,
      });

      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getCategoryFromType = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('text')) return 'TEXT';
    if (mimeType.includes('json')) return 'DATA';
    if (mimeType.includes('markdown')) return 'MARKDOWN';
    return 'DOCUMENT';
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'SCHEME':
      case 'PDF':
        return 'bg-primary/20 text-primary';
      case 'POLICY':
      case 'TEXT':
        return 'bg-info/20 text-info';
      case 'INVESTMENT':
      case 'DATA':
        return 'bg-success/20 text-success';
      case 'MARKDOWN':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-3 h-3 text-success" />;
      case 'processing':
        return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-destructive" />;
      default:
        return <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />;
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const readyDocsCount = documents.filter(d => d.status === 'ready').length;

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
            <Button className="w-full gap-2" size="lg" onClick={onNewConversation}>
              <Plus className="w-4 h-4" />
              New Conversation
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Document'}
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
                <div className="text-2xl font-bold text-foreground">{readyDocsCount}</div>
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
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {documents.length === 0 
                  ? 'No documents uploaded yet'
                  : 'No documents match your search'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge className={cn("text-[10px]", getCategoryColor(doc.category))}>
                            {doc.category || 'DOCUMENT'}
                          </Badge>
                          {getStatusIcon(doc.status)}
                        </div>
                        <h4 className="font-medium text-sm text-foreground leading-tight mb-1 truncate">
                          {doc.file_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {doc.chunks_count ? `${doc.chunks_count} chunks` : 'Processing...'}
                          {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)}KB`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
