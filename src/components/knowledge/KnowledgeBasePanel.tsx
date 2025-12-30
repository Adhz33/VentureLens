import { useState, useEffect, useRef } from 'react';
import { Database, Plus, Upload, Search, FileText, X, Loader2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LanguageCode } from '@/lib/constants';
import { getTranslation } from '@/lib/localization';
import { useAuth } from '@/hooks/useAuth';

// Demo documents to show when no real data is available
const DEMO_DOCUMENTS: Document[] = [
  { id: '1', file_name: 'Startup India Guidelines 2024.pdf', file_path: 'demo/1.pdf', file_type: 'application/pdf', file_size: 245000, category: 'PDF', description: 'Official startup guidelines', status: 'ready', chunks_count: 24, created_at: new Date().toISOString() },
  { id: '2', file_name: 'DPIIT Recognition Process.docx', file_path: 'demo/2.docx', file_type: 'application/docx', file_size: 189000, category: 'WORD', description: 'Recognition process', status: 'ready', chunks_count: 18, created_at: new Date().toISOString() },
  { id: '3', file_name: 'VC Investment Trends Q4.xlsx', file_path: 'demo/3.xlsx', file_type: 'application/xlsx', file_size: 356000, category: 'SPREADSHEET', description: 'Investment trends', status: 'ready', chunks_count: 42, created_at: new Date().toISOString() },
  { id: '4', file_name: 'Tax Benefits for Startups.pdf', file_path: 'demo/4.pdf', file_type: 'application/pdf', file_size: 178000, category: 'PDF', description: 'Tax benefits guide', status: 'ready', chunks_count: 15, created_at: new Date().toISOString() },
  { id: '5', file_name: 'Angel Tax Exemption Rules.md', file_path: 'demo/5.md', file_type: 'text/markdown', file_size: 45000, category: 'MARKDOWN', description: 'Angel tax rules', status: 'ready', chunks_count: 8, created_at: new Date().toISOString() },
  { id: '6', file_name: 'Sector-wise Funding Data.csv', file_path: 'demo/6.csv', file_type: 'text/csv', file_size: 234000, category: 'CSV', description: 'Funding data', status: 'ready', chunks_count: 56, created_at: new Date().toISOString() },
  { id: '7', file_name: 'IPR Fast-Track Guidelines.pdf', file_path: 'demo/7.pdf', file_type: 'application/pdf', file_size: 198000, category: 'PDF', description: 'IPR guidelines', status: 'ready', chunks_count: 21, created_at: new Date().toISOString() },
  { id: '8', file_name: 'Government Schemes Overview.docx', file_path: 'demo/8.docx', file_type: 'application/docx', file_size: 267000, category: 'WORD', description: 'Schemes overview', status: 'ready', chunks_count: 32, created_at: new Date().toISOString() },
  { id: '9', file_name: 'Investor Directory 2024.xlsx', file_path: 'demo/9.xlsx', file_type: 'application/xlsx', file_size: 445000, category: 'SPREADSHEET', description: 'Investor list', status: 'ready', chunks_count: 78, created_at: new Date().toISOString() },
  { id: '10', file_name: 'Seed Fund Scheme Details.pdf', file_path: 'demo/10.pdf', file_type: 'application/pdf', file_size: 156000, category: 'PDF', description: 'Seed fund details', status: 'ready', chunks_count: 14, created_at: new Date().toISOString() },
  { id: '11', file_name: 'Incubator Regulations.txt', file_path: 'demo/11.txt', file_type: 'text/plain', file_size: 34000, category: 'TEXT', description: 'Regulations', status: 'ready', chunks_count: 6, created_at: new Date().toISOString() },
  { id: '12', file_name: 'Patent Filing Process.pdf', file_path: 'demo/12.pdf', file_type: 'application/pdf', file_size: 289000, category: 'PDF', description: 'Patent process', status: 'ready', chunks_count: 28, created_at: new Date().toISOString() },
  { id: '13', file_name: 'State Startup Policies.docx', file_path: 'demo/13.docx', file_type: 'application/docx', file_size: 412000, category: 'WORD', description: 'State policies', status: 'ready', chunks_count: 45, created_at: new Date().toISOString() },
  { id: '14', file_name: 'Unicorn List India.csv', file_path: 'demo/14.csv', file_type: 'text/csv', file_size: 89000, category: 'CSV', description: 'Unicorn companies', status: 'ready', chunks_count: 12, created_at: new Date().toISOString() },
  { id: '15', file_name: 'SIDBI Fund Guidelines.pdf', file_path: 'demo/15.pdf', file_type: 'application/pdf', file_size: 178000, category: 'PDF', description: 'SIDBI guidelines', status: 'ready', chunks_count: 19, created_at: new Date().toISOString() },
  { id: '16', file_name: 'Exit Strategies Report.xlsx', file_path: 'demo/16.xlsx', file_type: 'application/xlsx', file_size: 312000, category: 'SPREADSHEET', description: 'Exit strategies', status: 'ready', chunks_count: 38, created_at: new Date().toISOString() },
  { id: '17', file_name: 'Regulatory Compliance.md', file_path: 'demo/17.md', file_type: 'text/markdown', file_size: 67000, category: 'MARKDOWN', description: 'Compliance guide', status: 'ready', chunks_count: 11, created_at: new Date().toISOString() },
  { id: '18', file_name: 'Funding Round Analysis.pdf', file_path: 'demo/18.pdf', file_type: 'application/pdf', file_size: 234000, category: 'PDF', description: 'Funding analysis', status: 'ready', chunks_count: 26, created_at: new Date().toISOString() },
];

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
  selectedLanguage?: LanguageCode;
}

export const KnowledgeBasePanel = ({ 
  isOpen, 
  onClose, 
  onNewConversation,
  selectedLanguage = 'en'
}: KnowledgeBasePanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isDemo } = useAuth();
  const t = getTranslation(selectedLanguage);

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
        title: t.errorTitle,
        description: t.failed,
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

  // Real-time subscription for document status updates
  useEffect(() => {
    const channel = supabase
      .channel('knowledge-docs-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'knowledge_documents'
        },
        (payload) => {
          const updated = payload.new as Document;
          setDocuments(prev => prev.map(doc => 
            doc.id === updated.id ? updated : doc
          ));
          
          // Clear processing indicator when done
          if (updated.id === processingDocId && updated.status === 'ready') {
            setProcessingDocId(null);
            toast({
              title: t.documentReady || 'Document Ready',
              description: `${updated.file_name} processed with ${updated.chunks_count} chunks`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'knowledge_documents'
        },
        (payload) => {
          const newDoc = payload.new as Document;
          setDocuments(prev => [newDoc, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processingDocId, t]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Sanitize filename: replace special characters and spaces
      const sanitizedName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[–—]/g, '-') // Replace em/en dashes with hyphen
        .replace(/[^\w.\-]/g, '_') // Replace other special chars with underscore
        .replace(/_+/g, '_'); // Collapse multiple underscores
      
      const fileName = `${Date.now()}-${sanitizedName}`;
      
      // Simulate upload progress (Supabase doesn't provide native progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('knowledge-base')
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('knowledge_documents')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          category: getCategoryFromType(file.type, file.name),
          status: 'pending',
        })
        .select()
        .single();

      if (docError) throw docError;

      // Track this document for processing status
      setProcessingDocId(docData.id);

      toast({
        title: t.documentUploaded,
        description: t.processingForRag,
      });

      // Trigger document processing (runs in background)
      supabase.functions.invoke('process-document', {
        body: { documentId: docData.id, filePath: uploadData.path }
      }).catch(err => console.error('Processing error:', err));

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t.uploadFailed,
        description: error instanceof Error ? error.message : t.failed,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
        title: t.documentDeleted,
        description: doc.file_name,
      });

      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: t.deleteFailed,
        description: t.failed,
        variant: 'destructive',
      });
    }
  };

  const getCategoryFromType = (mimeType: string, fileName?: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || fileName?.endsWith('.xlsx') || fileName?.endsWith('.xls')) return 'SPREADSHEET';
    if (mimeType.includes('wordprocessing') || mimeType.includes('msword') || fileName?.endsWith('.docx') || fileName?.endsWith('.doc')) return 'WORD';
    if (mimeType.includes('text')) return 'TEXT';
    if (mimeType.includes('json')) return 'DATA';
    if (mimeType.includes('markdown') || fileName?.endsWith('.md')) return 'MARKDOWN';
    if (mimeType.includes('csv') || fileName?.endsWith('.csv')) return 'CSV';
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
      case 'CSV':
        return 'bg-success/20 text-success';
      case 'MARKDOWN':
        return 'bg-warning/20 text-warning';
      case 'SPREADSHEET':
        return 'bg-emerald-500/20 text-emerald-500';
      case 'WORD':
        return 'bg-blue-500/20 text-blue-500';
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

  // Use demo documents when no real data is available
  const displayDocuments = documents.length === 0 && isDemo ? DEMO_DOCUMENTS : documents;

  const filteredDocs = displayDocuments.filter(doc =>
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const readyDocsCount = displayDocuments.filter(d => d.status === 'ready').length;

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
                <h2 className="font-display font-bold text-foreground">{t.knowledgeBaseTitle}</h2>
                <p className="text-xs text-muted-foreground">{t.ragContextData}</p>
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
              {t.newConversation}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.pdf,.docx,.doc,.xlsx,.xls,.csv"
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
              {isUploading ? t.uploading : t.uploadDocument}
            </Button>
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            {/* Processing Indicator */}
            {processingDocId && !isUploading && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Processing document...</span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.searchDocuments}
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
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{t.docs}</div>
              </div>
              <div className="border-l border-primary/30 h-10" />
              <div>
                <div className="font-semibold text-foreground">{t.sourceGrounded}</div>
                <div className="text-xs text-muted-foreground">{t.strictRetrieval}</div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {t.activeDocuments}
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {documents.length === 0 
                  ? t.noDocumentsUploaded
                  : t.noDocumentsMatch}
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
                          {doc.chunks_count ? `${doc.chunks_count} ${t.chunks}` : t.processing + '...'}
                          {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)}KB`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                        title={t.deleteFailed}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </>
      )}
    </aside>
  );
};
