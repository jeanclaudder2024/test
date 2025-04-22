import { storage } from "../storage";
import { InsertDocument } from "@shared/schema";
import { cohereService } from "./cohereService";

export const aiService = {
  // Process a natural language query about vessels or refineries
  processQuery: async (query: string) => {
    const vessels = await storage.getVessels();
    const refineries = await storage.getRefineries();
    
    // Simple keyword matching for demo purposes
    // This can be enhanced with Cohere for more natural language processing

    // Sample responses based on keywords
    if (query.toLowerCase().includes("vessel") && query.toLowerCase().includes("count")) {
      return {
        type: "text",
        content: `Currently tracking ${vessels.length} vessels across all regions.`
      };
    }
    
    if (query.toLowerCase().includes("refinery") && query.toLowerCase().includes("count")) {
      return {
        type: "text",
        content: `We have data on ${refineries.length} refineries globally.`
      };
    }

    if (query.toLowerCase().includes("largest") && query.toLowerCase().includes("tanker")) {
      const largestVessel = vessels.reduce((max, vessel) => 
        (vessel.deadweight || 0) > (max.deadweight || 0) ? vessel : max, 
        vessels[0]
      );
      
      return {
        type: "vessel",
        content: `The largest tanker currently tracked is ${largestVessel.name} with a deadweight of ${largestVessel.deadweight} tonnes.`,
        vessel: largestVessel
      };
    }

    // Default response
    return {
      type: "text",
      content: "I'm your vessel tracking assistant. You can ask me about vessels, refineries, or cargo information."
    };
  },

  // Generate document based on vessel data using Cohere AI
  generateDocument: async (vesselId: number, documentType: string) => {
    const vessel = await storage.getVesselById(vesselId);
    if (!vessel) {
      throw new Error("Vessel not found");
    }

    // Document type names for display and organization
    const documentTypes = {
      "bill of lading": "Bill of Lading",
      "bl": "Bill of Lading",
      "cargo manifest": "Cargo Manifest",
      "manifest": "Cargo Manifest",
      "inspection report": "Inspection Report",
      "inspection": "Inspection Report",
      "loading instructions": "Loading Instructions",
      "loading": "Loading Instructions",
      "sds": "Safety Data Sheet",
      "safety data sheet": "Safety Data Sheet",
      "loi": "Letter of Interest"
    };

    // Normalize document type
    const normalizedType = documentType.toLowerCase();
    const formattedType = (documentTypes as Record<string, string>)[normalizedType] || documentType;

    let title = `${formattedType} - ${vessel.name}`;
    let content = "";

    try {
      // Generate document content with Cohere AI
      if (process.env.COHERE_API_KEY) {
        content = await cohereService.generateShippingDocument(vessel, normalizedType);
      } else {
        // Fallback to template-based generation if no API key
        content = generateTemplateBasedDocument(vessel, normalizedType);
      }
    } catch (error) {
      console.error("Error generating document with AI:", error);
      // Fallback to template-based generation if AI fails
      content = generateTemplateBasedDocument(vessel, normalizedType);
    }

    // Generate a unique reference number for the document
    const refNumber = `DOC-${vesselId}-${new Date().getTime().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Calculate a reasonable expiry date (90 days from now for most documents)
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 90); // Most shipping documents valid for 90 days
    
    // Determine a relevant issuer based on document type
    let issuer = "Vesselian Maritime Authority";
    if (normalizedType.includes("bill") || normalizedType.includes("invoice")) {
      issuer = "Vesselian Shipping Company";
    } else if (normalizedType.includes("certificate") || normalizedType.includes("inspection")) {
      issuer = "International Maritime Certification Bureau";
    } else if (normalizedType.includes("manifest") || normalizedType.includes("cargo")) {
      issuer = "Global Cargo Documentation Authority";
    }
    
    const documentData: InsertDocument = {
      vesselId,
      type: formattedType,
      title,
      content,
      status: "active",
      reference: refNumber,
      issuer,
      recipientName: "Authorized Personnel",
      recipientOrg: "Maritime Operations",
      language: "en",
      // Using string ISO format for dates since we updated the schema
      issueDate: today.toISOString(),
      expiryDate: expiryDate.toISOString()
    };

    return storage.createDocument(documentData);
  }
};

/**
 * Fallback function to generate documents without AI
 */
function generateTemplateBasedDocument(vessel: any, documentType: string): string {
  let content = "";
  const currentDate = new Date().toISOString().split('T')[0];

  switch (documentType) {
    case "bill of lading":
    case "bl":
      content = `BILL OF LADING\n
Shipper: [SHIPPER COMPANY]
Consignee: [CONSIGNEE COMPANY]
Notify Party: [NOTIFY PARTY]

Vessel: ${vessel.name}
Voyage No: VY${new Date().getFullYear()}${Math.floor(Math.random() * 1000)}
Port of Loading: ${vessel.departurePort || 'TBD'}
Port of Discharge: ${vessel.destinationPort || 'TBD'}

Description of Goods:
${vessel.cargoType || 'Crude Oil'}
Quantity: ${vessel.cargoCapacity || 'N/A'} tonnes
Gross Weight: ${vessel.cargoCapacity ? Math.round(vessel.cargoCapacity * 0.9) : 'N/A'} metric tons

SHIPPED on board the vessel, the goods or packages said to contain goods herein mentioned in apparent good order and condition.

Date of Issue: ${currentDate}
Signed: ______________________________
        Master or Agent`;
      break;

    case "cargo manifest":
    case "manifest":
      content = `CARGO MANIFEST\n
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo}
Voyage Number: VY${new Date().getFullYear()}${Math.floor(Math.random() * 1000)}
Port of Loading: ${vessel.departurePort || 'TBD'}
Port of Discharge: ${vessel.destinationPort || 'TBD'}
Date: ${currentDate}

CARGO DETAILS:
---------------
Type: ${vessel.cargoType || 'Crude Oil'}
Quantity: ${vessel.cargoCapacity || 'N/A'} tonnes
UN Number: UN1267
Hazard Class: 3
Packing Group: I

SPECIAL INSTRUCTIONS:
---------------------
Temperature requirements: Ambient
Handling requirements: Standard crude oil procedures
Hazard notes: Flammable liquid

TOTAL CARGO: ${vessel.cargoCapacity || 'N/A'} tonnes

Certified by: _________________________
Date: ${currentDate}
Page: 1 of 1`;
      break;

    case "inspection report":
    case "inspection":
      content = `VESSEL INSPECTION REPORT\n
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo}
Flag: ${vessel.flag}
Built: ${vessel.built || 'N/A'}
Current Location: Lat ${vessel.currentLat || 'N/A'}, Lng ${vessel.currentLng || 'N/A'}
Inspection Date: ${currentDate}

EXECUTIVE SUMMARY:
-----------------
The vessel ${vessel.name} was inspected on ${currentDate} and found to be in [CONDITION] condition.

INSPECTION DETAILS:
------------------
1. Hull Condition: [DETAILS]
2. Machinery & Equipment: [DETAILS]
3. Safety Equipment: [DETAILS]
4. Cargo Systems: [DETAILS]
5. Navigation Equipment: [DETAILS]

DEFICIENCIES:
------------
1. [DEFICIENCY 1]
2. [DEFICIENCY 2]

RECOMMENDATIONS:
--------------
1. [RECOMMENDATION 1]
2. [RECOMMENDATION 2]

Overall Rating: [RATING]

Inspector: _______________________
Credentials: _____________________
Date: ${currentDate}`;
      break;

    case "safety data sheet":
    case "sds":
      content = `SAFETY DATA SHEET\n
Product: ${vessel.cargoType || 'Crude Oil'}
Vessel: ${vessel.name} (IMO: ${vessel.imo})
Date Generated: ${currentDate}

SECTION 1: PRODUCT IDENTIFICATION
Material: ${vessel.cargoType || 'Crude Oil'}
UN Number: UN1267
Shipping Name: Petroleum Crude Oil
Hazard Class: 3
Packing Group: I-III (depending on initial boiling point)

SECTION 2: HAZARDS IDENTIFICATION
GHS Classification: Flammable Liquid Category 1
Signal Word: DANGER
Hazard Statements: 
- Extremely flammable liquid and vapor
- May cause drowsiness or dizziness
- May cause genetic defects
- May cause cancer
- Suspected of damaging fertility or the unborn child

SECTION 3: COMPOSITION
Complex mixture of hydrocarbons consisting of paraffinic, cycloparaffinic, aromatic and olefinic hydrocarbons with carbon numbers predominantly in the C1 to C30 range.

SECTION 4: FIRST AID MEASURES
Eye Contact: Flush with water for at least 15 minutes
Skin Contact: Remove contaminated clothing, wash with soap and water
Inhalation: Remove to fresh air, seek medical attention
Ingestion: Do NOT induce vomiting, seek immediate medical attention`;
      break;

    case "loading instructions":
    case "loading":
      content = `LOADING INSTRUCTIONS\n
Vessel: ${vessel.name} (IMO: ${vessel.imo})
Cargo: ${vessel.cargoType || 'Crude Oil'}
Loading Port: ${vessel.departurePort || 'TBD'}
Loading Date: ${vessel.departureDate ? new Date(vessel.departureDate).toISOString().split('T')[0] : currentDate}

PRE-LOADING CHECKS:
------------------
1. Verify all tanks are clean and ready for loading
2. Test inert gas system
3. Check cargo pumps and valves
4. Calibrate all measuring instruments

LOADING SEQUENCE:
----------------
1. Commence loading at reduced rate (1,000 m3/hr)
2. After 1 hour, increase to normal rate (10,000 m3/hr)
3. Reduce rate for topping off (2,000 m3/hr)

TANK DISTRIBUTION:
----------------
1C: 95% capacity
2C: 95% capacity
3C: 95% capacity
4C: 95% capacity
5C: 95% capacity

SAMPLING:
--------
Take samples at beginning, middle, and end of loading
Retain all samples for 90 days

SAFETY MEASURES:
--------------
1. Maintain deck watch at all times
2. Monitor vapor concentrations
3. No hot work permitted during loading
4. Emergency stop procedures to be reviewed before commencing

DOCUMENTATION:
------------
Complete and sign:
1. Cargo Manifest
2. Bill of Lading
3. Cargo Survey Report
4. Ship/Shore Safety Checklist

Master's Acknowledgment: ______________________
Terminal Representative: ______________________
Date: ${currentDate}`;
      break;

    case "loi": // Letter of Interest
      content = `LETTER OF INTEREST\n
Date: ${currentDate}
Re: Purchase of ${vessel.cargoType || 'Crude Oil'} from vessel ${vessel.name}

Dear Sir/Madam,

We hereby confirm our interest in purchasing the following cargo:

Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo}
Product: ${vessel.cargoType || 'Crude Oil'}
Quantity: ${vessel.cargoCapacity || 'TBD'} tonnes
Loading Port: ${vessel.departurePort || 'TBD'}
Discharge Port: ${vessel.destinationPort || 'TBD'}
Laycan: ${vessel.eta ? new Date(new Date(vessel.eta).getTime() - 3*24*60*60*1000).toISOString().split('T')[0] : 'TBD'} - ${vessel.eta ? new Date(new Date(vessel.eta).getTime() + 3*24*60*60*1000).toISOString().split('T')[0] : 'TBD'}

We look forward to receiving your complete offer.

Best regards,
[BUYER NAME]
[BUYER COMPANY]`;
      break;

    default:
      content = `Generated document for ${vessel.name} carrying ${vessel.cargoType || 'cargo'}.`;
  }

  return content;
}
