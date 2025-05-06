import OpenAI from "openai";
import { Refinery, InsertRefinery } from "@shared/schema";
import { db } from "../db";
import { refineries } from "@shared/schema";
import { eq } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define product types for refineries
const PRODUCT_TYPES = [
  "Crude Oil",
  "Gasoline",
  "Diesel",
  "Jet Fuel",
  "LPG",
  "Fuel Oil",
  "Lubricants",
  "Asphalt",
  "Petrochemicals",
  "Kerosene",
  "Naphtha"
];

const REFINERY_TYPES = [
  "Full Conversion",
  "Cracking",
  "Hydroskimming",
  "Topping",
  "Reforming",
  "Coking",
  "Integrated Petrochemical",
  "Specialty Products",
  "Export Terminal",
  "Oil Sands Processing"
];

interface RefineryEnhancement {
  operator?: string;
  owner?: string;
  type?: string;
  products?: string[];
  yearBuilt?: number;
  complexity?: number;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  technicalSpecs?: any;
  city?: string;
  description?: string;
}

// Combine refinery types carefully
interface EnhancedRefinery extends Omit<Refinery, keyof RefineryEnhancement>, RefineryEnhancement {}

class RefineryAIEnhancer {
  /**
   * Enhance a refinery with AI-generated details
   */
  async enhanceRefinery(refinery: Refinery): Promise<EnhancedRefinery> {
    console.log(`Enhancing refinery data for ${refinery.name} using OpenAI...`);
    
    try {
      const prompt = this.buildRefineryPrompt(refinery);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a petroleum industry expert with detailed knowledge of global refineries. Provide factual, realistic information about refineries based on their name, location, and capacity."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      // Handle null content case
      if (!content) {
        console.error(`Empty response from OpenAI for refinery ${refinery.name}`);
        return refinery;
      }
      
      try {
        const result = JSON.parse(content);
        console.log(`Successfully enhanced refinery: ${refinery.name}`);
        
        return {
          ...refinery,
          ...result
        };
      } catch (parseError) {
        console.error(`Failed to parse OpenAI response for refinery ${refinery.name}:`, parseError);
        return refinery;
      }
    } catch (error) {
      console.error(`Error enhancing refinery ${refinery.name}:`, error);
      // Return the original refinery if enhancement fails
      return refinery;
    }
  }
  
  /**
   * Build a prompt to gather realistic refinery details
   */
  private buildRefineryPrompt(refinery: Refinery): string {
    return `
      Generate realistic, detailed information for the following refinery:
      
      Name: ${refinery.name}
      Country: ${refinery.country}
      Region: ${refinery.region}
      Capacity: ${refinery.capacity?.toLocaleString() || 'Unknown'} barrels per day
      
      Based on this information, please provide a JSON object with the following fields:
      - operator: The company that operates this refinery
      - owner: The company that owns this refinery (may be the same as operator)
      - type: The refinery type (e.g. "Full Conversion", "Cracking", "Hydroskimming", etc.)
      - products: An array of primary products this refinery produces
      - yearBuilt: A realistic year when this refinery was originally commissioned
      - complexity: A Nelson Complexity Index value (1.0-15.0)
      - email: A realistic contact email for the refinery
      - phone: A realistic contact phone number for the refinery
      - website: A realistic website URL for the refinery
      - address: A detailed address for the refinery
      - city: The city where the refinery is located
      - technicalSpecs: A JSON object containing at least 5 technical specifications
      - description: A detailed 2-3 paragraph description of the refinery, including history and significance
      
      Follow these guidelines:
      1. Make the information realistic and plausible without being exact data from a real refinery
      2. Include mention of recent upgrades or expansions where appropriate
      3. For technical specifications, include details on processing units, storage capacity, etc.
      4. Products should reflect what would typically be produced at a refinery of this size and location
      5. For the complexity index, higher values (8-15) indicate more complex refineries with more conversion units
      
      Return ONLY a valid JSON object with no additional text.
    `;
  }
  
  /**
   * Enhance multiple refineries and update them in the database
   */
  async enhanceAndUpdateRefineries(refineryIds: number[]): Promise<EnhancedRefinery[]> {
    const enhancedRefineries: EnhancedRefinery[] = [];
    
    for (const refineryId of refineryIds) {
      // Fetch refinery from database
      const [refinery] = await db.select().from(refineries).where(eq(refineries.id, refineryId));
      
      if (!refinery) {
        console.error(`Refinery with ID ${refineryId} not found`);
        continue;
      }
      
      // Enhance refinery with AI-generated data
      const enhancedRefinery = await this.enhanceRefinery(refinery);
      
      // Update the refinery in the database
      const productsString = enhancedRefinery.products ? JSON.stringify(enhancedRefinery.products) : null;
      const techSpecsString = enhancedRefinery.technicalSpecs ? JSON.stringify(enhancedRefinery.technicalSpecs) : null;
      
      await db.update(refineries)
        .set({
          operator: enhancedRefinery.operator || null,
          owner: enhancedRefinery.owner || null,
          type: enhancedRefinery.type || null,
          products: productsString,
          yearBuilt: enhancedRefinery.yearBuilt || null,
          complexity: enhancedRefinery.complexity ? enhancedRefinery.complexity.toString() : null,
          email: enhancedRefinery.email || null,
          phone: enhancedRefinery.phone || null,
          website: enhancedRefinery.website || null,
          address: enhancedRefinery.address || null,
          technicalSpecs: techSpecsString,
          city: enhancedRefinery.city || null,
          description: enhancedRefinery.description || refinery.description,
          lastUpdated: new Date()
        })
        .where(eq(refineries.id, refineryId));
      
      enhancedRefineries.push(enhancedRefinery);
    }
    
    return enhancedRefineries;
  }
  
  /**
   * Get connected ports for a refinery 
   */
  async generatePortConnections(refineryId: number): Promise<any[]> {
    // This would normally fetch connections from the database
    // For this implementation, it could be extended to create connections if none exist
    const [refinery] = await db.select().from(refineries).where(eq(refineries.id, refineryId));
    
    if (!refinery) {
      return [];
    }
    
    // Implement logic to find or generate port connections
    // Could use OpenAI to suggest logical port connections
    return [];
  }
}

export const refineryAIEnhancer = new RefineryAIEnhancer();