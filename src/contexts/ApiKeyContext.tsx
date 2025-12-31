import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ApiKeyContextType {
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    firecrawlApiKey: string;
    setFirecrawlApiKey: (key: string) => void;
    cloudApiKey: string;
    setCloudApiKey: (key: string) => void;
    supabaseUrl: string;
    setSupabaseUrl: (url: string) => void;
    supabaseKey: string;
    setSupabaseKey: (key: string) => void;
    saveKeys: () => void;
    hasKeys: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [firecrawlApiKey, setFirecrawlApiKey] = useState('');
    const [cloudApiKey, setCloudApiKey] = useState('');
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');

    useEffect(() => {
        const storedGeminiKey = localStorage.getItem('geminiApiKey');
        const storedFirecrawlKey = localStorage.getItem('firecrawlApiKey');
        const storedCloudKey = localStorage.getItem('cloudApiKey');
        const storedSupabaseUrl = localStorage.getItem('supabaseUrl');
        const storedSupabaseKey = localStorage.getItem('supabaseKey');

        if (storedGeminiKey) setGeminiApiKey(storedGeminiKey);

        if (storedFirecrawlKey) setFirecrawlApiKey(storedFirecrawlKey);
        if (storedCloudKey) setCloudApiKey(storedCloudKey);
        if (storedSupabaseUrl) setSupabaseUrl(storedSupabaseUrl);
        if (storedSupabaseKey) setSupabaseKey(storedSupabaseKey);
    }, []);

    const saveKeys = () => {
        localStorage.setItem('geminiApiKey', geminiApiKey);
        localStorage.setItem('firecrawlApiKey', firecrawlApiKey);
        localStorage.setItem('cloudApiKey', cloudApiKey);

        // Check if Supabase config changed to trigger reload
        const oldUrl = localStorage.getItem('supabaseUrl');
        const oldKey = localStorage.getItem('supabaseKey');
        const supabaseChanged = oldUrl !== supabaseUrl || oldKey !== supabaseKey;

        localStorage.setItem('supabaseUrl', supabaseUrl);
        localStorage.setItem('supabaseKey', supabaseKey);

        toast.success('API keys saved successfully');

        if (supabaseChanged) {
            toast.info('Supabase configuration changed. Reloading...', { duration: 2000 });
            setTimeout(() => window.location.reload(), 1500);
        }
    };

    const hasKeys = !!(geminiApiKey || firecrawlApiKey || cloudApiKey || supabaseUrl || supabaseKey);

    return (
        <ApiKeyContext.Provider value={{
            geminiApiKey, setGeminiApiKey,
            firecrawlApiKey, setFirecrawlApiKey,
            cloudApiKey, setCloudApiKey,
            supabaseUrl, setSupabaseUrl,
            supabaseKey, setSupabaseKey,
            saveKeys,
            hasKeys
        }}>
            {children}
        </ApiKeyContext.Provider>
    );
};

export const useApiKeys = () => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKeys must be used within an ApiKeyProvider');
    }
    return context;
};
