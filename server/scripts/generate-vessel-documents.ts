import { db } from "../db";
import OpenAI from "openai";
import { documents, vessels } from "@shared/schema";
import { eq } from "drizzle-orm";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Document types that are common in maritime shipping
const DOCUMENT_TYPES = [
  "Bill of Lading",
  "Certificate of Origin",
  "Commercial Invoice",
  "Packing List",
  "Charter Party Agreement",
  "Mate's Receipt",
  "Vessel Registration Certificate",
  "Ship Safety Certificate",
  "Maritime Declaration of Health",
  "Maritime Labor Certificate",
  "International Oil Pollution Prevention Certificate",
  "Cargo Manifest",
  "Dangerous Goods Declaration",
  "Certificate of Fitness",
  "International Ship Security Certificate",
  "Sea Waybill",
  "Insurance Certificate",
  "Port Clearance Certificate",
  "Crew List",
  "Ship's Log Abstract",
];

// Status types for documents
const DOCUMENT_STATUSES = ["active", "pending", "expired", "revoked"];

// Languages for documents
const DOCUMENT_LANGUAGES = ["English", "Arabic", "Spanish", "Chinese", "French"];

// Maritime organizations that might issue documents
const ISSUING_ORGANIZATIONS = [
  "International Maritime Organization (IMO)",
  "PetroDealHub Certification Authority",
  "Global Maritime Safety Council",
  "International Association of Classification Societies",
  "Bureau Veritas Marine & Offshore",
  "Lloyd's Register Group",
  "Det Norske Veritas Germanischer Lloyd (DNV GL)",
  "American Bureau of Shipping",
  "Nippon Kaiji Kyokai (ClassNK)",
  "Maritime and Port Authority of Singapore",
  "U.S. Coast Guard",
  "European Maritime Safety Agency",
  "China Classification Society",
  "Maritime Authority of Saudi Arabia",
  "Russian Maritime Register of Shipping",
  "Royal Institution of Naval Architects",
  "Panama Maritime Authority",
  "Marshall Islands Registry",
  "Liberian Registry",
  "International Chamber of Shipping",
];

// Maritime companies that might be recipients
const MARITIME_COMPANIES = [
  "Maersk Line",
  "Mediterranean Shipping Company (MSC)",
  "CMA CGM Group",
  "COSCO Shipping",
  "Hapag-Lloyd",
  "ONE (Ocean Network Express)",
  "Evergreen Marine",
  "Yang Ming Marine Transport",
  "HMM Co Ltd.",
  "Pacific International Lines",
  "ZIM Integrated Shipping Services",
  "Wan Hai Lines",
  "Emirates Shipping Line",
  "X-Press Feeders",
  "Arkas Line",
  "Sealand – A Maersk Company",
  "Safmarine",
  "OOCL (Orient Overseas Container Line)",
  "Samudera Shipping Line",
  "KMTC (Korea Marine Transport Co.)",
];

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(
  start: Date = new Date(2022, 0, 1),
  end: Date = new Date()
): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function generateRandomReference(): string {
  const prefix = ["DOC", "CERT", "REG", "MAR", "IMO", "PDH"][
    Math.floor(Math.random() * 6)
  ];
  const year = new Date().getFullYear().toString().substr(-2);
  const number = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(6, "0");
  return `${prefix}-${year}-${number}`;
}

// Function to generate a document for a vessel with GPT
async function generateDocumentWithGPT(
  vesselId: number,
  vesselName: string,
  vesselType: string,
  imo: string,
  docType: string
): Promise<{
  title: string;
  content: string;
  status: string;
  issueDate: string;
  expiryDate: string | null;
  reference: string;
  issuer: string;
  recipientName: string | null;
  recipientOrg: string | null;
  language: string;
}> {
  const issueDate = getRandomDate();
  const expiryDate =
    Math.random() > 0.3
      ? new Date(
          issueDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000
        )
      : null;
  
  const status = expiryDate && expiryDate < new Date() 
    ? "expired" 
    : getRandomElement(DOCUMENT_STATUSES);

  const issuer = getRandomElement(ISSUING_ORGANIZATIONS);
  const language = getRandomElement(DOCUMENT_LANGUAGES);
  
  // Decide if we need a recipient
  const hasRecipient = ["Bill of Lading", "Commercial Invoice", "Charter Party Agreement", "Sea Waybill"].includes(docType);
  
  const recipientName = hasRecipient
    ? `${getRandomElement(["Mr.", "Mrs.", "Ms.", "Capt.", "Dr."])} ${getRandomElement(
        ["Ali", "Smith", "Chen", "Rodriguez", "Kumar", "Mohammed", "Nguyen", "Johnson", "Garcia", "Lee"]
      )} ${getRandomElement(
        ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "J.", "K."]
      )}`
    : null;
  
  const recipientOrg = hasRecipient ? getRandomElement(MARITIME_COMPANIES) : null;
  
  const reference = generateRandomReference();

  // Generate realistic document content based on type
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a maritime document expert system. Generate a realistic ${docType} document for vessel ${vesselName} (IMO: ${imo}, Type: ${vesselType}). 
          The document should be issued by ${issuer} on ${formatDate(issueDate)}${
            expiryDate ? ` with expiry date ${formatDate(expiryDate)}` : ""
          }.
          Document reference: ${reference}.
          Document status: ${status}.
          ${
            recipientName
              ? `The document is addressed to ${recipientName} from ${recipientOrg}.`
              : ""
          }
          
          Generate a title for the document and detailed, realistic content that would appear in such a maritime document, including specific details about the vessel, cargo if relevant, and appropriate formal language used in maritime documentation.
          The content should be 200-400 words and formatted in a clear structure with sections appropriate for the document type.
          
          Important: Use extremely realistic data and formatting. Avoid placeholders or fabricated information. Include specific details that would appear in an actual document of this type.
          Response format should be a JSON object with two fields:
          1. "title": A professional title for the document
          2. "content": The detailed document content
          `,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      title: result.title,
      content: result.content,
      status,
      issueDate: formatDate(issueDate),
      expiryDate: expiryDate ? formatDate(expiryDate) : null,
      reference,
      issuer,
      recipientName,
      recipientOrg,
      language,
    };
  } catch (error) {
    console.error("Error generating document with GPT:", error);
    
    // Fallback content in case of API failure
    return {
      title: `${docType} for ${vesselName}`,
      content: `This is a ${docType} for vessel ${vesselName} (IMO: ${imo}).\n\nIssued by ${issuer}\nReference: ${reference}\n\nThis document certifies that the vessel has met all requirements as specified by the issuing authority. All inspections and checks have been conducted in accordance with international maritime regulations.`,
      status,
      issueDate: formatDate(issueDate),
      expiryDate: expiryDate ? formatDate(expiryDate) : null,
      reference,
      issuer,
      recipientName,
      recipientOrg,
      language,
    };
  }
}

// Main function to generate documents for vessels
export async function generateVesselDocuments(maxDocuments = 50) {
  try {
    console.log("Starting vessel document generation...");
    
    // Get all vessels
    const allVessels = await db.select().from(vessels);
    console.log(`Found ${allVessels.length} vessels.`);
    
    // Get existing documents count
    const existingDocs = await db.select().from(documents);
    console.log(`Database already contains ${existingDocs.length} vessel documents.`);
    
    // If we already have documents, skip generation
    if (existingDocs.length >= maxDocuments) {
      console.log(`Already have ${existingDocs.length} documents, skipping generation.`);
      return { count: existingDocs.length, generated: 0 };
    }
    
    let documentsToGenerate = maxDocuments - existingDocs.length;
    console.log(`Will generate ${documentsToGenerate} new documents.`);
    
    // Select random vessels for document generation
    const selectedVessels = [];
    
    // Prioritize vessels of type "Oil Tanker" or "Chemical Tanker"
    const oilVessels = allVessels.filter(v => v.vesselType?.includes("Tanker"));
    
    // Always include these vessels if they exist in the database
    for (const vesselId of [1, 2, 3, 4, 5]) {
      const vessel = allVessels.find(v => v.id === vesselId);
      if (vessel && !selectedVessels.includes(vessel)) {
        selectedVessels.push(vessel);
      }
    }
    
    // Add more oil tankers if needed
    while (selectedVessels.length < Math.min(10, documentsToGenerate / 2) && oilVessels.length > 0) {
      const randomIndex = Math.floor(Math.random() * oilVessels.length);
      const vessel = oilVessels.splice(randomIndex, 1)[0];
      if (!selectedVessels.includes(vessel)) {
        selectedVessels.push(vessel);
      }
    }
    
    // Fill remaining slots with random vessels
    while (selectedVessels.length < Math.min(20, documentsToGenerate / 2) && allVessels.length > 0) {
      const randomIndex = Math.floor(Math.random() * allVessels.length);
      const vessel = allVessels[randomIndex];
      if (!selectedVessels.includes(vessel)) {
        selectedVessels.push(vessel);
      }
    }
    
    console.log(`Selected ${selectedVessels.length} vessels for document generation.`);
    
    // Generate documents
    let generatedCount = 0;
    
    for (const vessel of selectedVessels) {
      // Generate 1-5 documents per vessel
      const documentsPerVessel = Math.min(
        Math.floor(Math.random() * 5) + 1,
        documentsToGenerate
      );
      
      console.log(`Generating ${documentsPerVessel} documents for vessel ${vessel.name}...`);
      
      // Choose random document types for this vessel
      const docTypes = [];
      while (docTypes.length < documentsPerVessel) {
        const docType = getRandomElement(DOCUMENT_TYPES);
        if (!docTypes.includes(docType)) {
          docTypes.push(docType);
        }
      }
      
      // Generate and insert each document
      for (const docType of docTypes) {
        // Skip if we've reached our document generation limit
        if (generatedCount >= documentsToGenerate) break;
        
        try {
          console.log(`Generating ${docType} for vessel ${vessel.name} (ID: ${vessel.id})...`);
          
          const documentData = await generateDocumentWithGPT(
            vessel.id,
            vessel.name || "Unknown Vessel",
            vessel.vesselType || "Unknown Type",
            vessel.imo || "Unknown IMO",
            docType
          );
          
          // Convert date strings to Date objects for the database
          const issueDate = documentData.issueDate ? new Date(documentData.issueDate) : new Date();
          const expiryDate = documentData.expiryDate ? new Date(documentData.expiryDate) : null;
          
          await db.insert(documents).values({
            vesselId: vessel.id,
            type: docType,
            title: documentData.title,
            content: documentData.content,
            status: documentData.status,
            issueDate: issueDate,
            expiryDate: expiryDate,
            reference: documentData.reference,
            issuer: documentData.issuer,
            recipientName: documentData.recipientName,
            recipientOrg: documentData.recipientOrg,
            language: documentData.language
          });
          
          generatedCount++;
          console.log(`Generated document: ${documentData.title}`);
        } catch (error) {
          console.error(`Error generating document for vessel ${vessel.id}:`, error);
        }
      }
      
      // Break if we've generated enough documents
      if (generatedCount >= documentsToGenerate) break;
    }
    
    console.log(`Successfully generated ${generatedCount} vessel documents.`);
    return { count: existingDocs.length + generatedCount, generated: generatedCount };
  } catch (error) {
    console.error("Error in generateVesselDocuments:", error);
    throw error;
  }
}

// This is now handled through imports - no need for direct execution check
// in ESM modules