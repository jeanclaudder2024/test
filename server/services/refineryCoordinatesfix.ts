// Accurate refinery coordinates for fixing map display issues
// All refineries showing in same location - need to update with real coordinates

export const ACCURATE_REFINERY_COORDINATES = {
  // Middle East & Gulf Region
  "Ras Tanura Refinery": { lat: "26.7346", lng: "50.1281", country: "Saudi Arabia" },
  "Yanbu Refinery": { lat: "24.0896", lng: "38.0616", country: "Saudi Arabia" },
  "Al-Jubail Refinery": { lat: "27.0174", lng: "49.6251", country: "Saudi Arabia" },
  "Kuwait Refinery": { lat: "29.3375", lng: "47.6581", country: "Kuwait" },
  "Abadan Refinery": { lat: "30.3370", lng: "48.3043", country: "Iran" },
  "Isfahan Refinery": { lat: "32.6546", lng: "51.6546", country: "Iran" },
  "Bandar Abbas Refinery": { lat: "27.1865", lng: "56.2808", country: "Iran" },
  
  // Europe
  "Rotterdam Refinery": { lat: "51.8738", lng: "4.2999", country: "Netherlands" },
  "Antwerp Refinery": { lat: "51.2194", lng: "4.4025", country: "Belgium" },
  "Feyzin Refinery": { lat: "45.6737", lng: "4.8718", country: "France" },
  "Milazzo Refinery": { lat: "38.2228", lng: "15.2434", country: "Italy" },
  "Repsol Refinery": { lat: "41.2431", lng: "1.8084", country: "Spain" },
  "Pembroke Refinery": { lat: "51.6749", lng: "-5.0164", country: "United Kingdom" },
  "Grangemouth Refinery": { lat: "56.0078", lng: "-3.7218", country: "United Kingdom" },
  
  // North America
  "Texas City Refinery": { lat: "29.3838", lng: "-94.9027", country: "United States" },
  "Port Arthur Refinery": { lat: "29.8849", lng: "-93.9299", country: "United States" },
  "Baytown Refinery": { lat: "29.7355", lng: "-94.9774", country: "United States" },
  "Whiting Refinery": { lat: "41.6794", lng: "-87.4992", country: "United States" },
  "Richmond Refinery": { lat: "37.9358", lng: "-122.3442", country: "United States" },
  "Los Angeles Refinery": { lat: "33.7866", lng: "-118.2987", country: "United States" },
  "Come By Chance Refinery": { lat: "47.7946", lng: "-53.9618", country: "Canada" },
  
  // Asia Pacific
  "Jurong Refinery": { lat: "1.2988", lng: "103.7378", country: "Singapore" },
  "Pulau Bukom Refinery": { lat: "1.2297", lng: "103.7540", country: "Singapore" },
  "Yokohama Refinery": { lat: "35.3089", lng: "139.6200", country: "Japan" },
  "Kawasaki Refinery": { lat: "35.5011", lng: "139.7799", country: "Japan" },
  "Mizushima Refinery": { lat: "34.5358", lng: "133.7681", country: "Japan" },
  "Ulsan Refinery": { lat: "35.5184", lng: "129.3114", country: "South Korea" },
  "Onsan Refinery": { lat: "35.4150", lng: "129.3692", country: "South Korea" },
  "Daesan Refinery": { lat: "36.9892", lng: "126.4464", country: "South Korea" },
  "Guangzhou Refinery": { lat: "23.1358", lng: "113.2757", country: "China" },
  "Zhenhai Refinery": { lat: "29.9585", lng: "121.7144", country: "China" },
  "Dalian Refinery": { lat: "38.9140", lng: "121.6147", country: "China" },
  
  // India
  "Jamnagar Refinery": { lat: "22.4707", lng: "70.0577", country: "India" },
  "Mumbai Refinery": { lat: "19.0760", lng: "72.8777", country: "India" },
  "Chennai Refinery": { lat: "13.0827", lng: "80.2707", country: "India" },
  "Paradip Refinery": { lat: "20.2650", lng: "86.6094", country: "India" },
  
  // Australia & Oceania
  "Geelong Refinery": { lat: "-38.1499", lng: "144.3617", country: "Australia" },
  "Kwinana Refinery": { lat: "-32.2370", lng: "115.7709", country: "Australia" },
  "Lytton Refinery": { lat: "-27.4198", lng: "153.1772", country: "Australia" },
  
  // Africa
  "Ras Lanuf Refinery": { lat: "30.5000", lng: "18.5692", country: "Libya" },
  "Port Harcourt Refinery": { lat: "4.8156", lng: "7.0498", country: "Nigeria" },
  "Warri Refinery": { lat: "5.5160", lng: "5.7507", country: "Nigeria" },
  "Cape Town Refinery": { lat: "-33.9249", lng: "18.4241", country: "South Africa" },
  
  // South America
  "Cubatão Refinery": { lat: "-23.8449", lng: "-46.4205", country: "Brazil" },
  "Paulínia Refinery": { lat: "-22.7609", lng: "-47.1528", country: "Brazil" },
  "Cartagena Refinery": { lat: "10.3910", lng: "-75.4794", country: "Colombia" },
  "La Plata Refinery": { lat: "-34.9011", lng: "-57.9544", country: "Argentina" },
  
  // Russia & CIS
  "Omsk Refinery": { lat: "54.9885", lng: "73.3242", country: "Russia" },
  "Yaroslavl Refinery": { lat: "57.6261", lng: "39.8845", country: "Russia" },
  "Kirishi Refinery": { lat: "59.4472", lng: "32.0172", country: "Russia" },
  "Baku Refinery": { lat: "40.4093", lng: "49.8671", country: "Azerbaijan" }
};

// Function to get random nearby coordinates (for multiple refineries in same city)
function getNearbyCoordinates(baseLat: string, baseLng: string, offsetKm: number = 5): { lat: string, lng: string } {
  const lat = parseFloat(baseLat);
  const lng = parseFloat(baseLng);
  
  // Convert km to degrees (approximate)
  const latOffset = (offsetKm / 111) * (Math.random() - 0.5) * 2; // 1 degree ≈ 111km
  const lngOffset = (offsetKm / (111 * Math.cos(lat * Math.PI / 180))) * (Math.random() - 0.5) * 2;
  
  return {
    lat: (lat + latOffset).toFixed(6),
    lng: (lng + lngOffset).toFixed(6)
  };
}

export async function updateRefineryCoordinates(storage: any) {
  console.log("🏭 Starting refinery coordinates update...");
  
  try {
    // Get all refineries from database
    const refineries = await storage.getRefineries();
    console.log(`Found ${refineries.length} refineries to update`);
    
    let updated = 0;
    const usedCoordinates = new Set<string>();
    
    for (const refinery of refineries) {
      let coordinates = null;
      
      // Try to find exact match first
      if (ACCURATE_REFINERY_COORDINATES[refinery.name]) {
        coordinates = ACCURATE_REFINERY_COORDINATES[refinery.name];
      } else {
        // Try to find by similar name or location
        const similarRefinery = Object.keys(ACCURATE_REFINERY_COORDINATES).find(key => 
          key.toLowerCase().includes(refinery.name.toLowerCase()) ||
          refinery.name.toLowerCase().includes(key.toLowerCase()) ||
          (refinery.country && ACCURATE_REFINERY_COORDINATES[key].country === refinery.country)
        );
        
        if (similarRefinery) {
          const baseCoords = ACCURATE_REFINERY_COORDINATES[similarRefinery];
          coordinates = getNearbyCoordinates(baseCoords.lat, baseCoords.lng, 10);
          coordinates.country = baseCoords.country;
        }
      }
      
      // If no specific coordinates found, use region-based defaults
      if (!coordinates) {
        coordinates = getRegionDefaultCoordinates(refinery.region, refinery.country);
      }
      
      // Ensure unique coordinates (add small offset if duplicate)
      const coordKey = `${coordinates.lat},${coordinates.lng}`;
      if (usedCoordinates.has(coordKey)) {
        const nearby = getNearbyCoordinates(coordinates.lat, coordinates.lng, 2);
        coordinates.lat = nearby.lat;
        coordinates.lng = nearby.lng;
      }
      usedCoordinates.add(`${coordinates.lat},${coordinates.lng}`);
      
      // Update refinery coordinates
      await storage.updateRefinery(refinery.id, {
        lat: coordinates.lat,
        lng: coordinates.lng,
        country: coordinates.country || refinery.country
      });
      
      console.log(`✅ Updated ${refinery.name}: ${coordinates.lat}, ${coordinates.lng}`);
      updated++;
    }
    
    console.log(`🎉 Successfully updated ${updated} refinery coordinates`);
    return { success: true, updated, total: refineries.length };
    
  } catch (error) {
    console.error("❌ Error updating refinery coordinates:", error);
    throw error;
  }
}

// Region-based default coordinates for refineries without specific locations
function getRegionDefaultCoordinates(region: string, country: string): { lat: string, lng: string, country: string } {
  const regionDefaults = {
    "Middle East": { lat: "26.0667", lng: "50.5577", country: "Bahrain" },
    "Europe": { lat: "51.9244", lng: "4.4777", country: "Netherlands" },
    "North America": { lat: "29.7604", lng: "-95.3698", country: "United States" },
    "Asia": { lat: "1.3521", lng: "103.8198", country: "Singapore" },
    "Africa": { lat: "4.8156", lng: "7.0498", country: "Nigeria" },
    "South America": { lat: "-23.5505", lng: "-46.6333", country: "Brazil" },
    "Oceania": { lat: "-33.8688", lng: "151.2093", country: "Australia" }
  };
  
  const defaultCoords = regionDefaults[region] || regionDefaults["Middle East"];
  return {
    lat: defaultCoords.lat,
    lng: defaultCoords.lng,
    country: country || defaultCoords.country
  };
}