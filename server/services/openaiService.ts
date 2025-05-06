import OpenAI from "openai";
import { Vessel, Port, Refinery, Company } from "@shared/schema";
import { storage } from "../storage";
import { calculateDistance } from "../utils/geoUtils";

// Initialize OpenAI client
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log("OpenAI client initialized successfully");
  } else {
    console.warn("OpenAI API key is not set. AI-powered features will be unavailable.");
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Helper function to safely access the OpenAI client
 * Will throw an error if OpenAI client is not available
 */
function getOpenAIClient(): OpenAI {
  if (!openai) {
    throw new Error("OpenAI client not available. Check if OPENAI_API_KEY is set properly.");
  }
  return openai;
}

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
      
      try {
        // Get OpenAI client with null check
        const client = getOpenAIClient();
        
        const response = await client.chat.completions.create({
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
      } catch (aiError) {
        console.warn("OpenAI generation failed:", aiError);
        
        // Fallback to a basic description
        const fallbackDescription = `${port.name} is a ${port.type || 'commercial'} port located in ${port.country}, ${port.region}. The port handles various types of cargo and serves as an important logistics hub in the region.`;
        
        // Update the port description in database with fallback
        await storage.updatePort(port.id, { description: fallbackDescription });
        
        return fallbackDescription;
      }
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
      
      try {
        // Get OpenAI client with null check
        const client = getOpenAIClient();
        
        const response = await client.chat.completions.create({
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
      } catch (aiError) {
        console.warn("OpenAI generation failed:", aiError);
        
        // Fallback to a basic description
        const fallbackDescription = `${refinery.name} is a petroleum refinery located in ${refinery.country}, ${refinery.region}. With a capacity of ${refinery.capacity?.toLocaleString() || 'Unknown'} barrels per day, it produces various refined petroleum products for domestic and international markets.`;
        
        // Update the refinery description in database with fallback
        await storage.updateRefinery(refinery.id, { description: fallbackDescription });
        
        return fallbackDescription;
      }
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
      
      try {
        // Get OpenAI client with null check
        const client = getOpenAIClient();
        
        const response = await client.chat.completions.create({
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
      } catch (aiError) {
        console.warn("OpenAI generation failed:", aiError);
        
        // Create a simple default document based on the type
        const defaultContent = `
DOCUMENT: ${documentType.toUpperCase()}
VESSEL: ${vessel.name}
IMO: ${vessel.imo || "N/A"}
TYPE: ${vessel.vesselType || "N/A"}
FLAG: ${vessel.flag || "N/A"}
DATE: ${new Date().toISOString().split('T')[0]}

This document was generated automatically without AI assistance.
`;
        
        return {
          title: `${documentType.toUpperCase()} - ${vessel.name} - ${new Date().toISOString().split('T')[0]}`,
          content: defaultContent
        };
      }
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
      
      try {
        // Get OpenAI client with null check
        const client = getOpenAIClient();
        
        const response = await client.chat.completions.create({
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
      } catch (aiError) {
        console.warn("OpenAI route optimization generation failed:", aiError);
        
        // Return default suggestions based on vessel type
        const defaultSuggestions = [
          "Consider adjusting speed to optimal fuel efficiency range.",
          "Monitor weather patterns to avoid adverse conditions.",
          "Verify that the current route follows established shipping lanes."
        ];
        
        return {
          suggestions: defaultSuggestions,
          fuelSavings: 3, // Default estimated savings
          timeSavings: 5  // Default time savings in hours
        };
      }
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
  
  /**
   * Generate a seller company name based on vessel information and cargo
   */
  async generateSellerCompanyName(vessel: Vessel): Promise<string> {
    try {
      console.log(`Generating seller company name for vessel: ${vessel.name} (IMO: ${vessel.imo})`);
      
      // First check if there are actual companies in the database that match the vessel's region or flag
      let companies: Company[] = [];
      
      if (vessel.currentRegion) {
        companies = await storage.getCompaniesByRegion(vessel.currentRegion);
      }
      
      // If we have actual companies, randomly select one rather than generating
      if (companies.length > 0) {
        const randomIndex = Math.floor(Math.random() * companies.length);
        return companies[randomIndex].name;
      }
      
      try {
        // Get OpenAI client with null check
        const client = getOpenAIClient();
        
        // If no companies found, generate one using OpenAI
        const prompt = `
        You are a maritime industry expert. Generate a realistic oil shipping/trading company name that would be the seller for a vessel with these characteristics:
        
        Vessel Details:
        - Name: ${vessel.name}
        - Flag: ${vessel.flag || 'Unknown'}
        - Region: ${vessel.currentRegion || vessel.flag || 'Global'}
        - Cargo Type: ${vessel.cargoType || 'Oil products'}
        
        Please respond with just the company name, no additional text. The company name should be realistic, professional, and reflect the region and cargo type. It should sound like a real company in the oil shipping industry.
        `;
        
        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 50,
        });
        
        const companyName = response.choices[0].message.content?.trim() || 
          "Global Oil Traders Ltd.";
        
        return companyName;
      } catch (aiError) {
        console.warn("OpenAI generation failed:", aiError);
        
        // Default company name based on vessel info
        const region = vessel.currentRegion || vessel.flag || "Global";
        return `${region} Oil Traders Ltd.`;
      }
    } catch (error) {
      console.error("Error generating seller company name:", error);
      return "Global Oil Traders Ltd."; // Default fallback name
    }
  }
  
  /**
   * Generate voyage progress data when API data is not available
   */
  async generateVoyageProgress(vessel: Vessel): Promise<{
    percentComplete: number;
    distanceTraveled: number;
    distanceRemaining: number;
    estimatedArrival: Date | null;
    currentSpeed: number;
    averageSpeed: number;
    lastUpdated: Date;
  } | null> {
    try {
      console.log(`Generating voyage progress with AI for vessel: ${vessel.name} (IMO: ${vessel.imo})`);
      
      // Check if we have all required data for calculation
      if (!vessel.departurePort || !vessel.destinationPort) {
        console.warn(`Cannot generate voyage progress: Missing departure or destination for vessel ${vessel.name}`);
        return null;
      }

      // If we have coordinates, use them to calculate distance directly
      const hasCoordinates = 
        vessel.departureLat && vessel.departureLng && 
        vessel.destinationLat && vessel.destinationLng && 
        vessel.currentLat && vessel.currentLng;
      
      if (hasCoordinates) {
        try {
          const departLat = parseFloat(String(vessel.departureLat));
          const departLng = parseFloat(String(vessel.departureLng));
          const destLat = parseFloat(String(vessel.destinationLat));
          const destLng = parseFloat(String(vessel.destinationLng));
          const currentLat = parseFloat(String(vessel.currentLat));
          const currentLng = parseFloat(String(vessel.currentLng));
          
          // Check if all coordinates are valid
          if (!isNaN(departLat) && !isNaN(departLng) && 
              !isNaN(destLat) && !isNaN(destLng) && 
              !isNaN(currentLat) && !isNaN(currentLng)) {
            
            // Calculate distances using Haversine formula
            const totalDistance = calculateDistance(
              departLat, departLng, 
              destLat, destLng
            );
            
            const traveledDistance = calculateDistance(
              departLat, departLng, 
              currentLat, currentLng
            );
            
            const remainingDistance = calculateDistance(
              currentLat, currentLng, 
              destLat, destLng
            );
            
            // Calculate percent complete
            const percentComplete = Math.min(
              Math.round((traveledDistance / totalDistance) * 100), 
              100
            );
            
            // Generate reasonable speeds based on vessel type
            let averageSpeed = 14; // Default average knots for tankers
            if (vessel.vesselType?.includes('crude')) {
              averageSpeed = 12; // Crude tankers are slower
            } else if (vessel.vesselType?.includes('gas')) {
              averageSpeed = 18; // Gas carriers tend to be faster
            }
            
            // Add some variation to current speed
            const currentSpeed = averageSpeed * (0.9 + Math.random() * 0.2);
            
            // Calculate ETA based on remaining distance and average speed
            let estimatedArrival = null;
            if (vessel.eta) {
              estimatedArrival = new Date(vessel.eta);
            } else if (remainingDistance > 0 && averageSpeed > 0) {
              const hoursRemaining = remainingDistance / averageSpeed;
              estimatedArrival = new Date();
              estimatedArrival.setHours(estimatedArrival.getHours() + hoursRemaining);
            }
            
            // Return calculated data
            return {
              percentComplete,
              distanceTraveled: Math.round(traveledDistance),
              distanceRemaining: Math.round(remainingDistance),
              estimatedArrival,
              currentSpeed: parseFloat(currentSpeed.toFixed(1)),
              averageSpeed,
              lastUpdated: new Date()
            };
          }
        } catch (calcError) {
          console.error("Error calculating distances from coordinates:", calcError);
          // Continue to AI generation as fallback
        }
      }
      
      // If we don't have coordinates or calculation failed, use AI to generate the data
      const prompt = `
      You are a maritime voyage tracking expert. Generate realistic voyage progress data for the following vessel:
      
      Vessel Details:
      - Name: ${vessel.name}
      - Type: ${vessel.vesselType || 'Oil Tanker'}
      - Departure Port: ${vessel.departurePort}
      - Destination Port: ${vessel.destinationPort}
      - Departure Date: ${vessel.departureDate ? new Date(vessel.departureDate).toISOString() : 'Unknown'}
      - Estimated Arrival Date: ${vessel.eta ? new Date(vessel.eta).toISOString() : 'Unknown'}
      - Current Position: ${vessel.currentLat}, ${vessel.currentLng}
      
      Please generate realistic voyage progress data including:
      1. Percent complete (integer between 0-100)
      2. Distance traveled in nautical miles (integer)
      3. Distance remaining in nautical miles (integer)
      4. Current speed in knots (float with 1 decimal)
      5. Average speed in knots (float with 1 decimal)
      
      Notes:
      - Make sure these values are realistic for an oil tanker
      - Typical tanker speeds are 12-18 knots
      - Make sure percentComplete, distanceTraveled, and distanceRemaining are consistent
      - Percentages should be based on distance, not time
      
      Format your response as a JSON object with these fields:
      - percentComplete: number (integer 0-100)
      - distanceTraveled: number (integer nautical miles)
      - distanceRemaining: number (integer nautical miles)
      - currentSpeed: number (float with 1 decimal, knots)
      - averageSpeed: number (float with 1 decimal, knots)
      `;
      
      try {
        // Get OpenAI client with null check
        const client = getOpenAIClient();
        
        // Get AI to generate the data
        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 250,
          response_format: { type: "json_object" }
        });
        
        // Parse the JSON response
        const jsonResponse = JSON.parse(response.choices[0].message.content || "{}");
        
        // Ensure all fields are present and valid
        const percentComplete = typeof jsonResponse.percentComplete === 'number' ? 
          Math.min(Math.max(Math.round(jsonResponse.percentComplete), 0), 100) : 50;
          
        const distanceTraveled = typeof jsonResponse.distanceTraveled === 'number' ? 
          Math.max(Math.round(jsonResponse.distanceTraveled), 0) : 1000;
          
        const distanceRemaining = typeof jsonResponse.distanceRemaining === 'number' ? 
          Math.max(Math.round(jsonResponse.distanceRemaining), 0) : 1000;
          
        const currentSpeed = typeof jsonResponse.currentSpeed === 'number' ? 
          Math.min(Math.max(jsonResponse.currentSpeed, 8), 20) : 14;
          
        const averageSpeed = typeof jsonResponse.averageSpeed === 'number' ? 
          Math.min(Math.max(jsonResponse.averageSpeed, 8), 20) : 14;
        
        // Calculate estimated arrival time based on distances and speed
        let estimatedArrival = null;
        if (vessel.eta) {
          estimatedArrival = new Date(vessel.eta);
        } else if (distanceRemaining > 0 && averageSpeed > 0) {
          const hoursRemaining = distanceRemaining / averageSpeed;
          estimatedArrival = new Date();
          estimatedArrival.setHours(estimatedArrival.getHours() + hoursRemaining);
        }
        
        // Return the AI-generated voyage progress data
        return {
          percentComplete,
          distanceTraveled,
          distanceRemaining,
          estimatedArrival,
          currentSpeed,
          averageSpeed,
          lastUpdated: new Date()
        };
      } catch (aiError) {
        console.warn("OpenAI voyage progress generation failed:", aiError);
        
        // Use simple calculation based on departure and ETA
        const now = new Date();
        let percentComplete = 50; // Default to midway
        let distanceTraveled = 1000;
        let distanceRemaining = 1000;
        let currentSpeed = 14;
        let averageSpeed = 14;
        
        // If we have departure date and ETA, calculate based on time
        if (vessel.departureDate && vessel.eta) {
          const departureDate = new Date(vessel.departureDate);
          const etaDate = new Date(vessel.eta);
          
          const totalJourneyTime = etaDate.getTime() - departureDate.getTime();
          const timeElapsed = now.getTime() - departureDate.getTime();
          
          if (totalJourneyTime > 0) {
            percentComplete = Math.min(Math.round((timeElapsed / totalJourneyTime) * 100), 100);
            // Assume 2000 NM for a typical journey if unknown
            const totalDistance = 2000;
            distanceTraveled = Math.round((percentComplete / 100) * totalDistance);
            distanceRemaining = totalDistance - distanceTraveled;
          }
        }
        
        return {
          percentComplete,
          distanceTraveled,
          distanceRemaining,
          estimatedArrival: vessel.eta ? new Date(vessel.eta) : null,
          currentSpeed,
          averageSpeed,
          lastUpdated: new Date()
        };
      }
      
    } catch (error) {
      console.error("Error generating voyage progress with AI:", error);
      return null;
    }
  }
  /**
   * Analyze vessels near a port and prioritize the most relevant ones
   * This uses OpenAI to evaluate vessel-port compatibility based on cargo type, port type, 
   * vessel type, and other characteristics
   * 
   * @param port The port to analyze vessels for
   * @param nearbyVessels Array of vessels with their distances from the port
   * @param maxResults Maximum number of vessels to return (default: 9)
   * @returns Filtered and prioritized array of vessels with distances
   */
  async analyzePortVesselRelationships(
    port: Port,
    nearbyVessels: {vessels: Vessel, distance: number}[],
    maxResults: number = 9
  ): Promise<{vessels: Vessel, distance: number, relevanceScore: number}[]> {
    try {
      console.log(`Analyzing vessels near port ${port.name} (ID: ${port.id}) with OpenAI`);
      
      // If we have 0 or 1 vessels, return them as is
      if (nearbyVessels.length <= 1) {
        return nearbyVessels.map(v => ({...v, relevanceScore: 1}));
      }
      
      // If we have fewer vessels than maxResults, use all of them
      if (nearbyVessels.length <= maxResults) {
        // Still score them for consistent results
        const scoredVessels = await this.scoreVesselPortRelevance(port, nearbyVessels);
        return scoredVessels.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
      
      // If we have many vessels, use OpenAI to select the most relevant ones
      const scoredVessels = await this.scoreVesselPortRelevance(port, nearbyVessels);
      
      // Sort by relevance score (highest first) and take the top maxResults
      return scoredVessels
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);
    } catch (error) {
      console.error(`Error analyzing vessels for port ${port.name}:`, error);
      
      // Fallback to simple distance-based selection if AI analysis fails
      console.log("Falling back to distance-based vessel selection");
      return nearbyVessels
        .slice(0, maxResults)
        .map(v => ({...v, relevanceScore: 1 - (v.distance / 100)}));
    }
  }
  
  /**
   * Score vessels based on their relevance to a specific port
   * Uses OpenAI to evaluate characteristics like vessel type matching port type
   * 
   * @param port The port to analyze vessels for
   * @param nearbyVessels Array of vessels with their distances from the port
   * @returns Vessels with relevance scores (0-1 scale)
   */
  private async scoreVesselPortRelevance(
    port: Port,
    nearbyVessels: {vessels: Vessel, distance: number}[]
  ): Promise<{vessels: Vessel, distance: number, relevanceScore: number}[]> {
    try {
      // Prepare a more compact vessel object for the prompt
      const vesselData = nearbyVessels.map((v, index) => ({
        id: index, // Use index as ID in the prompt to keep references simple
        realId: v.vessels.id, // Keep the real ID for mapping back
        name: v.vessels.name,
        type: v.vessels.vesselType,
        cargo: v.vessels.cargoType || 'Unknown',
        flag: v.vessels.flag,
        distance: v.distance,
        deadweight: v.vessels.deadweight || 'Unknown'
      }));
      
      // Create the prompt
      const prompt = `
      You are a maritime logistics expert. Analyze the compatibility between this port and nearby vessels.
      
      PORT INFORMATION:
      Name: ${port.name}
      Type: ${port.type || 'Commercial'}
      Country: ${port.country}
      Region: ${port.region}
      
      NEARBY VESSELS (${vesselData.length}):
      ${JSON.stringify(vesselData, null, 2)}
      
      TASK:
      For each vessel, assign a relevance score (0.0 to 1.0) based on how likely it would visit this type of port.
      Consider these factors:
      - Oil tankers are highly relevant to oil terminals
      - LNG carriers are highly relevant to LNG terminals
      - Container ships are relevant to container terminals
      - Vessel cargo type should match port type
      - Consider regional trading patterns
      - Distance is a factor but not decisive (vessels travel long distances)
      
      Respond with a JSON array containing objects with: id (matching input), relevanceScore.
      Example: [{"id": 0, "relevanceScore": 0.95}, {"id": 1, "relevanceScore": 0.72}]
      `;
      
      // Get OpenAI client with null check
      const client = getOpenAIClient();
      
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // Lower temperature for consistent results
        max_tokens: 600,
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const content = response.choices[0].message.content?.trim() || "{}";
      const results = JSON.parse(content);
      
      // Ensure results is in the expected format
      if (!results.vessels && !Array.isArray(results)) {
        console.warn("Unexpected format in OpenAI response for vessel scoring");
        throw new Error("Invalid response format");
      }
      
      // Handle both possible response formats
      const scoredIndices = Array.isArray(results) ? results : (results.vessels || []);
      
      // Map the scores back to the original vessels
      return nearbyVessels.map((v, index) => {
        // Find the matching score from OpenAI
        const match = scoredIndices.find((s: any) => s.id === index);
        const relevanceScore = match ? parseFloat(match.relevanceScore) : 0.5; // Default to 0.5 if no match
        
        return {
          ...v,
          relevanceScore: Math.max(0, Math.min(1, relevanceScore)) // Ensure score is between 0-1
        };
      });
    } catch (error) {
      console.error("Error in vessel scoring:", error);
      
      // Fallback to distance-based scoring
      return nearbyVessels.map(v => ({
        ...v,
        relevanceScore: Math.max(0, Math.min(1, 1 - (v.distance / 100)))
      }));
    }
  }

  /**
   * Update vessel with precise route tracking coordinates and seller/buyer info
   */
  async updateVesselRouteAndCompanyInfo(vessel: Vessel): Promise<Vessel> {
    try {
      console.log(`Updating route and company info for vessel: ${vessel.name} (IMO: ${vessel.imo})`);
      
      // Initialize update object
      const vesselUpdate: Partial<Vessel> = {};
      
      // 1. Generate seller name if not present
      if (!vessel.sellerName) {
        vesselUpdate.sellerName = await this.generateSellerCompanyName(vessel);
      }
      
      // 2. Set buyer to "NA" if not present
      if (!vessel.buyerName) {
        vesselUpdate.buyerName = "NA";
      }
      
      // 3. Get port coordinates for departure and destination if available
      if (vessel.departurePort && !vessel.departureLat && !vessel.departureLng) {
        // Check if departure port exists in our database
        const ports = await storage.getPorts();
        const departurePort = ports.find(p => 
          p.name.toLowerCase() === vessel.departurePort?.toLowerCase()
        );
        
        if (departurePort) {
          vesselUpdate.departureLat = departurePort.lat;
          vesselUpdate.departureLng = departurePort.lng;
        }
      }
      
      if (vessel.destinationPort && !vessel.destinationLat && !vessel.destinationLng) {
        // Check if destination port exists in our database
        const ports = await storage.getPorts();
        const destinationPort = ports.find(p => 
          p.name.toLowerCase() === vessel.destinationPort?.toLowerCase()
        );
        
        if (destinationPort) {
          vesselUpdate.destinationLat = destinationPort.lat;
          vesselUpdate.destinationLng = destinationPort.lng;
        }
      }
      
      // Only update if we have changes
      if (Object.keys(vesselUpdate).length > 0) {
        const updatedVessel = await storage.updateVessel(vessel.id, vesselUpdate);
        return updatedVessel || vessel;
      }
      
      return vessel;
    } catch (error) {
      console.error("Error updating vessel route and company info:", error);
      return vessel; // Return original vessel if update fails
    }
  }
}

export const openaiService = new OpenAIService();