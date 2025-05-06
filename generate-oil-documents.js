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
        
        const docType = row['Document Type'] || 'General Document';
        const vesselName = row['Vessel Name'] || `Unnamed Vessel ${index + 1}`;
        const documentName = `${vesselName} - ${docType}`.replace(/[\/\\:*?"<>|]/g, '_');
        
        // Generate document content based on document type
        const content = generateDocumentContent(row);
        
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
  switch (docType.toLowerCase()) {
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