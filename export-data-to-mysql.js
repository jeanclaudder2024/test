/**
 * Export all PostgreSQL data to MySQL format
 * This script exports all authentic vessel, port, and refinery data
 */

import { db } from './server/db.js';
import fs from 'fs';
import * as schema from './shared/schema.js';

async function exportDataToMySQL() {
  console.log('🚀 Starting data export from PostgreSQL to MySQL format...');
  
  let sqlOutput = `-- =====================================================
-- COMPLETE DATA EXPORT FROM POSTGRESQL TO MYSQL
-- Generated: ${new Date().toISOString()}
-- Contains all authentic oil vessel tracking data
-- =====================================================

USE u150634185_oiltrak;
SET FOREIGN_KEY_CHECKS = 0;

`;

  try {
    // Export Ports (29 authentic oil terminals)
    console.log('📍 Exporting ports...');
    const ports = await db.select().from(schema.ports);
    console.log(`Found ${ports.length} ports`);
    
    if (ports.length > 0) {
      sqlOutput += `-- =====================================================
-- PORTS DATA (${ports.length} Authentic Oil Terminals)
-- =====================================================
TRUNCATE TABLE ports;
INSERT INTO ports (id, name, country, region, lat, lng, type, status, capacity, description, last_updated) VALUES\n`;
      
      const portValues = ports.map(port => {
        const name = (port.name || '').replace(/'/g, "''");
        const country = (port.country || '').replace(/'/g, "''");
        const region = (port.region || '').replace(/'/g, "''");
        const description = (port.description || '').replace(/'/g, "''");
        const lastUpdated = port.lastUpdated ? `'${port.lastUpdated.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';
        
        return `(${port.id}, '${name}', '${country}', '${region}', '${port.lat}', '${port.lng}', '${port.type || 'oil_terminal'}', '${port.status || 'active'}', ${port.capacity || 'NULL'}, '${description}', ${lastUpdated})`;
      });
      
      sqlOutput += portValues.join(',\n') + ';\n\n';
    }

    // Export Refineries (111 global refineries)
    console.log('🏭 Exporting refineries...');
    const refineries = await db.select().from(require('./shared/schema').refineries);
    console.log(`Found ${refineries.length} refineries`);
    
    if (refineries.length > 0) {
      sqlOutput += `-- =====================================================
-- REFINERIES DATA (${refineries.length} Global Refineries)
-- =====================================================
TRUNCATE TABLE refineries;
INSERT INTO refineries (id, name, country, region, lat, lng, type, status, capacity, description, last_updated) VALUES\n`;
      
      const refineryValues = refineries.map(refinery => {
        const name = (refinery.name || '').replace(/'/g, "''");
        const country = (refinery.country || '').replace(/'/g, "''");
        const region = (refinery.region || '').replace(/'/g, "''");
        const description = (refinery.description || '').replace(/'/g, "''");
        const lastUpdated = refinery.lastUpdated ? `'${refinery.lastUpdated.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';
        
        return `(${refinery.id}, '${name}', '${country}', '${region}', '${refinery.lat}', '${refinery.lng}', '${refinery.type || 'refinery'}', '${refinery.status || 'active'}', ${refinery.capacity || 'NULL'}, '${description}', ${lastUpdated})`;
      });
      
      sqlOutput += refineryValues.join(',\n') + ';\n\n';
    }

    // Export Vessels (2,045 oil vessels) - Split into chunks for better performance
    console.log('🚢 Exporting vessels...');
    const vessels = await db.select().from(require('./shared/schema').vessels);
    console.log(`Found ${vessels.length} vessels`);
    
    if (vessels.length > 0) {
      sqlOutput += `-- =====================================================
-- VESSELS DATA (${vessels.length} Oil Tankers and Carriers)
-- =====================================================
TRUNCATE TABLE vessels;
`;
      
      // Process vessels in chunks of 100 for better performance
      const chunkSize = 100;
      for (let i = 0; i < vessels.length; i += chunkSize) {
        const chunk = vessels.slice(i, i + chunkSize);
        
        sqlOutput += `INSERT INTO vessels (id, name, imo, mmsi, vessel_type, flag, built, deadweight, cargo_capacity, current_lat, current_lng, destination, estimated_arrival, last_port, cargo_type, status, speed, course, draft, voyage_number, departure_date, seller_name, last_updated) VALUES\n`;
        
        const vesselValues = chunk.map(vessel => {
          const name = (vessel.name || '').replace(/'/g, "''");
          const imo = vessel.imo ? `'${vessel.imo}'` : 'NULL';
          const mmsi = vessel.mmsi ? `'${vessel.mmsi}'` : 'NULL';
          const vesselType = (vessel.vesselType || '').replace(/'/g, "''");
          const flag = (vessel.flag || '').replace(/'/g, "''");
          const destination = vessel.destination ? `'${vessel.destination.replace(/'/g, "''")}'` : 'NULL';
          const lastPort = vessel.lastPort ? `'${vessel.lastPort.replace(/'/g, "''")}'` : 'NULL';
          const cargoType = vessel.cargoType ? `'${vessel.cargoType.replace(/'/g, "''")}'` : 'NULL';
          const status = vessel.status ? `'${vessel.status}'` : "'active'";
          const speed = vessel.speed ? `'${vessel.speed}'` : 'NULL';
          const course = vessel.course ? `'${vessel.course}'` : 'NULL';
          const draft = vessel.draft ? `'${vessel.draft}'` : 'NULL';
          const voyageNumber = vessel.voyageNumber ? `'${vessel.voyageNumber}'` : 'NULL';
          const sellerName = vessel.sellerName ? `'${vessel.sellerName.replace(/'/g, "''")}'` : 'NULL';
          
          const estimatedArrival = vessel.estimatedArrival ? `'${vessel.estimatedArrival.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
          const departureDate = vessel.departureDate ? `'${vessel.departureDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
          const lastUpdated = vessel.lastUpdated ? `'${vessel.lastUpdated.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';
          
          return `(${vessel.id}, '${name}', ${imo}, ${mmsi}, '${vesselType}', '${flag}', ${vessel.built || 'NULL'}, ${vessel.deadweight || 'NULL'}, ${vessel.cargoCapacity || 'NULL'}, '${vessel.currentLat || ''}', '${vessel.currentLng || ''}', ${destination}, ${estimatedArrival}, ${lastPort}, ${cargoType}, ${status}, ${speed}, ${course}, ${draft}, ${voyageNumber}, ${departureDate}, ${sellerName}, ${lastUpdated})`;
        });
        
        sqlOutput += vesselValues.join(',\n') + ';\n\n';
      }
    }

    // Export Vessel-Refinery Connections
    console.log('🔗 Exporting vessel connections...');
    const connections = await db.select().from(require('./shared/schema').vesselRefineryConnections);
    console.log(`Found ${connections.length} connections`);
    
    if (connections.length > 0) {
      sqlOutput += `-- =====================================================
-- VESSEL-REFINERY CONNECTIONS (${connections.length} Active Connections)
-- =====================================================
TRUNCATE TABLE vessel_refinery_connections;
INSERT INTO vessel_refinery_connections (id, vessel_id, refinery_id, connection_type, cargo_volume, status, start_date, end_date, last_updated) VALUES\n`;
      
      const connectionValues = connections.map(conn => {
        const connectionType = conn.connectionType ? `'${conn.connectionType.replace(/'/g, "''")}'` : 'NULL';
        const cargoVolume = conn.cargoVolume ? `'${conn.cargoVolume}'` : 'NULL';
        const status = conn.status ? `'${conn.status}'` : "'active'";
        const startDate = conn.startDate ? `'${conn.startDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
        const endDate = conn.endDate ? `'${conn.endDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
        const lastUpdated = conn.lastUpdated ? `'${conn.lastUpdated.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';
        
        return `(${conn.id}, ${conn.vesselId}, ${conn.refineryId}, ${connectionType}, ${cargoVolume}, ${status}, ${startDate}, ${endDate}, ${lastUpdated})`;
      });
      
      sqlOutput += connectionValues.join(',\n') + ';\n\n';
    }

    // Export Companies
    console.log('🏢 Exporting companies...');
    const companies = await db.select().from(require('./shared/schema').companies);
    console.log(`Found ${companies.length} companies`);
    
    if (companies.length > 0) {
      sqlOutput += `-- =====================================================
-- COMPANIES DATA (${companies.length} Oil Shipping Companies)
-- =====================================================
TRUNCATE TABLE companies;
INSERT INTO companies (id, name, country, region, description, website, email, phone, company_type, last_updated) VALUES\n`;
      
      const companyValues = companies.map(company => {
        const name = (company.name || '').replace(/'/g, "''");
        const country = company.country ? `'${company.country.replace(/'/g, "''")}'` : 'NULL';
        const region = company.region ? `'${company.region.replace(/'/g, "''")}'` : 'NULL';
        const description = company.description ? `'${company.description.replace(/'/g, "''")}'` : 'NULL';
        const website = company.website ? `'${company.website}'` : 'NULL';
        const email = company.email ? `'${company.email}'` : 'NULL';
        const phone = company.phone ? `'${company.phone}'` : 'NULL';
        const companyType = company.companyType ? `'${company.companyType}'` : "'shipping'";
        const lastUpdated = company.lastUpdated ? `'${company.lastUpdated.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';
        
        return `(${company.id}, '${name}', ${country}, ${region}, ${description}, ${website}, ${email}, ${phone}, ${companyType}, ${lastUpdated})`;
      });
      
      sqlOutput += companyValues.join(',\n') + ';\n\n';
    }

    // Export Vessel Jobs
    console.log('💼 Exporting vessel jobs...');
    const jobs = await db.select().from(require('./shared/schema').vesselJobs);
    console.log(`Found ${jobs.length} jobs`);
    
    if (jobs.length > 0) {
      sqlOutput += `-- =====================================================
-- VESSEL JOBS DATA (${jobs.length} Maritime Jobs)
-- =====================================================
TRUNCATE TABLE vessel_jobs;
INSERT INTO vessel_jobs (id, vessel_id, job_title, company_name, route, cargo_type, departure_port, arrival_port, departure_date, estimated_arrival, charter_rate, cargo_quantity, status, created_at) VALUES\n`;
      
      const jobValues = jobs.map(job => {
        const jobTitle = (job.jobTitle || '').replace(/'/g, "''");
        const companyName = job.companyName ? `'${job.companyName.replace(/'/g, "''")}'` : 'NULL';
        const route = job.route ? `'${job.route.replace(/'/g, "''")}'` : 'NULL';
        const cargoType = job.cargoType ? `'${job.cargoType.replace(/'/g, "''")}'` : 'NULL';
        const departurePort = job.departurePort ? `'${job.departurePort.replace(/'/g, "''")}'` : 'NULL';
        const arrivalPort = job.arrivalPort ? `'${job.arrivalPort.replace(/'/g, "''")}'` : 'NULL';
        const charterRate = job.charterRate ? `'${job.charterRate}'` : 'NULL';
        const cargoQuantity = job.cargoQuantity ? `'${job.cargoQuantity}'` : 'NULL';
        const status = job.status ? `'${job.status}'` : "'active'";
        
        const departureDate = job.departureDate ? `'${job.departureDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
        const estimatedArrival = job.estimatedArrival ? `'${job.estimatedArrival.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
        const createdAt = job.createdAt ? `'${job.createdAt.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';
        
        return `(${job.id}, ${job.vesselId || 'NULL'}, '${jobTitle}', ${companyName}, ${route}, ${cargoType}, ${departurePort}, ${arrivalPort}, ${departureDate}, ${estimatedArrival}, ${charterRate}, ${cargoQuantity}, ${status}, ${createdAt})`;
      });
      
      sqlOutput += jobValues.join(',\n') + ';\n\n';
    }

    // Export Vessel Documents
    console.log('📄 Exporting vessel documents...');
    const documents = await db.select().from(require('./shared/schema').vesselDocuments);
    console.log(`Found ${documents.length} documents`);
    
    if (documents.length > 0) {
      sqlOutput += `-- =====================================================
-- VESSEL DOCUMENTS DATA (${documents.length} Documents)
-- =====================================================
TRUNCATE TABLE vessel_documents;
INSERT INTO vessel_documents (id, vessel_id, document_type, document_title, file_path, file_content, created_date, expiry_date, status, created_at) VALUES\n`;
      
      const documentValues = documents.map(doc => {
        const documentType = (doc.documentType || '').replace(/'/g, "''");
        const documentTitle = (doc.documentTitle || '').replace(/'/g, "''");
        const filePath = doc.filePath ? `'${doc.filePath.replace(/'/g, "''")}'` : 'NULL';
        const fileContent = doc.fileContent ? `'${doc.fileContent.replace(/'/g, "''").substring(0, 5000)}'` : 'NULL'; // Limit content length
        const status = doc.status ? `'${doc.status}'` : "'active'";
        
        const createdDate = doc.createdDate ? `'${doc.createdDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
        const expiryDate = doc.expiryDate ? `'${doc.expiryDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL';
        const createdAt = doc.createdAt ? `'${doc.createdAt.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()';
        
        return `(${doc.id}, ${doc.vesselId || 'NULL'}, '${documentType}', '${documentTitle}', ${filePath}, ${fileContent}, ${createdDate}, ${expiryDate}, ${status}, ${createdAt})`;
      });
      
      sqlOutput += documentValues.join(',\n') + ';\n\n';
    }

    sqlOutput += `
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- EXPORT COMPLETED SUCCESSFULLY
-- =====================================================
-- Total Records Exported:
-- • ${ports.length} Oil Terminals and Ports
-- • ${refineries.length} Global Refineries  
-- • ${vessels.length} Oil Vessels (VLCC, Suezmax, Aframax, LNG, etc.)
-- • ${connections.length} Vessel-Refinery Connections
-- • ${companies.length} Oil Shipping Companies
-- • ${jobs.length} Maritime Jobs
-- • ${documents.length} Vessel Documents
-- 
-- Ready for import into MySQL database: u150634185_oiltrak
-- =====================================================
`;

    // Write to file
    const filename = 'mysql_complete_database.sql';
    fs.writeFileSync(filename, sqlOutput);
    
    console.log(`✅ Export completed successfully!`);
    console.log(`📁 File saved as: ${filename}`);
    console.log(`📊 Total records exported:`);
    console.log(`   • ${ports.length} Oil Terminals`);
    console.log(`   • ${refineries.length} Refineries`);
    console.log(`   • ${vessels.length} Oil Vessels`);
    console.log(`   • ${connections.length} Connections`);
    console.log(`   • ${companies.length} Companies`);
    console.log(`   • ${jobs.length} Jobs`);
    console.log(`   • ${documents.length} Documents`);
    console.log(`\n🚀 Ready to import into MySQL!`);

  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

// Run the export
exportDataToMySQL();