import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate detailed refinery information based on basic inputs
 * @param refineryInfo - Basic refinery information to enhance
 * @returns Enhanced refinery information with AI-generated details
 */
export async function generateRefineryDetails(refineryInfo: {
  name: string;
  country: string;
  region: string;
  capacity?: number;
  type?: string;
}) {
  try {
    console.log("Generating refinery details using OpenAI for:", refineryInfo.name);
    
    // Create a detailed prompt for the AI
    const prompt = `
    Generate detailed and realistic information for an oil refinery with the following basic details:
    - Name: ${refineryInfo.name}
    - Country: ${refineryInfo.country}
    - Region: ${refineryInfo.region}
    ${refineryInfo.capacity ? `- Capacity: ${refineryInfo.capacity} barrels per day` : ''}
    ${refineryInfo.type ? `- Type: ${refineryInfo.type}` : ''}
    
    Please provide the following additional information in a JSON format:
    1. A comprehensive description of the refinery's operations, history, and significance (description)
    2. The refinery's owner company (owner)
    3. The operating company if different from owner (operator)
    4. A list of main products produced (products)
    5. The year the refinery was built (year_built)
    6. The refinery's complexity on a scale of 1.0-15.0 (complexity)
    7. The current utilization rate as a percentage (utilization)
    8. City where the refinery is located (city)
    9. Contact information including email and phone (email, phone)
    10. Website URL (website)
    11. Physical address (address)
    12. Technical specifications as a brief summary (technical_specs)
    
    Make sure all information is realistic, technically accurate for the oil industry, and appropriate for the refinery's location and region. Do not include any disclaimers or explanatory text in your response, just the JSON data.
    `;

    // Call OpenAI API to generate the details
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse and return the generated content
    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("Failed to generate refinery details: No content returned");
    }

    try {
      const parsedContent = JSON.parse(generatedContent);
      console.log("Successfully generated refinery details using OpenAI");
      return parsedContent;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Failed to parse generated refinery details");
    }
  } catch (error) {
    console.error("Error generating refinery details with OpenAI:", error);
    throw new Error(`Failed to generate refinery details: ${error.message}`);
  }
}

/**
 * Generate vessel information based on basic inputs
 * @param vesselInfo - Basic vessel information to enhance
 * @returns Enhanced vessel information with AI-generated details
 */
export async function generateVesselDetails(vesselInfo: {
  name: string;
  vesselType: string;
  flag: string;
}) {
  try {
    console.log("Generating vessel details using OpenAI for:", vesselInfo.name);
    
    // Create a detailed prompt for the AI
    const prompt = `
    Generate detailed and realistic information for a vessel with the following basic details:
    - Name: ${vesselInfo.name}
    - Vessel Type: ${vesselInfo.vesselType}
    - Flag: ${vesselInfo.flag}
    
    Please provide the following additional information in a JSON format:
    1. A realistic cargo type transported by this vessel (cargoType)
    2. Cargo capacity in tons (cargoCapacity)
    3. Year the vessel was built (built)
    4. Deadweight tonnage (deadweight)
    5. Current status - one of: AT_SEA, AT_PORT, LOADING, UNLOADING, AWAITING_ORDERS (status)
    6. Current speed in knots (speed)
    7. Buyer name for the cargo (buyerName)
    8. Seller name for the cargo (sellerName)
    
    Make sure all information is realistic, technically accurate for the shipping industry, and appropriate for the vessel type. Do not include any disclaimers or explanatory text in your response, just the JSON data.
    `;

    // Call OpenAI API to generate the details
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse and return the generated content
    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("Failed to generate vessel details: No content returned");
    }

    try {
      const parsedContent = JSON.parse(generatedContent);
      console.log("Successfully generated vessel details using OpenAI");
      return parsedContent;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Failed to parse generated vessel details");
    }
  } catch (error) {
    console.error("Error generating vessel details with OpenAI:", error);
    throw new Error(`Failed to generate vessel details: ${error.message}`);
  }
}

/**
 * Generate port information based on basic inputs
 * @param portInfo - Basic port information to enhance
 * @returns Enhanced port information with AI-generated details
 */
export async function generatePortDetails(portInfo: {
  name: string;
  country: string;
  region: string;
  type?: string;
}) {
  try {
    console.log("Generating port details using OpenAI for:", portInfo.name);
    
    // Create a detailed prompt for the AI
    const prompt = `
    Generate detailed and realistic information for a port with the following basic details:
    - Name: ${portInfo.name}
    - Country: ${portInfo.country}
    - Region: ${portInfo.region}
    ${portInfo.type ? `- Type: ${portInfo.type}` : ''}
    
    Please provide the following additional information in a JSON format:
    1. A comprehensive description of the port's operations, history, and significance (description)
    2. The port's handling capacity in tons per day (capacity)
    3. Current operational status - one of: active, maintenance, closed (status)
    
    Make sure all information is realistic, technically accurate for the maritime industry, and appropriate for the port's location and region. Do not include any disclaimers or explanatory text in your response, just the JSON data.
    `;

    // Call OpenAI API to generate the details
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse and return the generated content
    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("Failed to generate port details: No content returned");
    }

    try {
      const parsedContent = JSON.parse(generatedContent);
      console.log("Successfully generated port details using OpenAI");
      return parsedContent;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Failed to parse generated port details");
    }
  } catch (error) {
    console.error("Error generating port details with OpenAI:", error);
    throw new Error(`Failed to generate port details: ${error.message}`);
  }
}

export default {
  generateRefineryDetails,
  generateVesselDetails,
  generatePortDetails
};