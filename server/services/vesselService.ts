import { storage } from "../storage";
import { InsertVessel, InsertProgressEvent, Vessel, ProgressEvent } from "@shared/schema";

export const vesselService = {
  getAllVessels: async () => {
    return storage.getVessels();
  },

  getVesselById: async (id: number) => {
    return storage.getVesselById(id);
  },

  getVesselsByRegion: async (region: string) => {
    return storage.getVesselsByRegion(region);
  },

  createVessel: async (vessel: InsertVessel) => {
    return storage.createVessel(vessel);
  },

  updateVessel: async (id: number, vesselData: Partial<InsertVessel>) => {
    return storage.updateVessel(id, vesselData);
  },

  deleteVessel: async (id: number) => {
    return storage.deleteVessel(id);
  },

  // Progress events
  getVesselProgressEvents: async (vesselId: number) => {
    return storage.getProgressEventsByVesselId(vesselId);
  },

  addProgressEvent: async (event: InsertProgressEvent) => {
    return storage.createProgressEvent(event);
  },

  deleteProgressEvent: async (id: number) => {
    return storage.deleteProgressEvent(id);
  },

  // Seed data for development
  seedVesselData: async () => {
    const vessels: InsertVessel[] = [
      {
        name: "Aquitania Voyager",
        imo: "9732852",
        mmsi: "538005831",
        vesselType: "Crude Oil Tanker",
        flag: "Marshall Islands",
        built: 2016,
        deadweight: 299999,
        currentLat: 36.1344,
        currentLng: 5.4548,
        departurePort: "Ras Tanura, Saudi Arabia",
        departureDate: new Date("2023-03-15"),
        destinationPort: "Houston, USA",
        eta: new Date("2023-03-29"),
        cargoType: "Crude Oil - Arabian Heavy",
        cargoCapacity: 2000000,
        currentRegion: "Europe"
      },
      {
        name: "Nordic Freedom",
        imo: "9256602",
        mmsi: "563119000",
        vesselType: "Crude Oil Tanker",
        flag: "Singapore",
        built: 2005,
        deadweight: 159000,
        currentLat: 28.3621,
        currentLng: -89.4287,
        departurePort: "Corpus Christi, USA",
        departureDate: new Date("2023-03-10"),
        destinationPort: "Rotterdam, Netherlands",
        eta: new Date("2023-03-25"),
        cargoType: "Crude Oil - WTI",
        cargoCapacity: 1000000,
        currentRegion: "North America"
      },
      {
        name: "Pacific Horizon",
        imo: "9837628",
        mmsi: "372045000",
        vesselType: "LNG Carrier",
        flag: "Panama",
        built: 2019,
        deadweight: 84000,
        currentLat: 22.5346,
        currentLng: 59.7478,
        departurePort: "Ras Laffan, Qatar",
        departureDate: new Date("2023-03-12"),
        destinationPort: "Tokyo, Japan",
        eta: new Date("2023-03-28"),
        cargoType: "Liquefied Natural Gas",
        cargoCapacity: 170000,
        currentRegion: "MEA"
      }
    ];

    const progressEvents: InsertProgressEvent[] = [
      {
        vesselId: 1,
        date: new Date("2023-03-24"),
        event: "Vessel passed Gibraltar Strait",
        lat: 36.1344,
        lng: 5.4548,
        location: "36.1344° N, 5.4548° W"
      },
      {
        vesselId: 1,
        date: new Date("2023-03-22"),
        event: "Vessel entered Mediterranean Sea",
        lat: 35.9375,
        lng: 14.3754,
        location: "35.9375° N, 14.3754° E"
      },
      {
        vesselId: 1,
        date: new Date("2023-03-18"),
        event: "Vessel passed Suez Canal",
        lat: 30.0286,
        lng: 32.5793,
        location: "30.0286° N, 32.5793° E"
      }
    ];

    // Create vessels
    const createdVessels: Vessel[] = [];
    for (const vessel of vessels) {
      const created = await storage.createVessel(vessel);
      createdVessels.push(created);
    }

    // Create progress events
    for (const event of progressEvents) {
      await storage.createProgressEvent(event);
    }

    // Update stats with cargo info
    let totalCargo = 0;
    createdVessels.forEach(vessel => {
      if (vessel.cargoCapacity) {
        totalCargo += vessel.cargoCapacity;
      }
    });

    await storage.updateStats({ 
      totalCargo: BigInt(totalCargo),
      activeVessels: createdVessels.length
    });

    return {
      vessels: createdVessels.length,
      progressEvents: progressEvents.length
    };
  }
};
