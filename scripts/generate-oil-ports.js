/**
 * Script to generate additional oil ports
 * This script will add 150 oil-specific ports to the database
 */

import axios from 'axios';

// Oil terminal names by region
const oilPortNamesByRegion = {
  'Asia-Pacific': [
    'Qingdao Oil Terminal', 'Shanghai Petrochemical Port', 'Ningbo Oil Dock', 'Tianjin Oil Port', 
    'Dalian Crude Terminal', 'Daesan Oil Port', 'Ulsan Oil Harbor', 'Chiba Oil Terminal', 
    'Yokohama Energy Port', 'Kawasaki Oil Terminal', 'Mizushima Energy Hub', 'Mumbai Oil Terminal',
    'Paradip Oil Jetty', 'Chennai Petroleum Harbor', 'Map Ta Phut Energy Port', 'Sriracha Oil Terminal',
    'Rayong Crude Terminal', 'Mailiao Petrochemical Port', 'Jurong Oil Terminal', 'Melaka Oil Terminal',
    'Kertih Petrochemical Port', 'Jakarta Oil Harbor', 'Balikpapan Oil Terminal', 'Darwin Energy Terminal',
    'Port Bonython Oil Terminal', 'Geelong Refinery Port', 'Altona Energy Terminal'
  ],
  'Europe': [
    'Rotterdam Oil Terminal', 'Antwerp Petroleum Harbor', 'Hamburg Oil Port', 'Wilhelmshaven Oil Terminal', 
    'Le Havre Oil Harbor', 'Fos-sur-Mer Energy Port', 'Trieste Oil Terminal', 'Augusta Refinery Port', 
    'Taranto Energy Dock', 'Barcelona Oil Terminal', 'Sines Energy Harbor', 'Bilbao Oil Dock', 
    'Gdansk Oil Terminal', 'Ventspils Oil Port', 'Primorsk Energy Terminal', 'Novorossiysk Oil Harbor',
    'Constanta Petroleum Terminal', 'Burgas Oil Port', 'Thessaloniki Energy Terminal', 'Milford Haven Oil Port',
    'Southampton Oil Terminal', 'Pembroke Energy Harbor', 'Mongstad Oil Terminal', 'Sture Oil Terminal',
    'Gothenburg Energy Port', 'Brofjorden Oil Terminal', 'Porvoo Energy Harbor'
  ],
  'North America': [
    'Houston Oil Terminal', 'Port Arthur Energy Harbor', 'Corpus Christi Oil Terminal', 'Long Beach Oil Harbor', 
    'Los Angeles Petroleum Dock', 'Martinez Oil Terminal', 'Cherry Point Energy Port', 'Valdez Oil Terminal', 
    'Saint John Petroleum Harbor', 'Come By Chance Oil Terminal', 'Montreal Energy Port', 'Vancouver Oil Harbor',
    'Altamira Oil Terminal', 'Dos Bocas Petroleum Port', 'Coatzacoalcos Energy Terminal', 'Salina Cruz Oil Harbor',
    'Philadelphia Energy Port', 'New York Oil Terminal', 'Norfolk Petroleum Harbor', 'Tampa Oil Terminal',
    'New Orleans Energy Port', 'Mobile Oil Harbor', 'Prince Rupert Oil Terminal', 'Quebec Energy Port'
  ],
  'Latin America': [
    'Jose Terminal', 'La Salina Oil Port', 'Covenas Energy Terminal', 'Esmeraldas Oil Harbor', 
    'Callao Petroleum Terminal', 'Quintero Energy Port', 'San Vicente Oil Harbor', 'Salvador Oil Terminal', 
    'Suape Energy Port', 'Santos Oil Terminal', 'Rio de Janeiro Petroleum Port', 'São Sebastião Oil Terminal',
    'Bahia Blanca Energy Harbor', 'Puerto La Cruz Oil Terminal', 'Amuay Refinery Port', 'Cardon Oil Terminal',
    'Balao Oil Port', 'Lima Energy Terminal', 'Talara Oil Harbor', 'Concepcion Petroleum Port'
  ],
  'Middle East': [
    'Ras Tanura Oil Terminal', 'Juaymah Crude Terminal', 'Jeddah Oil Harbor', 'Yanbu Energy Port', 
    'Mina Al Ahmadi Terminal', 'Shuaiba Oil Harbor', 'Das Island Terminal', 'Jebel Dhanna Oil Port', 
    'Fujairah Energy Terminal', 'Ruwais Petroleum Port', 'Mina Al Fahal Oil Terminal', 'Khor Al Zubair Energy Port',
    'Basrah Oil Terminal', 'Kharg Island Terminal', 'Assaluyeh Energy Port', 'Bandar Abbas Oil Terminal',
    'Bandar Imam Khomeini Port', 'Sidi Kerir Oil Terminal', 'Ain Sukhna Energy Harbor', 'Aqaba Oil Port'
  ],
  'Africa': [
    'Skikda Oil Harbor', 'Arzew Energy Terminal', 'El Dekheila Oil Port', 'Sidi Kerir Petroleum Terminal', 
    'Suez Oil Harbor', 'Port Sudan Energy Terminal', 'Lagos Petroleum Port', 'Bonny Oil Terminal', 
    'Escravos Energy Harbor', 'Port Harcourt Oil Terminal', 'Tema Petroleum Port', 'Lome Energy Terminal',
    'Cape Town Oil Harbor', 'Durban Energy Port', 'Richards Bay Oil Terminal', 'Maputo Petroleum Harbor',
    'Mombasa Oil Terminal', 'Dar es Salaam Energy Port', 'Luanda Petroleum Harbor', 'Cabinda Oil Terminal'
  ]
};

// Approximate coordinates for regions
const regionCoordinates = {
  'Asia-Pacific': {
    latRange: [-40, 40],
    lngRange: [70, 180]
  },
  'Europe': {
    latRange: [35, 70],
    lngRange: [-10, 40]
  },
  'North America': {
    latRange: [15, 70],
    lngRange: [-170, -50]
  },
  'Latin America': {
    latRange: [-55, 25],
    lngRange: [-110, -30]
  },
  'Middle East': {
    latRange: [12, 42],
    lngRange: [35, 62]
  },
  'Africa': {
    latRange: [-35, 35],
    lngRange: [-20, 55]
  }
};

// Generate a random coordinate within the region's range
function generateCoordinateInRegion(region) {
  const { latRange, lngRange } = regionCoordinates[region];
  
  const lat = latRange[0] + (Math.random() * (latRange[1] - latRange[0]));
  const lng = lngRange[0] + (Math.random() * (lngRange[1] - lngRange[0]));
  
  return {
    lat: lat.toFixed(6),
    lng: lng.toFixed(6)
  };
}

// Generate oil port descriptions
function generateOilPortDescription(portName, country) {
  const descriptions = [
    `${portName} is a major oil shipping terminal in ${country}, processing millions of tons of crude oil and petroleum products annually.`,
    `As one of the largest oil terminals in ${country}, ${portName} has expanded capacity to handle VLCCs and serves as a key export point for regional energy resources.`,
    `${portName} features state-of-the-art loading facilities for crude oil and refined products, with multiple deep-water berths serving the energy needs of ${country}.`,
    `A strategic energy shipping hub in ${country}, ${portName} connects oil producers to global markets with extensive storage capacity and modern loading infrastructure.`,
    `Recently expanded to accommodate larger tankers, ${portName} is a vital link in ${country}'s energy export capabilities with significant crude oil throughput capacity.`,
    `${portName} serves as ${country}'s primary oil export facility with dedicated terminals for crude oil, LNG, and refined petroleum products.`,
    `With multiple deep-water berths capable of handling the largest oil tankers, ${portName} is central to ${country}'s position in global energy markets.`,
    `${portName} features extensive tank farms and underwater pipelines connecting to offshore loading buoys, enabling efficient handling of ${country}'s oil exports.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Generate a list of oil ports
async function generateOilPorts() {
  try {
    // Get existing ports to avoid ID conflicts
    const response = await axios.get('http://localhost:5000/api/ports');
    const existingPorts = response.data;
    console.log(`Found ${existingPorts.length} existing ports`);
    
    // Extract existing port names to avoid duplicates
    const existingPortNames = new Set(existingPorts.map(p => p.name.toLowerCase()));
    console.log(`Found ${existingPortNames.size} unique port names`);
    
    // Get the highest current port ID
    const highestId = existingPorts.reduce((max, port) => Math.max(max, port.id), 0);
    console.log(`Highest existing port ID: ${highestId}`);
    
    let nextId = highestId + 1;
    const newOilPorts = [];
    
    // Target number of oil ports to add
    const oilPortsToAdd = 150;
    console.log(`Generating ${oilPortsToAdd} new oil ports...`);
    
    // Generate oil ports for each region
    Object.keys(oilPortNamesByRegion).forEach(region => {
      const regionPortNames = oilPortNamesByRegion[region];
      
      // Distribute ports roughly evenly across regions (adjust as needed)
      const portsPerRegion = Math.ceil(oilPortsToAdd / Object.keys(oilPortNamesByRegion).length);
      
      for (let i = 0; i < portsPerRegion && newOilPorts.length < oilPortsToAdd; i++) {
        // Choose a port name from the region or create a generic one if we run out
        let portName;
        if (i < regionPortNames.length) {
          portName = regionPortNames[i];
        } else {
          // Generate a name with an index to ensure uniqueness
          portName = `${region} Oil Terminal ${i - regionPortNames.length + 1}`;
        }
        
        // Skip if the port name already exists
        if (existingPortNames.has(portName.toLowerCase())) {
          console.log(`Port name "${portName}" already exists, skipping...`);
          continue;
        }
        
        // Add to set of existing names to avoid duplicates within this script
        existingPortNames.add(portName.toLowerCase());
        
        // Determine the country based on the region
        const countriesByRegion = {
          'Asia-Pacific': ['China', 'Japan', 'South Korea', 'India', 'Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam', 'Australia'],
          'Europe': ['Netherlands', 'UK', 'Germany', 'France', 'Italy', 'Spain', 'Belgium', 'Poland', 'Russia', 'Norway'],
          'North America': ['USA', 'Canada', 'Mexico'],
          'Latin America': ['Brazil', 'Argentina', 'Venezuela', 'Colombia', 'Chile', 'Peru', 'Ecuador'],
          'Middle East': ['Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Oman', 'Iraq', 'Iran', 'Bahrain'],
          'Africa': ['Nigeria', 'Algeria', 'Egypt', 'Libya', 'Angola', 'South Africa', 'Ghana', 'Mozambique']
        };
        
        const country = countriesByRegion[region][Math.floor(Math.random() * countriesByRegion[region].length)];
        
        // Generate coordinates in the appropriate region
        const { lat, lng } = generateCoordinateInRegion(region);
        
        // Generate port capacity (oil ports have larger capacity)
        const capacity = 500000 + Math.floor(Math.random() * 9500000);
        
        // Create the oil port object
        const oilPort = {
          id: nextId++,
          name: portName,
          country: country,
          region: region,
          lat: lat,
          lng: lng,
          type: 'oil',
          capacity: capacity,
          status: 'active',
          description: generateOilPortDescription(portName, country)
        };
        
        newOilPorts.push(oilPort);
      }
    });
    
    console.log(`Generated ${newOilPorts.length} new oil ports`);
    
    // Add ports in batches to avoid overwhelming the server
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < newOilPorts.length; i += batchSize) {
      const batch = newOilPorts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newOilPorts.length/batchSize)}, size: ${batch.length}`);
      
      try {
        // Add each port individually
        for (const port of batch) {
          try {
            await axios.post('http://localhost:5000/api/ports', port);
            successCount++;
            console.log(`Added port: ${port.name} (ID: ${port.id})`);
          } catch (err) {
            errorCount++;
            console.error(`Error adding port ${port.name}:`, err.message);
          }
        }
      } catch (batchError) {
        console.error('Error processing batch:', batchError.message);
      }
    }
    
    console.log('Oil ports generation complete!');
    console.log(`Successfully added ${successCount} oil ports, errors: ${errorCount}`);
    return { success: true, added: successCount, errors: errorCount };
    
  } catch (error) {
    console.error('Error generating oil ports:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the function
generateOilPorts()
  .then(result => console.log('Final result:', result))
  .catch(err => console.error('Fatal error:', err));