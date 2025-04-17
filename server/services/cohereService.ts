/**
 * Service for interacting with Cohere AI API
 */

// Check if Cohere API key is set
if (!process.env.COHERE_API_KEY) {
  console.warn('Warning: COHERE_API_KEY is not set. Document generation features will not work.');
}

/**
 * Generate text using Cohere AI API
 * @param prompt The prompt to generate text from
 * @returns Generated text
 */
export async function generateWithCohere(prompt: string): Promise<string> {
  try {
    const url = 'https://api.cohere.ai/v1/generate';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt,
        max_tokens: 1000,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.generations[0].text;
  } catch (error) {
    console.error('Error generating text with Cohere:', error);
    throw new Error('Failed to generate document content. Please try again later.');
  }
}

/**
 * Generate shipping document using Cohere AI
 * @param vesselData Vessel and cargo data for document generation
 * @param documentType Type of document to generate
 * @returns Generated document content
 */
export async function generateShippingDocument(
  vesselData: any,
  documentType: string
): Promise<string> {
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Build structured prompt based on document type
  let prompt = '';
  
  switch (documentType.toLowerCase()) {
    case 'bill of lading':
      prompt = `Generate a detailed Bill of Lading for the following shipping information:
Vessel: ${vesselData.name} (IMO: ${vesselData.imo})
Flag: ${vesselData.flag}
Cargo Type: ${vesselData.cargoType || 'Crude Oil'}
Cargo Capacity: ${vesselData.cargoCapacity || 'N/A'} tons
Departure: ${vesselData.departurePort || 'N/A'} on ${vesselData.departureDate ? new Date(vesselData.departureDate).toISOString().split('T')[0] : 'N/A'}
Destination: ${vesselData.destinationPort || 'N/A'} (ETA: ${vesselData.eta ? new Date(vesselData.eta).toISOString().split('T')[0] : 'N/A'})
Date Issued: ${currentDate}

The Bill of Lading must include:
1. Shipper details
2. Consignee details
3. Notify party
4. Vessel and voyage details
5. Port of loading and discharge
6. Cargo description
7. Container numbers (if applicable)
8. Freight details
9. Number of original bills of lading issued
10. Terms and conditions
11. Signature blocks

Format as a properly structured formal document.`;
      break;
      
    case 'cargo manifest':
      prompt = `Generate a detailed Cargo Manifest for the following shipping information:
Vessel: ${vesselData.name} (IMO: ${vesselData.imo})
Flag: ${vesselData.flag}
Cargo Type: ${vesselData.cargoType || 'Crude Oil'}
Cargo Capacity: ${vesselData.cargoCapacity || 'N/A'} tons
Departure: ${vesselData.departurePort || 'N/A'} on ${vesselData.departureDate ? new Date(vesselData.departureDate).toISOString().split('T')[0] : 'N/A'}
Destination: ${vesselData.destinationPort || 'N/A'} (ETA: ${vesselData.eta ? new Date(vesselData.eta).toISOString().split('T')[0] : 'N/A'})
Date Issued: ${currentDate}

The Cargo Manifest must include:
1. Vessel details
2. Voyage number
3. Port of loading
4. Port of discharge
5. Detailed listing of all cargo with descriptions, weights, and measurements
6. Hazardous cargo information (if applicable)
7. Special handling requirements
8. Total cargo weight and volume
9. Signature and stamp
10. Page numbers and total page count

Format as a properly structured formal document.`;
      break;
      
    case 'inspection report':
      prompt = `Generate a detailed Vessel Inspection Report for the following vessel:
Vessel: ${vesselData.name} (IMO: ${vesselData.imo})
Flag: ${vesselData.flag}
Built: ${vesselData.built || 'N/A'}
Deadweight: ${vesselData.deadweight || 'N/A'} tons
Current Location: Latitude ${vesselData.currentLat || 'N/A'}, Longitude ${vesselData.currentLng || 'N/A'}
Date of Inspection: ${currentDate}

The Inspection Report must include:
1. Executive summary
2. Vessel particulars
3. Inspection scope and methodology
4. Hull condition assessment
5. Machinery and equipment condition
6. Safety and navigation equipment
7. Cargo systems inspection
8. Compliance with international regulations
9. Deficiencies identified
10. Recommendations
11. Overall vessel rating
12. Inspector details and credentials
13. Appendices for photos and detailed findings

Format as a professionally structured inspection report.`;
      break;
      
    case 'loading instructions':
      prompt = `Generate detailed Loading Instructions for the following vessel and cargo:
Vessel: ${vesselData.name} (IMO: ${vesselData.imo})
Flag: ${vesselData.flag}
Cargo Type: ${vesselData.cargoType || 'Crude Oil'}
Cargo Capacity: ${vesselData.cargoCapacity || 'N/A'} tons
Loading Port: ${vesselData.departurePort || 'N/A'}
Loading Date: ${vesselData.departureDate ? new Date(vesselData.departureDate).toISOString().split('T')[0] : currentDate}

The Loading Instructions must include:
1. Pre-loading checks and preparations
2. Loading sequence and rate
3. Trim and stability considerations
4. Tank distribution plan
5. Temperature and pressure requirements
6. Sampling and testing procedures
7. Safety precautions and emergency procedures
8. Communication protocols
9. Documentation requirements
10. Post-loading checks
11. Master's acknowledgment
12. Terminal representative's approval

Format as a structured, step-by-step technical document.`;
      break;
      
    default:
      prompt = `Generate a detailed shipping document for ${documentType} related to the following vessel:
Vessel: ${vesselData.name} (IMO: ${vesselData.imo})
Flag: ${vesselData.flag}
Cargo Type: ${vesselData.cargoType || 'Crude Oil'}
Cargo Capacity: ${vesselData.cargoCapacity || 'N/A'} tons
Departure: ${vesselData.departurePort || 'N/A'} on ${vesselData.departureDate ? new Date(vesselData.departureDate).toISOString().split('T')[0] : 'N/A'}
Destination: ${vesselData.destinationPort || 'N/A'} (ETA: ${vesselData.eta ? new Date(vesselData.eta).toISOString().split('T')[0] : 'N/A'})
Date Issued: ${currentDate}

Include all relevant fields for this type of document, ensuring it follows industry standards and regulatory requirements.
Format as a properly structured formal document.`;
  }
  
  // Generate the document using Cohere
  const generatedText = await generateWithCohere(prompt);
  
  return generatedText.trim();
}

export const cohereService = {
  generateWithCohere,
  generateShippingDocument
};