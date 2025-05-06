import { storage } from "../storage";
import { InsertRefinery, Refinery } from "@shared/schema";
import { generateRefineryDataset } from "./refineryGenerator";

export const refineryService = {
  getAllRefineries: async () => {
    return storage.getRefineries();
  },

  getRefineryById: async (id: number) => {
    return storage.getRefineryById(id);
  },

  getRefineryByRegion: async (region: string) => {
    return storage.getRefineryByRegion(region);
  },

  createRefinery: async (refinery: InsertRefinery) => {
    return storage.createRefinery(refinery);
  },

  updateRefinery: async (id: number, refineryData: Partial<InsertRefinery>) => {
    return storage.updateRefinery(id, refineryData);
  },

  deleteRefinery: async (id: number) => {
    return storage.deleteRefinery(id);
  },
  
  // Get vessels near a refinery within a certain radius (in km)
  getVesselsNearRefinery: async (refineryId: number, radius: number = 20, limit: number = 12) => {
    try {
      // Get the refinery
      const refinery = await storage.getRefineryById(refineryId);
      if (!refinery) return [];
      
      // Get all vessels
      const allVessels = await storage.getVessels();
      
      // Calculate distance to all vessels and filter by radius
      // using Haversine formula to calculate distance between coordinates
      const nearbyVessels = allVessels
        .map(vessel => {
          if (!vessel.currentLat || !vessel.currentLng) return null;
          
          const vesselLat = typeof vessel.currentLat === 'string' ? parseFloat(vessel.currentLat) : vessel.currentLat;
          const vesselLng = typeof vessel.currentLng === 'string' ? parseFloat(vessel.currentLng) : vessel.currentLng;
          
          if (isNaN(vesselLat) || isNaN(vesselLng)) return null;
          
          // Calculate distance using Haversine formula
          const R = 6371; // Radius of the Earth in km
          const dLat = (vesselLat - Number(refinery.lat)) * Math.PI / 180;
          const dLon = (vesselLng - Number(refinery.lng)) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(Number(refinery.lat) * Math.PI / 180) * Math.cos(vesselLat * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c; // Distance in km
          
          return { vessel, distance };
        })
        .filter(item => item !== null && item.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
      
      return nearbyVessels;
    } catch (error) {
      console.error('Error fetching vessels near refinery:', error);
      return [];
    }
  },
  
  // Get/generate weather information for a refinery
  getRefineryWeather: async (refineryId: number) => {
    try {
      const refinery = await storage.getRefineryById(refineryId);
      if (!refinery) return null;
      
      // Check if we already have weather data stored and it's recent (less than 3 hours old)
      if (refinery.weatherInfo) {
        try {
          const weatherData = JSON.parse(refinery.weatherInfo);
          const lastUpdated = new Date(weatherData.lastUpdated);
          const now = new Date();
          
          // If weather data is less than 3 hours old, return it
          if ((now.getTime() - lastUpdated.getTime()) < 3 * 60 * 60 * 1000) {
            return weatherData;
          }
        } catch (e) {
          // Invalid JSON or other error, continue to fetch new data
        }
      }
      
      // For the current implementation, we'll generate realistic weather data
      // In a production app, you would integrate with a weather API
      const weatherData = {
        temperature: Math.round(15 + Math.random() * 20), // 15-35 C
        humidity: Math.round(40 + Math.random() * 40), // 40-80%
        windSpeed: Math.round(5 + Math.random() * 25), // 5-30 km/h
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm'][Math.floor(Math.random() * 6)],
        seaState: ['Calm', 'Smooth', 'Slight', 'Moderate', 'Rough', 'Very Rough'][Math.floor(Math.random() * 6)],
        waveHeight: (Math.random() * 3).toFixed(1), // 0-3m
        visibility: ['Excellent', 'Good', 'Moderate', 'Poor', 'Very Poor'][Math.floor(Math.random() * 5)],
        uvIndex: Math.floor(Math.random() * 11), // 0-10
        lastUpdated: new Date().toISOString()
      };
      
      // Store the weather data for future reference
      await storage.updateRefinery(refineryId, {
        weatherInfo: JSON.stringify(weatherData)
      });
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching refinery weather:', error);
      return null;
    }
  },
  
  // Generate AI insights for a refinery
  generateRefineryInsights: async (refineryId: number) => {
    try {
      // Import OpenAI in an on-demand way to avoid unnecessary initialization
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Fetch the refinery data
      const refinery = await storage.getRefineryById(refineryId);
      if (!refinery) return null;
      
      // Fetch nearby vessels for context
      const nearbyVessels = await refineryService.getVesselsNearRefinery(refineryId, 20, 8);
      
      // Get weather info
      const weatherData = await refineryService.getRefineryWeather(refineryId);
      
      // Format the context data
      const context = {
        refinery: {
          ...refinery,
          weather: weatherData
        },
        nearbyVessels: nearbyVessels.map(item => ({
          vessel: {
            name: item.vessel.name,
            vesselType: item.vessel.vesselType,
            flag: item.vessel.flag,
            cargoType: item.vessel.cargoType,
            cargoCapacity: item.vessel.cargoCapacity
          },
          distance: item.distance.toFixed(1)
        }))
      };
      
      // Prepare the prompt for OpenAI
      const prompt = `
      You are an expert oil industry analyst specializing in refinery operations.
      
      Analyze the following refinery data and provide professional insights about:
      1. Current operational status and efficiency
      2. Supply chain analysis based on nearby vessels
      3. Market conditions impact
      4. Recommendations for optimization
      5. Key risks and opportunities
      
      Provide your analysis in a concise, professional format suitable for a dashboard.
      
      REFINERY INFORMATION:
      ${JSON.stringify(context, null, 2)}
      
      Format the response as JSON with the following structure:
      {
        "summary": "Brief 1-2 sentence overview of the refinery status",
        "operational_insights": "Analysis of current operations and efficiency",
        "supply_chain_status": "Analysis of supply status based on nearby vessels",
        "market_impact": "How current market conditions might be impacting this refinery",
        "recommendations": "1-2 specific actionable recommendations",
        "risks": ["List of 2-3 key risks"],
        "opportunities": ["List of 2-3 key opportunities"]
      }
      `;
      
      // Call OpenAI for insights
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert oil industry analyst providing insights for a maritime intelligence platform." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Parse the response
      try {
        const insights = JSON.parse(response.choices[0].message.content);
        
        // Store the insights for future reference with a timestamp
        const insightsWithTimestamp = {
          ...insights,
          generated_at: new Date().toISOString()
        };
        
        return insightsWithTimestamp;
      } catch (e) {
        console.error('Error parsing OpenAI response:', e);
        return {
          summary: "Unable to generate insights at this time",
          error: "Data processing error",
          generated_at: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error generating refinery insights:', error);
      return {
        summary: "Unable to generate insights at this time",
        error: error instanceof Error ? error.message : "Unknown error",
        generated_at: new Date().toISOString()
      };
    }
  },

  // Seed data for development
  seedRefineryData: async () => {
    try {
      console.log("Checking existing refineries in database...");
      // First, get existing refineries
      const existingRefineries = await storage.getRefineries();
      
      // Check if we already have refineries in the database
      if (existingRefineries.length > 0) {
        console.log(`Database already contains ${existingRefineries.length} refineries.`);
        
        // Update stats
        const activeRefineries = existingRefineries.filter(r => r.status === 'operational').length;
        await storage.updateStats({ activeRefineries });
        
        return {
          refineries: existingRefineries.length,
          active: activeRefineries
        };
      }
      
      // Database empty, generate refineries from our dataset
      console.log("No refineries in database. Generating refinery data...");
      const refineries = generateRefineryDataset();
      console.log(`Generated ${refineries.length} refineries from dataset.`);
      
      // Create refineries
      const createdRefineries: Refinery[] = [];
      
      // Create a Set of keys to check for duplicates (name + country)
      const existingRefineryKeys = new Set();
      
      for (const refinery of refineries) {
        // Create a unique key for the refinery
        const refineryKey = `${refinery.name}|${refinery.country}`;
        
        // Skip if refinery already exists in this batch
        if (existingRefineryKeys.has(refineryKey)) {
          continue;
        }
        
        const created = await storage.createRefinery(refinery);
        createdRefineries.push(created);
        
        // Add to tracking Set to prevent adding duplicates in this batch
        existingRefineryKeys.add(refineryKey);
      }

      console.log(`Created ${createdRefineries.length} new refineries in database.`);

      // Update stats
      const activeRefineries = createdRefineries.filter(r => r.status === 'operational').length;
      await storage.updateStats({ activeRefineries });

      return {
        refineries: createdRefineries.length,
        active: activeRefineries
      };
    } catch (error) {
      console.error("Error seeding refinery data:", error);
      throw error;
    }
  }
};