import OpenAI from "openai";

// Initialize OpenAI with API key from environment variables
if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generate text completion using OpenAI
 * @param prompt The prompt to generate text from
 * @returns Generated text
 */
export async function generateWithOpenAI(prompt: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("OpenAI text generation error:", errorMessage);
    throw new Error(`Failed to generate text with OpenAI: ${errorMessage}`);
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
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are a data generation assistant. Generate data according to this schema: ${schema}. 
                    Respond ONLY with valid JSON matching this schema, with no additional text.` 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    return JSON.parse(response.choices[0].message.content || "{}") as T;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("OpenAI structured data generation error:", errorMessage);
    throw new Error(`Failed to generate structured data: ${errorMessage}`);
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
  try {
    const prompt = `
      Generate a professional ${documentType} document for a vessel with the following details:
      Vessel Name: ${vesselData.name || 'Unnamed Vessel'}
      Vessel Type: ${vesselData.vesselType || 'Oil Tanker'}
      Current Location: ${vesselData.currentPort || 'Unknown Port'}
      Cargo Type: ${vesselData.cargoType || 'Crude Oil'}
      Cargo Volume: ${vesselData.cargoVolume || '100,000'} metric tons
      Destination: ${vesselData.destination || 'Unknown Destination'}
      ETA: ${vesselData.eta || 'Unknown'}
      
      The document should be detailed, formal, and follow standard shipping industry formats for ${documentType} documents.
      Include all necessary legal clauses, terms, and conditions appropriate for this type of document.
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional shipping document generator with expertise in maritime law and shipping regulations." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Error generating document";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("OpenAI document generation error:", errorMessage);
    
    // Provide a more specific error
    throw new Error(`Failed to generate ${documentType} document: ${errorMessage}`);
  }
}

/**
 * Generate suggested trading actions based on market data
 * @param marketData Current market data including prices, trends
 * @returns Trading suggestions and analysis
 */
export async function generateTradingAnalysis(marketData: any): Promise<string> {
  try {
    // Format the market data for the prompt
    const formattedPrices = marketData.prices.map((price: any) => 
      `${price.name}: $${price.price} (${price.change > 0 ? '+' : ''}${price.changePercent}%)`
    ).join('\n');
    
    const formattedTrends = marketData.trends?.map((trend: { name: string; description: string }) => 
      `- ${trend.name}: ${trend.description}`
    ).join('\n') || 'No trend data available';
    
    const formattedEvents = marketData.events?.map((event: { date: string; description: string }) => 
      `- ${event.date}: ${event.description}`
    ).join('\n') || 'No event data available';
    
    const prompt = `
      Analyze the following oil market data and suggest trading actions:
      
      CURRENT PRICES:
      ${formattedPrices}
      
      MARKET TRENDS:
      ${formattedTrends}
      
      RECENT MARKET EVENTS:
      ${formattedEvents}
      
      Please provide:
      1. A concise market analysis (2-3 paragraphs)
      2. Specific trading recommendations (buy/sell/hold) for each oil type
      3. Risk assessment for each recommendation (low/medium/high)
      4. Short-term outlook (1-2 weeks)
      5. Medium-term outlook (1-3 months)
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert oil market analyst with deep knowledge of global oil markets, geopolitics, and trading strategies." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    return response.choices[0].message.content || "Unable to generate analysis";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("OpenAI trading analysis error:", errorMessage);
    throw new Error(`Failed to generate trading analysis: ${errorMessage}`);
  }
}

/**
 * Helper function to analyze vessel routes and suggest optimizations
 * @param vesselData Current vessel data including route info
 * @returns Route optimization suggestions
 */
export async function analyzeVesselRoute(vesselData: any): Promise<string> {
  try {
    // Format the vessel data for the prompt
    const prompt = `
      Analyze the following vessel route and suggest optimizations:
      
      VESSEL INFORMATION:
      Vessel Name: ${vesselData.name || 'Unknown'}
      Vessel Type: ${vesselData.vesselType || 'Oil Tanker'}
      Current Position: ${vesselData.currentLat || 0}, ${vesselData.currentLng || 0}
      Current Region: ${vesselData.currentRegion || 'Unknown'}
      
      ROUTE INFORMATION:
      Origin: ${vesselData.originPort || 'Unknown'}
      Destination: ${vesselData.destination || 'Unknown'}
      Distance: ${vesselData.distance || 'Unknown'} nautical miles
      ETA: ${vesselData.eta || 'Unknown'}
      
      WEATHER AND SEA CONDITIONS:
      ${vesselData.weatherConditions || 'Standard weather conditions'}
      
      CARGO INFORMATION:
      Cargo Type: ${vesselData.cargoType || 'Crude Oil'}
      Cargo Volume: ${vesselData.cargoVolume || 'Unknown'} metric tons
      
      Please provide:
      1. Route efficiency analysis
      2. Specific optimization suggestions
      3. Estimated fuel savings
      4. Recommended speed adjustments
      5. Weather routing considerations
      6. Potential ETA improvements
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a maritime routing expert with knowledge of global shipping routes, weather patterns, and vessel efficiency optimization." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1200,
    });

    return response.choices[0].message.content || "Unable to analyze route";
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("OpenAI route analysis error:", errorMessage);
    throw new Error(`Failed to analyze vessel route: ${errorMessage}`);
  }
}

// Export methods as a service object
export const openaiService = {
  generateText: generateWithOpenAI,
  generateStructuredData,
  generateShippingDocument,
  generateTradingAnalysis,
  analyzeVesselRoute
};