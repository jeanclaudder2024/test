import axios from 'axios';
import { db } from '../db';
import { refineries, InsertRefinery, Refinery } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from '../storage';
import { openaiService } from './openaiService';

// Real-world refinery data by region
const REAL_REFINERIES = [
  // North America
  {
    name: "Baytown Refinery",
    country: "United States",
    region: "North America",
    lat: 29.7544,
    lng: -95.0107,
    capacity: 560500,
    status: "operational",
    description: "ExxonMobil's Baytown Refinery is the largest refinery in the United States, processing approximately 560,500 barrels of crude oil per day. Located in Baytown, Texas, it was established in 1919 and is part of a major industrial complex that includes petrochemical plants."
  },
  {
    name: "Garyville Refinery",
    country: "United States",
    region: "North America",
    lat: 30.0869,
    lng: -90.6295,
    capacity: 564000,
    status: "operational",
    description: "Marathon Petroleum's Garyville Refinery in Louisiana is one of the largest refineries in the United States with a crude oil processing capacity of approximately 564,000 barrels per day. It produces a variety of petroleum products including gasoline, diesel fuel, jet fuel, and asphalt."
  },
  {
    name: "Port Arthur Refinery",
    country: "United States",
    region: "North America",
    lat: 29.8957,
    lng: -93.9604,
    capacity: 603000,
    status: "operational",
    description: "Motiva Enterprises' Port Arthur Refinery in Texas is the largest refinery in North America, with a crude oil processing capacity of 603,000 barrels per day. It produces conventional gasoline, commercial aviation fuel, ultra-low sulfur diesel, and more."
  },
  {
    name: "Deer Park Refinery",
    country: "United States",
    region: "North America",
    lat: 29.7211,
    lng: -95.1290,
    capacity: 275000,
    status: "operational",
    description: "Shell's Deer Park Refinery in Texas has a crude oil processing capacity of approximately 275,000 barrels per day. Located on a 1,500-acre site along the Houston Ship Channel, it has been in operation since 1929."
  },
  {
    name: "Irving Oil Refinery",
    country: "Canada",
    region: "North America", 
    lat: 45.2452,
    lng: -66.1361,
    capacity: 320000,
    status: "operational",
    description: "Irving Oil Refinery in Saint John, New Brunswick is Canada's largest refinery with a capacity of 320,000 barrels per day. It is also the largest refinery in Canada, supplying products to markets throughout Eastern Canada and the Northeastern United States."
  },
  
  // Europe
  {
    name: "Rotterdam Refinery",
    country: "Netherlands",
    region: "Europe",
    lat: 51.8972,
    lng: 4.2773,
    capacity: 404000,
    status: "operational",
    description: "Shell's Rotterdam Refinery is one of the largest refineries in Europe with a capacity of 404,000 barrels per day. Located in the port of Rotterdam, it produces a wide range of products including fuels, chemicals, and lubricants."
  },
  {
    name: "Pernis Refinery",
    country: "Netherlands",
    region: "Europe",
    lat: 51.8867,
    lng: 4.3272,
    capacity: 416000,
    status: "operational",
    description: "The Shell Pernis Refinery in Rotterdam is the largest refinery in Europe, processing 416,000 barrels of crude oil per day. It produces a wide range of petroleum products and also has integrated chemical manufacturing facilities."
  },
  {
    name: "Antwerp Refinery",
    country: "Belgium",
    region: "Europe",
    lat: 51.2743,
    lng: 4.3058,
    capacity: 413000,
    status: "operational",
    description: "The Total Antwerp Refinery in Belgium has a crude oil processing capacity of approximately 413,000 barrels per day. It is one of the most complex refineries in Europe, with high conversion capability."
  },
  {
    name: "Płock Refinery",
    country: "Poland",
    region: "Europe",
    lat: 52.5548,
    lng: 19.6468,
    capacity: 327000,
    status: "operational",
    description: "The PKN Orlen Płock Refinery is the largest refinery in Poland with a capacity of 327,000 barrels per day. It processes crude oil primarily from Russia and produces a wide range of petroleum products."
  },
  {
    name: "Rheinland Refinery",
    country: "Germany",
    region: "Europe",
    lat: 50.9548,
    lng: 6.6725,
    capacity: 327000,
    status: "operational",
    description: "The Shell Rheinland Refinery in Germany is one of the largest refineries in Europe with a capacity of 327,000 barrels per day. Located in Cologne, it consists of two sites, Godorf and Wesseling, connected by pipelines."
  },
  
  // Asia-Pacific
  {
    name: "Jamnagar Refinery",
    country: "India",
    region: "Asia-Pacific",
    lat: 22.2000,
    lng: 69.0833,
    capacity: 1240000,
    status: "operational",
    description: "Reliance Industries' Jamnagar Refinery in Gujarat, India is the largest refining complex in the world with a combined capacity of 1.24 million barrels per day across two refineries. It was constructed in 2000 and expanded in 2008."
  },
  {
    name: "Ulsan Refinery",
    country: "South Korea",
    region: "Asia-Pacific",
    lat: 35.5039,
    lng: 129.3672,
    capacity: 817000,
    status: "operational",
    description: "SK Energy's Ulsan Refinery in South Korea is one of the largest refineries in Asia with a capacity of 817,000 barrels per day. It produces a variety of petroleum products including gasoline, diesel, jet fuel, and petrochemicals."
  },
  {
    name: "Mailiao Refinery",
    country: "Taiwan",
    region: "Asia-Pacific",
    lat: 23.7969,
    lng: 120.1839,
    capacity: 540000,
    status: "operational",
    description: "Formosa Petrochemical's Mailiao Refinery in Taiwan has a crude oil processing capacity of 540,000 barrels per day. It is part of a major petrochemical complex that integrates refining with petrochemical production."
  },
  {
    name: "Negishi Refinery",
    country: "Japan",
    region: "Asia-Pacific",
    lat: 35.4325,
    lng: 139.6419,
    capacity: 270000,
    status: "operational",
    description: "JXTG Nippon Oil & Energy's Negishi Refinery in Yokohama, Japan has a crude oil processing capacity of 270,000 barrels per day. It is one of the major refineries in Japan, producing a wide range of petroleum products."
  },
  {
    name: "Zhenhai Refinery",
    country: "China",
    region: "Asia-Pacific",
    lat: 29.9668,
    lng: 121.7196,
    capacity: 460000,
    status: "operational",
    description: "Sinopec's Zhenhai Refinery in Ningbo, China has a crude oil processing capacity of 460,000 barrels per day. It is one of the largest and most technologically advanced refineries in China, producing a wide range of petroleum products and petrochemicals."
  },
  
  // Middle East
  {
    name: "Ras Tanura Refinery",
    country: "Saudi Arabia",
    region: "Middle East",
    lat: 26.6444,
    lng: 50.1520,
    capacity: 550000,
    status: "operational",
    description: "Saudi Aramco's Ras Tanura Refinery in Saudi Arabia has a crude oil processing capacity of approximately 550,000 barrels per day. It is one of the oldest and largest refineries in the Middle East, situated along the Persian Gulf."
  },
  {
    name: "Ruwais Refinery",
    country: "United Arab Emirates",
    region: "Middle East",
    lat: 24.1102,
    lng: 52.7306,
    capacity: 817000,
    status: "operational",
    description: "ADNOC's Ruwais Refinery in the UAE is one of the largest refineries in the world with a capacity of 817,000 barrels per day after its expansion in 2015. It processes mainly Murban crude oil produced in the UAE."
  },
  {
    name: "Abadan Refinery",
    country: "Iran",
    region: "Middle East",
    lat: 30.3358,
    lng: 48.2934,
    capacity: 400000,
    status: "operational",
    description: "The Abadan Refinery in Iran is one of the oldest and largest refineries in the Middle East, with a current capacity of approximately 400,000 barrels per day. It was established in 1912 and has played a significant role in Iran's petroleum industry."
  },
  {
    name: "Mina Al-Ahmadi Refinery",
    country: "Kuwait",
    region: "Middle East",
    lat: 29.0758,
    lng: 48.1443,
    capacity: 466000,
    status: "operational",
    description: "Kuwait National Petroleum Company's Mina Al-Ahmadi Refinery has a crude oil processing capacity of 466,000 barrels per day. It is one of Kuwait's three refineries, located on the coast of the Arabian Gulf."
  },
  {
    name: "Yanbu Refinery",
    country: "Saudi Arabia",
    region: "Middle East",
    lat: 23.9609,
    lng: 38.2192,
    capacity: 400000,
    status: "operational",
    description: "Saudi Aramco's Yanbu Refinery in Saudi Arabia has a crude oil processing capacity of approximately 400,000 barrels per day. Located on the Red Sea coast, it plays a strategic role in supplying petroleum products to European and Mediterranean markets."
  },
  
  // Latin America
  {
    name: "Paulínia Refinery (REPLAN)",
    country: "Brazil",
    region: "Latin America",
    lat: -22.7569,
    lng: -47.1350,
    capacity: 415000,
    status: "operational",
    description: "Petrobras' Paulínia Refinery (REPLAN) in São Paulo, Brazil is the largest refinery in Brazil with a capacity of 415,000 barrels per day. It produces a wide range of petroleum products including gasoline, diesel, jet fuel, and liquefied petroleum gas."
  },
  {
    name: "Amuay Refinery",
    country: "Venezuela",
    region: "Latin America",
    lat: 11.7500,
    lng: -70.1833,
    capacity: 645000,
    status: "maintenance",
    description: "PDVSA's Amuay Refinery in Venezuela is part of the Paraguaná Refinery Complex, the second-largest refinery complex in the world. It has a design capacity of 645,000 barrels per day, but currently operates at reduced capacity due to maintenance issues and equipment failures."
  },
  {
    name: "Cartagena Refinery",
    country: "Colombia",
    region: "Latin America",
    lat: 10.3333,
    lng: -75.5000,
    capacity: 165000,
    status: "operational",
    description: "Ecopetrol's Cartagena Refinery in Colombia has a crude oil processing capacity of 165,000 barrels per day after its modernization and expansion project completed in 2015. It produces a variety of fuels including gasoline, diesel, and jet fuel."
  },
  {
    name: "Tula Refinery",
    country: "Mexico",
    region: "Latin America",
    lat: 20.0500,
    lng: -99.3333,
    capacity: 315000,
    status: "operational",
    description: "Pemex's Tula Refinery in Mexico has a crude oil processing capacity of approximately 315,000 barrels per day. Located in the state of Hidalgo, it is one of Mexico's six refineries, producing various petroleum products."
  },
  {
    name: "La Plata Refinery",
    country: "Argentina",
    region: "Latin America",
    lat: -34.8736,
    lng: -57.9089,
    capacity: 189000,
    status: "operational",
    description: "YPF's La Plata Refinery in Argentina has a crude oil processing capacity of 189,000 barrels per day. It is one of the largest refineries in Argentina, producing a variety of petroleum products including gasoline, diesel, and jet fuel."
  },
  
  // Africa
  {
    name: "Skikda Refinery",
    country: "Algeria",
    region: "Africa",
    lat: 36.8667,
    lng: 6.9000,
    capacity: 335000,
    status: "operational",
    description: "Sonatrach's Skikda Refinery in Algeria has a crude oil processing capacity of approximately 335,000 barrels per day. It is one of Algeria's largest refineries, producing a wide range of petroleum products."
  },
  {
    name: "Cairo Refinery",
    country: "Egypt",
    region: "Africa",
    lat: 30.0531,
    lng: 31.2272,
    capacity: 145000,
    status: "operational",
    description: "The Cairo Refinery in Egypt has a crude oil processing capacity of approximately 145,000 barrels per day. It is operated by the Egyptian General Petroleum Corporation (EGPC) and produces various petroleum products for the domestic market."
  },
  {
    name: "Sapref Refinery",
    country: "South Africa",
    region: "Africa",
    lat: -29.9533,
    lng: 30.9772,
    capacity: 180000,
    status: "operational",
    description: "The Sapref Refinery in Durban, South Africa is the largest crude oil refinery in South Africa with a capacity of 180,000 barrels per day. It is a joint venture between Shell and BP, producing a variety of petroleum products."
  },
  {
    name: "Pointe-Noire Refinery",
    country: "Republic of Congo",
    region: "Africa",
    lat: -4.7889,
    lng: 11.8636,
    capacity: 21000,
    status: "maintenance",
    description: "The Pointe-Noire Refinery in the Republic of Congo has a crude oil processing capacity of 21,000 barrels per day. It is operated by the Congolaise de Raffinage (CORAF) and supplies petroleum products to the domestic market."
  },
  {
    name: "Port Harcourt Refinery",
    country: "Nigeria",
    region: "Africa",
    lat: 4.8156,
    lng: 7.0498,
    capacity: 210000,
    status: "maintenance",
    description: "The Port Harcourt Refinery in Nigeria has a combined crude oil processing capacity of 210,000 barrels per day across its two refining complexes. It is operated by the Nigerian National Petroleum Corporation (NNPC) and is currently undergoing rehabilitation."
  }
];

/**
 * Service for managing refinery data
 */
export class RefineryDataService {
  /**
   * Seed the database with real-world refinery data
   */
  async seedRealRefineryData() {
    try {
      // Check if we already have refineries in the database
      const existingRefineries = await db.select().from(refineries);
      
      if (existingRefineries.length > 0) {
        console.log(`Database already contains ${existingRefineries.length} refineries. Clearing them first.`);
        // Delete all existing refineries
        await db.delete(refineries);
      }
      
      // Insert real refinery data
      const insertedRefineries = [];
      for (const refinery of REAL_REFINERIES) {
        const insertedRefinery = await storage.createRefinery({
          name: refinery.name,
          country: refinery.country,
          region: refinery.region,
          lat: refinery.lat.toString(),
          lng: refinery.lng.toString(),
          capacity: refinery.capacity,
          status: refinery.status,
          description: refinery.description
        });
        
        insertedRefineries.push(insertedRefinery);
      }
      
      console.log(`Successfully seeded ${insertedRefineries.length} real-world refineries`);
      return insertedRefineries;
    } catch (error) {
      console.error("Error seeding refinery data:", error);
      throw new Error("Failed to seed refinery data");
    }
  }
  
  /**
   * Generate additional refinery data using AI if needed
   */
  async generateRefineryDescription(refinery: InsertRefinery): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.log("OpenAI API key not set, using default description");
        return `${refinery.name} is a petroleum refinery located in ${refinery.country} with a processing capacity of ${refinery.capacity} barrels per day.`;
      }
      
      // Create a refinery object with the same structure as the database refinery
      const refineryObj: Refinery = {
        id: 0, // Temporary ID
        name: refinery.name,
        country: refinery.country,
        region: refinery.region,
        lat: refinery.lat,
        lng: refinery.lng,
        capacity: Number(refinery.capacity),
        status: refinery.status || "operational",
        description: ""
      };
      
      // Try to use the openaiService to generate the description
      try {
        const description = await openaiService.generateRefineryDescription(refineryObj);
        return description;
      } catch (error) {
        console.log("Error using openaiService to generate description, using fallback");
        return `${refinery.name} is a petroleum refinery located in ${refinery.country} with a processing capacity of ${refinery.capacity} barrels per day.`;
      }
    } catch (error) {
      console.error("Error generating refinery description with OpenAI:", error);
      return `${refinery.name} is a petroleum refinery located in ${refinery.country} with a processing capacity of ${refinery.capacity} barrels per day.`;
    }
  }
}

export const refineryDataService = new RefineryDataService();