import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKeys } from "@/contexts/ApiKeyContext";
import { Check, Settings, ShieldAlert } from "lucide-react";
import { useState } from "react";

export function SettingsDialog({ children }: { children?: React.ReactNode }) {
    const {
        geminiApiKey, setGeminiApiKey,
        firecrawlApiKey, setFirecrawlApiKey,
        cloudApiKey, setCloudApiKey,
        supabaseUrl, setSupabaseUrl,
        supabaseKey, setSupabaseKey,
        saveKeys
    } = useApiKeys();
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        saveKeys();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-brand-orange" />
                        API Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure your own API keys to use the application functionality.
                        Keys are stored locally.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 flex gap-3">
                        <ShieldAlert className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground">
                            Your keys are never sent to our servers. They are passed directly from your browser to the backend functions for each request.
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="gemini-key">Gemini API Key</Label>
                        <Input
                            id="gemini-key"
                            type="password"
                            placeholder="AI Studio Key (Google)"
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Required for RAG Query, Investor Matching, and Document Processing.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="firecrawl-key">Firecrawl API Key</Label>
                        <Input
                            id="firecrawl-key"
                            type="password"
                            placeholder="fc-..."
                            value={firecrawlApiKey}
                            onChange={(e) => setFirecrawlApiKey(e.target.value)}
                            className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Required for Web Scraping and Data Ingestion.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cloud-key">Cloud API Key</Label>
                        <Input
                            id="cloud-key"
                            type="password"
                            placeholder="Perplexity / Cloud API Key"
                            value={cloudApiKey}
                            onChange={(e) => setCloudApiKey(e.target.value)}
                            className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Required for Real-time Web Search (e.g. Perplexity).
                        </p>
                    </div>

                    <div className="border-t border-border/50 my-2"></div>
                    <div className="text-sm font-medium text-foreground">Custom Database (Optional)</div>

                    <div className="grid gap-2">
                        <Label htmlFor="supabase-url">Supabase Project URL</Label>
                        <Input
                            id="supabase-url"
                            type="text"
                            placeholder="https://your-project.supabase.co"
                            value={supabaseUrl}
                            onChange={(e) => setSupabaseUrl(e.target.value)}
                            className="bg-background/50"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                        <Input
                            id="supabase-key"
                            type="password"
                            placeholder="public-anon-key"
                            value={supabaseKey}
                            onChange={(e) => setSupabaseKey(e.target.value)}
                            className="bg-background/50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Changing these will reload the application to connect to your custom database.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} className="w-full sm:w-auto gap-2">
                        <Check className="w-4 h-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
