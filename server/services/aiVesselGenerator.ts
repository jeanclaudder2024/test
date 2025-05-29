import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratedVesselData {
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number;
  deadweight: number;
  currentLat: string;
  currentLng: string;
  cargoType: string;
  cargoCapacity: number;
  speed: string;
  currentRegion: string;
  ownerName: string;
  operatorName: string;
  buyerName: string;
  sellerName: string;
  oilSource: string;
}

export async function generateRealisticVesselData(): Promise<GeneratedVesselData> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert maritime vessel data generator. Generate realistic oil tanker vessel data with authentic maritime industry details. Respond with JSON only in this exact format:

{
  "name": "realistic vessel name",
  "imo": "IMO followed by 7 digits",
  "mmsi": "9 digit MMSI number",
  "vesselType": "one of: Oil Tanker, Chemical Tanker, LNG Carrier, LPG Carrier, Product Tanker, Crude Oil Tanker",
  "flag": "realistic flag state like Panama, Liberia, Marshall Islands, Singapore, Malta",
  "built": year between 2000-2024,
  "deadweight": realistic tonnage between 30000-320000,
  "currentLat": "latitude as decimal string",
  "currentLng": "longitude as decimal string", 
  "cargoType": "one of: Crude Oil, Gasoline, Diesel, Fuel Oil, Kerosene, Naphtha, LNG, LPG",
  "cargoCapacity": realistic capacity based on deadweight,
  "speed": "speed in knots as string like 12.5",
  "currentRegion": "one of: persian-gulf, north-sea, mediterranean, caribbean, asia-pacific",
  "ownerName": "realistic oil company like Saudi Aramco, ExxonMobil, Shell, BP, Chevron, TotalEnergies",
  "operatorName": "realistic shipping company or same as owner",
  "buyerName": "realistic oil company or refinery",
  "sellerName": "realistic oil company or producer", 
  "oilSource": "realistic oil field or refinery name"
}`
        },
        {
          role: "user", 
          content: "Generate realistic oil vessel data for maritime operations"
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const generatedData = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and ensure all required fields are present
    const vesselData: GeneratedVesselData = {
      name: generatedData.name || `Tanker ${Math.floor(Math.random() * 1000)}`,
      imo: generatedData.imo || `IMO${Math.floor(1000000 + Math.random() * 9000000)}`,
      mmsi: generatedData.mmsi || Math.floor(100000000 + Math.random() * 900000000).toString(),
      vesselType: generatedData.vesselType || "Oil Tanker",
      flag: generatedData.flag || "Panama",
      built: generatedData.built || 2020,
      deadweight: generatedData.deadweight || 80000,
      currentLat: generatedData.currentLat || "25.276987",
      currentLng: generatedData.currentLng || "55.296249",
      cargoType: generatedData.cargoType || "Crude Oil",
      cargoCapacity: generatedData.cargoCapacity || 75000,
      speed: generatedData.speed || "14.2",
      currentRegion: generatedData.currentRegion || "persian-gulf",
      ownerName: generatedData.ownerName || "Saudi Aramco",
      operatorName: generatedData.operatorName || generatedData.ownerName || "Saudi Aramco",
      buyerName: generatedData.buyerName || "Shell Trading",
      sellerName: generatedData.sellerName || "Saudi Aramco",
      oilSource: generatedData.oilSource || "Ghawar Oil Field"
    };

    return vesselData;
  } catch (error) {
    console.error("Error generating AI vessel data:", error);
    
    // Return realistic fallback data if AI generation fails
    const fallbackData: GeneratedVesselData = {
      name: `Atlantic Voyager ${Math.floor(Math.random() * 100)}`,
      imo: `IMO${Math.floor(1000000 + Math.random() * 9000000)}`,
      mmsi: Math.floor(100000000 + Math.random() * 900000000).toString(),
      vesselType: "Oil Tanker",
      flag: "Panama",
      built: 2020,
      deadweight: 95000,
      currentLat: "25.276987",
      currentLng: "55.296249",
      cargoType: "Crude Oil",
      cargoCapacity: 90000,
      speed: "13.8",
      currentRegion: "persian-gulf",
      ownerName: "Saudi Aramco",
      operatorName: "Vela International Marine",
      buyerName: "Shell Trading",
      sellerName: "Saudi Aramco",
      oilSource: "Safaniya Oil Field"
    };

    return fallbackData;
  }
}