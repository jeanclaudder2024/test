import OpenAI from "openai";
import { Vessel, Refinery } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to safely parse JSON from OpenAI response
function safeJsonParse(response: any) {
  try {
    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    return {};
  }
}

/**
 * Get AI insights about a vessel's route, cargo, and estimated times
 * @param vessel The vessel to analyze
 * @returns AI-generated insights about the vessel
 */
export async function getVesselInsights(vessel: Vessel): Promise<{
  routeAnalysis: string;
  cargoInsights: string;
  eta: string;
  recommendations: string[];
}> {
  try {
    const prompt = `
      Analyze this oil vessel data and provide detailed maritime insights:
      Vessel Name: ${vessel.name}
      IMO: ${vessel.imo}
      Type: ${vessel.vesselType}
      Flag: ${vessel.flag}
      Cargo Type: ${vessel.cargoType ?? "Unknown"}
      Cargo Capacity: ${vessel.cargoCapacity ?? "Unknown"}
      Current Position: ${vessel.currentLat ?? "Unknown"}, ${vessel.currentLng ?? "Unknown"}
      Current Region: ${vessel.currentRegion ?? "Unknown"}
      Departure Port: ${vessel.departurePort ?? "Unknown"} (${vessel.departureDate ?? "Unknown"})
      Destination Port: ${vessel.destinationPort ?? "Unknown"}
      ETA: ${vessel.eta ?? "Unknown"}
      
      Please provide the following insights in a structured JSON format:
      1. routeAnalysis: A detailed analysis of the vessel's route including maritime considerations
      2. cargoInsights: Analysis of the cargo type, capacity, and market relevance
      3. eta: A more refined ETA prediction (if possible) or explanation of factors affecting ETA
      4. recommendations: An array of 3-5 actionable recommendations for optimizing this vessel's journey
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a maritime intelligence expert with deep knowledge of global shipping, oil transportation, and maritime regulations. Provide factual, data-driven insights about vessels. Format your response as JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      routeAnalysis: result.routeAnalysis || "Analysis not available",
      cargoInsights: result.cargoInsights || "Insights not available",
      eta: result.eta || vessel.eta || "Unknown",
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    console.error("Error generating vessel insights:", error);
    return {
      routeAnalysis: "Unable to generate route analysis at this time.",
      cargoInsights: "Unable to generate cargo insights at this time.",
      eta: vessel.eta || "Unknown",
      recommendations: ["Check vessel data and try again later."],
    };
  }
}

/**
 * Get AI insights about a refinery's operations, capacity, and market position
 * @param refinery The refinery to analyze
 * @returns AI-generated insights about the refinery
 */
export async function getRefineryInsights(refinery: Refinery): Promise<{
  operationalAnalysis: string;
  marketPosition: string;
  regionImportance: string;
  recommendations: string[];
}> {
  try {
    const prompt = `
      Analyze this oil refinery data and provide detailed insights:
      Refinery Name: ${refinery.name}
      Country: ${refinery.country}
      Region: ${refinery.region}
      Status: ${refinery.status}
      Capacity: ${refinery.capacity ?? "Unknown"} barrels per day
      Coordinates: ${refinery.lat ?? "Unknown"}, ${refinery.lng ?? "Unknown"}
      
      Please provide the following insights in a structured JSON format:
      1. operationalAnalysis: Analysis of the refinery's operational status and capacity in the global context
      2. marketPosition: Assessment of the refinery's market position and significance
      3. regionImportance: Analysis of the refinery's importance in its specific region
      4. recommendations: An array of 3-5 actionable recommendations for optimizing this refinery's operations
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a petroleum industry expert with deep knowledge of global oil refining, energy markets, and regional economics. Provide factual, data-driven insights about refineries. Format your response as JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      operationalAnalysis: result.operationalAnalysis || "Analysis not available",
      marketPosition: result.marketPosition || "Analysis not available",
      regionImportance: result.regionImportance || "Analysis not available",
      recommendations: result.recommendations || [],
    };
  } catch (error) {
    console.error("Error generating refinery insights:", error);
    return {
      operationalAnalysis: "Unable to generate operational analysis at this time.",
      marketPosition: "Unable to generate market position analysis at this time.",
      regionImportance: "Unable to generate regional importance analysis at this time.",
      recommendations: ["Check refinery data and try again later."],
    };
  }
}

/**
 * Get AI-powered market analysis and predictions for global oil shipping
 * @param vessels Array of vessels to consider in the analysis
 * @param refineries Array of refineries to consider in the analysis
 * @returns AI-generated market analysis and predictions
 */
export async function getMarketAnalysis(vessels: Vessel[], refineries: Refinery[]): Promise<{
  marketTrends: string;
  supplyDemand: string;
  regionalHotspots: string[];
  predictions: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
}> {
  try {
    // Count vessels by region
    const vesselsByRegion: Record<string, number> = {};
    vessels.forEach((vessel) => {
      const region = vessel.currentRegion || "Unknown";
      vesselsByRegion[region] = (vesselsByRegion[region] || 0) + 1;
    });

    // Count refineries by region and status
    const refineryStats: Record<string, { total: number; operational: number; capacity: number }> = {};
    refineries.forEach((refinery) => {
      const region = refinery.region;
      if (!refineryStats[region]) {
        refineryStats[region] = { total: 0, operational: 0, capacity: 0 };
      }
      refineryStats[region].total += 1;
      if (refinery.status === "operational") {
        refineryStats[region].operational += 1;
      }
      refineryStats[region].capacity += refinery.capacity || 0;
    });

    const prompt = `
      Analyze the global oil shipping market based on this data:
      
      Vessel Distribution by Region:
      ${Object.entries(vesselsByRegion)
        .map(([region, count]) => `${region}: ${count} vessels`)
        .join("\n")}
      
      Refinery Distribution by Region:
      ${Object.entries(refineryStats)
        .map(([region, stats]) => 
          `${region}: ${stats.total} refineries (${stats.operational} operational, ${Math.round(stats.capacity/1000).toLocaleString()}k bpd capacity)`)
        .join("\n")}
      
      Total Vessels: ${vessels.length}
      Total Refineries: ${refineries.length}
      Operational Refineries: ${refineries.filter(r => r.status === "operational").length}
      
      Please provide the following analysis in a structured JSON format:
      1. marketTrends: Analysis of current market trends in global oil shipping
      2. supplyDemand: Assessment of global supply and demand balance
      3. regionalHotspots: Array of 3-5 regions with significant activity or disruptions
      4. predictions: Object with shortTerm, mediumTerm, and longTerm market predictions
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a global energy market analyst with expertise in oil transportation, trading, and geopolitics of energy. Provide factual, data-driven insights about the global oil shipping market. Format your response as JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      marketTrends: result.marketTrends || "Analysis not available",
      supplyDemand: result.supplyDemand || "Analysis not available",
      regionalHotspots: result.regionalHotspots || [],
      predictions: {
        shortTerm: result.predictions?.shortTerm || "Prediction not available",
        mediumTerm: result.predictions?.mediumTerm || "Prediction not available",
        longTerm: result.predictions?.longTerm || "Prediction not available",
      },
    };
  } catch (error) {
    console.error("Error generating market analysis:", error);
    return {
      marketTrends: "Unable to generate market trends analysis at this time.",
      supplyDemand: "Unable to generate supply and demand analysis at this time.",
      regionalHotspots: ["Analysis not available"],
      predictions: {
        shortTerm: "Unable to generate short-term predictions at this time.",
        mediumTerm: "Unable to generate medium-term predictions at this time.",
        longTerm: "Unable to generate long-term predictions at this time.",
      },
    };
  }
}

/**
 * Get AI-generated recommendations for vessel routing optimization
 * @param vessel The vessel to optimize routing for
 * @returns AI-generated routing optimization recommendations
 */
export async function getRoutingOptimization(vessel: Vessel): Promise<{
  optimalRoute: string;
  estimatedFuelSavings: string;
  estimatedTimeReduction: string;
  considerations: string[];
  routeVisualization: string;
}> {
  try {
    const prompt = `
      Analyze this oil vessel for route optimization:
      Vessel Name: ${vessel.name}
      IMO: ${vessel.imo}
      Type: ${vessel.vesselType}
      Flag: ${vessel.flag}
      Cargo Type: ${vessel.cargoType || "Unknown"}
      Current Position: ${vessel.currentLat}, ${vessel.currentLng}
      Current Region: ${vessel.currentRegion}
      Departure Port: ${vessel.departurePort || "Unknown"} (${vessel.departureDate || "Unknown"})
      Destination Port: ${vessel.destinationPort || "Unknown"}
      ETA: ${vessel.eta || "Unknown"}
      
      Please provide the following optimization recommendations in a structured JSON format:
      1. optimalRoute: Detailed description of the recommended optimal route
      2. estimatedFuelSavings: Estimate of potential fuel savings with the optimized route
      3. estimatedTimeReduction: Estimate of potential time savings with the optimized route
      4. considerations: Array of important considerations for this specific route (weather, piracy, geopolitical)
      5. routeVisualization: Text description of how the optimized route would look on a map
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a maritime route optimization expert with deep knowledge of global shipping lanes, weather patterns, geopolitical risk zones, and fuel efficiency calculations. Provide factual, data-driven recommendations for vessel routing. Format your response as JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      optimalRoute: result.optimalRoute || "Route optimization not available",
      estimatedFuelSavings: result.estimatedFuelSavings || "Estimate not available",
      estimatedTimeReduction: result.estimatedTimeReduction || "Estimate not available",
      considerations: result.considerations || [],
      routeVisualization: result.routeVisualization || "Visualization not available",
    };
  } catch (error) {
    console.error("Error generating routing optimization:", error);
    return {
      optimalRoute: "Unable to generate route optimization at this time.",
      estimatedFuelSavings: "Unable to estimate fuel savings at this time.",
      estimatedTimeReduction: "Unable to estimate time reduction at this time.",
      considerations: ["Check vessel data and try again later."],
      routeVisualization: "Unable to generate route visualization at this time.",
    };
  }
}

/**
 * Generate an answer to a natural language query about maritime shipping
 * @param query The user's natural language query
 * @param vessels Optional array of vessels to provide context
 * @param refineries Optional array of refineries to provide context
 * @returns AI-generated answer to the query
 */
export async function answerMaritimeQuery(
  query: string,
  vessels?: Vessel[],
  refineries?: Refinery[]
): Promise<{
  answer: string;
  relatedEntities?: Array<{ type: "vessel" | "refinery"; id: number; name: string }>;
}> {
  try {
    let contextStr = "";
    
    if (vessels && vessels.length > 0) {
      contextStr += "Available Vessels:\n";
      vessels.slice(0, 10).forEach((vessel) => {
        contextStr += `- ${vessel.name} (ID: ${vessel.id}): ${vessel.vesselType} vessel carrying ${vessel.cargoType || "unknown cargo"}, currently in ${vessel.currentRegion || "unknown region"}\n`;
      });
      if (vessels.length > 10) {
        contextStr += `...and ${vessels.length - 10} more vessels\n`;
      }
    }
    
    if (refineries && refineries.length > 0) {
      contextStr += "\nAvailable Refineries:\n";
      refineries.slice(0, 10).forEach((refinery) => {
        contextStr += `- ${refinery.name} (ID: ${refinery.id}): ${refinery.status} refinery in ${refinery.country}, ${refinery.region} with ${refinery.capacity?.toLocaleString() || "unknown"} bpd capacity\n`;
      });
      if (refineries.length > 10) {
        contextStr += `...and ${refineries.length - 10} more refineries\n`;
      }
    }

    const prompt = `
      User Query: "${query}"
      
      ${contextStr}
      
      Based on the user's query and the available maritime data, provide a comprehensive answer.
      If the query relates to specific vessels or refineries that are included in the context,
      include their IDs in the relatedEntities array.
      
      Format your response as a JSON object with these properties:
      1. answer: A detailed, informative answer to the user's query
      2. relatedEntities: (Optional) An array of objects with 'type' (vessel or refinery), 'id', and 'name' for any entities specifically relevant to the query
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a maritime intelligence assistant with expertise in global shipping, oil transportation, refining, and energy markets. Provide helpful, factual information in response to user queries. Format your response as JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      answer: result.answer || "I'm unable to answer that question at the moment.",
      relatedEntities: result.relatedEntities || [],
    };
  } catch (error) {
    console.error("Error answering maritime query:", error);
    return {
      answer: "I'm sorry, I'm unable to process your question at the moment. Please try again later.",
    };
  }
}

/**
 * Generate a dynamic AI dashboard with insights about the current state of global shipping
 * @param vessels Array of vessels to analyze
 * @param refineries Array of refineries to analyze 
 * @returns AI-generated dashboard insights
 */
export async function generateAIDashboard(vessels: Vessel[], refineries: Refinery[]): Promise<{
  headline: string;
  summary: string;
  keyInsights: string[];
  marketMovers: Array<{
    type: "vessel" | "refinery" | "region";
    name: string;
    impact: "positive" | "negative" | "neutral";
    reason: string;
  }>;
  riskAssessment: Array<{
    region: string;
    risk: "high" | "medium" | "low";
    factors: string[];
  }>;
}> {
  try {
    // Count vessels by region and cargo type
    const vesselsByRegion: Record<string, number> = {};
    const vesselsByCargoType: Record<string, number> = {};
    
    vessels.forEach((vessel) => {
      const region = vessel.currentRegion || "Unknown";
      vesselsByRegion[region] = (vesselsByRegion[region] || 0) + 1;
      
      const cargoType = vessel.cargoType || "Unknown";
      vesselsByCargoType[cargoType] = (vesselsByCargoType[cargoType] || 0) + 1;
    });

    // Count refineries by region and status
    const refineryStats: Record<string, { total: number; operational: number; maintenance: number; offline: number }> = {};
    
    refineries.forEach((refinery) => {
      const region = refinery.region;
      if (!refineryStats[region]) {
        refineryStats[region] = { total: 0, operational: 0, maintenance: 0, offline: 0 };
      }
      refineryStats[region].total += 1;
      
      if (refinery.status === "operational") {
        refineryStats[region].operational += 1;
      } else if (refinery.status === "maintenance") {
        refineryStats[region].maintenance += 1;
      } else if (refinery.status === "offline") {
        refineryStats[region].offline += 1;
      }
    });

    const prompt = `
      Generate a dynamic AI dashboard for global oil shipping based on this data:
      
      Vessel Distribution by Region:
      ${Object.entries(vesselsByRegion)
        .map(([region, count]) => `${region}: ${count} vessels`)
        .join("\n")}
      
      Vessel Distribution by Cargo Type:
      ${Object.entries(vesselsByCargoType)
        .map(([type, count]) => `${type}: ${count} vessels`)
        .join("\n")}
      
      Refinery Distribution by Region:
      ${Object.entries(refineryStats)
        .map(([region, stats]) => 
          `${region}: ${stats.total} refineries (${stats.operational} operational, ${stats.maintenance} in maintenance, ${stats.offline} offline)`)
        .join("\n")}
      
      Total Vessels: ${vessels.length}
      Total Refineries: ${refineries.length}
      
      Using this data, generate a comprehensive dashboard with the following components in JSON format:
      1. headline: A headline summarizing the most important current insight
      2. summary: A brief summary of the global oil shipping situation
      3. keyInsights: An array of 3-5 key insights derived from the data
      4. marketMovers: An array of 3-5 objects identifying vessels, refineries, or regions that are having significant market impact
      5. riskAssessment: An array of 3-5 objects identifying regions with varying levels of risk
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a maritime intelligence dashboard that provides real-time insights about global oil shipping. Analyze patterns in vessel and refinery data to identify trends, risks, and opportunities. Format your response as JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      headline: result.headline || "Global Oil Shipping Dashboard",
      summary: result.summary || "Dashboard summary not available",
      keyInsights: result.keyInsights || ["No key insights available"],
      marketMovers: result.marketMovers || [],
      riskAssessment: result.riskAssessment || [],
    };
  } catch (error) {
    console.error("Error generating AI dashboard:", error);
    return {
      headline: "Global Oil Shipping Dashboard",
      summary: "Unable to generate dashboard summary at this time.",
      keyInsights: ["Dashboard generation failed. Please try again later."],
      marketMovers: [],
      riskAssessment: [],
    };
  }
}

// Export all functions as part of the openAIService
export const openAIService = {
  getVesselInsights,
  getRefineryInsights,
  getMarketAnalysis,
  getRoutingOptimization,
  answerMaritimeQuery,
  generateAIDashboard,
};

export default openAIService;