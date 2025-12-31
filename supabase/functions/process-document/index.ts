import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize = 800, overlap = 150): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunk = cleanedText.slice(start, end).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }
  
  return chunks;
}

// Generate embeddings using Gemini AI
async function generateEmbedding(text: string, apiKey: string): Promise<string[] | null> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Extract the key semantic concepts from the text and return them as a comma-separated list of the 10 most important keywords/phrases. Only return the keywords, nothing else.' 
          },
          { role: 'user', content: text.substring(0, 1500) }
        ],
      }),
    });

    if (!response.ok) {
      console.error('Embedding API error:', response.status);
      return null;
    }

    const data = await response.json();
    const keywords = data.choices?.[0]?.message?.content || '';
    const keywordList = keywords.toLowerCase().split(',').map((k: string) => k.trim()).filter(Boolean);
    
    return keywordList;
  } catch (error) {
    console.error('Embedding generation error:', error);
    return null;
  }
}

// Extract text from PDF
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(arrayBuffer);
  const text: string[] = [];
  
  let pdfString = '';
  for (let i = 0; i < bytes.length; i++) {
    pdfString += String.fromCharCode(bytes[i]);
  }
  
  const btEtPattern = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtPattern.exec(pdfString)) !== null) {
    const textBlock = match[1];
    
    const tjPattern = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjPattern.exec(textBlock)) !== null) {
      const extracted = tjMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      text.push(extracted);
    }
    
    const tjArrayPattern = /\[(.*?)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayPattern.exec(textBlock)) !== null) {
      const arrayContent = tjArrayMatch[1];
      const stringPattern = /\(([^)]*)\)/g;
      let stringMatch;
      while ((stringMatch = stringPattern.exec(arrayContent)) !== null) {
        const extracted = stringMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        text.push(extracted);
      }
    }
  }
  
  const streamPattern = /stream\s*([\s\S]*?)\s*endstream/g;
  while ((match = streamPattern.exec(pdfString)) !== null) {
    const streamContent = match[1];
    const readableText = streamContent.match(/[A-Za-z][A-Za-z0-9\s.,;:!?'-]{10,}/g);
    if (readableText) {
      text.push(...readableText);
    }
  }
  
  const result = text.join(' ').replace(/\s+/g, ' ').trim();
  console.log('Extracted PDF text length:', result.length);
  
  return result;
}

// Extract text from DOCX (Office Open XML)
async function extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(arrayBuffer);
    
    // Main document content is in word/document.xml
    const documentXml = await zip.file('word/document.xml')?.async('string');
    
    if (!documentXml) {
      console.error('No document.xml found in DOCX');
      return '';
    }
    
    // Extract text from XML - look for <w:t> tags which contain text
    const textContent: string[] = [];
    
    // Match all text nodes
    const textPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;
    while ((match = textPattern.exec(documentXml)) !== null) {
      if (match[1].trim()) {
        textContent.push(match[1]);
      }
    }
    
    // Also extract from paragraph tags for structure
    const paragraphPattern = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
    const paragraphs: string[] = [];
    
    while ((match = paragraphPattern.exec(documentXml)) !== null) {
      const paragraphXml = match[1];
      const texts: string[] = [];
      const innerTextPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let innerMatch;
      while ((innerMatch = innerTextPattern.exec(paragraphXml)) !== null) {
        texts.push(innerMatch[1]);
      }
      if (texts.length > 0) {
        paragraphs.push(texts.join(''));
      }
    }
    
    const result = paragraphs.join('\n').replace(/\s+/g, ' ').trim();
    console.log('Extracted DOCX text length:', result.length);
    
    return result || textContent.join(' ');
  } catch (error) {
    console.error('Error extracting DOCX:', error);
    return '';
  }
}

// Extract text from XLSX (Office Open XML Spreadsheet)
async function extractTextFromXLSX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(arrayBuffer);
    
    // Get shared strings (text values are stored separately)
    const sharedStringsXml = await zip.file('xl/sharedStrings.xml')?.async('string');
    const sharedStrings: string[] = [];
    
    if (sharedStringsXml) {
      // Extract text from shared strings
      const stringPattern = /<t[^>]*>([^<]*)<\/t>/g;
      let match;
      while ((match = stringPattern.exec(sharedStringsXml)) !== null) {
        sharedStrings.push(match[1]);
      }
    }
    
    // Get all sheet data
    const allText: string[] = [];
    const sheetFiles = Object.keys(zip.files).filter(f => f.startsWith('xl/worksheets/sheet') && f.endsWith('.xml'));
    
    for (const sheetFile of sheetFiles) {
      const sheetXml = await zip.file(sheetFile)?.async('string');
      if (!sheetXml) continue;
      
      // Extract cell values
      const cellPattern = /<c[^>]*(?:t="s"[^>]*)?>[\s\S]*?<v>(\d+)<\/v>[\s\S]*?<\/c>/g;
      const inlineCellPattern = /<c[^>]*>[\s\S]*?<is>[\s\S]*?<t>([^<]*)<\/t>[\s\S]*?<\/is>[\s\S]*?<\/c>/g;
      const valueCellPattern = /<c[^>]*(?:t="n"[^>]*)?>[\s\S]*?<v>([^<]+)<\/v>[\s\S]*?<\/c>/g;
      
      let match;
      
      // Get string references
      while ((match = cellPattern.exec(sheetXml)) !== null) {
        const index = parseInt(match[1], 10);
        if (sharedStrings[index]) {
          allText.push(sharedStrings[index]);
        }
      }
      
      // Get inline strings
      while ((match = inlineCellPattern.exec(sheetXml)) !== null) {
        if (match[1].trim()) {
          allText.push(match[1]);
        }
      }
      
      // Get numeric values
      while ((match = valueCellPattern.exec(sheetXml)) !== null) {
        if (match[1].trim() && !isNaN(Number(match[1]))) {
          allText.push(match[1]);
        }
      }
    }
    
    // Also add all shared strings that might contain useful data
    allText.push(...sharedStrings);
    
    const result = [...new Set(allText)].join(' ').replace(/\s+/g, ' ').trim();
    console.log('Extracted XLSX text length:', result.length);
    
    return result;
  } catch (error) {
    console.error('Error extracting XLSX:', error);
    return '';
  }
}

// Extract text from XLS (legacy Excel format - basic extraction)
async function extractTextFromXLS(arrayBuffer: ArrayBuffer): Promise<string> {
  // XLS is a binary format, try to extract readable strings
  const bytes = new Uint8Array(arrayBuffer);
  const text: string[] = [];
  
  let currentString = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // Check if it's a printable ASCII character
    if (byte >= 32 && byte <= 126) {
      currentString += String.fromCharCode(byte);
    } else if (currentString.length > 3) {
      // Only keep strings longer than 3 characters
      text.push(currentString);
      currentString = '';
    } else {
      currentString = '';
    }
  }
  
  if (currentString.length > 3) {
    text.push(currentString);
  }
  
  // Filter out common binary artifacts
  const filtered = text.filter(s => {
    // Keep strings that look like real content
    const hasLetters = /[a-zA-Z]{2,}/.test(s);
    const notJustNumbers = !/^\d+$/.test(s);
    const notBinary = !/[^\x20-\x7E]/.test(s);
    return hasLetters && notJustNumbers && notBinary && s.length > 5;
  });
  
  const result = filtered.join(' ').replace(/\s+/g, ' ').trim();
  console.log('Extracted XLS text length:', result.length);
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, filePath } = await req.json();

    if (!documentId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'documentId and filePath are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing document:', documentId, filePath);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update document status to processing
    await supabase
      .from('knowledge_documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('knowledge-base')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      await supabase
        .from('knowledge_documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text content based on file type
    let textContent = '';
    const fileName = filePath.toLowerCase();
    const arrayBuffer = await fileData.arrayBuffer();
    
    if (fileName.endsWith('.pdf')) {
      console.log('Processing PDF file...');
      textContent = await extractTextFromPDF(arrayBuffer);
      
      if (textContent.length < 100) {
        console.log('Basic PDF parsing yielded little content, trying fallback...');
        const rawText = await fileData.text();
        const readableStrings = rawText.match(/[A-Za-z][A-Za-z0-9\s.,;:!?'"-]{20,}/g);
        if (readableStrings) {
          textContent = readableStrings.join(' ');
        }
      }
    } else if (fileName.endsWith('.docx')) {
      console.log('Processing DOCX file...');
      textContent = await extractTextFromDOCX(arrayBuffer);
    } else if (fileName.endsWith('.xlsx')) {
      console.log('Processing XLSX file...');
      textContent = await extractTextFromXLSX(arrayBuffer);
    } else if (fileName.endsWith('.xls')) {
      console.log('Processing XLS file...');
      textContent = await extractTextFromXLS(arrayBuffer);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      textContent = await fileData.text();
    } else if (fileName.endsWith('.json')) {
      const jsonContent = await fileData.text();
      textContent = JSON.stringify(JSON.parse(jsonContent), null, 2);
    } else if (fileName.endsWith('.csv')) {
      textContent = await fileData.text();
    } else {
      textContent = await fileData.text();
    }

    console.log('Extracted text length:', textContent.length);

    if (textContent.length < 10) {
      console.error('Insufficient text content extracted');
      await supabase
        .from('knowledge_documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      return new Response(
        JSON.stringify({ error: 'Could not extract sufficient text from document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chunk the text
    const chunks = chunkText(textContent);
    console.log('Created chunks:', chunks.length);

    // Determine file type for source_type
    let sourceType: 'pdf' | 'web' | 'table' | 'report' | 'api' = 'web';
    if (fileName.endsWith('.pdf')) sourceType = 'pdf';
    else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) sourceType = 'table';
    else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) sourceType = 'report';

    // Create a data source entry
    const { data: sourceData, error: sourceError } = await supabase
      .from('data_sources')
      .insert({
        source_type: sourceType,
        url: filePath,
        title: filePath.split('/').pop(),
        content: textContent.substring(0, 5000),
        metadata: { 
          documentId, 
          chunksCount: chunks.length, 
          fileType: fileName.split('.').pop(),
          originalLength: textContent.length
        }
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Error creating data source:', sourceError);
    }

    const sourceId = sourceData?.id;

    // Generate embeddings and store chunks
    const embeddingInserts = [];
    
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      let embeddingData = null;
      
      if (geminiApiKey && index < 20) {
        embeddingData = await generateEmbedding(chunk, geminiApiKey);
      }
      
      embeddingInserts.push({
        source_id: sourceId,
        content_chunk: chunk,
        chunk_index: index,
        embedding_data: embeddingData ? { keywords: embeddingData } : null,
        metadata: { documentId, fileName: filePath }
      });
    }

    const { error: embedError } = await supabase
      .from('embeddings')
      .insert(embeddingInserts);

    if (embedError) {
      console.error('Error storing embeddings:', embedError);
    }

    // Update document status to ready
    await supabase
      .from('knowledge_documents')
      .update({ 
        status: 'ready',
        chunks_count: chunks.length
      })
      .eq('id', documentId);

    console.log('Document processing completed:', documentId, 'Chunks:', chunks.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        chunksCreated: chunks.length,
        documentId,
        fileType: fileName.split('.').pop(),
        hasEmbeddings: !!geminiApiKey
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
