/**
 * Script to generate vessel documents using OpenAI
 */
import { db } from '../db';
import { vessels, documents } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { OpenAIService } from '../services/openaiService';

// Create OpenAI service instance
const openaiService = new OpenAIService();

// The vessel ID to generate documents for
const VESSEL_ID = 48459; // Southern Carrier

// Document types to generate
const documentTypes = [
  'Bill of Lading',
  'Letter of Protest',
  'Maritime Labour Certificate'
];

async function generateDocuments() {
  console.log('Starting document generation...');
  
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not set. Please set OPENAI_API_KEY environment variable.');
    return;
  }
  
  try {
    // Get the vessel from database
    const [vessel] = await db.select().from(vessels).where(eq(vessels.id, VESSEL_ID));
    
    if (!vessel) {
      console.error(`Vessel with ID ${VESSEL_ID} not found.`);
      return;
    }
    
    console.log(`Generating documents for vessel: ${vessel.name} (ID: ${vessel.id})`);
    
    // Process each document type
    for (const docType of documentTypes) {
      try {
        console.log(`Generating ${docType}...`);
        
        // Use OpenAI to generate document content
        const generatedDoc = await openaiService.generateShippingDocument(vessel, docType);
        
        // Insert document into database
        const [savedDoc] = await db.insert(documents).values({
          vesselId: vessel.id,
          type: docType,
          title: generatedDoc.title,
          content: generatedDoc.content,
          status: 'active',
          createdAt: new Date(),
          lastModified: new Date(),
          language: 'en'
        }).returning();
        
        console.log(`✅ Created document: ${savedDoc.title} (ID: ${savedDoc.id})`);
        
      } catch (error) {
        console.error(`Error generating ${docType}:`, error);
      }
    }
    
    console.log('Document generation completed successfully!');
    
  } catch (error) {
    console.error('Error in document generation process:', error);
  }
}

// Run the script
generateDocuments()
  .then(() => {
    console.log('Process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });