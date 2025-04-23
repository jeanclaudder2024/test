import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate text completion using OpenAI
 * @param prompt The prompt to generate text from
 * @returns Generated text
 */
export async function generateWithOpenAI(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error("Error generating text with OpenAI:", error);
    throw new Error(`Failed to generate text with OpenAI: ${error.message}`);
  }
}

/**
 * Generate structured data using OpenAI
 * @param prompt The prompt for data generation
 * @param schema Description of the expected JSON structure
 * @returns Generated structured data as JSON
 */
export async function generateStructuredData<T>(prompt: string, schema: string): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a data generator API. Create valid JSON data based on the user's request. 
                   The response should follow this schema: ${schema}`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("Error generating structured data with OpenAI:", error);
    throw new Error(`Failed to generate structured data: ${error.message}`);
  }
}

/**
 * Generate shipping document using OpenAI
 * @param vesselData Vessel and cargo data for document generation
 * @param documentType Type of document to generate
 * @returns Generated document content
 */
export async function generateShippingDocument(
  vesselData: any,
  documentType: string
): Promise<string> {
  const prompt = `Generate a ${documentType} for the following vessel and cargo:
  
  Vessel Name: ${vesselData.name}
  IMO Number: ${vesselData.imo || 'N/A'}
  Vessel Type: ${vesselData.vesselType || 'Oil Tanker'}
  Flag: ${vesselData.flag || 'N/A'}
  
  Cargo Type: ${vesselData.cargoType || 'Crude Oil'}
  Cargo Volume: ${vesselData.cargoVolume || 'N/A'} tons
  
  Departure Port: ${vesselData.departurePort || 'N/A'}
  Destination Port: ${vesselData.destinationPort || 'N/A'}
  
  Current Date: ${new Date().toLocaleDateString()}
  
  Please create a professional and detailed ${documentType} that would be used in the oil shipping industry.
  Include all standard sections, clauses, terms and conditions typical for this document type.
  The document should be formatted professionally with clear sections.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert in creating oil shipping and trading documents. 
                    Generate a professional, detailed, and realistic ${documentType} based on the vessel and cargo information provided.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Document generation failed";
  } catch (error) {
    console.error("Error generating document with OpenAI:", error);
    throw new Error(`Failed to generate document: ${error.message}`);
  }
}

/**
 * Generate suggested trading actions based on market data
 * @param marketData Current market data including prices, trends
 * @returns Trading suggestions and analysis
 */
export async function generateTradingAnalysis(marketData: any): Promise<string> {
  const prompt = `Analyze the following oil market data and suggest trading strategies:
  
  Current Prices:
  ${Object.entries(marketData.prices || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
  
  Recent Trends:
  ${(marketData.trends || []).map(trend => `- ${trend}`).join('\n')}
  
  Market Events:
  ${(marketData.events || []).map(event => `- ${event}`).join('\n')}
  
  Please provide a concise analysis of the current market situation and suggest 2-3 specific trading strategies
  that could be profitable in the current conditions. Focus on oil trading specifically.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert oil trading analyst with decades of experience in the global oil markets.
                    Provide insightful analysis and actionable trading strategies based on the market data provided.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Analysis generation failed";
  } catch (error) {
    console.error("Error generating trading analysis with OpenAI:", error);
    throw new Error(`Failed to generate trading analysis: ${error.message}`);
  }
}

/**
 * Helper function to analyze vessel routes and suggest optimizations
 * @param vesselData Current vessel data including route info
 * @returns Route optimization suggestions
 */
export async function analyzeVesselRoute(vesselData: any): Promise<string> {
  const prompt = `Analyze the following vessel route and suggest optimizations:
  
  Vessel: ${vesselData.name} (${vesselData.vesselType || 'Oil Tanker'})
  Current Position: Lat ${vesselData.currentLat}, Lng ${vesselData.currentLng}
  Departure: ${vesselData.departurePort || 'Unknown'}
  Destination: ${vesselData.destinationPort || 'Unknown'}
  Cargo: ${vesselData.cargoType || 'Oil'}, ${vesselData.cargoVolume || 'Unknown'} tons
  
  Please analyze this route and suggest optimizations considering:
  1. Fuel efficiency
  2. Weather conditions
  3. Geopolitical factors
  4. Port congestion
  5. Regulatory considerations
  
  Provide specific actionable recommendations for optimizing this vessel's journey.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert maritime route planner with specialized knowledge in oil tanker logistics and optimization.
                    Provide practical and specific route optimization advice based on the vessel data provided.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "Route analysis failed";
  } catch (error) {
    console.error("Error analyzing vessel route with OpenAI:", error);
    throw new Error(`Failed to analyze vessel route: ${error.message}`);
  }
}

export const openaiService = {
  generateText: generateWithOpenAI,
  generateStructuredData,
  generateShippingDocument,
  generateTradingAnalysis,
  analyzeVesselRoute
};