import { LanguageCode } from './constants';

export type SearchMode = 'documents' | 'web' | 'combined';

export interface UITranslations {
  // Header & Navigation
  intelligentQuery: string;
  queryDescription: string;

  // Sidebar Menu
  menu: string;
  askVentureLens: string;
  marketInsights: string;
  findInvestors: string;
  governmentSchemes: string;
  dataSources: string;
  knowledgeBase: string;
  startupIntelligence: string;
  poweredByRag: string;
  retrievalAugmented: string;

  // Dashboard
  fundingDashboard: string;
  dashboardSubtitle: string;
  totalFunding: string;
  uniqueInvestors: string;
  fundedStartups: string;
  dataSourcesCount: string;
  dealsInPeriod: string;
  activeInPeriod: string;
  inSelectedRange: string;
  newSourcesAdded: string;

  // Investors Section
  topInvestors: string;
  investorsDescription: string;
  totalInvested: string;
  focusAreas: string;
  notableInvestments: string;

  // Policies Section
  governmentPolicies: string;
  policiesDescription: string;
  deadline: string;
  learnMore: string;

  // Data Sources
  dataSourcesTitle: string;
  dataSourcesDescription: string;
  addCustomSource: string;
  enterUrlPlaceholder: string;
  addSource: string;
  ingestedSources: string;
  sourcesReady: string;
  dataIngested: string;
  contentScraped: string;
  ingestionFailed: string;
  failedToScrape: string;

  // Export Panel
  export: string;
  downloadCsv: string;
  generatePdfReport: string;
  exportedRecords: string;
  noDataToExport: string;
  exportFailed: string;

  // Date Range Filter
  quickSelect: string;
  last7Days: string;
  last30Days: string;
  last3Months: string;
  last6Months: string;
  thisYear: string;
  lastYear: string;
  allTime: string;

  // Knowledge Base Panel
  ragKnowledgeBase: string;
  manageDocuments: string;
  newConversation: string;
  uploadDocument: string;
  searchDocuments: string;
  totalDocuments: string;
  documentsReady: string;
  processing: string;
  failed: string;

  // Crawl Scheduler
  automatedDataCrawler: string;
  lastRun: string;
  nextScheduledRun: string;
  runNow: string;
  running: string;
  configuredSources: string;

  // Search modes
  searchMode: string;
  documentsOnly: string;
  webOnly: string;
  combined: string;
  documentsOnlyDesc: string;
  webOnlyDesc: string;
  combinedDesc: string;

  // Chat interface
  startExploring: string;
  askAnyQuestion: string;
  askPlaceholder: string;
  clearConversation: string;

  // Loading states
  searchingKnowledgeBase: string;
  searchingWeb: string;

  // Web search prompt
  documentsNoInfo: string;
  wouldYouLikeWebSearch: string;
  searchTheWeb: string;
  searching: string;

  // Sources
  fromKnowledgeBase: string;
  webSources: string;

  // Errors
  errorTitle: string;
  rateLimitError: string;
  creditsExhausted: string;
  failedToProcess: string;
  webSearchFailed: string;
  webSearchComplete: string;
  foundInfoFromWeb: string;

  // Buttons
  send: string;

  // Footer
  footerTagline: string;
  builtWith: string;

  // Settings
  settings: string;

  // Sector Comparison
  sectorComparison: string;
  selectSectorsToCompare: string;
  monthlyTrend: string;
  sectorSummary: string;
  selectAtLeastTwo: string;
  selectSectorsPrompt: string;
  monthlyTrends: string;
  totalFundingTab: string;
  dealAnalysis: string;
  totalDeals: string;
  avgDealSize: string;

  // Charts
  fundingTrends: string;
  monthlyFundingTrends: string;
  sectorBreakdown: string;
  fundingByRound: string;
  sectorAnalysis: string;
  sectorDistribution: string;
  whereMoneyFlowing: string;
  deals: string;
  focus: string;

  // Funding Comparison
  fundingComparison: string;
  vsPreviousPeriod: string;
  weekly: string;
  monthly: string;
  quarterly: string;
  thisWeek: string;
  lastWeek: string;

  // Knowledge Base
  knowledgeBaseTitle: string;
  ragContextData: string;
  activeDocuments: string;
  sourceGrounded: string;
  strictRetrieval: string;
  docs: string;
  noDocumentsUploaded: string;
  noDocumentsMatch: string;
  uploading: string;
  documentUploaded: string;
  processingForRag: string;
  processingStarted: string;
  documentReady: string;
  documentDeleted: string;
  deleteFailed: string;
  uploadFailed: string;
  chunks: string;
}

const baseTranslations: UITranslations = {
  // Header & Navigation
  intelligentQuery: 'Intelligent',
  queryDescription: 'Ask questions about startup funding in your preferred language. Get grounded insights backed by real data sources.',

  // Sidebar Menu
  menu: 'Menu',
  askVentureLens: 'Ask VentureLens',
  marketInsights: 'Market Insights',
  findInvestors: 'Find Investors',
  governmentSchemes: 'Government Schemes',
  dataSources: 'Data Sources',
  knowledgeBase: 'Knowledge Base',
  startupIntelligence: 'Startup Intelligence',
  poweredByRag: 'Powered by RAG',
  retrievalAugmented: 'Retrieval Augmented GenAI',

  // Dashboard
  fundingDashboard: 'Funding Dashboard',
  dashboardSubtitle: 'Real-time insights into startup ecosystem funding activity',
  totalFunding: 'Total Funding',
  uniqueInvestors: 'Unique Investors',
  fundedStartups: 'Funded Startups',
  dataSourcesCount: 'Data Sources',
  dealsInPeriod: 'deals in period',
  activeInPeriod: 'Active in period',
  inSelectedRange: 'In selected range',
  newSourcesAdded: 'new sources added',

  // Investors Section
  topInvestors: 'Top Investors',
  investorsDescription: 'Leading venture capital and private equity firms active in the Indian startup ecosystem',
  totalInvested: 'total invested',
  focusAreas: 'Focus Areas',
  notableInvestments: 'Notable Investments',

  // Policies Section
  governmentPolicies: 'Government Policies',
  policiesDescription: 'Schemes and initiatives supporting startups and entrepreneurs',
  deadline: 'Deadline',
  learnMore: 'Learn More',

  // Data Sources
  dataSourcesTitle: 'Data Sources',
  dataSourcesDescription: 'Ingest and manage data from web sources, PDFs, and reports to build your knowledge base.',
  addCustomSource: 'Add Custom Source',
  enterUrlPlaceholder: 'Enter URL to scrape (e.g., https://inc42.com/article)',
  addSource: 'Add Source',
  ingestedSources: 'Ingested Sources',
  sourcesReady: 'sources ready',
  dataIngested: 'Data Ingested',
  contentScraped: 'Content has been scraped and processed successfully.',
  ingestionFailed: 'Ingestion Failed',
  failedToScrape: 'Failed to scrape and process the URL.',

  // Export Panel
  export: 'Export',
  downloadCsv: 'Download CSV',
  generatePdfReport: 'Generate PDF Report',
  exportedRecords: 'Exported records',
  noDataToExport: 'No funding data available to export',
  exportFailed: 'Failed to export',

  // Date Range Filter
  quickSelect: 'Quick Select',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  last3Months: 'Last 3 months',
  last6Months: 'Last 6 months',
  thisYear: 'This year',
  lastYear: 'Last year',
  allTime: 'All time',

  // Knowledge Base Panel
  ragKnowledgeBase: 'RAG Knowledge Base',
  manageDocuments: 'Manage documents for context-aware responses',
  newConversation: 'New Conversation',
  uploadDocument: 'Upload',
  searchDocuments: 'Search documents...',
  totalDocuments: 'Total Documents',
  documentsReady: 'documents ready for RAG',
  processing: 'Processing',
  failed: 'Failed',

  // Crawl Scheduler
  automatedDataCrawler: 'Automated Data Crawler',
  lastRun: 'Last run',
  nextScheduledRun: 'Next scheduled run',
  runNow: 'Run Now',
  running: 'Running...',
  configuredSources: 'Configured Sources',

  // Search modes
  searchMode: 'Search Mode',
  documentsOnly: 'Documents Only',
  webOnly: 'Web Only',
  combined: 'Combined',
  documentsOnlyDesc: 'Search only uploaded documents',
  webOnlyDesc: 'Search only the web',
  combinedDesc: 'Search documents first, then web',

  // Chat interface
  startExploring: 'Start Exploring',
  askAnyQuestion: 'Ask any question about startup funding, investors, or government policies',
  askPlaceholder: 'Ask your question here...',
  clearConversation: 'Clear conversation',

  // Loading states
  searchingKnowledgeBase: 'Searching knowledge base...',
  searchingWeb: 'Searching the web...',

  // Web search prompt
  documentsNoInfo: "Documents don't have the specific information you asked for.",
  wouldYouLikeWebSearch: 'Would you like to search the web for more up-to-date information?',
  searchTheWeb: 'Search the Web',
  searching: 'Searching...',

  // Sources
  fromKnowledgeBase: 'From Knowledge Base:',
  webSources: 'Web Sources:',

  // Errors
  errorTitle: 'Error',
  rateLimitError: 'Rate limit exceeded. Please try again in a moment.',
  creditsExhausted: 'AI credits exhausted. Please add credits to continue.',
  failedToProcess: 'Failed to process your query. Please try again.',
  webSearchFailed: 'Could not perform web search.',
  webSearchComplete: 'Web Search Complete',
  foundInfoFromWeb: 'Found information from the web!',

  // Buttons
  send: 'Send',

  // Footer
  footerTagline: 'Multilingual RAG-based Startup Funding Intelligence System',
  builtWith: 'Built with ❤️',

  // Settings
  settings: 'Settings',

  // Sector Comparison
  sectorComparison: 'Sector Comparison',
  selectSectorsToCompare: 'Select up to 5 sectors to compare:',
  monthlyTrend: 'Monthly Trend',
  sectorSummary: 'Sector Summary',
  selectAtLeastTwo: 'Select at least 2 sectors to compare',
  selectSectorsPrompt: 'Select sectors above to compare funding trends',
  monthlyTrends: 'Monthly Trends',
  totalFundingTab: 'Total Funding',
  dealAnalysis: 'Deal Analysis',
  totalDeals: 'Total Deals',
  avgDealSize: 'Avg Deal Size',

  // Charts
  fundingTrends: 'Funding Trends',
  monthlyFundingTrends: 'Monthly investment flow in $M',
  sectorBreakdown: 'Sector Breakdown',
  fundingByRound: 'Funding by Round',
  sectorAnalysis: 'Sector Analysis',
  sectorDistribution: 'Sector Distribution',
  whereMoneyFlowing: 'Where the money is flowing',
  deals: 'deals',
  focus: 'Focus',

  // Funding Comparison
  fundingComparison: 'Funding Comparison',
  vsPreviousPeriod: 'vs previous period',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  thisWeek: 'This Week',
  lastWeek: 'Last Week',

  // Knowledge Base
  knowledgeBaseTitle: 'Knowledge Base',
  ragContextData: 'RAG Context Data',
  activeDocuments: 'Active Documents',
  sourceGrounded: 'Source Grounded',
  strictRetrieval: 'Strict retrieval from these files.',
  docs: 'Docs',
  noDocumentsUploaded: 'No documents uploaded yet',
  noDocumentsMatch: 'No documents match your search',
  uploading: 'Uploading...',
  documentUploaded: 'Document uploaded',
  processingForRag: 'Processing document for RAG...',
  processingStarted: 'Processing started',
  documentReady: 'Document will be ready shortly',
  documentDeleted: 'Document deleted',
  deleteFailed: 'Delete failed',
  uploadFailed: 'Upload failed',
  chunks: 'chunks',
};

export const translations: Record<LanguageCode, UITranslations> = {
  en: { ...baseTranslations },
  hi: {
    ...baseTranslations,
    // Header & Navigation
    intelligentQuery: 'बुद्धिमान',
    queryDescription: 'अपनी पसंदीदा भाषा में स्टार्टअप फंडिंग के बारे में सवाल पूछें। वास्तविक डेटा स्रोतों पर आधारित अंतर्दृष्टि प्राप्त करें।',

    // Sidebar Menu
    menu: 'मेनू',
    askVentureLens: 'VentureLens से पूछें',
    marketInsights: 'बाजार अंतर्दृष्टि',
    findInvestors: 'निवेशक खोजें',
    governmentSchemes: 'सरकारी योजनाएं',
    dataSources: 'डेटा स्रोत',
    knowledgeBase: 'ज्ञान आधार',
    startupIntelligence: 'स्टार्टअप इंटेलिजेंस',
    poweredByRag: 'RAG द्वारा संचालित',
    retrievalAugmented: 'रिट्रीवल ऑगमेंटेड GenAI',

    // Dashboard
    fundingDashboard: 'फंडिंग डैशबोर्ड',
    dashboardSubtitle: 'स्टार्टअप इकोसिस्टम फंडिंग गतिविधि में रियल-टाइम अंतर्दृष्टि',
    totalFunding: 'कुल फंडिंग',
    uniqueInvestors: 'अद्वितीय निवेशक',
    fundedStartups: 'फंडेड स्टार्टअप्स',
    dataSourcesCount: 'डेटा स्रोत',
    dealsInPeriod: 'अवधि में सौदे',
    activeInPeriod: 'अवधि में सक्रिय',
    inSelectedRange: 'चयनित सीमा में',
    newSourcesAdded: 'नए स्रोत जोड़े गए',

    // Investors Section
    topInvestors: 'शीर्ष निवेशक',
    investorsDescription: 'भारतीय स्टार्टअप इकोसिस्टम में सक्रिय प्रमुख वेंचर कैपिटल और प्राइवेट इक्विटी फर्म',
    totalInvested: 'कुल निवेश',
    focusAreas: 'फोकस क्षेत्र',
    notableInvestments: 'उल्लेखनीय निवेश',

    // Policies Section
    governmentPolicies: 'सरकारी नीतियां',
    policiesDescription: 'स्टार्टअप और उद्यमियों का समर्थन करने वाली योजनाएं और पहल',
    deadline: 'समय सीमा',
    learnMore: 'और जानें',

    // Data Sources
    dataSourcesTitle: 'डेटा स्रोत',
    dataSourcesDescription: 'अपने ज्ञान आधार को बनाने के लिए वेब स्रोतों, PDF और रिपोर्ट से डेटा को इंजेस्ट और प्रबंधित करें।',
    addCustomSource: 'कस्टम स्रोत जोड़ें',
    enterUrlPlaceholder: 'स्क्रैप करने के लिए URL दर्ज करें',
    addSource: 'स्रोत जोड़ें',
    ingestedSources: 'इंजेस्टेड स्रोत',
    sourcesReady: 'स्रोत तैयार',
    dataIngested: 'डेटा इंजेस्ट हुआ',
    contentScraped: 'सामग्री को सफलतापूर्वक स्क्रैप और प्रोसेस किया गया।',
    ingestionFailed: 'इंजेशन विफल',
    failedToScrape: 'URL को स्क्रैप और प्रोसेस करने में विफल।',

    // Export Panel
    export: 'निर्यात',
    downloadCsv: 'CSV डाउनलोड करें',
    generatePdfReport: 'PDF रिपोर्ट बनाएं',
    exportedRecords: 'निर्यातित रिकॉर्ड',
    noDataToExport: 'निर्यात के लिए कोई फंडिंग डेटा उपलब्ध नहीं',
    exportFailed: 'निर्यात विफल',

    // Date Range Filter
    quickSelect: 'त्वरित चयन',
    last7Days: 'पिछले 7 दिन',
    last30Days: 'पिछले 30 दिन',
    last3Months: 'पिछले 3 महीने',
    last6Months: 'पिछले 6 महीने',
    thisYear: 'इस साल',
    lastYear: 'पिछला साल',
    allTime: 'सभी समय',

    // Knowledge Base Panel
    ragKnowledgeBase: 'RAG ज्ञान आधार',
    manageDocuments: 'संदर्भ-जागरूक प्रतिक्रियाओं के लिए दस्तावेज़ प्रबंधित करें',
    newConversation: 'नई बातचीत',
    uploadDocument: 'अपलोड',
    searchDocuments: 'दस्तावेज़ खोजें...',
    totalDocuments: 'कुल दस्तावेज़',
    documentsReady: 'RAG के लिए दस्तावेज़ तैयार',
    processing: 'प्रोसेसिंग',
    failed: 'विफल',

    // Crawl Scheduler
    automatedDataCrawler: 'स्वचालित डेटा क्रॉलर',
    lastRun: 'अंतिम रन',
    nextScheduledRun: 'अगला निर्धारित रन',
    runNow: 'अभी चलाएं',
    running: 'चल रहा है...',
    configuredSources: 'कॉन्फ़िगर किए गए स्रोत',

    // Search modes
    searchMode: 'खोज मोड',
    documentsOnly: 'केवल दस्तावेज़',
    webOnly: 'केवल वेब',
    combined: 'संयुक्त',
    documentsOnlyDesc: 'केवल अपलोड किए गए दस्तावेज़ों में खोजें',
    webOnlyDesc: 'केवल वेब पर खोजें',
    combinedDesc: 'पहले दस्तावेज़ों में, फिर वेब पर खोजें',

    // Chat interface
    startExploring: 'खोज शुरू करें',
    askAnyQuestion: 'स्टार्टअप फंडिंग, निवेशकों, या सरकारी नीतियों के बारे में कोई भी प्रश्न पूछें',
    askPlaceholder: 'अपना प्रश्न यहाँ पूछें...',
    clearConversation: 'वार्तालाप साफ़ करें',

    // Loading states
    searchingKnowledgeBase: 'ज्ञान आधार खोज रहा है...',
    searchingWeb: 'वेब पर खोज रहा है...',

    // Web search prompt
    documentsNoInfo: 'दस्तावेज़ों में आपके द्वारा पूछी गई विशिष्ट जानकारी नहीं है।',
    wouldYouLikeWebSearch: 'क्या आप अधिक अद्यतित जानकारी के लिए वेब पर खोजना चाहेंगे?',
    searchTheWeb: 'वेब पर खोजें',
    searching: 'खोज रहा है...',

    // Sources
    fromKnowledgeBase: 'ज्ञान आधार से:',
    webSources: 'वेब स्रोत:',

    // Errors
    errorTitle: 'त्रुटि',
    rateLimitError: 'दर सीमा पार हो गई। कृपया थोड़ी देर बाद पुनः प्रयास करें।',
    creditsExhausted: 'AI क्रेडिट समाप्त। जारी रखने के लिए कृपया क्रेडिट जोड़ें।',
    failedToProcess: 'आपकी क्वेरी संसाधित करने में विफल। कृपया पुनः प्रयास करें।',
    webSearchFailed: 'वेब खोज नहीं कर सका।',
    webSearchComplete: 'वेब खोज पूर्ण',
    foundInfoFromWeb: 'वेब से जानकारी मिली!',

    // Buttons
    send: 'भेजें',

    // Footer
    footerTagline: 'बहुभाषी RAG-आधारित स्टार्टअप फंडिंग इंटेलिजेंस सिस्टम',
    builtWith: '❤️ के साथ बनाया गया',

    // Sector Comparison
    sectorComparison: 'क्षेत्र तुलना',
    selectSectorsToCompare: 'तुलना करने के लिए 5 क्षेत्रों तक का चयन करें:',
    monthlyTrend: 'मासिक रुझान',
    sectorSummary: 'क्षेत्र सारांश',
    selectAtLeastTwo: 'तुलना करने के लिए कम से कम 2 क्षेत्रों का चयन करें',
    selectSectorsPrompt: 'फंडिंग रुझानों की तुलना करने के लिए ऊपर क्षेत्रों का चयन करें',
    monthlyTrends: 'मासिक रुझान',
    totalFundingTab: 'कुल फंडिंग',
    dealAnalysis: 'सौदा विश्लेषण',
    totalDeals: 'कुल सौदे',
    avgDealSize: 'औसत सौदा आकार',

    // Charts
    fundingTrends: 'फंडिंग रुझान',
    monthlyFundingTrends: '$M में मासिक निवेश प्रवाह',
    sectorBreakdown: 'क्षेत्र विभाजन',
    fundingByRound: 'राउंड द्वारा फंडिंग',
    sectorAnalysis: 'क्षेत्र विश्लेषण',
    sectorDistribution: 'क्षेत्र वितरण',
    whereMoneyFlowing: 'पैसा कहाँ जा रहा है',
    deals: 'सौदे',
    focus: 'फोकस',

    // Funding Comparison
    fundingComparison: 'फंडिंग तुलना',
    vsPreviousPeriod: 'पिछली अवधि की तुलना में',
    weekly: 'साप्ताहिक',
    monthly: 'मासिक',
    quarterly: 'तिमाही',
    thisWeek: 'इस सप्ताह',
    lastWeek: 'पिछला सप्ताह',

    // Knowledge Base
    knowledgeBaseTitle: 'ज्ञान आधार',
    ragContextData: 'RAG संदर्भ डेटा',
    activeDocuments: 'सक्रिय दस्तावेज़',
    sourceGrounded: 'स्रोत आधारित',
    strictRetrieval: 'इन फ़ाइलों से सख्त पुनर्प्राप्ति।',
    docs: 'दस्तावेज़',
    noDocumentsUploaded: 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया',
    noDocumentsMatch: 'कोई दस्तावेज़ आपकी खोज से मेल नहीं खाता',
    uploading: 'अपलोड हो रहा है...',
    documentUploaded: 'दस्तावेज़ अपलोड हुआ',
    processingForRag: 'RAG के लिए दस्तावेज़ प्रोसेस हो रहा है...',
    processingStarted: 'प्रोसेसिंग शुरू',
    documentReady: 'दस्तावेज़ जल्द ही तैयार होगा',
    documentDeleted: 'दस्तावेज़ हटाया गया',
    deleteFailed: 'हटाने में विफल',
    uploadFailed: 'अपलोड विफल',
    chunks: 'चंक्स',
  },
  ta: {
    ...baseTranslations,
    // Header & Navigation
    intelligentQuery: 'புத்திசாலி',
    queryDescription: 'உங்கள் விருப்பமான மொழியில் ஸ்டார்ட்அப் நிதியுதவி பற்றி கேள்விகளைக் கேளுங்கள்.',

    // Sidebar Menu
    menu: 'மெனு',
    askVentureLens: 'VentureLens கேளுங்கள்',
    marketInsights: 'சந்தை நுண்ணறிவு',
    findInvestors: 'முதலீட்டாளர்களைக் கண்டறியுங்கள்',
    governmentSchemes: 'அரசு திட்டங்கள்',
    dataSources: 'தரவு மூலங்கள்',
    knowledgeBase: 'அறிவுத்தளம்',
    startupIntelligence: 'ஸ்டார்ட்அப் இன்டெலிஜென்ஸ்',
    poweredByRag: 'RAG மூலம் இயக்கப்படுகிறது',
    retrievalAugmented: 'ரிட்ரீவல் ஆக்மென்டட் GenAI',

    // Dashboard
    fundingDashboard: 'நிதியுதவி டாஷ்போர்ட்',
    dashboardSubtitle: 'ஸ்டார்ட்அப் சுற்றுச்சூழல் நிதியுதவி செயல்பாட்டில் நிகழ்நேர நுண்ணறிவு',
    totalFunding: 'மொத்த நிதியுதவி',
    uniqueInvestors: 'தனித்துவ முதலீட்டாளர்கள்',
    fundedStartups: 'நிதியுதவி பெற்ற ஸ்டார்ட்அப்கள்',
    dataSourcesCount: 'தரவு மூலங்கள்',
    dealsInPeriod: 'காலகட்டத்தில் ஒப்பந்தங்கள்',
    activeInPeriod: 'காலகட்டத்தில் செயலில்',
    inSelectedRange: 'தேர்ந்தெடுக்கப்பட்ட வரம்பில்',
    newSourcesAdded: 'புதிய மூலங்கள் சேர்க்கப்பட்டன',

    // Investors Section
    topInvestors: 'சிறந்த முதலீட்டாளர்கள்',
    investorsDescription: 'இந்திய ஸ்டார்ட்அப் சுற்றுச்சூழலில் செயல்படும் முன்னணி வென்ச்சர் கேபிடல் மற்றும் பிரைவேட் ஈக்விட்டி நிறுவனங்கள்',
    totalInvested: 'மொத்த முதலீடு',
    focusAreas: 'கவன பகுதிகள்',
    notableInvestments: 'குறிப்பிடத்தக்க முதலீடுகள்',

    // Policies Section
    governmentPolicies: 'அரசு கொள்கைகள்',
    policiesDescription: 'ஸ்டார்ட்அப்கள் மற்றும் தொழில்முனைவோரை ஆதரிக்கும் திட்டங்கள் மற்றும் முயற்சிகள்',
    deadline: 'காலக்கெடு',
    learnMore: 'மேலும் அறிக',

    // Export Panel
    export: 'ஏற்றுமதி',
    downloadCsv: 'CSV பதிவிறக்கம்',
    generatePdfReport: 'PDF அறிக்கை உருவாக்கு',

    // Date Range Filter
    quickSelect: 'விரைவு தேர்வு',
    last7Days: 'கடந்த 7 நாட்கள்',
    last30Days: 'கடந்த 30 நாட்கள்',
    last3Months: 'கடந்த 3 மாதங்கள்',
    last6Months: 'கடந்த 6 மாதங்கள்',
    thisYear: 'இந்த ஆண்டு',
    lastYear: 'கடந்த ஆண்டு',
    allTime: 'எல்லா நேரமும்',

    // Search modes
    searchMode: 'தேடல் முறை',
    documentsOnly: 'ஆவணங்கள் மட்டும்',
    webOnly: 'வெப் மட்டும்',
    combined: 'இணைந்த',
    documentsOnlyDesc: 'பதிவேற்றிய ஆவணங்களில் மட்டும் தேடுங்கள்',
    webOnlyDesc: 'வெப்பில் மட்டும் தேடுங்கள்',
    combinedDesc: 'முதலில் ஆவணங்கள், பின்னர் வெப்',

    // Chat interface
    startExploring: 'ஆராய்வைத் தொடங்குங்கள்',
    askAnyQuestion: 'ஸ்டார்ட்அப் நிதியுதவி, முதலீட்டாளர்கள் அல்லது அரசு கொள்கைகள் பற்றி எந்த கேள்வியும் கேளுங்கள்',
    askPlaceholder: 'உங்கள் கேள்வியை இங்கே கேளுங்கள்...',
    clearConversation: 'உரையாடலை அழி',

    // Footer
    footerTagline: 'பன்மொழி RAG-அடிப்படையிலான ஸ்டார்ட்அப் நிதியுதவி இன்டெலிஜென்ஸ் சிஸ்டம்',
    builtWith: '❤️ உடன் உருவாக்கப்பட்டது',

    // Buttons
    send: 'அனுப்பு',

    // Sector Comparison
    sectorComparison: 'துறை ஒப்பீடு',
    selectSectorsToCompare: 'ஒப்பிட 5 துறைகள் வரை தேர்ந்தெடுக்கவும்',
    selectAtLeastTwo: 'ஒப்பிட குறைந்தது 2 துறைகளைத் தேர்ந்தெடுக்கவும்',
  },
  te: {
    ...baseTranslations,
    // Header & Navigation
    intelligentQuery: 'తెలివైన',
    queryDescription: 'మీ ఇష్టమైన భాషలో స్టార్టప్ ఫండింగ్ గురించి ప్రశ్నలు అడగండి.',

    // Sidebar Menu
    menu: 'మెను',
    askVentureLens: 'VentureLens అడగండి',
    marketInsights: 'మార్కెట్ అంతర్దృష్టులు',
    findInvestors: 'పెట్టుబడిదారులను కనుగొనండి',
    governmentSchemes: 'ప్రభుత్వ పథకాలు',
    dataSources: 'డేటా మూలాలు',
    knowledgeBase: 'నాలెడ్జ్ బేస్',
    startupIntelligence: 'స్టార్టప్ ఇంటెలిజెన్స్',
    poweredByRag: 'RAG ద్వారా ఆధారితం',

    // Dashboard
    fundingDashboard: 'ఫండింగ్ డాష్‌బోర్డ్',
    dashboardSubtitle: 'స్టార్టప్ ఇకోసిస్టమ్ ఫండింగ్ కార్యకలాపంలో రియల్-టైమ్ అంతర్దృష్టులు',
    totalFunding: 'మొత్తం ఫండింగ్',
    uniqueInvestors: 'ప్రత్యేక పెట్టుబడిదారులు',
    fundedStartups: 'ఫండెడ్ స్టార్టప్‌లు',

    // Investors Section
    topInvestors: 'టాప్ పెట్టుబడిదారులు',
    investorsDescription: 'భారతీయ స్టార్టప్ ఇకోసిస్టమ్‌లో చురుకుగా ఉన్న ప్రముఖ వెంచర్ క్యాపిటల్ మరియు ప్రైవేట్ ఈక్విటీ సంస్థలు',

    // Policies Section
    governmentPolicies: 'ప్రభుత్వ విధానాలు',
    policiesDescription: 'స్టార్టప్‌లు మరియు వ్యవస్థాపకులకు మద్దతు ఇచ్చే పథకాలు మరియు కార్యక్రమాలు',

    // Search modes
    searchMode: 'శోధన మోడ్',
    documentsOnly: 'పత్రాలు మాత్రమే',
    webOnly: 'వెబ్ మాత్రమే',
    combined: 'కలిపిన',

    // Chat interface
    startExploring: 'అన్వేషణ ప్రారంభించండి',
    askPlaceholder: 'మీ ప్రశ్నను ఇక్కడ అడగండి...',

    // Footer
    footerTagline: 'బహుభాషా RAG-ఆధారిత స్టార్టప్ ఫండింగ్ ఇంటెలిజెన్స్ సిస్టమ్',
    send: 'పంపండి',

    // Sector Comparison
    sectorComparison: 'రంగ పోలిక',
    selectSectorsToCompare: 'పోల్చడానికి 5 రంగాల వరకు ఎంచుకోండి',
  },
  bn: {
    ...baseTranslations,
    // Sidebar Menu
    menu: 'মেনু',
    askVentureLens: 'VentureLens জিজ্ঞাসা করুন',
    marketInsights: 'বাজার অন্তর্দৃষ্টি',
    findInvestors: 'বিনিয়োগকারী খুঁজুন',
    governmentSchemes: 'সরকারি প্রকল্প',
    dataSources: 'ডেটা উৎস',
    knowledgeBase: 'জ্ঞান ভাণ্ডার',

    // Dashboard
    fundingDashboard: 'ফান্ডিং ড্যাশবোর্ড',
    totalFunding: 'মোট ফান্ডিং',
    uniqueInvestors: 'অনন্য বিনিয়োগকারী',
    fundedStartups: 'ফান্ডেড স্টার্টআপ',

    // Investors Section
    topInvestors: 'শীর্ষ বিনিয়োগকারী',

    // Policies Section
    governmentPolicies: 'সরকারি নীতি',

    // Search modes
    searchMode: 'অনুসন্ধান মোড',
    documentsOnly: 'শুধুমাত্র ডকুমেন্ট',
    webOnly: 'শুধুমাত্র ওয়েব',
    combined: 'সম্মিলিত',

    // Chat interface
    startExploring: 'অন্বেষণ শুরু করুন',
    askPlaceholder: 'এখানে আপনার প্রশ্ন জিজ্ঞাসা করুন...',

    // Footer
    footerTagline: 'বহুভাষিক RAG-ভিত্তিক স্টার্টআপ ফান্ডিং ইন্টেলিজেন্স সিস্টেম',
    send: 'পাঠান',

    // Sector Comparison
    sectorComparison: 'সেক্টর তুলনা',
    selectSectorsToCompare: 'তুলনা করতে 5টি সেক্টর পর্যন্ত নির্বাচন করুন',
  },
  mr: {
    ...baseTranslations,
    // Sidebar Menu
    menu: 'मेनू',
    askVentureLens: 'VentureLens ला विचारा',
    marketInsights: 'बाजार अंतर्दृष्टी',
    findInvestors: 'गुंतवणूकदार शोधा',
    governmentSchemes: 'सरकारी योजना',
    dataSources: 'डेटा स्रोत',
    knowledgeBase: 'ज्ञान आधार',

    // Dashboard
    fundingDashboard: 'फंडिंग डॅशबोर्ड',
    totalFunding: 'एकूण फंडिंग',
    uniqueInvestors: 'अद्वितीय गुंतवणूकदार',
    fundedStartups: 'फंडेड स्टार्टअप्स',

    // Investors Section
    topInvestors: 'शीर्ष गुंतवणूकदार',

    // Policies Section
    governmentPolicies: 'सरकारी धोरणे',

    // Search modes
    searchMode: 'शोध मोड',
    documentsOnly: 'फक्त दस्तऐवज',
    webOnly: 'फक्त वेब',
    combined: 'एकत्रित',

    // Chat interface
    startExploring: 'शोध सुरू करा',
    askPlaceholder: 'तुमचा प्रश्न येथे विचारा...',

    send: 'पाठवा',

    // Sector Comparison
    sectorComparison: 'क्षेत्र तुलना',
    selectSectorsToCompare: 'तुलनेसाठी 5 क्षेत्रांपर्यंत निवडा',
  },
  gu: {
    ...baseTranslations,
    // Sidebar Menu
    menu: 'મેનુ',
    askVentureLens: 'VentureLens પૂછો',
    marketInsights: 'બજાર આંતરદૃષ્ટિ',
    findInvestors: 'રોકાણકારો શોધો',
    governmentSchemes: 'સરકારી યોજનાઓ',
    dataSources: 'ડેટા સ્રોતો',
    knowledgeBase: 'જ્ઞાન આધાર',

    // Dashboard
    fundingDashboard: 'ફંડિંગ ડેશબોર્ડ',
    totalFunding: 'કુલ ફંડિંગ',
    uniqueInvestors: 'અનન્ય રોકાણકારો',
    fundedStartups: 'ફંડેડ સ્ટાર્ટઅપ્સ',

    // Investors Section
    topInvestors: 'ટોચના રોકાણકારો',

    // Policies Section
    governmentPolicies: 'સરકારી નીતિઓ',

    // Search modes
    searchMode: 'શોધ મોડ',
    documentsOnly: 'માત્ર દસ્તાવેજો',
    webOnly: 'માત્ર વેબ',
    combined: 'સંયુક્ત',

    // Chat interface
    startExploring: 'અન્વેષણ શરૂ કરો',
    askPlaceholder: 'તમારો પ્રશ્ન અહીં પૂછો...',

    send: 'મોકલો',

    // Sector Comparison
    sectorComparison: 'ક્ષેત્ર સરખામણી',
    selectSectorsToCompare: 'સરખામણી માટે 5 ક્ષેત્રો સુધી પસંદ કરો',
  },
  kn: {
    ...baseTranslations,
    // Sidebar Menu
    menu: 'ಮೆನು',
    askVentureLens: 'VentureLens ಕೇಳಿ',
    marketInsights: 'ಮಾರುಕಟ್ಟೆ ಒಳನೋಟಗಳು',
    findInvestors: 'ಹೂಡಿಕೆದಾರರನ್ನು ಹುಡುಕಿ',
    governmentSchemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    dataSources: 'ಡೇಟಾ ಮೂಲಗಳು',
    knowledgeBase: 'ಜ್ಞಾನ ಬೇಸ್',

    // Dashboard
    fundingDashboard: 'ಫಂಡಿಂಗ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    totalFunding: 'ಒಟ್ಟು ಫಂಡಿಂಗ್',
    uniqueInvestors: 'ವಿಶಿಷ್ಟ ಹೂಡಿಕೆದಾರರು',
    fundedStartups: 'ಫಂಡೆಡ್ ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗಳು',

    // Investors Section
    topInvestors: 'ಅಗ್ರ ಹೂಡಿಕೆದಾರರು',

    // Policies Section
    governmentPolicies: 'ಸರ್ಕಾರಿ ನೀತಿಗಳು',

    // Search modes
    searchMode: 'ಹುಡುಕಾಟ ಮೋಡ್',
    documentsOnly: 'ಡಾಕ್ಯುಮೆಂಟ್‌ಗಳು ಮಾತ್ರ',
    webOnly: 'ವೆಬ್ ಮಾತ್ರ',
    combined: 'ಸಂಯೋಜಿತ',

    // Chat interface
    startExploring: 'ಅನ್ವೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ',
    askPlaceholder: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಕೇಳಿ...',

    send: 'ಕಳುಹಿಸಿ',

    // Sector Comparison
    sectorComparison: 'ವಲಯ ಹೋಲಿಕೆ',
    selectSectorsToCompare: 'ಹೋಲಿಸಲು 5 ವಲಯಗಳವರೆಗೆ ಆಯ್ಕೆಮಾಡಿ',
  },
  ml: {
    ...baseTranslations,
    // Sidebar Menu
    menu: 'മെനു',
    askVentureLens: 'VentureLens ചോദിക്കുക',
    marketInsights: 'മാർക്കറ്റ് ഉൾക്കാഴ്ചകൾ',
    findInvestors: 'നിക്ഷേപകരെ കണ്ടെത്തുക',
    governmentSchemes: 'സർക്കാർ പദ്ധതികൾ',
    dataSources: 'ഡാറ്റ ഉറവിടങ്ങൾ',
    knowledgeBase: 'വിജ്ഞാനകോശം',

    // Dashboard
    fundingDashboard: 'ഫണ്ടിംഗ് ഡാഷ്‌ബോർഡ്',
    totalFunding: 'മൊത്തം ഫണ്ടിംഗ്',
    uniqueInvestors: 'അദ്വിതീയ നിക്ഷേപകർ',
    fundedStartups: 'ഫണ്ടഡ് സ്റ്റാർട്ടപ്പുകൾ',

    // Investors Section
    topInvestors: 'മികച്ച നിക്ഷേപകർ',

    // Policies Section
    governmentPolicies: 'സർക്കാർ നയങ്ങൾ',

    // Search modes
    searchMode: 'തിരയൽ മോഡ്',
    documentsOnly: 'ഡോക്യുമെന്റുകൾ മാത്രം',
    webOnly: 'വെബ് മാത്രം',
    combined: 'സംയോജിത',

    // Chat interface
    startExploring: 'പര്യവേക്ഷണം ആരംഭിക്കുക',
    askPlaceholder: 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ചോദിക്കുക...',

    send: 'അയയ്ക്കുക',

    // Sector Comparison
    sectorComparison: 'മേഖല താരതമ്യം',
    selectSectorsToCompare: 'താരതമ്യം ചെയ്യാൻ 5 മേഖലകൾ വരെ തിരഞ്ഞെടുക്കുക',
  },
  pa: {
    ...baseTranslations,
    // Sidebar Menu
    menu: 'ਮੀਨੂ',
    askVentureLens: 'VentureLens ਪੁੱਛੋ',
    marketInsights: 'ਮਾਰਕੀਟ ਸੂਝ',
    findInvestors: 'ਨਿਵੇਸ਼ਕ ਲੱਭੋ',
    governmentSchemes: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ',
    dataSources: 'ਡੇਟਾ ਸਰੋਤ',
    knowledgeBase: 'ਗਿਆਨ ਅਧਾਰ',

    // Dashboard
    fundingDashboard: 'ਫੰਡਿੰਗ ਡੈਸ਼ਬੋਰਡ',
    totalFunding: 'ਕੁੱਲ ਫੰਡਿੰਗ',
    uniqueInvestors: 'ਵਿਲੱਖਣ ਨਿਵੇਸ਼ਕ',
    fundedStartups: 'ਫੰਡਿਡ ਸਟਾਰਟਅੱਪਸ',

    // Investors Section
    topInvestors: 'ਚੋਟੀ ਦੇ ਨਿਵੇਸ਼ਕ',

    // Policies Section
    governmentPolicies: 'ਸਰਕਾਰੀ ਨੀਤੀਆਂ',

    // Search modes
    searchMode: 'ਖੋਜ ਮੋਡ',
    documentsOnly: 'ਸਿਰਫ਼ ਦਸਤਾਵੇਜ਼',
    webOnly: 'ਸਿਰਫ਼ ਵੈੱਬ',
    combined: 'ਸੰਯੁਕਤ',

    // Chat interface
    startExploring: 'ਖੋਜ ਸ਼ੁਰੂ ਕਰੋ',
    askPlaceholder: 'ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਪੁੱਛੋ...',

    send: 'ਭੇਜੋ',

    // Sector Comparison
    sectorComparison: 'ਸੈਕਟਰ ਤੁਲਨਾ',
    selectSectorsToCompare: 'ਤੁਲਨਾ ਕਰਨ ਲਈ 5 ਸੈਕਟਰਾਂ ਤੱਕ ਚੁਣੋ',
  },
};

export const getTranslation = (language: LanguageCode): UITranslations => {
  return translations[language] || translations.en;
};
