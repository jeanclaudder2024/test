import { db } from "../db";
import { documents, vessels } from "@shared/schema";
import { count, eq } from "drizzle-orm";
import { generateVesselDocuments } from "./generate-vessel-documents";

/**
 * Generate sample documents for vessels in the database
 */
export async function seedVesselDocuments(minDocuments: number = 10): Promise<{
  count: number;
  seeded: boolean;
}> {
  console.log("Starting vessel document seeding...");
  
  // Check if we already have documents in the database
  const existingDocs = await db.select({ count: count() }).from(documents);
  const existingCount = existingDocs[0].count;
  
  if (existingCount > 0) {
    console.log(`Database already contains ${existingCount} vessel documents.`);
    
    // If we have fewer than the minimum documents, generate more using AI
    if (existingCount < minDocuments) {
      console.log(`Generating more documents with AI to reach minimum of ${minDocuments}...`);
      try {
        const result = await generateVesselDocuments(minDocuments);
        return { count: result.count, seeded: result.generated > 0 };
      } catch (error) {
        console.error("Error generating additional documents:", error);
        return { count: existingCount, seeded: false };
      }
    }
    
    return { count: existingCount, seeded: false };
  }
  
  // If no documents exist, use the AI generator to create them
  try {
    console.log("No documents found. Using AI to generate professional vessel documents...");
    const result = await generateVesselDocuments(minDocuments);
    return { count: result.count, seeded: result.generated > 0 };
  } catch (error) {
    console.error("Error generating vessel documents with AI:", error);
    
    // If AI generation fails, we have no documents
    console.log("AI generation failed. No documents were created.");
    return { count: 0, seeded: false };
  }
}