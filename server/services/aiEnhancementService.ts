import OpenAI from "openai";
import { Vessel, Port, Refinery } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Service to enhance maritime data with AI-generated details
export class AIEnhancementService {
  /**
   * Enhance a vessel with AI-generated data if needed
   */
  static async enhanceVesselData(vessel: Partial<Vessel>): Promise<Partial<Vessel>> {
    try {
      // Only enhance if the vessel has minimal data but valid coordinates
      if (vessel.currentLat && vessel.currentLng && vessel.name && vessel.name.trim() !== '') {
        const vesselName = vessel.name || 'Unknown Vessel';
        // Check what data is missing
        const missingFields = [];
        
        if (!vessel.cargoType) missingFields.push('cargoType');
        if (!vessel.flag) missingFields.push('flag');
        if (!vessel.vesselType) missingFields.push('vesselType');
        if (!vessel.built) missingFields.push('built');
        if (!vessel.deadweight) missingFields.push('deadweight');
        
        // If we have enough missing data to warrant an API call
        if (missingFields.length >= 2) {
          console.log(`Enhancing vessel data for ${vessel.name} with AI`);
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a maritime vessel database expert. Fill in the missing details for a vessel based on typical patterns for vessels with similar characteristics. Respond with ONLY a JSON object containing the requested fields.",
              },
              {
                role: "user",
                content: `I need realistic data for a vessel named "${vesselName}". Please provide a JSON object with these missing fields: ${missingFields.join(', ')}. The vessel is currently at coordinates ${vessel.currentLat || 0}, ${vessel.currentLng || 0}.`,
              },
            ],
            response_format: { type: "json_object" },
          });

          try {
            const content = response.choices[0].message.content || '{}';
            const enhancedData = JSON.parse(content);
            console.log(`Enhanced data for ${vessel.name}:`, enhancedData);
            
            // Merge the AI-enhanced data with existing vessel data
            return { ...vessel, ...enhancedData };
          } catch (error) {
            console.error("Failed to parse JSON from OpenAI response:", error);
            return vessel;
          }
        }
      }
      return vessel;
    } catch (error) {
      console.error(`AI enhancement error for vessel ${vessel.name}:`, error);
      return vessel;
    }
  }
  
  /**
   * Enhance a port with AI-generated data if needed
   */
  static async enhancePortData(port: Partial<Port>): Promise<Partial<Port>> {
    try {
      // Only enhance if the port has minimal data but valid coordinates
      if (port.lat && port.lng && port.name && port.name.trim() !== '') {
        const portName = port.name || 'Unknown Port';
        // Check what data is missing
        const missingFields = [];
        
        if (!port.type) missingFields.push('type');
        if (!port.status) missingFields.push('status');
        if (!port.capacity) missingFields.push('capacity');
        if (!port.description) missingFields.push('description');
        
        // If we have enough missing data to warrant an API call
        if (missingFields.length >= 2) {
          console.log(`Enhancing port data for ${port.name} with AI`);
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a maritime port database expert. Fill in the missing details for a port based on typical patterns for ports in the given country/region. Respond with ONLY a JSON object containing the requested fields.",
              },
              {
                role: "user",
                content: `I need realistic data for a port named "${portName}" in ${port.country || 'unknown country'}. Please provide a JSON object with these missing fields: ${missingFields.join(', ')}. The port is located at coordinates ${port.lat || 0}, ${port.lng || 0}.`,
              },
            ],
            response_format: { type: "json_object" },
          });

          try {
            const content = response.choices[0].message.content || '{}';
            const enhancedData = JSON.parse(content);
            console.log(`Enhanced data for ${port.name}:`, enhancedData);
            
            // Merge the AI-enhanced data with existing port data
            return { ...port, ...enhancedData };
          } catch (error) {
            console.error("Failed to parse JSON from OpenAI response:", error);
            return port;
          }
        }
      }
      return port;
    } catch (error) {
      console.error(`AI enhancement error for port ${port.name}:`, error);
      return port;
    }
  }
  
  /**
   * Enhance a refinery with AI-generated data if needed
   */
  static async enhanceRefineryData(refinery: Partial<Refinery>): Promise<Partial<Refinery>> {
    try {
      // Only enhance if the refinery has minimal data but valid coordinates
      if (refinery.lat && refinery.lng && refinery.name && refinery.name.trim() !== '') {
        const refineryName = refinery.name || 'Unknown Refinery';
        // Check what data is missing
        const missingFields = [];
        
        if (!refinery.operator) missingFields.push('operator');
        if (!refinery.status) missingFields.push('status');
        if (!refinery.capacity) missingFields.push('capacity');
        if (!refinery.products) missingFields.push('products');
        if (!refinery.type) missingFields.push('type');
        if (!refinery.description) missingFields.push('description');
        
        // If we have enough missing data to warrant an API call
        if (missingFields.length >= 3) {
          console.log(`Enhancing refinery data for ${refinery.name} with AI`);
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are an oil refinery database expert. Fill in the missing details for a refinery based on typical patterns for refineries in the given country/region. Respond with ONLY a JSON object containing the requested fields.",
              },
              {
                role: "user",
                content: `I need realistic data for a refinery named "${refineryName}" in ${refinery.country || 'unknown country'}. Please provide a JSON object with these missing fields: ${missingFields.join(', ')}. The refinery is located at coordinates ${refinery.lat || 0}, ${refinery.lng || 0}.`,
              },
            ],
            response_format: { type: "json_object" },
          });

          try {
            const content = response.choices[0].message.content || '{}';
            const enhancedData = JSON.parse(content);
            console.log(`Enhanced data for ${refinery.name}:`, enhancedData);
            
            // Merge the AI-enhanced data with existing refinery data
            return { ...refinery, ...enhancedData };
          } catch (error) {
            console.error("Failed to parse JSON from OpenAI response:", error);
            return refinery;
          }
        }
      }
      return refinery;
    } catch (error) {
      console.error(`AI enhancement error for refinery ${refinery.name}:`, error);
      return refinery;
    }
  }
}