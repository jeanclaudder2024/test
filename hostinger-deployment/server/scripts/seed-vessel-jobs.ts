import { db } from "../db";
import {
  vessels,
  gates,
  brokers,
  ports,
  vesselJobs,
  vesselExtraInfo,
  documents
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { seedVesselDocuments } from "./seed-vessel-documents";

/**
 * This script seeds the database with vessel jobs, gates, brokers, documents
 * and extra vessel information for the vessel dashboard feature.
 */
export async function seedVesselJobs() {
  console.log("Starting vessel job seeding...");
  
  // Check if we already have vessel jobs
  const existingJobs = await db.select({ count: sql<number>`count(*)` }).from(vesselJobs);
  
  if (existingJobs[0].count > 0) {
    console.log(`Database already contains ${existingJobs[0].count} vessel jobs.`);
    
    // Even if jobs already exist, seed documents if needed
    const docResult = await seedVesselDocuments();
    
    return {
      jobs: existingJobs[0].count,
      docs: docResult.count,
      extraInfo: 0,
      seeded: false
    };
  }

  try {
    // 1. First, make sure we have ports
    const allPorts = await db.select().from(ports).limit(50);
    
    if (allPorts.length === 0) {
      throw new Error("No ports found in database. Please seed ports first.");
    }
    
    // 2. Create gates for some ports (2-4 gates per port)
    const createdGates = [];
    for (const port of allPorts.slice(0, 15)) {
      const gateCount = Math.floor(Math.random() * 3) + 2; // 2-4 gates
      
      for (let i = 1; i <= gateCount; i++) {
        const gateTypes = ['oil', 'container', 'bulk', 'passenger', 'general'];
        const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
        
        const gateStatus = Math.random() > 0.7 ? 'busy' : 'available';
        
        const gate = await db.insert(gates).values({
          portId: port.id,
          name: `${port.name} Gate ${i}`,
          number: `G${i}`,
          status: gateStatus,
          type: gateType,
          capacity: Math.floor(Math.random() * 5) + 1,
          currentOccupancy: gateStatus === 'busy' ? 1 : 0,
          description: `Gate ${i} at ${port.name} port for ${gateType} cargo`,
          createdAt: new Date(),
          lastUpdated: new Date()
        }).returning();
        
        createdGates.push(gate[0]);
      }
    }
    
    console.log(`Created ${createdGates.length} gates for ports`);
    
    // 3. Create sample brokers (if not exist)
    let allBrokers = await db.select().from(brokers);
    
    if (allBrokers.length === 0) {
      const brokerData = [
        {
          name: "Mohammed Al-Saud",
          company: "Gulf Maritime Trading",
          email: "msaud@gmtrading.com",
          phone: "+966 55 123 4567",
          country: "Saudi Arabia",
          createdAt: new Date(),
          lastUpdated: new Date()
        },
        {
          name: "Sarah Johnson",
          company: "Atlantic Shipping Services",
          email: "sjohnson@atlanticship.com",
          phone: "+1 212 555 7890",
          country: "United States",
          createdAt: new Date(),
          lastUpdated: new Date()
        },
        {
          name: "Liu Wei",
          company: "Pacific Rim Logistics",
          email: "wliu@pacificrimlog.cn",
          phone: "+86 10 8765 4321",
          country: "China",
          createdAt: new Date(),
          lastUpdated: new Date()
        },
        {
          name: "Elena Petrova",
          company: "Black Sea Shipping",
          email: "epetrova@blacksea.ru",
          phone: "+7 495 123 4567",
          country: "Russia",
          createdAt: new Date(),
          lastUpdated: new Date()
        },
        {
          name: "Jamal Abubakar",
          company: "Emirates Oil Transport",
          email: "jabubakar@emiroil.ae",
          phone: "+971 50 123 4567",
          country: "UAE",
          createdAt: new Date(),
          lastUpdated: new Date()
        }
      ];
      
      for (const broker of brokerData) {
        await db.insert(brokers).values(broker).returning();
      }
      
      allBrokers = await db.select().from(brokers);
      console.log(`Created ${allBrokers.length} brokers`);
    }
    
    // 4. Get oil vessels and assign jobs
    const oilVessels = await db.select()
      .from(vessels)
      .where(sql`LOWER(${vessels.vesselType}) LIKE ${'%oil%'} OR LOWER(${vessels.vesselType}) LIKE ${'%tanker%'}`)
      .limit(50);
    
    const jobTypes = ['loading', 'unloading', 'inspection', 'maintenance', 'refueling'];
    const jobStatuses = ['pending', 'in_progress', 'completed', 'delayed'];
    const cargoTypes = ['crude oil', 'gasoline', 'diesel', 'jet fuel', 'LNG', 'petroleum products'];
    
    let jobsCreated = 0;
    let extraInfoCreated = 0;
    let docsCreated = 0;
    
    // Create vessel jobs
    for (const vessel of oilVessels) {
      // Only create jobs for vessels with coordinates
      if (!vessel.currentLat || !vessel.currentLng) continue;
      
      // Find a random gate
      const randomGate = createdGates[Math.floor(Math.random() * createdGates.length)];
      // Find a random broker
      const randomBroker = allBrokers[Math.floor(Math.random() * allBrokers.length)];
      
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const jobStatus = jobStatuses[Math.floor(Math.random() * jobStatuses.length)];
      
      // Set dates
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 7)); // Start 0-7 days ago
      
      const estimatedEndTime = new Date(startTime);
      estimatedEndTime.setDate(estimatedEndTime.getDate() + Math.floor(Math.random() * 14) + 1); // End 1-14 days from start
      
      // For completed jobs, set actual end time
      const actualEndTime = jobStatus === 'completed' ? new Date(startTime) : null;
      if (actualEndTime) {
        actualEndTime.setDate(actualEndTime.getDate() + Math.floor(Math.random() * 10) + 1); // End 1-10 days from start
      }
      
      // Create cargo details
      const cargoType = cargoTypes[Math.floor(Math.random() * cargoTypes.length)];
      const quantity = Math.floor(Math.random() * 100000) + 10000;
      const unit = "barrels";
      
      const cargoDetails = JSON.stringify({
        type: cargoType,
        quantity: quantity,
        unit: unit,
        origin: randomBroker.country
      });
      
      // Determine unloading progress
      let unloadingProgress = 0;
      if (jobStatus === 'completed') {
        unloadingProgress = 100;
      } else if (jobStatus === 'in_progress') {
        unloadingProgress = Math.floor(Math.random() * 90) + 10; // 10-99%
      }
      
      // Create job
      const job = await db.insert(vesselJobs).values({
        vesselId: vessel.id,
        jobType: jobType,
        status: jobStatus,
        gateId: randomGate.id,
        brokerId: randomBroker.id,
        startTime: startTime,
        estimatedEndTime: estimatedEndTime,
        actualEndTime: actualEndTime,
        cargoDetails: cargoDetails,
        unloadingProgress: unloadingProgress,
        createdAt: new Date(),
        lastUpdated: new Date(),
        notes: `${jobType} operation for ${vessel.name}, carrying ${cargoType}`
      }).returning();
      
      jobsCreated++;
      
      // Create extra info for vessel dashboard
      // Determine status based on job status
      let loadingStatus = 'waiting';
      let colorCode = 'blue';
      
      if (jobStatus === 'in_progress' && jobType === 'unloading') {
        loadingStatus = 'unloading';
        colorCode = 'red';
      } else if (jobStatus === 'completed') {
        loadingStatus = 'completed';
        colorCode = 'green';
      } else if (jobStatus === 'in_progress' && jobType === 'loading') {
        loadingStatus = 'loading';
        colorCode = 'purple';
      }
      
      // Check if vessel already has extra info
      const existingInfo = await db.select().from(vesselExtraInfo).where(eq(vesselExtraInfo.vesselId, vessel.id));
      
      if (existingInfo.length === 0) {
        await db.insert(vesselExtraInfo).values({
          vesselId: vessel.id,
          loadingStatus: loadingStatus,
          colorCode: colorCode,
          currentGateId: randomGate.id,
          lastSeen: new Date(),
          lastUpdated: new Date()
        } as any);
        
        extraInfoCreated++;
      }
      
      // Create documents for vessel
      const docTypes = ['Bill of Lading', 'Cargo Manifest', 'Certificate of Origin', 'Quality Certificate', 'Inspection Report'];
      const docStatuses = ['active', 'pending', 'expired'];
      
      // Create 2-4 documents per vessel
      const docCount = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < docCount; i++) {
        const docType = docTypes[Math.floor(Math.random() * docTypes.length)];
        const docStatus = docStatuses[Math.floor(Math.random() * docStatuses.length)];
        
        // Set dates
        const issueDate = new Date();
        issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 30)); // Issued 0-30 days ago
        
        const expiryDate = new Date(issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Valid for 1 year
        
        // Generate content for document
        const content = `This ${docType} certifies that the cargo of ${JSON.parse(cargoDetails).type} 
          with quantity ${JSON.parse(cargoDetails).quantity} ${JSON.parse(cargoDetails).unit}
          is being transported by the vessel ${vessel.name} (IMO: ${vessel.imo})
          from ${randomBroker.country} to the destination port.
          
          This document was issued on ${issueDate.toLocaleDateString()}
          and remains valid until ${expiryDate.toLocaleDateString()}.
          
          Authorized by: ${randomBroker.name}
          Company: ${randomBroker.company}
          Reference: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        await db.insert(documents).values({
          vesselId: vessel.id,
          type: docType,
          title: `${docType} - ${vessel.name}`,
          content: content,
          status: docStatus,
          issueDate: issueDate,
          expiryDate: expiryDate,
          reference: `DOC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          issuer: randomBroker.name,
          recipientName: "Port Authority",
          recipientOrg: randomGate.name,
          createdAt: new Date(),
          lastUpdated: new Date()
        }).returning();
        
        docsCreated++;
      }
    }
    
    console.log(`Seeded ${jobsCreated} vessel jobs`);
    console.log(`Created ${extraInfoCreated} vessel extra info records`);
    console.log(`Created ${docsCreated} vessel documents`);
    
    // Additionally seed more formatted documents for the document viewer
    const docResult = await seedVesselDocuments();
    const totalDocs = docsCreated + docResult.count;
    
    console.log(`Seeded an additional ${docResult.count} vessel documents with the document seeder`);
    
    return {
      jobs: jobsCreated,
      extraInfo: extraInfoCreated,
      docs: totalDocs,
      brokers: allBrokers.length,
      gates: createdGates.length,
      seeded: true
    };
    
  } catch (error) {
    console.error("Error seeding vessel jobs:", error);
    throw error;
  }
}

// This script can be imported or run directly
// When imported, only the functions are used
// For direct execution, see npm scripts