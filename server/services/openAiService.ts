import OpenAI from "openai";
import { Vessel } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * OpenAI service for generating AI responses and analyzing data
 */
export const openAiService = {
  /**
   * Generate a response about vessel data using OpenAI
   * @param query User query about vessels or shipping
   * @param vessels Context data about relevant vessels
   * @returns AI-generated response
   */
  async analyzeVesselsData(query: string, vessels: Vessel[]): Promise<string> {
    try {
      const vesselContext = vessels.slice(0, 5).map(v => ({
        id: v.id,
        name: v.name,
        imo: v.imo,
        vesselType: v.vesselType,
        flag: v.flag,
        currentRegion: v.currentRegion,
        cargoType: v.cargoType,
        cargoCapacity: v.cargoCapacity,
        departurePort: v.departurePort,
        destinationPort: v.destinationPort,
        position: {
          lat: v.currentLat ? parseFloat(v.currentLat) : null,
          lng: v.currentLng ? parseFloat(v.currentLng) : null
        }
      }));

      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a maritime intelligence assistant specializing in oil shipping vessels and logistics. 
            You provide concise, informative insights about vessels, their cargo, and shipping patterns.
            Be professional but conversational. Provide factual information only based on the vessel data provided.
            If you don't know something, say so clearly. Support your answers with data when available.
            Respond in the same language as the user's query.`
          },
          {
            role: "user",
            content: `Here is data about some oil vessels: ${JSON.stringify(vesselContext)}
            My question is: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate an analysis at this time.";
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      return `Error: ${error.message || "Unknown error occurred"}`;
    }
  },

  /**
   * Generate vessel journey analysis and predictions
   * @param vessel The vessel to analyze
   * @returns Analysis of the vessel's journey and predictions
   */
  async analyzeVesselJourney(vessel: Vessel): Promise<{ analysis: string, predictions: string, risks: string }> {
    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a maritime intelligence AI that specializes in analyzing vessel journeys, 
            predicting potential issues, and identifying shipping risks.
            Format your response as a JSON object with three properties:
            1. analysis: A detailed analysis of the vessel's current journey
            2. predictions: Predictions about arrival times, weather impacts, and other journey factors
            3. risks: Potential risks or issues that could affect this journey
            
            Base your analysis only on the vessel data provided. Use your maritime knowledge to 
            make reasonable inferences, but clearly state when you're making assumptions.`
          },
          {
            role: "user",
            content: `Analyze this vessel's journey: ${JSON.stringify({
              id: vessel.id,
              name: vessel.name,
              imo: vessel.imo,
              vesselType: vessel.vesselType,
              flag: vessel.flag,
              currentRegion: vessel.currentRegion,
              cargoType: vessel.cargoType,
              cargoCapacity: vessel.cargoCapacity,
              departurePort: vessel.departurePort,
              departureDate: vessel.departureDate,
              destinationPort: vessel.destinationPort,
              eta: vessel.eta,
              position: {
                lat: vessel.currentLat ? parseFloat(vessel.currentLat) : null,
                lng: vessel.currentLng ? parseFloat(vessel.currentLng) : null
              }
            })}`
          }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        analysis: result.analysis || "No analysis available",
        predictions: result.predictions || "No predictions available",
        risks: result.risks || "No risk assessment available"
      };
    } catch (error: any) {
      console.error("OpenAI journey analysis error:", error);
      return {
        analysis: `Error analyzing journey: ${error.message}`,
        predictions: "Predictions unavailable due to an error",
        risks: "Risk assessment unavailable due to an error"
      };
    }
  },

  /**
   * Generate recommendations for optimizing shipping routes
   * @param vessel The vessel to generate recommendations for
   * @param includeWeather Whether to include weather considerations
   * @returns Recommendations for route optimization
   */
  async generateRouteRecommendations(vessel: Vessel, includeWeather: boolean = true): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a maritime route optimization expert. Generate practical recommendations
            for optimizing the route of an oil vessel based on its current position, destination, and cargo.
            ${includeWeather ? "Include weather considerations in your analysis." : ""}
            Be specific and practical. Focus on efficiency, safety, and cost-effectiveness.
            Provide 3-5 actionable recommendations.`
          },
          {
            role: "user",
            content: `Generate route optimization recommendations for this vessel: ${JSON.stringify({
              name: vessel.name,
              imo: vessel.imo,
              vesselType: vessel.vesselType,
              cargoType: vessel.cargoType,
              departurePort: vessel.departurePort,
              destinationPort: vessel.destinationPort,
              currentRegion: vessel.currentRegion,
              position: { 
                lat: vessel.currentLat ? parseFloat(vessel.currentLat) : null, 
                lng: vessel.currentLng ? parseFloat(vessel.currentLng) : null 
              }
            })}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || "No recommendations available at this time.";
    } catch (error: any) {
      console.error("OpenAI route recommendations error:", error);
      return `Error generating route recommendations: ${error.message}`;
    }
  },

  /**
   * Generate a vessel inspection report
   * @param vessel The vessel to generate a report for
   * @returns Generated inspection report
   */
  async generateInspectionReport(vessel: Vessel): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a vessel inspection expert. Generate a detailed but concise
            vessel inspection report based on the vessel information provided. 
            Include sections on:
            1. Vessel identification and basic information
            2. Hull condition assessment
            3. Machinery and equipment evaluation
            4. Safety systems and compliance check
            5. Cargo systems inspection
            6. Recommendations
            
            Format the report professionally with clear sections and headers.
            Be specific and realistic based on the vessel type and cargo.`
          },
          {
            role: "user",
            content: `Generate an inspection report for: ${JSON.stringify({
              name: vessel.name,
              imo: vessel.imo,
              mmsi: vessel.mmsi,
              vesselType: vessel.vesselType,
              flag: vessel.flag,
              built: vessel.built,
              deadweight: vessel.deadweight,
              cargoType: vessel.cargoType,
              cargoCapacity: vessel.cargoCapacity
            })}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      return response.choices[0].message.content || "Unable to generate inspection report.";
    } catch (error: any) {
      console.error("OpenAI inspection report error:", error);
      return `Error generating inspection report: ${error.message}`;
    }
  },
  
  /**
   * Generate a general AI response to a user query
   * @param prompt The full prompt with user query and context
   * @returns AI-generated response
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a maritime oil vessel tracking platform.
            You provide helpful, accurate, and concise information about vessels, refineries,
            shipping routes, and oil logistics. Be professional but conversational.
            If you don't know something, say so clearly and suggest what information would help.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
    } catch (error: any) {
      console.error("OpenAI general response error:", error);
      return `Error generating response: ${error.message}`;
    }
  }
};