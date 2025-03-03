import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { Anthropic } from '@anthropic-ai/sdk';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

// Add check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function extractPDFInfo(pdfPath) {
  try {
    // Read the PDF file
    const dataBuffer = await fs.readFile(pdfPath);
    
    // Parse PDF
    const data = await pdfParse(dataBuffer);
    
    // Clean up the text
    const cleanText = data.text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    // Extract metadata from PDF info
    const { info } = data;
    const metadata = {
      author: info.Author || 'Unknown',
      creationDate: info.CreationDate ? parseAdobeDate(info.CreationDate) : null,
      producer: info.Producer || 'Unknown',
      pageCount: data.numpages,
      text: cleanText
    };

    // Store the raw text for future reference (optional)
    const textFilePath = pdfPath.replace('.pdf', '.txt');
    await fs.writeFile(textFilePath, cleanText);
    
    return metadata;
  } catch (error) {
    console.error(`Error extracting info from ${pdfPath}:`, error);
    return {
      error: `Error extracting PDF info: ${error.message}`,
      text: ''
    };
  }
}

// Helper function to parse Adobe's date format (e.g., "D:20240315123456-07'00'")
function parseAdobeDate(adobeDate) {
  if (!adobeDate) return null;
  
  try {
    // Remove the 'D:' prefix if it exists
    const dateStr = adobeDate.startsWith('D:') ? adobeDate.substring(2) : adobeDate;
    
    // Extract date components
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    
    // Create ISO date string
    const isoDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    return new Date(isoDate).toISOString();
  } catch (error) {
    console.warn('Error parsing Adobe date:', error);
    return null;
  }
}

async function generateSummary(text) {
  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `
      Please provide a very brief summary (1 sentence) of the following document text: \n\n${text}
      
      WARNINGS
      Be direct. Just return the summary, don't explain that the document appears to be about a given topic
      `
    }]
  });

  return response.content[0].text;
}

async function processDocuments(docsDir) {
  try {
    // Ensure the directory exists
    await fs.mkdir(docsDir, { recursive: true });
    
    // Read all files in the documents directory
    const files = await fs.readdir(docsDir);
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in the documents directory.');
      // Create an empty metadata file
      await fs.writeFile(
        path.join(process.cwd(), 'src', 'data', 'documents.json'),
        JSON.stringify([], null, 2)
      );
      return [];
    }

    const documentMetadata = [];

    for (const file of pdfFiles) {
      const filePath = path.join(docsDir, file);
      const stats = await fs.stat(filePath);

      console.log(`Processing ${file}...`);

      // Extract PDF info including text and metadata
      const pdfInfo = await extractPDFInfo(filePath);
      
      if (pdfInfo.error) {
        console.error(`Skipping ${file} due to extraction error`);
        continue;
      }

      // Generate summary using Claude
      console.log(`Generating summary for ${file}...`);
      const summary = await generateSummary(pdfInfo.text);

      documentMetadata.push({
        id: documentMetadata.length + 1,
        title: path.basename(file, '.pdf').replace(/_/g, ' '),
        category: 'Uncategorized',
        summary,
        url: `/documents/${file}`,
        lastModified: stats.mtime,
        size: stats.size,
        author: pdfInfo.author,
        creationDate: pdfInfo.creationDate,
        pageCount: pdfInfo.pageCount,
        producer: pdfInfo.producer,
        textContent: pdfInfo.text // Optional: remove if you don't want to store the full text
      });

      // Add a small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save metadata to a JSON file
    await fs.writeFile(
      path.join(process.cwd(), 'src', 'data', 'documents.json'),
      JSON.stringify(documentMetadata, null, 2)
    );

    console.log(`Successfully processed ${documentMetadata.length} documents`);
    return documentMetadata;

  } catch (error) {
    console.error('Error processing documents:', error);
    // Create an empty metadata file in case of error
    await fs.writeFile(
      path.join(process.cwd(), 'src', 'data', 'documents.json'),
      JSON.stringify([], null, 2)
    );
    throw error;
  }
}

// Make the script executable
try {
  // Create required directories
  await fs.mkdir(path.join(process.cwd(), 'src', 'data'), { recursive: true });
  await fs.mkdir(path.join(process.cwd(), 'public', 'documents'), { recursive: true });
  
  // Create an initial empty documents.json if it doesn't exist
  const dataPath = path.join(process.cwd(), 'src', 'data', 'documents.json');
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify([], null, 2));
  }

  // Process documents
  const docsDir = path.join(process.cwd(), 'public', 'documents');
  await processDocuments(docsDir);
  
  console.log('Processing complete!');
} catch (error) {
  console.error('Script failed:', error);
  process.exit(1);
} 