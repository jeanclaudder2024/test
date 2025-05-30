import { Router } from 'express';
import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const vesselDataRouter = Router();

// Create an endpoint to generate vessel data using OpenAI
vesselDataRouter.post('/enhanced', async (req, res) => {
  try {
    const { vesselId, vesselType, vesselName, flag, region } = req.body;
    
    if (!vesselType || !vesselName || !flag || !region) {
      return res.status(400).json({ error: 'Missing required vessel information' });
    }
    
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

    // Return the generated data
    const generatedData = JSON.parse(response.choices[0].message.content);
    return res.json(generatedData);
    
  } catch (error: any) {
    console.error('Error generating vessel data:', error);
    
    // Return a fallback response with basic information
    return res.status(500).json({
      error: 'Failed to generate vessel data',
      fallbackData: {
        currentCargo: req.body.vesselType.includes("Tanker") ? "Crude Oil" : "General Cargo",
        cargoCapacity: req.body.vesselType.includes("Tanker") ? "80,000-120,000 DWT" : "10,000-50,000 TEU",
        ownerCompany: `${req.body.flag} Maritime Corporation`,
        yearBuilt: "2015-2020",
      }
    });
  }
});