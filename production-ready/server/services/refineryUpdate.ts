import { storage } from '../storage';
import { getAccurateRefineries } from './refineryCoordinates';
import { InsertRefinery } from '@shared/schema';

/**
 * Update refinery locations with accurate coordinates
 * This function will update all refineries in the database with more accurate coordinates
 */
export async function updateRefineryCoordinates(): Promise<{
  updated: number;
  total: number;
}> {
  // Get all existing refineries from the database
  const existingRefineries = await storage.getRefineries();
  console.log(`Found ${existingRefineries.length} refineries in database to check for updates`);

  // Get accurate refinery data
  const accurateRefineries = getAccurateRefineries();
  
  let updatedCount = 0;
  
  // For each accurate refinery, find a matching one in the database and update its coordinates
  const updatePromises = accurateRefineries.map(async (accurateRefinery) => {
    // Try to find a matching refinery by name and country
    const matchingRefinery = existingRefineries.find(
      (existing) => 
        existing.name.toLowerCase().includes(accurateRefinery.name.toLowerCase()) ||
        accurateRefinery.name.toLowerCase().includes(existing.name.toLowerCase())
    );
    
    if (matchingRefinery) {
      // Update the refinery coordinates and other accurate data
      const updated = await storage.updateRefinery(matchingRefinery.id, {
        lat: accurateRefinery.lat,
        lng: accurateRefinery.lng,
        country: accurateRefinery.country,
        status: accurateRefinery.status,
        capacity: accurateRefinery.capacity
      });
      
      if (updated) {
        updatedCount++;
        console.log(`Updated refinery coordinates for ${accurateRefinery.name}`);
      }
    }
  });
  
  // Wait for all updates to complete
  await Promise.all(updatePromises);
  
  console.log(`Updated coordinates for ${updatedCount} of ${existingRefineries.length} refineries`);
  return {
    updated: updatedCount,
    total: existingRefineries.length
  };
}

/**
 * Seed any missing refineries from the accurate list
 * This adds any refineries from our accurate dataset that are not already in the database
 */
export async function seedMissingRefineries(): Promise<{
  added: number;
}> {
  // Get all existing refineries from the database
  const existingRefineries = await storage.getRefineries();
  const existingNames = existingRefineries.map(r => r.name.toLowerCase());
  
  // Get accurate refinery data
  const accurateRefineries = getAccurateRefineries();
  
  // Filter for refineries that don't exist in the database
  const missingRefineries = accurateRefineries.filter(refinery => 
    !existingNames.some(name => 
      name.includes(refinery.name.toLowerCase()) || 
      refinery.name.toLowerCase().includes(name)
    )
  );
  
  console.log(`Found ${missingRefineries.length} new refineries to add to database`);
  
  // Create missing refineries in the database
  if (missingRefineries.length > 0) {
    const addedRefineries = await Promise.all(
      missingRefineries.map(refinery => {
        const newRefinery: InsertRefinery = {
          ...refinery,
        };
        // Add description field before creating the refinery
        return storage.createRefinery({
          ...newRefinery,
          description: `${refinery.name} is a major oil refinery located in ${refinery.country}. It has a capacity of ${Number(refinery.capacity).toLocaleString()} barrels per day.`
        });
      })
    );
    
    console.log(`Added ${addedRefineries.length} new refineries to database`);
    return { added: addedRefineries.length };
  }
  
  return { added: 0 };
}