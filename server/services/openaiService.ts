import OpenAI from "openai";
import { Port, Refinery, Vessel } from "@shared/schema";

// Create OpenAI client instance
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Service for generating maritime data using OpenAI APIs
 */
export class OpenAIService {
  /**
   * Generate a detailed description for a port based on its metadata
   */
  async generatePortDescription(port: Port): Promise<string> {
    try {
      const prompt = `
Generate a detailed and professional description for the following port:
- Name: ${port.name}
- Country: ${port.country}
- Region: ${port.region}
- Capacity: ${port.capacity || 'Unknown'} tons/year
- Location: Lat ${port.lat}, Lng ${port.lng}

The description should include:
1. Brief historical context if applicable
2. Primary cargo types handled
3. Major shipping routes connected to this port
4. Key infrastructure elements
5. Economic importance to the region
6. Maximum vessel size accommodations

Format as a single paragraph, approximately 100-150 words. Use formal, maritime industry language.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content?.trim() || 
        `${port.name} is a significant maritime facility located in ${port.country}, serving as a vital link in the region's shipping network.`;
    } catch (error) {
      console.error('Error generating port description:', error);
      return `${port.name} is a significant maritime facility located in ${port.country}, serving as a vital link in the region's shipping network.`;
    }
  }

  /**
   * Generate a detailed description for a refinery based on its metadata
   */
  async generateRefineryDescription(refinery: Refinery): Promise<string> {
    try {
      const prompt = `
Generate a detailed and professional description for the following oil refinery:
- Name: ${refinery.name}
- Country: ${refinery.country}
- Region: ${refinery.region}
- Capacity: ${refinery.capacity || 'Unknown'} barrels per day
- Status: ${refinery.status || 'Operational'}
- Location: Lat ${refinery.lat}, Lng ${refinery.lng}

The description should include:
1. Brief information about when it was established (approximate if not known)
2. Primary refined products
3. Technical capabilities
4. Economic importance to the region
5. Distribution network
6. Any notable characteristics

Format as a single paragraph, approximately 100-150 words. Use formal, oil industry language.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content?.trim() || 
        `${refinery.name} is a major petroleum processing facility located in ${refinery.country}, playing a key role in the region's energy infrastructure.`;
    } catch (error) {
      console.error('Error generating refinery description:', error);
      return `${refinery.name} is a major petroleum processing facility located in ${refinery.country}, playing a key role in the region's energy infrastructure.`;
    }
  }

  /**
   * Generate shipping documents for a vessel
   */
  async generateShippingDocument(vessel: Vessel, documentType: string): Promise<{title: string, content: string}> {
    try {
      let documentPrompt = "";
      
      switch(documentType.toLowerCase()) {
        case "bill of lading":
          documentPrompt = this.getBillOfLadingPrompt(vessel);
          break;
        case "certificate of origin":
          documentPrompt = this.getCertificateOfOriginPrompt(vessel);
          break;
        case "inspection report":
          documentPrompt = this.getInspectionReportPrompt(vessel);
          break;
        case "customs declaration":
          documentPrompt = this.getCustomsDeclarationPrompt(vessel);
          break;
        default:
          documentPrompt = this.getGenericDocumentPrompt(vessel, documentType);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: documentPrompt }],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.5,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"title":"Document", "content":"Content unavailable"}');
      
      return {
        title: result.title || `${documentType} - ${vessel.name}`,
        content: result.content || `Document content unavailable for ${vessel.name}.`
      };
    } catch (error) {
      console.error(`Error generating ${documentType}:`, error);
      return {
        title: `${documentType} - ${vessel.name}`,
        content: `Document content unavailable for ${vessel.name}. Please try again later.`
      };
    }
  }

  /**
   * Generate route optimization suggestions
   */
  async generateRouteOptimization(vessel: Vessel): Promise<{suggestions: string[], fuelSavings: number, timeSavings: number}> {
    try {
      const prompt = `
Generate route optimization suggestions for the following vessel:
- Vessel Name: ${vessel.name}
- Type: ${vessel.vesselType}
- Departure: ${vessel.departurePort || 'Unknown'}
- Destination: ${vessel.destinationPort || 'Unknown'}
- Current Position: Lat ${vessel.currentLat || 'Unknown'}, Lng ${vessel.currentLng || 'Unknown'}

Provide your response as a JSON object with these fields:
1. "suggestions": An array of 3-5 specific route optimization suggestions
2. "fuelSavings": Estimated fuel savings percentage (a number between 5 and 20)
3. "timeSavings": Estimated time savings in hours (a number between 5 and 48)

Make the suggestions specific to maritime shipping, accounting for factors like currents, weather patterns, and shipping lanes.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions":[], "fuelSavings":0, "timeSavings":0}');
      
      return {
        suggestions: result.suggestions || [],
        fuelSavings: result.fuelSavings || 0,
        timeSavings: result.timeSavings || 0
      };
    } catch (error) {
      console.error('Error generating route optimization:', error);
      return {
        suggestions: ["Unable to generate route optimization suggestions at this time."],
        fuelSavings: 0,
        timeSavings: 0
      };
    }
  }

  // Helper methods for document prompt generation
  private getBillOfLadingPrompt(vessel: Vessel): string {
    return `
Generate a realistic Bill of Lading document for the following vessel:
- Vessel Name: ${vessel.name}
- IMO: ${vessel.imo}
- Vessel Type: ${vessel.vesselType}
- Departure Port: ${vessel.departurePort || 'Unknown'}
- Destination Port: ${vessel.destinationPort || 'Unknown'}
- Cargo Type: ${vessel.cargoType || 'Crude Oil'}
- Cargo Capacity: ${vessel.cargoCapacity || 'Unknown'} tons

Include appropriate fields for a Bill of Lading including:
- Shipper details
- Consignee details
- Notify party
- Cargo description
- Package count and type
- Gross and net weight
- Measurement
- Freight terms
- Date of issue
- Signature fields

Respond with a JSON object containing:
1. "title": The title of the document
2. "content": The formatted Bill of Lading text content

Use realistic but fictional company names and contact details. Format the document appropriately with sections and formatting.
`;
  }

  private getCertificateOfOriginPrompt(vessel: Vessel): string {
    return `
Generate a realistic Certificate of Origin document for cargo carried by the following vessel:
- Vessel Name: ${vessel.name}
- IMO: ${vessel.imo}
- Vessel Type: ${vessel.vesselType}
- Departure Port: ${vessel.departurePort || 'Unknown'} (Country of Origin)
- Destination Port: ${vessel.destinationPort || 'Unknown'} (Country of Destination)
- Cargo Type: ${vessel.cargoType || 'Crude Oil'}

Include appropriate fields for a Certificate of Origin including:
- Exporter details
- Consignee details
- Country of origin
- Country of destination
- Transport details
- Marks and numbers
- Description of goods
- HS tariff classification number
- Origin criterion
- Declaration by the exporter
- Certification by the issuing authority
- Date of issue

Respond with a JSON object containing:
1. "title": The title of the document
2. "content": The formatted Certificate of Origin text content

Use realistic but fictional company names and authorities. Format the document appropriately with sections and formatting.
`;
  }

  private getInspectionReportPrompt(vessel: Vessel): string {
    return `
Generate a realistic Vessel Inspection Report for the following vessel:
- Vessel Name: ${vessel.name}
- IMO: ${vessel.imo}
- MMSI: ${vessel.mmsi}
- Flag: ${vessel.flag}
- Vessel Type: ${vessel.vesselType}
- Built: ${vessel.built || 'Unknown'}

Include appropriate fields for a Vessel Inspection Report including:
- Inspection details (date, location, inspector)
- Vessel particulars
- Hull condition assessment
- Machinery condition assessment
- Safety equipment assessment
- Navigation equipment assessment
- Crew and documentation review
- Compliance with international regulations
- Deficiencies identified
- Recommendations
- Overall rating
- Follow-up requirements
- Signature and stamp sections

Respond with a JSON object containing:
1. "title": The title of the document
2. "content": The formatted Inspection Report text content

Make it detailed and technical in nature, including a mix of satisfactory items and several minor deficiencies that need addressing. Format the document appropriately with sections and formatting.
`;
  }

  private getCustomsDeclarationPrompt(vessel: Vessel): string {
    return `
Generate a realistic Customs Declaration document for cargo carried by the following vessel:
- Vessel Name: ${vessel.name}
- IMO: ${vessel.imo}
- Voyage Number: (generate a realistic voyage number)
- Vessel Type: ${vessel.vesselType}
- Departure Port: ${vessel.departurePort || 'Unknown'}
- Destination Port: ${vessel.destinationPort || 'Unknown'}
- Cargo Type: ${vessel.cargoType || 'Crude Oil'}
- Cargo Capacity: ${vessel.cargoCapacity || 'Unknown'} tons

Include appropriate fields for a Customs Declaration including:
- Declarant information
- Importer/Exporter details
- Transport information
- Cargo manifest summary
- Commodity codes
- Country of origin
- Value of goods
- Duties and taxes
- Customs broker information
- Declaration statements
- Date and signature fields

Respond with a JSON object containing:
1. "title": The title of the document
2. "content": The formatted Customs Declaration text content

Use realistic but fictional company names and details. Include appropriate commodity codes and duty calculations. Format the document appropriately with sections and formatting.
`;
  }

  private getGenericDocumentPrompt(vessel: Vessel, documentType: string): string {
    return `
Generate a realistic ${documentType} document for the following vessel:
- Vessel Name: ${vessel.name}
- IMO: ${vessel.imo}
- MMSI: ${vessel.mmsi}
- Flag: ${vessel.flag}
- Vessel Type: ${vessel.vesselType}
- Departure Port: ${vessel.departurePort || 'Unknown'}
- Destination Port: ${vessel.destinationPort || 'Unknown'}
- Cargo Type: ${vessel.cargoType || 'Crude Oil'}

Create a comprehensive and realistic ${documentType} that would typically be used in maritime shipping.
Include all relevant sections, fields, and information that would normally appear in such a document.
Use appropriate maritime terminology and formatting.

Respond with a JSON object containing:
1. "title": The title of the document
2. "content": The formatted document text content

Use realistic but fictional details where needed, and format the document appropriately with sections and formatting.
`;
  }
}

export const openaiService = new OpenAIService();