// This file contains accurate refinery coordinates for oil refineries worldwide
// These coordinates are based on real location data to correct the map display

import { Refinery, Vessel, Port } from '@shared/schema';

export type RefineryData = {
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  capacity: number;
  status: string;
};

// Middle East Refineries
const MIDDLE_EAST_REFINERIES: RefineryData[] = [
  {
    name: "Ruwais Refinery",
    country: "United Arab Emirates",
    region: "middle-east",
    lat: 24.1175,
    lng: 52.7300,
    capacity: 817000,
    status: "operational",
  },
  {
    name: "Al-Zour Refinery",
    country: "Kuwait",
    region: "middle-east",
    lat: 28.7325,
    lng: 48.3832,
    capacity: 615000,
    status: "operational",
  },
  {
    name: "Ras Tanura Refinery",
    country: "Saudi Arabia",
    region: "middle-east",
    lat: 26.6444,
    lng: 50.1642,
    capacity: 550000,
    status: "operational",
  },
  {
    name: "Mina Al-Ahmadi Refinery",
    country: "Kuwait",
    region: "middle-east",
    lat: 29.0758,
    lng: 48.1302,
    capacity: 466000,
    status: "operational",
  },
  {
    name: "Yanbu SAMREF Refinery",
    country: "Saudi Arabia",
    region: "middle-east",
    lat: 24.0889,
    lng: 38.0639,
    capacity: 400000,
    status: "operational",
  },
  {
    name: "Jubail SATORP Refinery",
    country: "Saudi Arabia",
    region: "middle-east",
    lat: 27.0114,
    lng: 49.5867,
    capacity: 400000,
    status: "operational",
  },
  {
    name: "Jazan Refinery",
    country: "Saudi Arabia",
    region: "middle-east",
    lat: 16.9128,
    lng: 42.5719,
    capacity: 400000,
    status: "operational",
  },
  {
    name: "Abadan Refinery",
    country: "Iran",
    region: "middle-east",
    lat: 30.3392,
    lng: 48.2809,
    capacity: 400000,
    status: "operational",
  },
  {
    name: "Duqm Refinery",
    country: "Oman",
    region: "middle-east",
    lat: 19.6658,
    lng: 57.7047,
    capacity: 230000,
    status: "operational",
  },
  {
    name: "Ras Laffan Refinery",
    country: "Qatar",
    region: "middle-east",
    lat: 25.9055, 
    lng: 51.5868,
    capacity: 292000,
    status: "operational",
  }
];

// North Africa Refineries
const NORTH_AFRICA_REFINERIES: RefineryData[] = [
  {
    name: "Skikda Refinery",
    country: "Algeria",
    region: "north-africa",
    lat: 36.8764,
    lng: 6.9061,
    capacity: 300000,
    status: "operational",
  },
  {
    name: "Ras Lanuf Refinery",
    country: "Libya",
    region: "north-africa",
    lat: 30.5000,
    lng: 18.5333,
    capacity: 220000,
    status: "offline",
  },
  {
    name: "Zawiya Refinery",
    country: "Libya",
    region: "north-africa",
    lat: 32.7505,
    lng: 12.7281,
    capacity: 120000,
    status: "maintenance",
  },
  {
    name: "Suez Refinery",
    country: "Egypt",
    region: "north-africa",
    lat: 29.9668,
    lng: 32.5498,
    capacity: 146000,
    status: "operational",
  },
  {
    name: "MIDOR Refinery",
    country: "Egypt",
    region: "north-africa",
    lat: 31.0667,
    lng: 29.7500,
    capacity: 100000,
    status: "operational",
  },
  {
    name: "Samir Refinery",
    country: "Morocco",
    region: "north-africa",
    lat: 33.6835,
    lng: -7.3857,
    capacity: 200000,
    status: "operational",
  }
];

// Western Europe Refineries
const WESTERN_EUROPE_REFINERIES: RefineryData[] = [
  {
    name: "Shell Pernis Refinery",
    country: "Netherlands",
    region: "western-europe",
    lat: 51.8852,
    lng: 4.3860,
    capacity: 416000,
    status: "operational",
  },
  {
    name: "BP Rotterdam Refinery",
    country: "Netherlands",
    region: "western-europe",
    lat: 51.9225,
    lng: 4.4792,
    capacity: 400000,
    status: "operational",
  },
  {
    name: "Total Antwerp Refinery",
    country: "Belgium",
    region: "western-europe",
    lat: 51.2477,
    lng: 4.4207,
    capacity: 360000,
    status: "operational",
  },
  {
    name: "Karlsruhe Refinery",
    country: "Germany",
    region: "western-europe",
    lat: 49.0069,
    lng: 8.4037,
    capacity: 285000,
    status: "operational",
  },
  {
    name: "Grangemouth Refinery",
    country: "United Kingdom",
    region: "western-europe",
    lat: 56.0197,
    lng: -3.7200,
    capacity: 210000,
    status: "operational",
  },
  {
    name: "Lavéra Refinery",
    country: "France",
    region: "western-europe",
    lat: 43.3886,
    lng: 5.0144,
    capacity: 210000,
    status: "operational",
  }
];

// Eastern Europe Refineries
const EASTERN_EUROPE_REFINERIES: RefineryData[] = [
  {
    name: "Ploiești Refinery",
    country: "Romania",
    region: "eastern-europe",
    lat: 44.9479,
    lng: 26.0500,
    capacity: 200000,
    status: "operational",
  },
  {
    name: "Gdańsk Refinery",
    country: "Poland",
    region: "eastern-europe",
    lat: 54.3520,
    lng: 18.6466,
    capacity: 210000,
    status: "operational",
  },
  {
    name: "Bratislava Refinery",
    country: "Slovakia",
    region: "eastern-europe",
    lat: 48.1486,
    lng: 17.1077,
    capacity: 120000,
    status: "operational",
  },
  {
    name: "Burgas Refinery",
    country: "Bulgaria",
    region: "eastern-europe",
    lat: 42.5048,
    lng: 27.4626,
    capacity: 196000,
    status: "operational",
  },
  {
    name: "Novopolotsk Refinery",
    country: "Belarus",
    region: "eastern-europe",
    lat: 55.5246,
    lng: 28.6449,
    capacity: 200000,
    status: "operational",
  }
];

// North America Refineries
const NORTH_AMERICA_REFINERIES: RefineryData[] = [
  {
    name: "Port Arthur Refinery",
    country: "United States",
    region: "north-america",
    lat: 29.8957,
    lng: -93.9852,
    capacity: 600000,
    status: "operational",
  },
  {
    name: "Baytown Refinery",
    country: "United States",
    region: "north-america",
    lat: 29.7544,
    lng: -94.9811,
    capacity: 560000,
    status: "operational",
  },
  {
    name: "Garyville Refinery",
    country: "United States",
    region: "north-america",
    lat: 30.0858,
    lng: -90.6257,
    capacity: 540000,
    status: "operational",
  },
  {
    name: "Baton Rouge Refinery",
    country: "United States",
    region: "north-america",
    lat: 30.5012,
    lng: -91.1542,
    capacity: 500000,
    status: "operational",
  },
  {
    name: "Galveston Bay Refinery",
    country: "United States",
    region: "north-america",
    lat: 29.3829,
    lng: -94.9057,
    capacity: 459000,
    status: "operational",
  },
  {
    name: "Los Angeles Refinery",
    country: "United States",
    region: "north-america",
    lat: 33.8096,
    lng: -118.2297,
    capacity: 365000,
    status: "operational",
  },
  {
    name: "Wood River Refinery",
    country: "United States",
    region: "north-america",
    lat: 38.8403,
    lng: -90.0960,
    capacity: 314000,
    status: "operational",
  },
  {
    name: "Saint John Refinery",
    country: "Canada",
    region: "north-america",
    lat: 45.2207,
    lng: -66.1407,
    capacity: 320000,
    status: "operational",
  }
];

// South America Refineries
const SOUTH_AMERICA_REFINERIES: RefineryData[] = [
  {
    name: "Paraguaná Refinery Complex",
    country: "Venezuela",
    region: "south-america",
    lat: 11.7500,
    lng: -70.2167,
    capacity: 940000,
    status: "maintenance",
  },
  {
    name: "Amuay Refinery",
    country: "Venezuela",
    region: "south-america",
    lat: 11.7500,
    lng: -70.2167,
    capacity: 645000,
    status: "maintenance",
  },
  {
    name: "Duque de Caxias Refinery (REDUC)",
    country: "Brazil",
    region: "south-america",
    lat: -22.7623,
    lng: -43.2704,
    capacity: 242000,
    status: "operational",
  },
  {
    name: "Presidente Getúlio Vargas Refinery (REPAR)",
    country: "Brazil",
    region: "south-america",
    lat: -25.5630,
    lng: -49.3593,
    capacity: 208000,
    status: "operational",
  },
  {
    name: "Talara Refinery",
    country: "Peru",
    region: "south-america",
    lat: -4.5794,
    lng: -81.2759,
    capacity: 65000,
    status: "operational",
  }
];

// Central America Refineries
const CENTRAL_AMERICA_REFINERIES: RefineryData[] = [
  {
    name: "Salina Cruz Refinery",
    country: "Mexico",
    region: "central-america",
    lat: 16.1811,
    lng: -95.1961,
    capacity: 330000,
    status: "operational",
  },
  {
    name: "Tula Refinery",
    country: "Mexico",
    region: "central-america",
    lat: 20.0467,
    lng: -99.3411,
    capacity: 315000,
    status: "operational",
  },
  {
    name: "Cadereyta Refinery",
    country: "Mexico",
    region: "central-america",
    lat: 25.5936,
    lng: -99.9892,
    capacity: 275000,
    status: "operational",
  },
  {
    name: "Cartagena Refinery",
    country: "Colombia",
    region: "central-america",
    lat: 10.3910,
    lng: -75.4794,
    capacity: 165000,
    status: "operational",
  },
  {
    name: "Esmeraldas Refinery",
    country: "Ecuador",
    region: "central-america",
    lat: 0.9526,
    lng: -79.6544,
    capacity: 110000,
    status: "operational",
  }
];

// Southern Africa Refineries
const SOUTHERN_AFRICA_REFINERIES: RefineryData[] = [
  {
    name: "SAPREF Refinery",
    country: "South Africa",
    region: "southern-africa",
    lat: -29.9087,
    lng: 30.9726,
    capacity: 180000,
    status: "operational",
  },
  {
    name: "Sasol Secunda Synfuels Operations",
    country: "South Africa",
    region: "southern-africa",
    lat: -26.5558,
    lng: 29.1811,
    capacity: 150000,
    status: "operational",
  },
  {
    name: "Engen Refinery",
    country: "South Africa",
    region: "southern-africa",
    lat: -29.9308,
    lng: 31.0244,
    capacity: 120000,
    status: "operational",
  },
  {
    name: "Natref Refinery",
    country: "South Africa",
    region: "southern-africa",
    lat: -26.8096,
    lng: 27.8613,
    capacity: 108000,
    status: "operational",
  },
  {
    name: "Caltex Refinery",
    country: "South Africa",
    region: "southern-africa",
    lat: -33.9249,
    lng: 18.4241,
    capacity: 100000,
    status: "maintenance",
  }
];

// Russia Refineries
const RUSSIA_REFINERIES: RefineryData[] = [
  {
    name: "Omsk Refinery",
    country: "Russia",
    region: "russia",
    lat: 54.9924,
    lng: 73.3686,
    capacity: 500000,
    status: "operational",
  },
  {
    name: "Ufa Refinery Complex",
    country: "Russia",
    region: "russia",
    lat: 54.7430,
    lng: 55.9678,
    capacity: 450000,
    status: "operational",
  },
  {
    name: "Moscow Refinery",
    country: "Russia",
    region: "russia",
    lat: 55.7558,
    lng: 37.6173,
    capacity: 360000,
    status: "operational",
  },
  {
    name: "Nizhnekamsk Refinery",
    country: "Russia",
    region: "russia",
    lat: 55.6359,
    lng: 51.8139,
    capacity: 360000,
    status: "operational",
  },
  {
    name: "Kirishi Refinery",
    country: "Russia",
    region: "russia",
    lat: 59.4751,
    lng: 32.0246,
    capacity: 340000,
    status: "operational",
  }
];

// China Refineries
const CHINA_REFINERIES: RefineryData[] = [
  {
    name: "Zhenhai Refinery",
    country: "China",
    region: "china",
    lat: 29.9490,
    lng: 121.7390,
    capacity: 460000,
    status: "operational",
  },
  {
    name: "Dalian Refinery",
    country: "China",
    region: "china",
    lat: 38.9140,
    lng: 121.6147,
    capacity: 410000,
    status: "operational",
  },
  {
    name: "Maoming Refinery",
    country: "China",
    region: "china",
    lat: 21.6618,
    lng: 110.9206,
    capacity: 360000,
    status: "operational",
  },
  {
    name: "Tianjin Refinery",
    country: "China",
    region: "china",
    lat: 39.0842,
    lng: 117.2009,
    capacity: 320000,
    status: "operational",
  },
  {
    name: "Shanghai Refinery",
    country: "China",
    region: "china",
    lat: 31.2304,
    lng: 121.4737,
    capacity: 320000,
    status: "operational",
  }
];

// Asia Pacific Refineries
const ASIA_PACIFIC_REFINERIES: RefineryData[] = [
  {
    name: "Jamnagar Refinery",
    country: "India",
    region: "asia-pacific",
    lat: 22.2806,
    lng: 69.8789,
    capacity: 1240000,
    status: "operational",
  },
  {
    name: "Ulsan Refinery",
    country: "South Korea",
    region: "asia-pacific",
    lat: 35.5279,
    lng: 129.3538,
    capacity: 840000,
    status: "operational",
  },
  {
    name: "Mailiao Refinery",
    country: "Taiwan",
    region: "asia-pacific",
    lat: 23.8006,
    lng: 120.1908,
    capacity: 540000,
    status: "operational",
  },
  {
    name: "Negishi Refinery",
    country: "Japan",
    region: "asia-pacific",
    lat: 35.4443,
    lng: 139.6469,
    capacity: 270000,
    status: "operational",
  },
  {
    name: "Mizushima Refinery",
    country: "Japan",
    region: "asia-pacific",
    lat: 34.5077,
    lng: 133.7600,
    capacity: 320000,
    status: "operational",
  }
];

// Southeast Asia & Oceania Refineries
const SOUTHEAST_ASIA_OCEANIA_REFINERIES: RefineryData[] = [
  {
    name: "Port Dickson Refinery",
    country: "Malaysia",
    region: "southeast-asia-oceania",
    lat: 2.6889,
    lng: 101.7981,
    capacity: 155000,
    status: "operational",
  },
  {
    name: "Map Ta Phut Refinery",
    country: "Thailand",
    region: "southeast-asia-oceania",
    lat: 12.6815,
    lng: 101.1700,
    capacity: 280000,
    status: "operational",
  },
  {
    name: "Singapore Refinery",
    country: "Singapore",
    region: "southeast-asia-oceania",
    lat: 1.2644,
    lng: 103.7994,
    capacity: 592000,
    status: "operational",
  },
  {
    name: "Cilacap Refinery",
    country: "Indonesia",
    region: "southeast-asia-oceania",
    lat: -7.7324,
    lng: 109.0192,
    capacity: 348000,
    status: "operational",
  },
  {
    name: "Balikpapan Refinery",
    country: "Indonesia",
    region: "southeast-asia-oceania",
    lat: -1.2667,
    lng: 116.8333,
    capacity: 260000,
    status: "operational",
  }
];

// Combine all refineries
export const ACCURATE_REFINERIES: RefineryData[] = [
  ...MIDDLE_EAST_REFINERIES,
  ...NORTH_AFRICA_REFINERIES,
  ...WESTERN_EUROPE_REFINERIES,
  ...EASTERN_EUROPE_REFINERIES,
  ...NORTH_AMERICA_REFINERIES,
  ...SOUTH_AMERICA_REFINERIES,
  ...CENTRAL_AMERICA_REFINERIES,
  ...SOUTHERN_AFRICA_REFINERIES,
  ...RUSSIA_REFINERIES,
  ...CHINA_REFINERIES,
  ...ASIA_PACIFIC_REFINERIES,
  ...SOUTHEAST_ASIA_OCEANIA_REFINERIES
];

/**
 * Convert RefineryData to Refinery type for the application
 */
export function convertToRefineries(refineryData: RefineryData[]): Refinery[] {
  return refineryData.map((refinery, index) => ({
    id: index + 1,
    name: refinery.name,
    country: refinery.country,
    region: refinery.region,
    lat: refinery.lat.toString(),
    lng: refinery.lng.toString(),
    capacity: refinery.capacity,
    status: refinery.status,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

/**
 * Generate ports connected to each refinery
 */
export function generateConnectedPorts(refineries: Refinery[]): Port[] {
  let portsArray: Port[] = [];
  let portIdCounter = 1;
  
  refineries.forEach((refinery) => {
    // Generate 1-3 ports for each refinery
    const numPorts = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numPorts; i++) {
      // Calculate a position near the refinery (5-20km away)
      const latOffset = (Math.random() * 0.15) * (Math.random() > 0.5 ? 1 : -1);
      const lngOffset = (Math.random() * 0.15) * (Math.random() > 0.5 ? 1 : -1);
      
      const portName = i === 0 
        ? `Port of ${refinery.name}` 
        : `${refinery.name} Terminal ${i}`;
      
      portsArray.push({
        id: portIdCounter++,
        name: portName,
        country: refinery.country,
        region: refinery.region,
        lat: (parseFloat(refinery.lat) + latOffset).toString(),
        lng: (parseFloat(refinery.lng) + lngOffset).toString(),
        capacity: 100000 + Math.floor(Math.random() * 500000),
        status: "operational",
        description: `Maritime port serving ${refinery.name}`,
        type: "oil_terminal",
        lastUpdated: new Date()
      });
    }
  });
  
  console.log(`Generated ${portsArray.length} ports for ${refineries.length} refineries`);
  return portsArray;
}