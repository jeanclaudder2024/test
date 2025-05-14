import { db } from "../db";
import { documents, vessels } from "@shared/schema";
import { count, eq } from "drizzle-orm";

/**
 * Document types for seeding
 */
const DOCUMENT_TYPES = [
  "Bill of Lading",
  "Certificate of Origin",
  "Commercial Invoice",
  "Phytosanitary Certificate",
  "Ship Registry Certificate",
  "Insurance Certificate",
  "Cargo Manifest",
  "Letter of Credit",
  "Inspection Report",
  "Charter Party Agreement",
  "Letter of Indemnity",
  "Dangerous Goods Declaration",
  "Bunker Delivery Note",
  "Safety Management Certificate",
  "Customs Clearance Document"
];

/**
 * Generate sample documents for vessels in the database
 */
export async function seedVesselDocuments(minDocumentsPerVessel: number = 2): Promise<{
  count: number;
  seeded: boolean;
}> {
  console.log("Starting vessel document seeding...");
  
  // Check if we already have documents in the database
  const existingDocs = await db.select({ count: count() }).from(documents);
  const existingCount = existingDocs[0].count;
  
  if (existingCount > 0) {
    console.log(`Database already contains ${existingCount} vessel documents.`);
    return { count: existingCount, seeded: false };
  }
  
  // Get all vessel IDs
  const allVessels = await db.select({ id: vessels.id }).from(vessels);
  
  if (allVessels.length === 0) {
    console.log("No vessels found. Can't seed documents.");
    return { count: 0, seeded: false };
  }
  
  // Limit to 20 random vessels for seeding
  const seedVessels = allVessels
    .sort(() => Math.random() - 0.5)
    .slice(0, 20);
  
  // Generate documents for each vessel
  const docsToInsert = [];
  
  for (const vessel of seedVessels) {
    // Generate between 2-5 documents per vessel
    const numDocs = Math.floor(Math.random() * 3) + minDocumentsPerVessel;
    
    for (let i = 0; i < numDocs; i++) {
      // Pick a random document type
      const docType = DOCUMENT_TYPES[Math.floor(Math.random() * DOCUMENT_TYPES.length)];
      
      // Generate issue date between 1-365 days ago
      const daysAgo = Math.floor(Math.random() * 365) + 1;
      const issueDate = new Date();
      issueDate.setDate(issueDate.getDate() - daysAgo);
      
      // 75% of documents have expiry dates
      let expiryDate = null;
      if (Math.random() < 0.75) {
        expiryDate = new Date(issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }
      
      // Generate reference number
      const refCode = 'DOC-' + Math.floor(10000 + Math.random() * 90000).toString();
      
      // Generate statuses - 60% active, 20% pending, 15% expired, 5% revoked
      let status = "active";
      const statusRand = Math.random();
      if (statusRand > 0.6 && statusRand <= 0.8) {
        status = "pending";
      } else if (statusRand > 0.8 && statusRand <= 0.95) {
        status = "expired";
      } else if (statusRand > 0.95) {
        status = "revoked";
      }
      
      // Create document content based on type
      const content = generateDocumentContent(docType, vessel.id, refCode);
      
      docsToInsert.push({
        vesselId: vessel.id,
        type: docType,
        title: `${docType} for Vessel ID ${vessel.id}`,
        content,
        status,
        issueDate,
        expiryDate,
        reference: refCode,
        issuer: "PetroDealHub Authority",
        recipientName: "Vessel Captain",
        recipientOrg: "Maritime Shipping Corp.",
        language: "en"
      });
    }
  }
  
  // Insert all documents
  if (docsToInsert.length > 0) {
    await db.insert(documents).values(docsToInsert);
    console.log(`Successfully seeded ${docsToInsert.length} vessel documents for ${seedVessels.length} vessels.`);
    return { count: docsToInsert.length, seeded: true };
  } else {
    console.log("No documents to insert.");
    return { count: 0, seeded: false };
  }
}

/**
 * Generate appropriate document content based on document type
 */
function generateDocumentContent(docType: string, vesselId: number, reference: string): string {
  const date = new Date().toISOString().split('T')[0];
  
  switch (docType) {
    case "Bill of Lading":
      return `BILL OF LADING
Reference: ${reference}
Date: ${date}
Vessel ID: ${vesselId}

SHIPPER: Petroleum Export Company Ltd.
CONSIGNEE: Global Oil Distribution Inc.
PORT OF LOADING: Rotterdam, Netherlands
PORT OF DISCHARGE: Singapore

CARGO DESCRIPTION:
- Crude Oil, Grade A
- Quantity: 125,000 metric tons
- Origin: North Sea
- API Gravity: 38°

FREIGHT CHARGES: Prepaid
SPECIAL INSTRUCTIONS: Keep at required temperature as per shipping instructions.

This Bill of Lading is issued subject to the standard terms and conditions, which are incorporated by reference herein.`;

    case "Certificate of Origin":
      return `CERTIFICATE OF ORIGIN
Reference: ${reference}
Issue Date: ${date}

This is to certify that the goods described below have originated from the country specified herein:

EXPORTER: Petroleum Export Company Ltd.
ADDRESS: 123 Export Plaza, Rotterdam, Netherlands

IMPORTER: Global Oil Distribution Inc.
ADDRESS: 456 Import Avenue, Singapore

COUNTRY OF ORIGIN: Netherlands

PRODUCT DESCRIPTION:
- Crude Oil, Grade A
- Quantity: 125,000 metric tons
- HS CODE: 2709.00

I, the undersigned, declare that the goods described above originate in the country specified.

Signature: _________________
Authority: PetroDealHub Certification Authority`;

    case "Commercial Invoice":
      return `COMMERCIAL INVOICE
Invoice No: INV-${reference}
Date: ${date}

SELLER:
Petroleum Export Company Ltd.
123 Export Plaza, Rotterdam, Netherlands
Tax ID: NL123456789B01

BUYER:
Global Oil Distribution Inc.
456 Import Avenue, Singapore
Tax ID: SG987654321G

VESSEL ID: ${vesselId}

ITEM DESCRIPTION                  QUANTITY       UNIT PRICE       TOTAL
----------------------------------------------------------------------
Crude Oil, Grade A               125,000 MT      USD 65.00    USD 8,125,000.00

                                             SUBTOTAL:      USD 8,125,000.00
                                             VAT (0%):      USD 0.00
                                             TOTAL:         USD 8,125,000.00

PAYMENT TERMS: Letter of Credit, 30 days
INCOTERMS: FOB Rotterdam

This invoice serves as the official commercial document for the described transaction.`;

    case "Cargo Manifest":
      return `CARGO MANIFEST
Reference: ${reference}
Vessel ID: ${vesselId}
Date: ${date}

MASTER'S DECLARATION

I, Captain James Smith, Master of the vessel with ID ${vesselId}, declare that the following cargo is loaded on board:

CARGO DETAILS:
1. CRUDE OIL
   - Quantity: 125,000 metric tons
   - Stowage: Cargo tanks 1-8
   - UN Number: UN1267
   - Hazard Class: 3

2. BUNKER FUEL (FOR VESSEL USE)
   - Quantity: 1,500 metric tons
   - Stowage: Fuel tanks A, B, C

I hereby declare that the above information is true and correct to the best of my knowledge.

Captain Signature: _________________
Date: ${date}
Seal: [OFFICIAL SEAL]`;

    default:
      return `${docType.toUpperCase()}
Reference: ${reference}
Date: ${date}
Vessel ID: ${vesselId}

This document certifies that the vessel with ID ${vesselId} has been issued a ${docType} in accordance with international maritime regulations and standards.

The document is valid from the issue date and remains in effect unless otherwise notified by the relevant authorities.

ISSUED BY: PetroDealHub Authority
AUTHORIZED SIGNATORY: _______________

This is an official document. Tampering with this document is a criminal offense.`;
  }
}