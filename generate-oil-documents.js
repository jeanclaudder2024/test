import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create documents directory if it doesn't exist
const docsDir = path.join(__dirname, 'generated_documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Load the Excel file
function generateDocuments() {
  try {
    const workbook = xlsx.readFile('./attached_assets/Oil_Deal_Document_Types.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} document entries to process`);

    // Process each row
    data.forEach((row, index) => {
      try {
        console.log(`Processing row ${index + 1}:`, JSON.stringify(row));
        
        // Extract proper document type name from the Excel data
        const docType = row['Document Name (EN)'] || 'General Document';
        
        // Generate vessel names based on real world oil tankers
        const vesselNames = [
          'Suez Rajan', 'Nordic Freedom', 'Advantage Spring', 'Maran Homer', 'SCF Baltica',
          'Minerva Zoe', 'Aframax River', 'Eagle Vancouver', 'Stena Supreme', 'Delta Pioneer',
          'Atlas Voyager', 'Pacific Victory', 'Olympic Faith', 'Nordic Apollo', 'Hafnia Rhine',
          'Eagle Victoria', 'Navig8 Pride', 'Seaways Redwood', 'Maran Artemis', 'Gener8 Andriotis',
          'Almi Globe', 'Sonangol Cabinda', 'Front Crown', 'Aegean Faith', 'TRF Kristiansand',
          'Nissos Paros', 'Elandra Spruce', 'Marlin Aventurine'
        ];
        
        // Select a vessel name based on the index, or use a default if index is out of range
        const vesselName = index < vesselNames.length ? vesselNames[index] : `Unnamed Vessel ${index + 1}`;
        
        // Create a valid filename
        const documentName = `${vesselName} - ${docType}`.replace(/[\/\\:*?"<>|]/g, '_');
        
        // Add maritime-specific data to the row for document generation
        const enhancedRow = {
          ...row,
          'Document Type': docType, // Set the document type to the English name from the Excel
          'Vessel Name': vesselName,
          'Port Name': ['Rotterdam', 'Singapore', 'Houston', 'Fujairah', 'Shanghai'][Math.floor(Math.random() * 5)],
          'Cargo Type': ['Crude Oil', 'Gasoline', 'Jet Fuel', 'Diesel', 'LNG'][Math.floor(Math.random() * 5)],
          'Cargo Quantity': Math.floor(50000 + Math.random() * 150000),
          'Unit': 'MT',
          'Departure Date': new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          'Arrival Date': new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          'Document Date': new Date(),
          'Broker': 'Global Maritime Services',
          'Buyer': 'TOTAL Trading SA',
          'Seller': 'Shell International Trading',
          'Captain': `Captain ${['Smith', 'Anderson', 'Johnson', 'Miller', 'Martinez'][Math.floor(Math.random() * 5)]}`,
          'Flag': ['Panama', 'Liberia', 'Marshall Islands', 'Greece', 'Singapore'][Math.floor(Math.random() * 5)],
          'IMO Number': `9${Math.floor(100000 + Math.random() * 900000)}`,
          'Price': Math.floor(70 + Math.random() * 40),
          'Currency': 'USD',
          'Refinery': ['Saudi Aramco Ras Tanura', 'ExxonMobil Baytown', 'Shell Pernis', 'Sinopec Zhenhai', 'Reliance Jamnagar'][Math.floor(Math.random() * 5)],
          'Inspector Name': `${['John', 'Maria', 'Ahmed', 'Wei', 'Carlos'][Math.floor(Math.random() * 5)]} ${['Wilson', 'Chen', 'Al-Farsi', 'Garcia', 'Singh'][Math.floor(Math.random() * 5)]}`,
          'Inspection Company': ['SGS Group', 'Bureau Veritas', 'Intertek', 'AmSpec', 'Saybolt'][Math.floor(Math.random() * 5)],
          'Remarks': row['Notes'] || ''
        };
        
        // Generate document content based on document type
        const content = generateDocumentContent(enhancedRow);
        
        // Save document to file
        const filePath = path.join(docsDir, `${documentName}.txt`);
        fs.writeFileSync(filePath, content);
        console.log(`Generated document: ${documentName}.txt`);
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error.message);
      }
    });
    
    console.log(`All documents generated successfully in ${docsDir}`);
  } catch (error) {
    console.error('Error processing Excel file:', error.message);
  }
}

// Helper function to format date strings
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  
  try {
    // Handle Excel date number
    if (typeof dateStr === 'number') {
      const date = xlsx.SSF.parse_date_code(dateStr);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    
    // Handle date string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return as is if not a valid date
    
    return date.toISOString().split('T')[0];
  } catch (e) {
    return dateStr; // Return as is in case of error
  }
}

// Generate document content based on document type
function generateDocumentContent(row) {
  const docType = row['Document Type'] || 'General Document';
  const vesselName = row['Vessel Name'] || 'Unnamed Vessel';
  const portName = row['Port Name'] || 'Unspecified Port';
  const cargoType = row['Cargo Type'] || 'General Cargo';
  const cargoQuantity = row['Cargo Quantity'] || 'N/A';
  const cargoUnit = row['Unit'] || 'MT';
  const departureDate = formatDate(row['Departure Date']);
  const arrivalDate = formatDate(row['Arrival Date']);
  const documentDate = formatDate(row['Document Date']) || formatDate(new Date());
  const broker = row['Broker'] || 'Global Maritime Services';
  const buyer = row['Buyer'] || 'N/A';
  const seller = row['Seller'] || 'N/A';
  const captain = row['Captain'] || 'N/A';
  const flag = row['Flag'] || 'N/A';
  const imo = row['IMO Number'] || 'N/A';
  const price = row['Price'] || 'N/A';
  const currency = row['Currency'] || 'USD';
  const refinery = row['Refinery'] || 'N/A';
  const inspectorName = row['Inspector Name'] || 'N/A';
  const inspectionCompany = row['Inspection Company'] || 'Maritime Inspection Services';
  const remarks = row['Remarks'] || '';

  // Common document header
  let content = `=====================================
DOCUMENT TYPE: ${docType.toUpperCase()}
DOCUMENT DATE: ${documentDate}
=====================================\n\n`;

  // Generate content based on document type
  const docTypeLower = docType.toLowerCase();
  
  // Handle specific document types based on their english names from the Excel file
  switch (docTypeLower) {
    case 'letter of intent (loi)':
      content += `LETTER OF INTENT (LOI)
Reference: LOI-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

FROM:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234

TO:
${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000

SUBJECT: INTENTION TO PURCHASE PETROLEUM PRODUCTS

Dear Sir/Madam,

I, the undersigned, acting as authorized representative of ${buyer || 'GLOBAL OIL IMPORTS INC.'}, hereby confirm our interest in purchasing the following petroleum products under the terms and conditions outlined below:

PRODUCT SPECIFICATIONS:
Product: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit} (+/- 5% at seller's option)
Quality: As per international standards for ${cargoType}
Price: ${price} ${currency} per ${cargoUnit} (CIF basis)
Delivery: ${portName}
Delivery Period: ${departureDate} to ${arrivalDate}

PAYMENT TERMS:
Payment Method: Letter of Credit
L/C Opening Bank: International Trade Bank
L/C Duration: 30 days from Bill of Lading date

This Letter of Intent is valid for fifteen (15) days from the date hereof and shall automatically expire thereafter unless extended by mutual agreement in writing.

This document represents our genuine interest to enter into a formal agreement for the above transaction and shall be followed by a detailed Sales & Purchase Agreement upon your acceptance.

${remarks}

Sincerely,

________________________
Authorized Signatory
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Date: ${documentDate}`;
      break;
      
    case 'soft corporate offer (sco)':
      content += `SOFT CORPORATE OFFER (SCO)
Reference: SCO-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

FROM:
${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000

TO:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234

SUBJECT: OFFER FOR SUPPLY OF PETROLEUM PRODUCTS

Dear Sir/Madam,

We are pleased to submit our Soft Corporate Offer for the supply of petroleum products with the following specifications and terms:

PRODUCT DETAILS:
Product: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit} (+/- 5% at seller's option)
Quality: As per international standards for ${cargoType}
Origin: ${refinery || 'Various Origins'}
Price: ${price} ${currency} per ${cargoUnit} (CIF basis)
Delivery Port: ${portName}
Delivery Timeline: ${departureDate} to ${arrivalDate}

PAYMENT TERMS:
Payment Method: 100% irrevocable, transferable Letter of Credit
L/C Duration: 30 days from Bill of Lading date
Issuing Bank: Top 25 world bank

DOCUMENTATION:
- Commercial Invoice
- Bill of Lading
- Certificate of Origin
- Certificate of Quality
- Certificate of Quantity
- Packing List

This offer is valid for five (5) business days from the date of issue and subject to prior sale and availability at time of confirmation.

${remarks}

Sincerely,

________________________
Authorized Signatory
${seller || 'MASTER ENERGY TRADING LTD.'}
Date: ${documentDate}`;
      break;
      
    case 'irrevocable corporate purchase order (icpo)':
      content += `IRREVOCABLE CORPORATE PURCHASE ORDER (ICPO)
Reference: ICPO-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

FROM:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234

TO:
${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000

SUBJECT: IRREVOCABLE PURCHASE ORDER FOR PETROLEUM PRODUCTS

Dear Sir/Madam,

We, the undersigned, as authorized representatives of ${buyer || 'GLOBAL OIL IMPORTS INC.'}, hereby confirm our irrevocable intention to purchase the following petroleum products under the terms and conditions outlined below:

PRODUCT SPECIFICATIONS:
Product: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit} (+/- 5% at seller's option)
Quality: As per international standards for ${cargoType}
Price: ${price} ${currency} per ${cargoUnit} (CIF basis)
Delivery: ${portName}
Delivery Period: ${departureDate} to ${arrivalDate}

PAYMENT TERMS:
Payment Method: Irrevocable, Transferable Letter of Credit
L/C Opening Bank: International Trade Bank, New York
L/C Duration: 30 days from Bill of Lading date

INSPECTION:
Inspection Company: ${inspectionCompany}
Inspection Location: Both loading and discharge ports

DOCUMENTATION REQUIRED:
- Commercial Invoice (3 originals, 3 copies)
- Full set of 3/3 original Clean on Board Ocean Bills of Lading
- Certificate of Origin (1 original, 3 copies)
- Certificate of Quality (1 original, 3 copies)
- Certificate of Quantity (1 original, 3 copies)
- Packing List (1 original, 3 copies)

This Purchase Order is irrevocable and binding upon both parties when countersigned by the Seller. Please indicate your acceptance by signing and returning a copy of this document within five (5) business days.

${remarks}

FOR THE BUYER:                       FOR THE SELLER:

________________________           ________________________
Authorized Signatory                Authorized Signatory
${buyer || 'GLOBAL OIL IMPORTS INC.'}    ${seller || 'MASTER ENERGY TRADING LTD.'}
Date: ${documentDate}              Date: ____________________`;
      break;
      
    case 'sales & purchase agreement (spa)':
      content += `SALES & PURCHASE AGREEMENT (SPA)
Reference: SPA-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

BETWEEN:
SELLER: ${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000

AND:
BUYER: ${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234

PRODUCT SPECIFICATIONS:
Product: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit} (+/- 5% at seller's option)
Quality: As per specifications in Appendix A
Price: ${price} ${currency} per ${cargoUnit} (CIF basis)
Delivery: ${portName}
Delivery Period: ${departureDate} to ${arrivalDate}

PAYMENT TERMS:
Payment Method: Irrevocable, Transferable Letter of Credit
L/C Opening Bank: International Trade Bank, New York
L/C Duration: 30 days from Bill of Lading date

INSPECTION:
Inspection Company: ${inspectionCompany}
Inspection Location: Both loading and discharge ports
Inspections Costs: Shared equally between Buyer and Seller

SHIPPING TERMS:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Master: ${captain}
Shipping Mode: CIF ${portName}
Laycan: ${departureDate} to ${arrivalDate}

DOCUMENTATION:
The Seller shall provide the following documents:
- Commercial Invoice (3 originals, 3 copies)
- Full set of 3/3 original Clean on Board Ocean Bills of Lading
- Certificate of Origin (1 original, 3 copies)
- Certificate of Quality (1 original, 3 copies)
- Certificate of Quantity (1 original, 3 copies)
- Packing List (1 original, 3 copies)

FORCE MAJEURE:
Neither party shall be liable for failure to perform any obligation under this Agreement due to events beyond their reasonable control including but not limited to acts of God, fire, flood, war, governmental restrictions.

ARBITRATION:
Any dispute arising out of or in connection with this Agreement shall be referred to arbitration in London in accordance with the rules of the London Court of International Arbitration.

GOVERNING LAW:
This Agreement shall be governed by and construed in accordance with English Law.

${remarks}

FOR THE SELLER:                      FOR THE BUYER:

________________________           ________________________
Authorized Signatory                Authorized Signatory
${seller || 'MASTER ENERGY TRADING LTD.'}    ${buyer || 'GLOBAL OIL IMPORTS INC.'}
Date: ${documentDate}              Date: ${documentDate}`;
      break;

    case 'proforma invoice':
      content += `PROFORMA INVOICE
Reference: PI-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

SELLER:
${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000
Tax ID: GB123456789

BUYER:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234
Tax ID: US987654321

PRODUCT DETAILS:
Description: ${cargoType}
HS Code: ${cargoType.toLowerCase().includes('crude') ? '2709.00' : cargoType.toLowerCase().includes('gasoline') ? '2710.12' : '2710.19'}
Origin: ${refinery || 'Various Origins'}
Quantity: ${cargoQuantity} ${cargoUnit}
Unit Price: ${price} ${currency} per ${cargoUnit}
Total Value: ${(parseFloat(cargoQuantity) * parseFloat(price)).toLocaleString()} ${currency}

SHIPPING DETAILS:
Delivery Terms: CIF ${portName}
Port of Loading: ${portName}
Expected Shipping Date: ${departureDate}
Vessel: ${vesselName}
IMO Number: ${imo}

PAYMENT TERMS:
Payment Method: Irrevocable Letter of Credit
L/C Validity: 45 days
Banking Details: 
Bank: International Banking Corporation
Swift Code: INTBCXXX
Account Number: 12345678

REMARKS:
This is a proforma invoice only and not a demand for payment.
Final quantities will be determined by outturn measurements at discharge port.
${remarks}

FOR THE SELLER:

________________________
Authorized Signatory
${seller || 'MASTER ENERGY TRADING LTD.'}
Date: ${documentDate}`;
      break;

    case 'commercial invoice':
      content += `COMMERCIAL INVOICE
Reference: INV-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

SELLER:
${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000
Tax ID: GB123456789

BUYER:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234
Tax ID: US987654321

PRODUCT DETAILS:
Description: ${cargoType}
HS Code: ${cargoType.toLowerCase().includes('crude') ? '2709.00' : cargoType.toLowerCase().includes('gasoline') ? '2710.12' : '2710.19'}
Origin: ${refinery || 'Various Origins'}
Quantity: ${cargoQuantity} ${cargoUnit}
Unit Price: ${price} ${currency} per ${cargoUnit}
Total Value: ${(parseFloat(cargoQuantity) * parseFloat(price)).toLocaleString()} ${currency}

SHIPPING DETAILS:
Delivery Terms: CIF ${portName}
Port of Loading: ${portName}
Shipping Date: ${departureDate}
Vessel: ${vesselName}
IMO Number: ${imo}
B/L Number: BL-${Math.floor(100000 + Math.random() * 900000)}

PAYMENT TERMS:
Payment Method: As per Sales & Purchase Agreement
L/C Reference: LC-${Math.floor(100000 + Math.random() * 900000)}
Banking Details:
Bank: International Banking Corporation
Swift Code: INTBCXXX
Account Number: 12345678

REMARKS:
We hereby certify that this invoice shows the actual price of the goods described, and that all particulars are true and correct.
${remarks}

FOR THE SELLER:

________________________
Authorized Signatory
${seller || 'MASTER ENERGY TRADING LTD.'}
Date: ${documentDate}`;
      break;
      
    case 'packing list':
      content += `PACKING LIST
Reference: PL-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

SELLER:
${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000

BUYER:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234

SHIPPING DETAILS:
Vessel: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Port of Loading: ${portName}
Date of Loading: ${departureDate}
Port of Discharge: ${row['Destination Port'] || 'TBN (To Be Nominated)'}
Estimated Arrival: ${arrivalDate}
B/L Number: BL-${Math.floor(100000 + Math.random() * 900000)}

CARGO DETAILS:
Product Description: ${cargoType}
Total Quantity: ${cargoQuantity} ${cargoUnit}
Number of Parcels: 1

TANK DISTRIBUTION:
${(() => {
  const tankCount = Math.floor(4 + Math.random() * 6);
  let distribution = '';
  let remaining = parseFloat(cargoQuantity);
  
  for (let i = 1; i <= tankCount; i++) {
    const tankPercentage = (i === tankCount) ? 1 : (1 / tankCount + (Math.random() * 0.1 - 0.05));
    const tankQuantity = (i === tankCount) ? remaining : parseFloat(cargoQuantity) * tankPercentage;
    remaining -= tankQuantity;
    
    distribution += `Tank ${i}: ${tankQuantity.toFixed(3)} ${cargoUnit}\n`;
  }
  
  return distribution;
})()}

REMARKS:
The product is loaded in bulk as per the quality specifications outlined in the Certificate of Quality.
${remarks}

FOR THE SELLER:

________________________
Authorized Signatory
${seller || 'MASTER ENERGY TRADING LTD.'}
Date: ${documentDate}`;
      break;
      
    case 'safety data sheet (sds)':
      content += `SAFETY DATA SHEET (SDS)
Reference: SDS-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}
Revision: 01

SECTION 1: IDENTIFICATION OF THE SUBSTANCE/MIXTURE AND OF THE COMPANY/UNDERTAKING

Product Identifier: ${cargoType}
CAS Number: ${cargoType.toLowerCase().includes('crude') ? '8002-05-9' : cargoType.toLowerCase().includes('gasoline') ? '86290-81-5' : cargoType.toLowerCase().includes('diesel') ? '68334-30-5' : '64741-77-1'}
Relevant identified uses: Fuel
Supplier: ${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Emergency telephone: +44 20 7946 0000

SECTION 2: HAZARDS IDENTIFICATION

Classification: Flammable Liquid Category ${cargoType.toLowerCase().includes('crude') ? '2' : cargoType.toLowerCase().includes('gasoline') ? '1' : '3'}
Signal Word: DANGER
Hazard Statements:
H${cargoType.toLowerCase().includes('gasoline') ? '224' : cargoType.toLowerCase().includes('crude') ? '225' : '226'} - ${cargoType.toLowerCase().includes('gasoline') ? 'Extremely' : cargoType.toLowerCase().includes('crude') ? 'Highly' : 'Extremely'} flammable liquid and vapor
H304 - May be fatal if swallowed and enters airways
H315 - Causes skin irritation
H336 - May cause drowsiness or dizziness
H350 - May cause cancer
H373 - May cause damage to organs through prolonged or repeated exposure
H411 - Toxic to aquatic life with long-lasting effects

Precautionary Statements:
P210 - Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. No smoking.
P273 - Avoid release to the environment
P280 - Wear protective gloves/protective clothing/eye protection/face protection
P301+P310 - IF SWALLOWED: Immediately call a POISON CENTER or doctor/physician
P403+P235 - Store in a well-ventilated place. Keep cool

SECTION 3: COMPOSITION/INFORMATION ON INGREDIENTS

Chemical Characterization: ${cargoType.toLowerCase().includes('crude') ? 'Complex combination of hydrocarbons' : 'Petroleum product'}
Hazardous Components:
${cargoType.toLowerCase().includes('crude') ? 'Crude oil (CAS 8002-05-9): 100%' : cargoType.toLowerCase().includes('gasoline') ? 'Gasoline (CAS 86290-81-5): >99%\nBenzene (CAS 71-43-2): <1%' : cargoType.toLowerCase().includes('diesel') ? 'Diesel fuel (CAS 68334-30-5): >99%' : 'Petroleum distillates (CAS 64741-77-1): >99%'}

SECTION 4: FIRST AID MEASURES

Inhalation: Remove victim to fresh air and keep at rest in a position comfortable for breathing. If not breathing, give artificial respiration. Get medical attention.
Skin Contact: Remove contaminated clothing. Wash affected area with soap and water. Get medical attention if irritation develops or persists.
Eye Contact: Flush eyes with water for at least 15 minutes. Remove contact lenses if present and easy to do. Get medical attention.
Ingestion: Do NOT induce vomiting. Get immediate medical attention. If vomiting occurs, keep head low to prevent aspiration.

SECTION 5: FIREFIGHTING MEASURES

Extinguishing Media: Dry chemical powder, foam, carbon dioxide
Specific Hazards: Highly flammable. Vapors may form explosive mixtures with air. Vapors may travel to ignition sources and flash back.
Advice for Firefighters: Wear self-contained breathing apparatus and full protective gear.

This is an abbreviated version of the Safety Data Sheet. Refer to the full document for complete information.

${seller || 'MASTER ENERGY TRADING LTD.'}
Date: ${documentDate}`;
      break;

    case 'certificate of quantity':
      content += `CERTIFICATE OF QUANTITY
Reference: CON-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL INFORMATION:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}

CARGO DETAILS:
Product: ${cargoType}
Loading Port: ${portName}
Loading Date: ${departureDate}
Shore Tank(s): Tank ${Math.floor(100 + Math.random() * 900)}

QUANTITY DETERMINATION:
Method of Measurement: Shore Tank Measurement / Vessel Tank Measurement / Flow Meter
Temperature: ${Math.floor(15 + Math.random() * 10)}°C
Density at 15°C: ${cargoType.toLowerCase().includes('crude') ? (820 + Math.random() * 50).toFixed(2) : cargoType.toLowerCase().includes('gasoline') ? (730 + Math.random() * 40).toFixed(2) : (830 + Math.random() * 40).toFixed(2)} kg/m³

QUANTITY DETAILS:
Gross Observed Volume: ${parseFloat(cargoQuantity) * 1.002} ${cargoUnit}
Temperature Correction Factor: ${(0.985 + Math.random() * 0.01).toFixed(5)}
Gross Standard Volume (at 15°C): ${parseFloat(cargoQuantity)} ${cargoUnit}
Water & Sediment: ${(Math.random() * 0.15).toFixed(2)}%
Net Standard Volume: ${(parseFloat(cargoQuantity) * (1 - Math.random() * 0.002)).toFixed(3)} ${cargoUnit}
Weight in Air: ${(parseFloat(cargoQuantity) * (cargoType.toLowerCase().includes('crude') ? 0.85 : cargoType.toLowerCase().includes('gasoline') ? 0.75 : 0.85)).toFixed(3)} Metric Tons

MEASUREMENT WITNESSED BY:
Seller's Representative: ${seller || 'MASTER ENERGY TRADING LTD.'}
Buyer's Representative: ${buyer || 'GLOBAL OIL IMPORTS INC.'}
Independent Inspector: ${inspectionCompany}

REMARKS:
The above quantities were determined in accordance with API/ASTM standards.
${remarks}

CERTIFICATION:
This is to certify that the above quantities were determined by or under the supervision of the undersigned, and are true and correct to the best of our knowledge and belief.

________________________
${inspectorName}
${inspectionCompany}
Date: ${documentDate}`;
      break;
      
    case 'shipping declaration':
      content += `SHIPPING DECLARATION
Reference: SD-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL INFORMATION:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Call Sign: ${(['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO'])[Math.floor(Math.random() * 5)]}${Math.floor(1000 + Math.random() * 9000)}
Gross Tonnage: ${Math.floor(30000 + Math.random() * 70000)} MT
Net Tonnage: ${Math.floor(20000 + Math.random() * 50000)} MT
Year Built: ${2000 + Math.floor(Math.random() * 22)}

VOYAGE DETAILS:
Voyage Number: ${Math.floor(100 + Math.random() * 900)}
Port of Loading: ${portName}
Loading Date: ${departureDate}
Port of Discharge: ${row['Destination Port'] || 'TBN (To Be Nominated)'}
Expected Arrival: ${arrivalDate}

CARGO INFORMATION:
Type of Cargo: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit}
UN Number: ${cargoType.toLowerCase().includes('crude') ? 'UN1267' : cargoType.toLowerCase().includes('gasoline') ? 'UN1203' : cargoType.toLowerCase().includes('diesel') ? 'UN1202' : 'UN1223'}
IMO Class: ${cargoType.toLowerCase().includes('crude') ? '3' : cargoType.toLowerCase().includes('gasoline') ? '3' : cargoType.toLowerCase().includes('diesel') ? '3' : '3'}
Packing Group: ${cargoType.toLowerCase().includes('gasoline') ? 'II' : 'III'}
Marine Pollutant: Yes
Flashpoint: ${cargoType.toLowerCase().includes('crude') ? '<23°C' : cargoType.toLowerCase().includes('gasoline') ? '<-40°C' : cargoType.toLowerCase().includes('diesel') ? '>55°C' : '>60°C'}

CARRIER/AGENT INFORMATION:
Carrier: ${seller || 'MASTER ENERGY TRADING LTD.'}
Carrier's Agent at Loading Port: Global Shipping Agency
Agent's Contact: +1 555 123 4567

DECLARATION:
I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packaged, marked and labeled/placarded, and are in all respects in proper condition for transport according to applicable international and national governmental regulations.

${remarks}

________________________
Authorized Signatory
${seller || 'MASTER ENERGY TRADING LTD.'}
Date: ${documentDate}`;
      break;
      
    case 'delivery report':
      content += `DELIVERY REPORT
Reference: DR-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

RECEIVER INFORMATION:
Receiver: ${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact Person: ${Math.random() > 0.5 ? 'Mr. John Smith' : 'Ms. Sarah Chen'}
Contact Number: +1 713 555 1234

SHIPPER INFORMATION:
Shipper: ${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact Person: ${Math.random() > 0.5 ? 'Mr. Andrew Wilson' : 'Ms. Emily Johnson'}
Contact Number: +44 20 7946 0000

SHIPMENT DETAILS:
Product: ${cargoType}
Purchase Order Number: PO-${Math.floor(100000 + Math.random() * 900000)}
Vessel Name: ${vesselName}
IMO Number: ${imo}
Port of Loading: ${portName}
Loading Date: ${departureDate}
Port of Discharge: ${row['Destination Port'] || buyer || 'Houston'}
Discharge Date: ${arrivalDate}

QUANTITY DETAILS:
Bill of Lading Quantity: ${parseFloat(cargoQuantity)} ${cargoUnit}
Delivered Quantity: ${(parseFloat(cargoQuantity) * (1 - Math.random() * 0.005)).toFixed(3)} ${cargoUnit}
Discrepancy: ${(parseFloat(cargoQuantity) * Math.random() * 0.005).toFixed(3)} ${cargoUnit} (${(Math.random() * 0.5).toFixed(2)}%)
Reason for Discrepancy: ${Math.random() > 0.5 ? 'Normal transit loss' : 'Temperature variation'}

QUALITY INSPECTION:
Inspector: ${inspectionCompany}
Quality Compliance: ${Math.random() > 0.8 ? 'Partial - See remarks' : 'Full - All specifications met'}
Sample References: S-${Math.floor(10000 + Math.random() * 90000)}

DELIVERY CONFIRMATION:
☑ All documentation received
☑ Product quality verified
☑ Product quantity verified
☑ Delivery accepted

REMARKS:
${remarks || 'Delivery completed successfully. All contractual obligations have been met.'}

Received By:

________________________
Authorized Signatory
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Date: ${documentDate}`;
      break;
    
    case 'bill of lading (b/l)':
    case 'bill of lading':
      content += `BILL OF LADING
Reference: BOL-${Math.floor(100000 + Math.random() * 900000)}
Date Issued: ${documentDate}

SHIPPER/EXPORTER:
${seller || 'MASTER ENERGY TRADING LTD.'}
Contact: +44 20 7946 0000

CONSIGNEE:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Contact: +1 713 555 1234

NOTIFY PARTY:
${broker}
Contact: info@${broker.toLowerCase().replace(/\s/g, '')}.com

VESSEL DETAILS:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Master: ${captain}

VOYAGE DETAILS:
Port of Loading: ${portName}
Date of Loading: ${departureDate}
Port of Discharge: ${row['Destination Port'] || 'TBN (To Be Nominated)'}
Estimated Arrival: ${arrivalDate}

CARGO DETAILS:
Description: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit}
Price: ${price} ${currency} per ${cargoUnit}

REMARKS:
Shipped in apparent good order and condition. The goods are to be delivered in like good order and condition at the port of discharge.
${remarks}

SIGNED BY:
For and on behalf of the Master/Owner of the Vessel

________________________
Captain ${captain}
Master of ${vesselName}
Date: ${documentDate}`;
      break;

    case 'shipping manifest':
      content += `SHIPPING MANIFEST
Reference: SM-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL INFORMATION:
Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Master: Captain ${captain}

VOYAGE DETAILS:
Port of Departure: ${portName}
Departure Date/Time: ${departureDate}
Destination Port: ${row['Destination Port'] || 'TBN (To Be Nominated)'}
Estimated Arrival: ${arrivalDate}

CARGO MANIFEST:
1. ${cargoType}
   - Quantity: ${cargoQuantity} ${cargoUnit}
   - Shipper: ${seller}
   - Consignee: ${buyer}
   - Origin: ${refinery || portName}
   - Hazard Class: ${cargoType.toLowerCase().includes('crude') ? 'Class 3 - Flammable Liquid' : 'N/A'}

CREW MANIFEST:
Master: Captain ${captain}
Total Crew: ${Math.floor(15 + Math.random() * 10)}

DECLARATION:
I hereby declare that this manifest contains a true and complete list of all cargo on board the vessel.

________________________
Captain ${captain}
Master of ${vesselName}
Date: ${documentDate}`;
      break;

    case 'cargo inspection report':
      content += `CARGO INSPECTION REPORT
Reference: CIR-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

INSPECTION DETAILS:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Port of Inspection: ${portName}
Inspection Date: ${documentDate}
Inspector: ${inspectorName}
Inspection Company: ${inspectionCompany}

CARGO DETAILS:
Cargo Type: ${cargoType}
Declared Quantity: ${cargoQuantity} ${cargoUnit}
Measured Quantity: ${(parseFloat(cargoQuantity) * (0.998 + Math.random() * 0.004)).toFixed(2)} ${cargoUnit}
Temperature: ${Math.floor(15 + Math.random() * 10)}°C
API Gravity: ${cargoType.toLowerCase().includes('crude') ? (30 + Math.random() * 10).toFixed(1) : 'N/A'}
Sulfur Content: ${cargoType.toLowerCase().includes('crude') ? (0.5 + Math.random() * 2).toFixed(2) + '%' : 'N/A'}

SAMPLING:
Samples Collected: Yes
Sample Location: Ship's manifold, shore tank
Retained By: Buyer, Seller, and Inspector
Seal Numbers: S-${Math.floor(10000 + Math.random() * 90000)}

INSPECTION FINDINGS:
□ No visible free water
□ No visible particulate matter
□ Color and appearance normal for grade
□ Temperature within specification
□ Quantity within acceptable tolerance

CONCLUSION:
Based on the inspection performed, the cargo is found to be in conformity with the contractual specifications.
${remarks}

________________________
${inspectorName}
${inspectionCompany}
Date: ${documentDate}`;
      break;

    case 'certificate of quality':
      content += `CERTIFICATE OF QUALITY
Reference: COQ-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL INFORMATION:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}

CARGO DETAILS:
Product: ${cargoType}
Total Quantity: ${cargoQuantity} ${cargoUnit}
Loading Port: ${portName}
Loading Date: ${departureDate}
Origin: ${refinery || 'N/A'}

QUALITY ANALYSIS:
Sample Type: Composite
Sample Date: ${documentDate}
Analysis Performed By: ${inspectionCompany}

TEST RESULTS:
${generateQualityTestResults(cargoType)}

CERTIFICATION:
This is to certify that the above samples were drawn and analyzed in accordance with standard industry procedures and the results conform to the agreed specifications.

${remarks}

________________________
${inspectorName}
Quality Assurance Manager
${inspectionCompany}
Date: ${documentDate}`;
      break;

    case 'letter of indemnity':
      content += `LETTER OF INDEMNITY
Reference: LOI-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

FROM:
${seller || 'MASTER ENERGY TRADING LTD.'}
Address: 123 Commerce Street, London, UK
Contact: +44 20 7946 0000

TO:
${buyer || 'GLOBAL OIL IMPORTS INC.'}
Address: 456 Petroleum Avenue, Houston, TX, USA
Contact: +1 713 555 1234

VESSEL INFORMATION:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}

CARGO DETAILS:
Product: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit}
Loading Port: ${portName}
Loading Date: ${departureDate}
Destination: ${row['Destination Port'] || 'TBN (To Be Nominated)'}

INDEMNITY AGREEMENT:
In consideration of your paying for the above cargo without presentation of the original Bills of Lading, which have not yet arrived at the discharge port, we hereby expressly warrant that we have title to such goods and that we have and will have the right to deliver, assign and transfer the same to you.

We hereby agree to protect, indemnify, and hold you harmless from and against any and all damages, costs, legal fees, and other expenses which you may suffer by reason of:

a) The absence of the original Bills of Lading at the time of payment and/or cargo delivery.
b) Any claims from third parties asserting rights to the cargo.
c) Any breach of our warranty of title.

This Letter of Indemnity shall be governed by and construed in accordance with English Law and any dispute arising out of or in connection with this Letter of Indemnity shall be referred to arbitration in London.

Yours faithfully,
For and on behalf of ${seller || 'MASTER ENERGY TRADING LTD.'}

________________________
Authorized Signatory
Position: Chief Commercial Officer
Date: ${documentDate}`;
      break;

    case 'charter party agreement':
      content += `CHARTER PARTY AGREEMENT
Reference: CP-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

BETWEEN:
Owner: ${seller || 'GLOBAL TANKER HOLDINGS LTD.'}
Address: 789 Maritime Plaza, Piraeus, Greece
Contact: +30 210 123 4567

AND:
Charterer: ${buyer || 'PETRO TRADING INTERNATIONAL S.A.'}
Address: 101 Commerce Building, Geneva, Switzerland
Contact: +41 22 789 0123

VESSEL PARTICULARS:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Built: ${2000 + Math.floor(Math.random() * 22)}
Deadweight: ${Math.floor(50000 + Math.random() * 150000)} MT
Class: ${Math.random() > 0.5 ? 'Lloyd\'s Register' : 'American Bureau of Shipping'}
P&I Club: ${Math.random() > 0.5 ? 'Gard' : 'North of England'}

CHARTER DETAILS:
Type of Charter: Voyage Charter
Laycan: ${departureDate} - ${formatDate(new Date(new Date(departureDate).getTime() + 2*24*60*60*1000))}
Port(s) of Loading: ${portName}
Port(s) of Discharge: ${row['Destination Port'] || 'TBN (To Be Nominated)'}
Cargo: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit} (${Math.floor(5 + Math.random() * 5)}% More or Less in Owner's Option)
Freight Rate: ${price || (Math.floor(10 + Math.random() * 20))} ${currency} per ${cargoUnit}
Demurrage: ${Math.floor(20000 + Math.random() * 30000)} USD per day pro rata
Laytime: ${Math.floor(36 + Math.random() * 36)} hours SHINC

The following terms and conditions form an integral part of this Charter Party Agreement:
1. Vessel to provide clean tanks suitable for the agreed cargo.
2. Laytime to commence 6 hours after NOR is tendered or when vessel is all fast, whichever occurs first.
3. Freight payment: 100% within 3 banking days after completion of loading and against presentation of Invoice and BL.
4. Demurrage to be settled within 30 days after presentation of claim with supporting documents.
5. This Charter Party shall be governed by and construed in accordance with English Law.

${remarks}

FOR THE OWNER:                       FOR THE CHARTERER:

________________________           ________________________
Authorized Signatory                Authorized Signatory
Date: ${documentDate}              Date: ${documentDate}`;
      break;

    case 'ullage report':
      content += `ULLAGE REPORT
Reference: UR-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL INFORMATION:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}

PORT DETAILS:
Port: ${portName}
Berth: ${Math.floor(1 + Math.random() * 20)}
Operation: ${departureDate ? 'Loading' : 'Discharge'}
Operation Date: ${departureDate || arrivalDate}

CARGO: ${cargoType}

ULLAGE SURVEY DETAILS:
Date/Time of Survey: ${documentDate}
Surveyor: ${inspectorName}
Company: ${inspectionCompany}

TANK MEASUREMENTS:
${generateUllageMeasurements(cargoType, cargoQuantity, cargoUnit)}

SUMMARY:
Total Observed Volume: ${cargoQuantity} ${cargoUnit}
Temperature Correction Factor: 0.${Math.floor(985 + Math.random() * 10)}
Total Standard Volume (at 15°C): ${(parseFloat(cargoQuantity) * (0.985 + Math.random() * 0.01)).toFixed(3)} ${cargoUnit}

REMARKS:
All measurements were taken using calibrated electronic UTI tape.
Observed quantities are based on vessel's approved tank tables.
${remarks}

CERTIFICATION:
The above figures represent the findings of our survey and are believed to be correct.

________________________
${inspectorName}
${inspectionCompany}
Date: ${documentDate}`;
      break;

    case 'statement of facts':
      content += `STATEMENT OF FACTS
Reference: SOF-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL INFORMATION:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Master: Captain ${captain}

PORT CALL DETAILS:
Port: ${portName}
Berth: ${Math.floor(1 + Math.random() * 20)}
Operation: ${departureDate ? 'Loading' : 'Discharge'}
Cargo: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit}

CHRONOLOGY OF EVENTS:
${generateChronologyOfEvents(departureDate, arrivalDate)}

WEATHER CONDITIONS:
Weather was generally ${Math.random() > 0.7 ? 'overcast with light rain' : Math.random() > 0.5 ? 'partly cloudy' : 'clear'} during operations.
Wind force: Beaufort scale ${Math.floor(1 + Math.random() * 5)}
Sea state: ${Math.random() > 0.7 ? 'Moderate' : Math.random() > 0.5 ? 'Slight' : 'Calm'}

DELAYS AND REMARKS:
${Math.random() > 0.7 ? 'Operations were briefly interrupted due to ' + (Math.random() > 0.5 ? 'rain showers' : 'shift change') : 'No significant delays encountered during operations'}.
${remarks}

SIGNATURES:
We, the undersigned, agree that the above Statement of Facts is a true and accurate record of events.

FOR VESSEL:                          FOR TERMINAL:                       FOR AGENTS:

________________________            ________________________           ________________________
Captain ${captain}                   Terminal Representative             Agent Representative
Master of ${vesselName}              ${portName} Terminal                Maritime Agency Services
Date: ${documentDate}               Date: ${documentDate}              Date: ${documentDate}`;
      break;

    case 'vessel inspection report':
      content += `VESSEL INSPECTION REPORT
Reference: VIR-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL PARTICULARS:
Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Type: ${vesselName.toLowerCase().includes('tanker') ? 'Oil Tanker' : 'Bulk Carrier'}
Year Built: ${2000 + Math.floor(Math.random() * 22)}
Deadweight: ${Math.floor(50000 + Math.random() * 150000)} MT

INSPECTION DETAILS:
Port of Inspection: ${portName}
Date of Inspection: ${documentDate}
Inspector: ${inspectorName}
Company: ${inspectionCompany}
Type of Inspection: Pre-loading Suitability Survey

INSPECTION FINDINGS:
1. Hull & Structure
   □ External hull condition satisfactory
   □ Main deck in good condition
   □ No visible structural damage

2. Cargo System
   □ Cargo tanks visually clean and dry
   □ Heating coils functional
   □ Inert gas system operational
   □ Cargo pumps tested and operational

3. Safety Equipment
   □ Life-saving equipment in good condition
   □ Fire-fighting equipment properly maintained
   □ Safety signage visible and legible
   □ Emergency procedures posted

4. Navigation Equipment
   □ Navigation lights functional
   □ Communication equipment operational
   □ Charts updated
   □ GMDSS equipment tested

5. Environmental Protection
   □ SOPEP equipment available
   □ Oily water separator operational
   □ No visible leaks or spills observed
   □ Garbage management plan in place

DEFICIENCIES AND RECOMMENDATIONS:
${Math.random() > 0.7 ? '1. Minor rust observed on port side main deck railings - Recommended maintenance at next port call\n2. One fire extinguisher found overdue for inspection - To be replaced or recertified immediately' : 'No significant deficiencies found'}

CONCLUSION:
${Math.random() > 0.8 ? 'Vessel conditionally accepted subject to rectification of noted deficiencies' : 'Vessel found in satisfactory condition and suitable for intended cargo operations'}.
${remarks}

INSPECTOR'S SIGNATURE:

________________________
${inspectorName}
${inspectionCompany}
Date: ${documentDate}`;
      break;

    case 'notice of readiness':
      content += `NOTICE OF READINESS
Reference: NOR-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

TO: ${buyer || 'Terminal Operators'} / ${seller || 'Cargo Interests'} / Agents
Port: ${portName}

VESSEL PARTICULARS:
Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Master: Captain ${captain}

VOYAGE DETAILS:
Arrived at ${portName} on ${arrivalDate || documentDate} at ${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} hrs local time
Last Port: ${Math.random() > 0.5 ? 'Port of Rotterdam, Netherlands' : 'Port of Singapore, Singapore'}
Next Port: ${row['Destination Port'] || 'TBN (To Be Nominated)'}

CARGO DETAILS:
Cargo to be ${departureDate ? 'loaded' : 'discharged'}: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit}
Charterer: ${buyer || 'GLOBAL OIL IMPORTS INC.'}

DECLARATION:
I hereby give notice that the vessel has arrived at the port of ${portName}, is in all respects ready to ${departureDate ? 'load' : 'discharge'} the above cargo in accordance with the terms of the Charter Party, and the ${Math.floor(1 + Math.random() * 10)} cargo tanks have been properly prepared for receiving the intended cargo.

All applicable port formalities have been completed, and the vessel is in possession of all necessary certificates for the operation.

This Notice of Readiness is tendered whether in berth or not, whether in free pratique or not, whether customs cleared or not (WIBON, WIPON, WIFPON, WCCON).

Time of Notice: ${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} hrs local time

________________________
Captain ${captain}
Master of ${vesselName}
Date: ${documentDate}


RECEIPT ACKNOWLEDGEMENT:

________________________
Name:
For and on behalf of: ${buyer || 'Terminal / Receivers'}
Date/Time:`;
      break;

    case 'cargo manifest':
      content += `CARGO MANIFEST
Reference: CM-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL DETAILS:
Vessel Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}
Master: Captain ${captain}
Voyage No.: ${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear().toString().substring(2)}

PORT INFORMATION:
Port of Loading: ${portName}
Loading Completed: ${departureDate}
Destination Port: ${row['Destination Port'] || 'TBN (To Be Nominated)'}
Estimated Arrival: ${arrivalDate}

CARGO DETAILS:
1. Description: ${cargoType}
   Quantity: ${cargoQuantity} ${cargoUnit}
   Shipper: ${seller || 'MASTER ENERGY TRADING LTD.'}
   Consignee: ${buyer || 'GLOBAL OIL IMPORTS INC.'}
   Bill of Lading No.: BL-${Math.floor(100000 + Math.random() * 900000)}
   UN Number: ${cargoType.toLowerCase().includes('crude') ? 'UN1267' : cargoType.toLowerCase().includes('gas') ? 'UN1972' : 'UN1202'}
   IMO Class: ${cargoType.toLowerCase().includes('crude') ? '3' : cargoType.toLowerCase().includes('gas') ? '2.1' : '3'}
   Flashpoint: ${cargoType.toLowerCase().includes('crude') ? '<23°C' : cargoType.toLowerCase().includes('gas') ? 'N/A' : '<60°C'}
   Origin: ${refinery || portName}

HAZARDOUS CARGO DECLARATION:
This is to certify that the above-named materials are properly classified, described, packaged, marked and labeled, and are in proper condition for transportation according to applicable regulations.

REMARKS:
${remarks}

DECLARATION:
I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packaged, marked and labeled/placarded, and are in all respects in proper condition for transport according to applicable international and national governmental regulations.

________________________
Captain ${captain}
Master of ${vesselName}
Date: ${documentDate}`;
      break;

    default:
      content += `GENERAL MARITIME DOCUMENT
Reference: GMD-${Math.floor(100000 + Math.random() * 900000)}
Date: ${documentDate}

VESSEL INFORMATION:
Name: ${vesselName}
IMO Number: ${imo}
Flag: ${flag}

PORT DETAILS:
Port: ${portName}
Date: ${departureDate || arrivalDate || documentDate}

CARGO INFORMATION:
Type: ${cargoType}
Quantity: ${cargoQuantity} ${cargoUnit}

PARTIES INVOLVED:
Seller: ${seller || 'N/A'}
Buyer: ${buyer || 'N/A'}
Broker: ${broker || 'N/A'}

REMARKS:
${remarks}

________________________
Authorized Signatory
Date: ${documentDate}`;
  }

  return content;
}

// Generate quality test results based on cargo type
function generateQualityTestResults(cargoType) {
  if (cargoType.toLowerCase().includes('crude')) {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
API Gravity @ 60°F        | ${(30 + Math.random() * 10).toFixed(1)}         | Report           | ASTM D287
Sulfur Content, wt%       | ${(0.5 + Math.random() * 2).toFixed(2)}         | Max 3.5          | ASTM D4294
BS&W, vol%                | ${(0.1 + Math.random() * 0.4).toFixed(2)}         | Max 1.0          | ASTM D4007
Salt Content, PTB         | ${Math.floor(5 + Math.random() * 20)}          | Max 50           | ASTM D3230
Pour Point, °C            | ${Math.floor(-15 - Math.random() * 20)}         | Report           | ASTM D97
Reid Vapor Pressure, kPa  | ${(40 + Math.random() * 20).toFixed(1)}        | Max 70           | ASTM D323
Density @ 15°C, kg/m³     | ${Math.floor(850 + Math.random() * 50)}        | Report           | ASTM D1298
Viscosity @ 50°C, cSt     | ${(20 + Math.random() * 180).toFixed(1)}        | Report           | ASTM D445`;
  } else if (cargoType.toLowerCase().includes('gasoline') || cargoType.toLowerCase().includes('petrol')) {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
RON                       | ${Math.floor(91 + Math.random() * 10)}          | Min 91           | ASTM D2699
MON                       | ${Math.floor(82 + Math.random() * 7)}          | Min 81           | ASTM D2700
Density @ 15°C, kg/m³     | ${Math.floor(720 + Math.random() * 50)}        | 720-775          | ASTM D1298
Sulfur Content, ppm       | ${Math.floor(5 + Math.random() * 45)}          | Max 50           | ASTM D5453
Benzene Content, vol%     | ${(0.5 + Math.random() * 0.5).toFixed(2)}         | Max 1.0          | ASTM D3606
RVP @ 37.8°C, kPa         | ${Math.floor(45 + Math.random() * 15)}          | 45-60            | ASTM D323
Oxygen Content, wt%       | ${(2.0 + Math.random() * 0.7).toFixed(2)}         | Max 2.7          | ASTM D4815
Appearance                | Clear         | Clear & Bright   | Visual`;
  } else if (cargoType.toLowerCase().includes('diesel') || cargoType.toLowerCase().includes('gas oil')) {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
Cetane Number             | ${Math.floor(49 + Math.random() * 10)}          | Min 49           | ASTM D613
Density @ 15°C, kg/m³     | ${Math.floor(820 + Math.random() * 40)}        | 820-845          | ASTM D1298
Sulfur Content, ppm       | ${Math.floor(5 + Math.random() * 10)}          | Max 15           | ASTM D5453
Flash Point, °C           | ${Math.floor(55 + Math.random() * 20)}          | Min 55           | ASTM D93
Viscosity @ 40°C, mm²/s   | ${(2.0 + Math.random() * 2.0).toFixed(2)}         | 2.0-4.5          | ASTM D445
Cloud Point, °C           | ${Math.floor(-5 - Math.random() * 10)}          | Max 0            | ASTM D2500
CFPP, °C                  | ${Math.floor(-15 - Math.random() * 10)}         | Max -10          | ASTM D6371
Water Content, mg/kg      | ${Math.floor(150 + Math.random() * 50)}        | Max 200          | ASTM D6304`;
  } else if (cargoType.toLowerCase().includes('fuel oil') || cargoType.toLowerCase().includes('heavy fuel')) {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
Density @ 15°C, kg/m³     | ${Math.floor(980 + Math.random() * 30)}        | Max 1010         | ASTM D4052
Viscosity @ 50°C, cSt     | ${Math.floor(180 + Math.random() * 200)}        | Max 380          | ASTM D445
Sulfur Content, wt%       | ${(0.5 + Math.random() * 2.5).toFixed(2)}         | Max 3.5          | ASTM D4294
Flash Point, °C           | ${Math.floor(60 + Math.random() * 40)}          | Min 60           | ASTM D93
Pour Point, °C            | ${Math.floor(0 + Math.random() * 30)}          | Max 30           | ASTM D97
Carbon Residue, wt%       | ${(10 + Math.random() * 5).toFixed(1)}         | Max 15           | ASTM D4530
Ash Content, wt%          | ${(0.02 + Math.random() * 0.08).toFixed(2)}        | Max 0.1          | ASTM D482
Vanadium, mg/kg           | ${Math.floor(50 + Math.random() * 250)}        | Max 300          | ASTM D5708`;
  } else if (cargoType.toLowerCase().includes('jet') || cargoType.toLowerCase().includes('kerosene')) {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
Density @ 15°C, kg/m³     | ${Math.floor(775 + Math.random() * 65)}        | 775-840          | ASTM D1298
Flash Point, °C           | ${Math.floor(38 + Math.random() * 10)}          | Min 38           | ASTM D56
Freezing Point, °C        | ${Math.floor(-47 - Math.random() * 10)}         | Max -47          | ASTM D2386
Viscosity @ -20°C, mm²/s  | ${(3.5 + Math.random() * 4.0).toFixed(2)}         | Max 8.0          | ASTM D445
Smoke Point, mm           | ${Math.floor(20 + Math.random() * 10)}          | Min 19           | ASTM D1322
Sulfur Content, wt%       | ${(0.1 + Math.random() * 0.2).toFixed(3)}         | Max 0.3          | ASTM D4294
Aromatics, vol%           | ${Math.floor(16 + Math.random() * 9)}          | Max 25           | ASTM D1319
Appearance                | Clear         | Clear & Bright   | Visual`;
  } else if (cargoType.toLowerCase().includes('lpg') || cargoType.toLowerCase().includes('propane')) {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
Propane Content, vol%     | ${Math.floor(95 + Math.random() * 5)}          | Min 95           | ASTM D2163
Butane Content, vol%      | ${Math.floor(0 + Math.random() * 5)}           | Max 5            | ASTM D2163
Olefins, vol%             | ${(0.1 + Math.random() * 0.9).toFixed(1)}         | Max 1.0          | ASTM D2163
Vapor Pressure @ 37.8°C   | ${(1100 + Math.random() * 300).toFixed(0)} kPa    | 1200-1400 kPa    | ASTM D1267
Total Sulfur, mg/kg       | ${Math.floor(5 + Math.random() * 25)}          | Max 30           | ASTM D6667
Water Content             | Pass          | No Free Water    | Visual
Odor                      | Pass          | Distinctive      | Sensory
Residue on Evaporation    | ${(0.001 + Math.random() * 0.004).toFixed(3)} g/100ml | Max 0.005 g/100ml | ASTM D2158`;
  } else if (cargoType.toLowerCase().includes('lng') || cargoType.toLowerCase().includes('natural gas')) {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
Methane, mol%             | ${(87 + Math.random() * 10).toFixed(2)}         | Min 85           | GPA 2286
Ethane, mol%              | ${(5 + Math.random() * 5).toFixed(2)}          | Report           | GPA 2286
Propane, mol%             | ${(1 + Math.random() * 3).toFixed(2)}          | Report           | GPA 2286
Nitrogen, mol%            | ${(0.1 + Math.random() * 0.9).toFixed(2)}         | Max 1.0          | GPA 2286
Gross Heating Value       | ${(1050 + Math.random() * 50).toFixed(1)} BTU/scf | 1000-1100 BTU/scf | ASTM D3588
Wobbe Index               | ${(1390 + Math.random() * 30).toFixed(1)}       | 1385-1415        | Calculated
H₂S Content, mg/kg        | <1            | Max 4            | ASTM D5504
Mercury, ng/m³            | <10           | Max 10           | ASTM D6350`;
  } else {
    return `Parameter                 | Result        | Specification    | Method
--------------------------|---------------|------------------|------------------
Density @ 15°C, kg/m³     | ${Math.floor(800 + Math.random() * 100)}        | Report           | ASTM D1298
Flash Point, °C           | ${Math.floor(40 + Math.random() * 50)}          | Report           | ASTM D93
Viscosity @ 40°C, mm²/s   | ${(10 + Math.random() * 20).toFixed(2)}         | Report           | ASTM D445
Sulfur Content, wt%       | ${(0.1 + Math.random() * 1.0).toFixed(2)}         | Report           | ASTM D4294
Water Content, vol%       | ${(0.01 + Math.random() * 0.09).toFixed(2)}        | Report           | ASTM D4007
Appearance                | ${Math.random() > 0.5 ? 'Clear' : 'Bright'}       | Report           | Visual`;
  }
}

// Generate ullage measurements
function generateUllageMeasurements(cargoType, totalQuantity, unit) {
  const tankCount = Math.floor(4 + Math.random() * 6); // Generate between 4-10 tanks
  let output = '';
  let totalQuantityNum = parseFloat(totalQuantity);
  
  for (let i = 1; i <= tankCount; i++) {
    // Generate random values for each tank
    const tankPercentage = 1 / tankCount + (Math.random() * 0.1 - 0.05); // Around evenly distributed
    const tankQuantity = (totalQuantityNum * tankPercentage).toFixed(3);
    const ullage = (Math.random() * 3 + 1).toFixed(3); // 1-4 meters
    const temperature = (Math.floor(30 + Math.random() * 15)).toString(); // 30-45°C
    
    output += `Tank ${i}:
  Ullage: ${ullage} m
  Observed Volume: ${tankQuantity} ${unit}
  Temperature: ${temperature}°C
  Free Water: ${Math.random() > 0.8 ? (Math.random() * 0.05).toFixed(3) + ' m' : 'None'}\n\n`;
  }
  
  return output;
}

// Generate chronology of events for statement of facts
function generateChronologyOfEvents(departureDate, arrivalDate) {
  const isLoading = !!departureDate;
  const baseDate = new Date(isLoading ? departureDate : arrivalDate);
  const events = [];

  // Arrival
  const arrivalTime = new Date(baseDate);
  arrivalTime.setHours(arrivalTime.getHours() - Math.floor(24 + Math.random() * 12));
  events.push(`${formatDateForEvents(arrivalTime)}: Vessel arrived at outer anchorage`);

  // NOR Tendered
  const norTime = new Date(arrivalTime);
  norTime.setHours(norTime.getHours() + Math.floor(1 + Math.random() * 3));
  events.push(`${formatDateForEvents(norTime)}: Notice of Readiness tendered`);

  // Pilot Boarding
  const pilotTime = new Date(norTime);
  pilotTime.setHours(pilotTime.getHours() + Math.floor(4 + Math.random() * 8));
  events.push(`${formatDateForEvents(pilotTime)}: Pilot boarded`);

  // Berthing
  const berthTime = new Date(pilotTime);
  berthTime.setHours(berthTime.getHours() + Math.floor(1 + Math.random() * 2));
  events.push(`${formatDateForEvents(berthTime)}: Vessel all fast at berth`);

  // Survey Start
  const surveyStartTime = new Date(berthTime);
  surveyStartTime.setHours(surveyStartTime.getHours() + Math.floor(1 + Math.random() * 2));
  events.push(`${formatDateForEvents(surveyStartTime)}: Tank inspection and initial survey started`);

  // Survey End
  const surveyEndTime = new Date(surveyStartTime);
  surveyEndTime.setHours(surveyEndTime.getHours() + Math.floor(2 + Math.random() * 3));
  events.push(`${formatDateForEvents(surveyEndTime)}: Survey completed, tanks approved`);

  // Hose Connection
  const hoseTime = new Date(surveyEndTime);
  hoseTime.setHours(hoseTime.getHours() + Math.floor(1 + Math.random() * 2));
  events.push(`${formatDateForEvents(hoseTime)}: Cargo hoses connected and pressure tested`);

  // Operation Start
  const opStartTime = new Date(hoseTime);
  opStartTime.setHours(opStartTime.getHours() + Math.floor(1 + Math.random() * 2));
  events.push(`${formatDateForEvents(opStartTime)}: ${isLoading ? 'Loading' : 'Discharge'} commenced`);

  // Operation Complete
  const opEndTime = new Date(baseDate);
  events.push(`${formatDateForEvents(opEndTime)}: ${isLoading ? 'Loading' : 'Discharge'} completed`);

  // Final Survey Start
  const finalSurveyStartTime = new Date(opEndTime);
  finalSurveyStartTime.setHours(finalSurveyStartTime.getHours() + Math.floor(1 + Math.random() * 2));
  events.push(`${formatDateForEvents(finalSurveyStartTime)}: Final survey started`);

  // Final Survey End
  const finalSurveyEndTime = new Date(finalSurveyStartTime);
  finalSurveyEndTime.setHours(finalSurveyEndTime.getHours() + Math.floor(2 + Math.random() * 3));
  events.push(`${formatDateForEvents(finalSurveyEndTime)}: Final survey completed`);

  // Documents Signed
  const docsTime = new Date(finalSurveyEndTime);
  docsTime.setHours(docsTime.getHours() + Math.floor(1 + Math.random() * 3));
  events.push(`${formatDateForEvents(docsTime)}: Documents signed and released`);

  // Hose Disconnection
  const disconnectTime = new Date(docsTime);
  disconnectTime.setHours(disconnectTime.getHours() + Math.floor(1 + Math.random() * 2));
  events.push(`${formatDateForEvents(disconnectTime)}: Cargo hoses disconnected`);

  // Departure
  const departureTime = new Date(disconnectTime);
  departureTime.setHours(departureTime.getHours() + Math.floor(2 + Math.random() * 4));
  events.push(`${formatDateForEvents(departureTime)}: Vessel sailed from berth`);

  return events.join('\n');
}

function formatDateForEvents(date) {
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Execute the document generation
generateDocuments();