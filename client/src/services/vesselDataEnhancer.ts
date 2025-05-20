import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Types for vessel data
export interface VesselEnhancedData {
  currentCargo?: string;
  cargoCapacity?: string;
  estArrivalDate?: string;
  estDepartureDate?: string;
  voyageNotes?: string;
  captain?: string;
  ownerCompany?: string;
  yearBuilt?: string;
  previousVoyages?: string[];
  technicalSpecifications?: {
    propulsionType?: string;
    enginePower?: string;
    maxSpeed?: string;
    fuelType?: string;
  };
  safetyRating?: string;
  isTracked?: boolean;
}

/**
 * Uses OpenAI to generate realistic vessel data for vessels with missing information
 * @param vesselType The type of vessel (e.g. "Oil Tanker", "Container Ship")
 * @param vesselName The name of the vessel
 * @param flag The flag country of the vessel
 * @param region The current region of the vessel
 * @returns Enhanced vessel data
 */
export async function generateVesselData(
  vesselType: string,
  vesselName: string,
  flag: string,
  region: string
): Promise<VesselEnhancedData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a maritime vessel data expert. Generate realistic vessel information based on the provided details."
        },
        {
          role: "user",
          content: `Generate realistic vessel data for ${vesselName}, a ${vesselType} flying the ${flag} flag, currently in the ${region} region. Provide information like current cargo, cargo capacity, estimated arrival/departure dates, voyage notes, captain's name, owner company, technical specifications, etc. Ensure the data is realistic for this vessel type and region. Format as JSON.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    // Parse and return the generated data
    return JSON.parse(response.choices[0].message.content) as VesselEnhancedData;
  } catch (error) {
    console.error("Error generating vessel data:", error);
    // Return basic fallback data if generation fails
    return {
      currentCargo: vesselType.includes("Tanker") ? "Crude Oil" : "General Cargo",
      cargoCapacity: vesselType.includes("Tanker") ? "80,000-120,000 DWT" : "10,000-50,000 TEU",
      ownerCompany: `${flag} Maritime Corporation`,
      yearBuilt: "2015-2020",
    };
  }
}

// Cache for storing generated vessel data to avoid repeated API calls
const vesselDataCache = new Map<number, VesselEnhancedData>();

/**
 * Gets enhanced data for a vessel, either from cache or by generating new data
 */
export async function getEnhancedVesselData(
  vesselId: number,
  vesselType: string,
  vesselName: string,
  flag: string,
  region: string
): Promise<VesselEnhancedData> {
  // Check if data exists in cache
  if (vesselDataCache.has(vesselId)) {
    return vesselDataCache.get(vesselId)!;
  }
  
  // Generate new data
  const data = await generateVesselData(vesselType, vesselName, flag, region);
  
  // Store in cache
  vesselDataCache.set(vesselId, data);
  
  return data;
}