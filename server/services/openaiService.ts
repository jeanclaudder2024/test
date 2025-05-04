import OpenAI from "openai";
import { Vessel, Port, Refinery } from "@shared/schema";
import { storage } from "../storage";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Service for generating maritime data using OpenAI APIs
 */
export class OpenAIService {
  /**
   * Generate a detailed description for a port based on its metadata
   */
  async generatePortDescription(port: Port): Promise<string> {
    try {
      console.log(`Generating AI description for port: ${port.name} (ID: ${port.id})`);
      
      const prompt = `
      You are a maritime industry expert. Generate a detailed, factual description for the following port.
      
      Port Details:
      - Name: ${port.name}
      - Country: ${port.country}
      - Region: ${port.region}
      - Type: ${port.type || 'Commercial'}
      - Capacity: ${port.capacity?.toLocaleString() || 'Unknown'} tons
      - Status: ${port.status || 'Active'}
      
      Please provide a comprehensive 2-3 paragraph description that includes:
      1. The port's significance in the region
      2. Its primary cargo types and trade routes
      3. Notable infrastructure or facilities
      4. Any relevant historical context
      
      Format as a cohesive narrative without bullet points or headers.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      const description = response.choices[0].message.content?.trim() || 
        "Unable to generate description at this time.";
      
      // Update the port description in database
      await storage.updatePort(port.id, { description });
      
      return description;
    } catch (error) {
      console.error("Error generating port description:", error);
      throw new Error("Failed to generate port description");
    }
  }

  /**
   * Generate a detailed description for a refinery based on its metadata
   */
  async generateRefineryDescription(refinery: Refinery): Promise<string> {
    try {
      console.log(`Generating AI description for refinery: ${refinery.name} (ID: ${refinery.id})`);
      
      // Get connected ports for context
      const connections = await storage.getRefineryPortConnectionsByRefineryId(refinery.id);
      let connectedPorts: string[] = [];
      
      if (connections.length > 0) {
        const portIds = connections.map(conn => conn.portId);
        const portPromises = portIds.map(id => storage.getPortById(id));
        const ports = await Promise.all(portPromises);
        connectedPorts = ports.filter(Boolean).map(port => port?.name || '').filter(name => name !== '');
      }
      
      const prompt = `
      You are a petroleum industry expert. Generate a detailed, factual description for the following oil refinery.
      
      Refinery Details:
      - Name: ${refinery.name}
      - Country: ${refinery.country}
      - Region: ${refinery.region}
      - Capacity: ${refinery.capacity?.toLocaleString() || 'Unknown'} barrels per day
      - Status: ${refinery.status || 'Active'}
      - Connected Ports: ${connectedPorts.length > 0 ? connectedPorts.join(', ') : 'None recorded'}
      
      Please provide a comprehensive 2-3 paragraph description that includes:
      1. The refinery's significance in the regional energy landscape
      2. Its primary products and output capacity
      3. Notable technology or processes used
      4. Its supply chain and distribution network (including connected ports if any)
      
      Format as a cohesive narrative without bullet points or headers.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      const description = response.choices[0].message.content?.trim() || 
        "Unable to generate description at this time.";
      
      // Update the refinery description in database
      await storage.updateRefinery(refinery.id, { description });
      
      return description;
    } catch (error) {
      console.error("Error generating refinery description:", error);
      throw new Error("Failed to generate refinery description");
    }
  }

  /**
   * Generate shipping documents for a vessel
   */
  async generateShippingDocument(vessel: Vessel, documentType: string): Promise<{title: string, content: string}> {
    try {
      console.log(`Generating ${documentType} for vessel: ${vessel.name} (IMO: ${vessel.imo})`);
      
      let prompt = "";
      
      // Select the appropriate prompt based on document type
      switch (documentType.toLowerCase()) {
        case "bill of lading":
          prompt = this.getBillOfLadingPrompt(vessel);
          break;
        case "certificate of origin":
          prompt = this.getCertificateOfOriginPrompt(vessel);
          break;
        case "inspection report":
          prompt = this.getInspectionReportPrompt(vessel);
          break;
        case "customs declaration":
          prompt = this.getCustomsDeclarationPrompt(vessel);
          break;
        default:
          prompt = this.getGenericDocumentPrompt(vessel, documentType);
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });
      
      const content = response.choices[0].message.content?.trim() || 
        "Unable to generate document at this time.";
      
      return {
        title: `${documentType.toUpperCase()} - ${vessel.name} - ${new Date().toISOString().split('T')[0]}`,
        content
      };
    } catch (error) {
      console.error("Error generating shipping document:", error);
      throw new Error("Failed to generate shipping document");
    }
  }

  /**
   * Generate route optimization suggestions
   */
  async generateRouteOptimization(vessel: Vessel): Promise<{suggestions: string[], fuelSavings: number, timeSavings: number}> {
    try {
      console.log(`Generating route optimization for vessel: ${vessel.name} (IMO: ${vessel.imo})`);
      
      const prompt = `
      You are a maritime routing expert. Generate route optimization suggestions for the following vessel:
      
      Vessel Details:
      - Name: ${vessel.name}
      - Type: ${vessel.vesselType}
      - Current Position: Lat ${vessel.currentLat || 'Unknown'}, Lng ${vessel.currentLng || 'Unknown'}
      - Current Region: ${vessel.currentRegion || 'Unknown'}
      - Flag: ${vessel.flag || 'Unknown'}
      - Deadweight: ${vessel.deadweight?.toLocaleString() || 'Unknown'} tons
      
      Please provide:
      1. 3-5 specific route optimization suggestions that could improve efficiency
      2. An estimated percentage of fuel savings
      3. An estimated time savings in hours
      
      Format your response as a JSON object with these fields:
      - suggestions: array of strings
      - fuelSavings: number (percentage)
      - timeSavings: number (hours)
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
      
      const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        suggestions: Array.isArray(jsonResponse.suggestions) ? jsonResponse.suggestions : [],
        fuelSavings: typeof jsonResponse.fuelSavings === 'number' ? jsonResponse.fuelSavings : 0,
        timeSavings: typeof jsonResponse.timeSavings === 'number' ? jsonResponse.timeSavings : 0
      };
    } catch (error) {
      console.error("Error generating route optimization:", error);
      throw new Error("Failed to generate route optimization");
    }
  }

  private getBillOfLadingPrompt(vessel: Vessel): string {
    return `
    You are a shipping documentation expert. Create a Bill of Lading for the following vessel:
    
    Vessel Details:
    - Name: ${vessel.name}
    - IMO Number: ${vessel.imo}
    - MMSI: ${vessel.mmsi}
    - Type: ${vessel.vesselType}
    - Flag: ${vessel.flag || 'Unknown'}
    
    Include these sections:
    1. Shipper/Exporter
    2. Consignee
    3. Vessel and Voyage Information
    4. Port of Loading
    5. Port of Discharge
    6. Description of Goods
    7. Container Numbers
    8. Weight and Measurements
    9. Freight and Charges
    10. Signatures
    
    Format as a formal document with appropriate headers and layouts.
    `;
  }

  private getCertificateOfOriginPrompt(vessel: Vessel): string {
    return `
    You are a shipping documentation expert. Create a Certificate of Origin for cargo carried by the following vessel:
    
    Vessel Details:
    - Name: ${vessel.name}
    - IMO Number: ${vessel.imo}
    - MMSI: ${vessel.mmsi}
    - Type: ${vessel.vesselType}
    - Flag: ${vessel.flag || 'Unknown'}
    
    Include these sections:
    1. Exporter (Seller)
    2. Consignee
    3. Country of Origin
    4. Transport Details
    5. Description of Goods
    6. HS Tariff Classification
    7. Certifying Statements
    8. Authorized Signature and Date
    
    Format as a formal certificate with appropriate headers, official language, and layout.
    `;
  }

  private getInspectionReportPrompt(vessel: Vessel): string {
    return `
    You are a maritime safety inspector. Create a detailed vessel inspection report for:
    
    Vessel Details:
    - Name: ${vessel.name}
    - IMO Number: ${vessel.imo}
    - MMSI: ${vessel.mmsi}
    - Type: ${vessel.vesselType}
    - Flag: ${vessel.flag || 'Unknown'}
    - Built: ${vessel.built || 'Unknown'}
    - Deadweight: ${vessel.deadweight?.toLocaleString() || 'Unknown'} tons
    
    Include these sections:
    1. Inspection Information (date, location, inspector)
    2. Vessel Particulars
    3. Safety Equipment Assessment
    4. Structural Condition
    5. Machinery and Propulsion
    6. Navigation Equipment
    7. Pollution Prevention
    8. Crew Certification and Manning
    9. Deficiencies (if any)
    10. Conclusions and Recommendations
    
    Format as a detailed technical report with appropriate headers and sections.
    `;
  }

  private getCustomsDeclarationPrompt(vessel: Vessel): string {
    return `
    You are a customs documentation specialist. Create a customs declaration for cargo carried by:
    
    Vessel Details:
    - Name: ${vessel.name}
    - IMO Number: ${vessel.imo}
    - MMSI: ${vessel.mmsi}
    - Type: ${vessel.vesselType}
    - Flag: ${vessel.flag || 'Unknown'}
    
    Include these sections:
    1. Declarant Information
    2. Vessel and Voyage Details
    3. Port of Entry
    4. Date of Arrival
    5. Cargo Manifest Summary
    6. Goods Classification (HS Codes)
    7. Value of Goods
    8. Country of Origin
    9. Duties and Taxes
    10. Declaration Statement
    
    Format as an official customs document with appropriate headers and layouts.
    `;
  }

  private getGenericDocumentPrompt(vessel: Vessel, documentType: string): string {
    return `
    You are a maritime documentation specialist. Create a ${documentType} document for:
    
    Vessel Details:
    - Name: ${vessel.name}
    - IMO Number: ${vessel.imo}
    - MMSI: ${vessel.mmsi}
    - Type: ${vessel.vesselType}
    - Flag: ${vessel.flag || 'Unknown'}
    - Built: ${vessel.built || 'Unknown'}
    - Deadweight: ${vessel.deadweight?.toLocaleString() || 'Unknown'} tons
    
    Create a professionally formatted ${documentType} with all necessary sections, details, and language
    appropriate for this type of maritime document. Include relevant dates, locations, and regulatory references.
    
    Format as a formal document with appropriate structure and official language.
    `;
  }
}

export const openaiService = new OpenAIService();