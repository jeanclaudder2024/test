/**
 * Script to generate vessel documents using OpenAI
 * This will create various document types for selected vessels
 */
import { db } from '../db';
import { vessels, documents } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { OpenAIService } from '../services/openaiService';
import OpenAI from 'openai';

const openaiService = new OpenAIService();

// Document types to generate
const documentTypes = [
  'Bill of Lading',
  'Certificate of Origin',
  'Inspection Report',
  'Customs Declaration',
  'Letter of Protest',
  'Sea Waybill',
  'Cargo Manifest',
  'Maritime Labour Certificate',
  'International Ship Security Certificate',
  'International Oil Pollution Prevention Certificate',
  'Crew List',
  'Ship Logbook Entry',
  'Charter Party Agreement',
  'Port Clearance Certificate',
  'Voyage Charter Party',
  'Commercial Invoice',
  'Packing List',
  'Dangerous Goods Declaration'
];

// List of vessel IDs to generate documents for
// Add the vessel IDs you want to generate documents for
const vesselIdsToGenerateDocumentsFor = [
  46497, // Western Commander
  48459, // Southern Carrier
  46498, // Pacific Navigator
  46502, // Pacific Mariner
  47133, // Eastern Express
  47408  // Oceanic Voyager
];

async function generateVesselDocuments() {
  console.log('Starting document generation for vessels...');
  
  // Check if OpenAI is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not set. Please set OPENAI_API_KEY to generate documents.');
    return;
  }
  
  try {
    // Get vessels
    const vesselsToProcess = await db.select()
      .from(vessels)
      .where(vessels.id.in(vesselIdsToGenerateDocumentsFor));
    
    console.log(`Found ${vesselsToProcess.length} vessels to generate documents for.`);
    
    // Track statistics
    let totalDocumentsGenerated = 0;
    let totalDocumentsSkipped = 0;
    
    // Process each vessel
    for (const vessel of vesselsToProcess) {
      console.log(`\nGenerating documents for vessel: ${vessel.name} (ID: ${vessel.id})`);
      
      // Get existing documents for this vessel to avoid duplicates
      const existingDocs = await db.select({ type: documents.type })
        .from(documents)
        .where(eq(documents.vesselId, vessel.id));
      
      const existingDocTypes = new Set(existingDocs.map(doc => doc.type.toLowerCase()));
      console.log(`Vessel already has ${existingDocs.length} documents.`);
      
      // Randomly select 4-6 document types to generate
      const numDocsToGenerate = Math.floor(Math.random() * 3) + 4; // 4-6 documents
      const selectedDocTypes = [];
      
      // First try to add document types that don't already exist
      const availableTypes = documentTypes.filter(type => 
        !existingDocTypes.has(type.toLowerCase())
      );
      
      while (selectedDocTypes.length < numDocsToGenerate && availableTypes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTypes.length);
        const docType = availableTypes.splice(randomIndex, 1)[0];
        selectedDocTypes.push(docType);
      }
      
      console.log(`Will generate ${selectedDocTypes.length} new documents for vessel.`);
      
      // Generate each document
      for (const docType of selectedDocTypes) {
        try {
          console.log(`  Generating "${docType}" document...`);
          
          // Generate document content using OpenAI
          const generatedDoc = await openaiService.generateShippingDocument(vessel, docType);
          
          // Set status based on document type (some are likely to be 'active', others 'expired', etc.)
          let status = 'active';
          if (['inspection report', 'certificate'].some(term => docType.toLowerCase().includes(term))) {
            // 30% chance of being expired for certificates and inspection reports
            status = Math.random() < 0.3 ? 'expired' : 'active';
          } else if (docType.toLowerCase().includes('declaration')) {
            // Declarations are usually pending or active
            status = Math.random() < 0.4 ? 'pending' : 'active';
          }

          // Random issue date in the past (0-60 days ago)
          const issueDate = new Date();
          issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 60));
          
          // For certificates, set an expiry date 1-2 years in the future
          let expiryDate = null;
          if (['certificate', 'licence', 'license', 'permit'].some(term => docType.toLowerCase().includes(term))) {
            expiryDate = new Date(issueDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + Math.floor(Math.random() * 2) + 1);
            
            // If status is expired, set expiry date in the past
            if (status === 'expired') {
              expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() - Math.floor(Math.random() * 30) - 1); // 1-30 days ago
            }
          }
          
          // Generate reference number for the document
          const reference = `PDH-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
          
          // Determine issuer based on document type
          let issuer = '';
          if (docType.toLowerCase().includes('certificate')) {
            issuer = ['International Maritime Organization', 'Bureau Veritas Marine & Offshore', 'Lloyd\'s Register', 'American Bureau of Shipping'][Math.floor(Math.random() * 4)];
          } else if (docType.toLowerCase().includes('customs')) {
            issuer = ['U.S. Customs and Border Protection', 'HM Revenue & Customs', 'China Customs', 'Singapore Customs'][Math.floor(Math.random() * 4)];
          } else if (docType.toLowerCase().includes('inspection')) {
            issuer = ['SGS Maritime Services', 'Intertek Marine Services', 'DNV GL Maritime', 'China Classification Society'][Math.floor(Math.random() * 4)];
          } else {
            issuer = ['PetroDealHub Documentation Services', 'Maritime Documentation Center', 'Global Marine Documentation', 'Oceanic Documentation Services'][Math.floor(Math.random() * 4)];
          }
          
          // Determine language based on vessel flag and random chance
          const languages = ['en', 'English', 'Spanish', 'Chinese', 'Arabic', 'French'];
          const language = languages[Math.floor(Math.random() * languages.length)];
          
          // Insert the document into the database
          const [savedDoc] = await db.insert(documents).values({
            vesselId: vessel.id,
            type: docType,
            title: generatedDoc.title,
            content: generatedDoc.content,
            status,
            issueDate,
            expiryDate,
            reference,
            issuer,
            language
          }).returning();
          
          console.log(`  ✅ Created document ID: ${savedDoc.id} - "${savedDoc.title}"`);
          totalDocumentsGenerated++;
          
        } catch (error) {
          console.error(`  ❌ Error generating "${docType}" document:`, error);
          totalDocumentsSkipped++;
        }
      }
    }
    
    console.log(`\n===== Document Generation Summary =====`);
    console.log(`Total vessels processed: ${vesselsToProcess.length}`);
    console.log(`Total documents generated: ${totalDocumentsGenerated}`);
    console.log(`Total documents skipped due to errors: ${totalDocumentsSkipped}`);
    console.log(`========================================`);
    
  } catch (error) {
    console.error('Error in document generation process:', error);
  }
}

// Run the script
generateVesselDocuments()
  .then(() => {
    console.log('Document generation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error during document generation:', error);
    process.exit(1);
  });