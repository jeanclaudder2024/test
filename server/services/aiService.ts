import { storage } from "../storage";
import { InsertDocument } from "@shared/schema";
import { cohereService } from "./cohereService";

export const aiService = {
  // Process a natural language query about oil trading and shipping
  processQuery: async (query: string) => {
    // Sample responses based on keywords
    if (query.toLowerCase().includes("oil") && query.toLowerCase().includes("price")) {
      return {
        type: "text",
        content: "Current oil prices vary by type. Brent crude is trading at around $82.45 per barrel, while WTI crude is at $78.60 per barrel. OPEC basket price is approximately $81.20 per barrel."
      };
    }
    
    if (query.toLowerCase().includes("document") && (query.toLowerCase().includes("types") || query.toLowerCase().includes("kind"))) {
      return {
        type: "text",
        content: "We support generating several types of shipping documents including Bills of Lading, Letters of Credit, Certificates of Origin, Commercial Invoices, and Inspection Certificates."
      };
    }

    if (query.toLowerCase().includes("broker") && query.toLowerCase().includes("elite")) {
      return {
        type: "text",
        content: "Elite membership for brokers provides premium features including priority document processing, market intelligence reports, and exclusive access to high-value trading opportunities."
      };
    }

    // Default to using Cohere for more complex queries
    try {
      const response = await cohereService.generateResponse(query);
      return {
        type: "text",
        content: response
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      return {
        type: "text",
        content: "I'm sorry, I couldn't process that query. Could you try rephrasing your question?"
      };
    }
  },

  // Generate a document based on cargo details
  generateDocument: async (dummy: number, documentType: string, cargoDetails?: any) => {
    console.log(`Generating ${documentType} document`);

    try {
      // First try to use Cohere to generate a document
      const content = await cohereService.generateShippingDocument(cargoDetails || {}, documentType);
      
      // Store the generated document in the database
      const documentData: InsertDocument = {
        title: `${documentType} - ${new Date().toLocaleDateString()}`,
        content: content,
        documentType: documentType,
        status: 'generated',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const savedDocument = await storage.createDocument(documentData);
      
      return {
        success: true,
        document: savedDocument,
        message: `${documentType} generated successfully`
      };
    } catch (error) {
      console.error("Error generating document with AI:", error);
      
      // Fallback to template-based document
      const templateContent = generateTemplateBasedDocument(cargoDetails || {}, documentType);
      
      const documentData: InsertDocument = {
        title: `${documentType} (Template) - ${new Date().toLocaleDateString()}`,
        content: templateContent,
        documentType: documentType,
        status: 'generated',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const savedDocument = await storage.createDocument(documentData);
      
      return {
        success: true,
        document: savedDocument,
        message: `${documentType} generated using template`
      };
    }
  }
};

/**
 * Fallback function to generate documents without AI
 */
function generateTemplateBasedDocument(cargoDetails: any, documentType: string): string {
  const date = new Date().toLocaleDateString();
  const ref = `REF-${Math.floor(Math.random() * 1000000)}`;
  
  switch (documentType.toLowerCase()) {
    case 'bill of lading':
      return `BILL OF LADING
Reference: ${ref}
Date: ${date}
---------------------------------
SHIPPER: [Company Name]
CONSIGNEE: [Recipient Name]
VESSEL: ${cargoDetails?.vessel || 'TBD'}
PORT OF LOADING: ${cargoDetails?.portOfLoading || 'TBD'}
PORT OF DISCHARGE: ${cargoDetails?.portOfDischarge || 'TBD'}
CARGO: ${cargoDetails?.cargoType || 'Crude Oil'} - ${cargoDetails?.quantity || '1000'} ${cargoDetails?.unit || 'Metric Tons'}
---------------------------------
This is to certify that the above-mentioned goods have been shipped in apparent good order and condition.
`;
      
    case 'certificate of origin':
      return `CERTIFICATE OF ORIGIN
Reference: ${ref}
Date: ${date}
---------------------------------
EXPORTER: [Company Name]
IMPORTER: [Recipient Name]
COUNTRY OF ORIGIN: ${cargoDetails?.origin || 'Saudi Arabia'}
CARGO DESCRIPTION: ${cargoDetails?.cargoType || 'Crude Oil'} - ${cargoDetails?.quantity || '1000'} ${cargoDetails?.unit || 'Metric Tons'}
HS CODE: ${cargoDetails?.hsCode || '2709.00'}
---------------------------------
This is to certify that the goods described above originate from the stated country of origin.
`;
      
    case 'commercial invoice':
      const quantity = parseInt(cargoDetails?.quantity || '1000');
      const unitPrice = parseFloat(cargoDetails?.unitPrice || '80');
      const total = quantity * unitPrice;
      
      return `COMMERCIAL INVOICE
Reference: ${ref}
Date: ${date}
---------------------------------
SELLER: [Company Name]
BUYER: [Recipient Name]
SHIPMENT: ${cargoDetails?.cargoType || 'Crude Oil'} - ${quantity} ${cargoDetails?.unit || 'Metric Tons'}
UNIT PRICE: USD ${unitPrice.toFixed(2)} per ${cargoDetails?.unit || 'Metric Ton'}
TOTAL AMOUNT: USD ${total.toFixed(2)}
PAYMENT TERMS: ${cargoDetails?.paymentTerms || 'Letter of Credit'}
---------------------------------
This invoice is issued in relation to the shipment described above.
`;
      
    case 'letter of credit':
      return `LETTER OF CREDIT
Reference: ${ref}
Date: ${date}
---------------------------------
ISSUING BANK: [Bank Name]
APPLICANT: [Buyer Company]
BENEFICIARY: [Seller Company]
AMOUNT: USD ${cargoDetails?.amount || '1,000,000.00'}
EXPIRY DATE: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
SHIPMENT: ${cargoDetails?.cargoType || 'Crude Oil'} - ${cargoDetails?.quantity || '1000'} ${cargoDetails?.unit || 'Metric Tons'}
FROM: ${cargoDetails?.portOfLoading || 'TBD'}
TO: ${cargoDetails?.portOfDischarge || 'TBD'}
---------------------------------
This Letter of Credit is subject to UCP 600 and constitutes our irrevocable undertaking to honor drafts for payment.
`;
      
    default:
      return `SHIPPING DOCUMENT: ${documentType.toUpperCase()}
Reference: ${ref}
Date: ${date}
---------------------------------
This is a template document for ${documentType} related to oil cargo shipment.
Please provide more specific details for a complete document.
`;
  }
}