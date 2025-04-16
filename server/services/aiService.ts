import { storage } from "../storage";
import { InsertDocument } from "@shared/schema";

// In a real application, this would integrate with OpenAI's API
export const aiService = {
  // Process a natural language query about vessels or refineries
  processQuery: async (query: string) => {
    const vessels = await storage.getVessels();
    const refineries = await storage.getRefineries();
    
    // Simple keyword matching for demo purposes
    // In a real app, this would use OpenAI's API for NLP

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

  // Generate document based on vessel data
  generateDocument: async (vesselId: number, documentType: string) => {
    const vessel = await storage.getVesselById(vesselId);
    if (!vessel) {
      throw new Error("Vessel not found");
    }

    let title = "";
    let content = "";

    switch (documentType.toLowerCase()) {
      case "sds": // Safety Data Sheet
        title = `SDS - ${vessel.cargoType} - ${vessel.name}`;
        content = `SAFETY DATA SHEET\n
Product: ${vessel.cargoType}
Vessel: ${vessel.name} (IMO: ${vessel.imo})
Date Generated: ${new Date().toISOString().split('T')[0]}

SECTION 1: PRODUCT IDENTIFICATION
Material: ${vessel.cargoType}
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
- Suspected of damaging fertility or the unborn child`;
        break;

      case "loi": // Letter of Interest
        title = `LOI - ${vessel.name} - ${vessel.cargoType}`;
        content = `LETTER OF INTEREST\n
Date: ${new Date().toISOString().split('T')[0]}
Re: Purchase of ${vessel.cargoType} from vessel ${vessel.name}

Dear Sir/Madam,

We hereby confirm our interest in purchasing the following cargo:

Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo}
Product: ${vessel.cargoType}
Quantity: ${vessel.cargoCapacity} barrels
Loading Port: ${vessel.departurePort}
Discharge Port: ${vessel.destinationPort}
Laycan: ${new Date(vessel.eta?.getTime() - 3*24*60*60*1000).toISOString().split('T')[0]} - ${new Date(vessel.eta?.getTime() + 3*24*60*60*1000).toISOString().split('T')[0]}

We look forward to receiving your complete offer.

Best regards,
[BUYER NAME]
[BUYER COMPANY]`;
        break;

      case "bl": // Bill of Lading
        title = `Bill of Lading - ${vessel.name} - ${vessel.cargoType}`;
        content = `BILL OF LADING\n
Shipper: [SHIPPER COMPANY]
Consignee: [CONSIGNEE COMPANY]
Notify Party: [NOTIFY PARTY]

Vessel: ${vessel.name}
Voyage No: VY${new Date().getFullYear()}${Math.floor(Math.random() * 1000)}
Port of Loading: ${vessel.departurePort}
Port of Discharge: ${vessel.destinationPort}

Description of Goods:
${vessel.cargoType}
Quantity: ${vessel.cargoCapacity} barrels
Gross Weight: ${Math.round(vessel.cargoCapacity * 0.136)} metric tons

SHIPPED on board the vessel, the goods or packages said to contain goods herein mentioned in apparent good order and condition.

Date of Issue: ${new Date().toISOString().split('T')[0]}
Signed: ______________________________
        Master or Agent`;
        break;

      default:
        title = `Document - ${vessel.name}`;
        content = `Generated document for ${vessel.name} carrying ${vessel.cargoType}`;
    }

    const documentData: InsertDocument = {
      vesselId,
      type: documentType,
      title,
      content
    };

    return storage.createDocument(documentData);
  }
};
