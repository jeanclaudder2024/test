import { storage } from "../storage";
import { InsertAdminDocument } from "@shared/schema";
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
    
    const documentData: InsertAdminDocument = {
      vesselId,
      documentType: formattedType,
      title,
      content,
      status: "published",
      category: "generated",
      description: `AI-generated ${formattedType} for vessel ${vessel.name}`,
      tags: `${formattedType.toLowerCase().replace(/\s+/g, ',')},vessel,${vessel.name.toLowerCase().replace(/\s+/g, '-')}`,
      isTemplate: false,
      isActive: true
    };

    return storage.createDocument(documentData);
  }
};

/**
 * Fallback function to generate documents without AI
 */
function generateTemplateBasedDocument(vessel: any, documentType: string): string {
  const currentDate = new Date().toLocaleDateString();
  const currentDateTime = new Date().toLocaleString();
  const normalizedType = documentType.toLowerCase();
  const voyageNumber = `VY${new Date().getFullYear()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const refNumber = `DOC-${vessel.id}-${Date.now().toString().slice(-6)}`;
  
  let content = "";

  switch (documentType) {
    case "bill of lading":
    case "bl":
      content = `BILL OF LADING

═══════════════════════════════════════════════════════════════
REFERENCE NUMBER: ${refNumber}
DATE OF ISSUE: ${currentDate}
═══════════════════════════════════════════════════════════════

SHIPPER:
${vessel.owner || 'Maritime Shipping Co.'}
Address: International Maritime District
Phone: +1-555-MARINE
Email: shipping@maritime.com

CONSIGNEE:
To Be Determined
Address: TBD

VESSEL INFORMATION:
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo || 'N/A'}
MMSI: ${vessel.mmsi || 'N/A'}
Flag: ${vessel.flag || 'N/A'}
Voyage Number: ${voyageNumber}
Vessel Type: ${vessel.vesselType || 'Oil Tanker'}
Built: ${vessel.built || 'N/A'}
Deadweight: ${vessel.deadweight?.toLocaleString() || 'N/A'} MT
Gross Tonnage: ${vessel.grossTonnage?.toLocaleString() || 'N/A'} GT

PORT INFORMATION:
Port of Loading: ${vessel.departurePort || 'To Be Determined'}
Port of Discharge: ${vessel.destinationPort || 'To Be Determined'}

CARGO DESCRIPTION:
═══════════════════════════════════════════════════════════════
Description of Goods: ${vessel.cargoType || 'Crude Oil'}
Quantity: ${vessel.cargoCapacity?.toLocaleString() || 'N/A'} metric tonnes
Gross Weight: ${vessel.cargoCapacity ? Math.round(vessel.cargoCapacity * 1.02).toLocaleString() : 'N/A'} metric tons
Net Weight: ${vessel.cargoCapacity?.toLocaleString() || 'N/A'} metric tons
UN Number: UN1267 (Petroleum crude oil)
Hazard Class: 3 (Flammable liquids)
Packing Group: I

SPECIAL INSTRUCTIONS:
- Handle with extreme care - flammable cargo
- Temperature monitoring required
- Inert gas system to be maintained
- No smoking or open flames permitted
- Comply with MARPOL regulations

SHIPPED on board the vessel, the goods or packages said to contain goods herein mentioned in apparent good order and condition, unless otherwise noted herein.

FREIGHT AND CHARGES:
Freight: As per charter party agreement
Demurrage: As per charter party terms
Other charges: As applicable

TERMS AND CONDITIONS:
This Bill of Lading is subject to the terms and conditions printed on the reverse side hereof and to the applicable international conventions.

═══════════════════════════════════════════════════════════════
Date of Issue: ${currentDate}
Place of Issue: ${vessel.currentRegion || 'International Waters'}

Signed: ______________________________
        Master or Authorized Agent
        ${vessel.name}

For and on behalf of the Carrier
═══════════════════════════════════════════════════════════════`;
      break;

    case "cargo manifest":
    case "manifest":
      content = `CARGO MANIFEST

═══════════════════════════════════════════════════════════════
REFERENCE NUMBER: ${refNumber}
DATE: ${currentDate}
═══════════════════════════════════════════════════════════════

VESSEL INFORMATION:
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo || 'N/A'}
MMSI: ${vessel.mmsi || 'N/A'}
Flag: ${vessel.flag || 'N/A'}
Voyage Number: ${voyageNumber}
Vessel Type: ${vessel.vesselType || 'Oil Tanker'}
Deadweight: ${vessel.deadweight?.toLocaleString() || 'N/A'} MT
Gross Tonnage: ${vessel.grossTonnage?.toLocaleString() || 'N/A'} GT

PORT INFORMATION:
Port of Loading: ${vessel.departurePort || 'To Be Determined'}
Port of Discharge: ${vessel.destinationPort || 'To Be Determined'}
Expected Departure: ${new Date(Date.now() + 24*60*60*1000).toLocaleDateString()}
Expected Arrival: ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}

CARGO DETAILS:
═══════════════════════════════════════════════════════════════
Cargo Type: ${vessel.cargoType || 'Crude Oil'}
Quantity: ${vessel.cargoCapacity?.toLocaleString() || 'N/A'} metric tonnes
Gross Weight: ${vessel.cargoCapacity ? Math.round(vessel.cargoCapacity * 1.02).toLocaleString() : 'N/A'} metric tons
Net Weight: ${vessel.cargoCapacity?.toLocaleString() || 'N/A'} metric tons
UN Number: UN1267 (Petroleum crude oil)
Hazard Class: 3 (Flammable liquids)
Packing Group: I
Flash Point: <23°C
Specific Gravity: 0.8-0.95

STORAGE AND HANDLING:
═══════════════════════════════════════════════════════════════
- Temperature Control: Ambient temperature acceptable
- Handling Requirements: Standard crude oil procedures
- Safety Precautions: No smoking, no open flames
- Ventilation: Adequate ventilation required
- Personal Protective Equipment: As per MSDS
- Emergency Procedures: Fire suppression system ready

REGULATORY COMPLIANCE:
═══════════════════════════════════════════════════════════════
- MARPOL Annex I compliance
- SOLAS requirements met
- ISM Code compliance
- ISPS Code compliance
- Local port regulations applicable

TOTAL CARGO SUMMARY:
Total Packages: 1 (Bulk liquid)
Total Weight: ${vessel.cargoCapacity?.toLocaleString() || 'N/A'} metric tonnes
Total Volume: ${vessel.cargoCapacity ? Math.round(vessel.cargoCapacity * 1.2).toLocaleString() : 'N/A'} cubic meters

═══════════════════════════════════════════════════════════════
Certified by: _________________________
Name: Master/Chief Officer
Date: ${currentDate}
Signature: _________________________
Page: 1 of 1
═══════════════════════════════════════════════════════════════`;
      break;

    case "inspection report":
    case "inspection":
      content = `VESSEL INSPECTION REPORT

═══════════════════════════════════════════════════════════════
REPORT NUMBER: ${refNumber}
INSPECTION DATE: ${currentDate}
═══════════════════════════════════════════════════════════════

VESSEL IDENTIFICATION:
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo || 'N/A'}
MMSI: ${vessel.mmsi || 'N/A'}
Call Sign: ${vessel.callSign || 'N/A'}
Flag State: ${vessel.flag || 'N/A'}
Vessel Type: ${vessel.vesselType || 'Oil Tanker'}
Year Built: ${vessel.yearBuilt || 'N/A'}
Classification Society: ${vessel.classificationSociety || 'N/A'}

INSPECTION DETAILS:
Inspection Type: Port State Control / Flag State Inspection
Inspector Name: Marine Safety Inspector
Inspector License: MSI-${Math.floor(Math.random() * 10000)}
Location: ${vessel.currentPort || 'At Sea'}
Weather Conditions: Fair
Sea State: Calm

HULL AND STRUCTURE INSPECTION:
═══════════════════════════════════════════════════════════════
✓ Hull Integrity: SATISFACTORY
  - No visible cracks or deformation
  - Paint condition: Good
  - Corrosion level: Minimal, within acceptable limits
  - Ballast tanks: Inspected, no leakage detected

✓ Deck Equipment: SATISFACTORY
  - Mooring equipment: Operational
  - Anchor windlass: Tested, functional
  - Cargo handling equipment: Operational
  - Safety railings: Secure and compliant

ENGINE AND MACHINERY:
═══════════════════════════════════════════════════════════════
✓ Main Engine: SATISFACTORY
  - Performance: Within normal parameters
  - Oil pressure: Normal
  - Temperature: Normal
  - Vibration levels: Acceptable

✓ Auxiliary Systems: SATISFACTORY
  - Generator sets: Operational
  - Fuel systems: No leaks detected
  - Cooling systems: Functional
  - Hydraulic systems: Operational

SAFETY EQUIPMENT:
═══════════════════════════════════════════════════════════════
✓ Life Saving Appliances: COMPLIANT
  - Lifeboats: ${Math.floor(Math.random() * 4) + 2} units, tested and operational
  - Life rafts: Certified, within service date
  - Life jackets: Sufficient quantity, good condition
  - Emergency signals: Complete inventory

✓ Fire Fighting Equipment: COMPLIANT
  - Fire detection system: Tested, operational
  - Fire suppression system: Pressure tested, operational
  - Portable extinguishers: Inspected, within service date
  - Emergency fire pump: Tested, operational

CARGO SYSTEMS:
═══════════════════════════════════════════════════════════════
✓ Cargo Handling: OPERATIONAL
  - Cargo pumps: Tested, performance satisfactory
  - Piping systems: Pressure tested, no leaks
  - Cargo tank coating: Inspected, good condition
  - Inert gas system: Operational, proper oxygen levels

✓ Pollution Prevention: COMPLIANT
  - Oil discharge monitoring: Operational
  - Sewage treatment: Functional
  - Garbage management: Compliant with MARPOL
  - Ballast water management: System operational

NAVIGATION AND COMMUNICATION:
═══════════════════════════════════════════════════════════════
✓ Navigation Equipment: FUNCTIONAL
  - GPS systems: Operational, accurate positioning
  - Radar systems: Tested, clear display
  - AIS transponder: Transmitting correctly
  - Compass systems: Calibrated, accurate

✓ Communication Systems: OPERATIONAL
  - VHF radio: Clear transmission/reception
  - Satellite communication: Operational
  - Emergency beacons: Tested, functional
  - Bridge equipment: All systems operational

CERTIFICATES AND DOCUMENTATION:
═══════════════════════════════════════════════════════════════
✓ Safety Management Certificate: Valid
✓ International Ship Security Certificate: Valid
✓ International Oil Pollution Prevention Certificate: Valid
✓ Safety Equipment Certificate: Valid
✓ Radio Safety Certificate: Valid
✓ Minimum Safe Manning Certificate: Valid

DEFICIENCIES IDENTIFIED:
═══════════════════════════════════════════════════════════════
None - All systems and equipment found to be in satisfactory condition

RECOMMENDATIONS:
═══════════════════════════════════════════════════════════════
1. Continue regular maintenance schedule as per planned maintenance system
2. Monitor cargo system performance during operations
3. Update safety equipment certificates before expiration dates
4. Conduct regular crew safety drills
5. Maintain proper record keeping for all maintenance activities

OVERALL ASSESSMENT: SATISFACTORY
Vessel is fit for service and complies with international maritime regulations.

═══════════════════════════════════════════════════════════════
INSPECTOR SIGNATURE: _________________________
Name: Marine Safety Inspector
Date: ${currentDate}
License Number: MSI-${Math.floor(Math.random() * 10000)}
Next Inspection Due: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()}
═══════════════════════════════════════════════════════════════`;
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

    case "shipping document":
    case "shipping":
    default:
      content = `SHIPPING DOCUMENT

═══════════════════════════════════════════════════════════════
DOCUMENT NUMBER: ${refNumber}
ISSUE DATE: ${currentDate}
═══════════════════════════════════════════════════════════════

VESSEL INFORMATION:
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo || 'N/A'}
MMSI: ${vessel.mmsi || 'N/A'}
Call Sign: ${vessel.callSign || 'N/A'}
Flag: ${vessel.flag || 'N/A'}
Voyage Number: ${voyageNumber}
Vessel Type: ${vessel.vesselType || 'Oil Tanker'}
Year Built: ${vessel.yearBuilt || 'N/A'}
Classification: ${vessel.classificationSociety || 'N/A'}

VESSEL SPECIFICATIONS:
═══════════════════════════════════════════════════════════════
Length Overall: ${vessel.length || 'N/A'} meters
Beam: ${vessel.beam || 'N/A'} meters
Depth: ${vessel.depth || 'N/A'} meters
Draft (Max): ${vessel.draft || 'N/A'} meters
Deadweight: ${vessel.deadweight?.toLocaleString() || 'N/A'} MT
Gross Tonnage: ${vessel.grossTonnage?.toLocaleString() || 'N/A'} GT
Net Tonnage: ${vessel.netTonnage?.toLocaleString() || 'N/A'} NT
Cargo Capacity: ${vessel.cargoCapacity?.toLocaleString() || 'N/A'} MT

ROUTE INFORMATION:
═══════════════════════════════════════════════════════════════
Port of Loading: ${vessel.departurePort || 'To Be Determined'}
Port of Discharge: ${vessel.destinationPort || 'To Be Determined'}
Expected Departure: ${new Date(Date.now() + 24*60*60*1000).toLocaleDateString()}
Expected Arrival: ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
Estimated Transit Time: ${Math.floor(Math.random() * 10) + 5} days
Distance: ${Math.floor(Math.random() * 3000) + 1000} nautical miles

CARGO INFORMATION:
═══════════════════════════════════════════════════════════════
Cargo Type: ${vessel.cargoType || 'Crude Oil'}
Cargo Grade: ${vessel.cargoGrade || 'API 32-35'}
Quantity: ${vessel.cargoCapacity?.toLocaleString() || 'N/A'} metric tonnes
Loading Rate: ${Math.floor(Math.random() * 5000) + 3000} MT/hour
Discharge Rate: ${Math.floor(Math.random() * 4000) + 2500} MT/hour
Temperature: Ambient
Density: 0.85-0.92 kg/L
Viscosity: 10-50 cSt at 50°C

CHARTER PARTY DETAILS:
═══════════════════════════════════════════════════════════════
Charter Type: Voyage Charter
Charterer: [CHARTERER NAME]
Owner: [OWNER NAME]
Broker: [BROKER NAME]
Freight Rate: USD ${Math.floor(Math.random() * 50) + 25}/MT
Total Freight: USD ${vessel.cargoCapacity ? (vessel.cargoCapacity * (Math.floor(Math.random() * 50) + 25)).toLocaleString() : 'TBD'}

LAYTIME AND DEMURRAGE:
═══════════════════════════════════════════════════════════════
Laytime Allowed: 72 hours total (36 hours loading + 36 hours discharge)
Demurrage Rate: USD 25,000 per day or pro rata
Despatch Rate: USD 12,500 per day or pro rata
Notice Time: 72 hours for loading, 48 hours for discharge
Weather Working Days: Yes
Sundays and Holidays Excluded: SHINC

SHIPPING TERMS:
═══════════════════════════════════════════════════════════════
Incoterms: FOB (Free On Board)
Payment Terms: 95% on B/L date, 5% on final discharge
Insurance: Marine cargo insurance as per Institute Cargo Clauses
Survey: Independent surveyor at load and discharge ports
Quality: As per API specifications
Quantity: Bill of Lading quantity final

REGULATORY COMPLIANCE:
═══════════════════════════════════════════════════════════════
✓ MARPOL Annex I compliance
✓ SOLAS requirements
✓ ISM Code compliance
✓ ISPS Code compliance
✓ Port state control requirements
✓ Flag state regulations
✓ Classification society rules

DOCUMENTS REQUIRED:
═══════════════════════════════════════════════════════════════
- Bill of Lading (3 originals)
- Commercial Invoice
- Certificate of Origin
- Certificate of Quality
- Certificate of Quantity
- Marine Insurance Policy
- Cargo Manifest
- Dangerous Goods Declaration (if applicable)

EMERGENCY CONTACTS:
═══════════════════════════════════════════════════════════════
Vessel Master: [MASTER NAME]
Ship Management: [MANAGEMENT COMPANY]
24/7 Emergency: +[EMERGENCY NUMBER]
P&I Club: [P&I CLUB NAME]
Classification Society: [CLASS SOCIETY]

═══════════════════════════════════════════════════════════════
Prepared by: _________________________
Name: Shipping Coordinator
Company: [SHIPPING COMPANY]
Date: ${currentDate}
Signature: _________________________

Approved by: _________________________
Name: Operations Manager
Date: ${currentDate}
Signature: _________________________
═══════════════════════════════════════════════════════════════`;
      break;
  }

  return content;
}
