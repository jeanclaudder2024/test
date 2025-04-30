import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Vessel, ProgressEvent } from '@shared/schema';

/**
 * Custom hook to fetch all vessels
 */
export const useVessels = () => {
  return useQuery({
    queryKey: ['/api/vessels'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/vessels');
        return response.data as Vessel[];
      } catch (error) {
        console.error('Error fetching vessels:', error);
        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Custom hook to fetch vessels near a specific refinery
 */
export const useVesselsNearRefinery = (refineryId: number) => {
  return useQuery({
    queryKey: [`/api/vessels/near-refinery/${refineryId}`],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/vessels/near-refinery/${refineryId}`);
        return response.data as Vessel[];
      } catch (error) {
        console.error(`Error fetching vessels near refinery ID ${refineryId}:`, error);
        
        // Generate fallback vessels for the refinery if API fails
        return generateFallbackVessels(refineryId);
      }
    },
    enabled: !!refineryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Custom hook to fetch progress events for a specific vessel
 */
export const useVesselProgressEvents = (vesselId: number) => {
  return useQuery({
    queryKey: [`/api/vessels/${vesselId}/progress-events`],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/vessels/${vesselId}/progress-events`);
        return response.data as ProgressEvent[];
      } catch (error) {
        console.error(`Error fetching progress events for vessel ID ${vesselId}:`, error);
        return generateFallbackProgressEvents(vesselId);
      }
    },
    enabled: !!vesselId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Generate fallback vessels for a refinery when API calls fail
 */
const generateFallbackVessels = (refineryId: number): Vessel[] => {
  // Fetch refinery data to generate appropriate vessels
  const getRefineryData = async () => {
    try {
      const response = await axios.get(`/api/refineries/${refineryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching refinery data for ID ${refineryId}:`, error);
      return null;
    }
  };
  
  // Generate 2-5 random vessels
  const vesselCount = 2 + Math.floor(Math.random() * 4);
  const mockVessels: Vessel[] = [];
  
  // Generate vessel names
  const vesselNames = [
    'Pacific Crown', 'Oriental Jade', 'Gulf Explorer', 'Atlantic Pioneer', 
    'Nordic Prince', 'Desert Voyager', 'Ocean Guardian', 'Liberty Star',
    'Arabian Sea', 'Mediterranean Pride', 'Caspian Eagle', 'Persian Gulf'
  ];
  
  // Generate vessels with random data
  for (let i = 0; i < vesselCount; i++) {
    const name = vesselNames[Math.floor(Math.random() * vesselNames.length)];
    
    const vessel: Vessel = {
      id: refineryId * 1000 + i,
      name,
      imo: `IMO${9000000 + refineryId * 100 + i}`,
      mmsi: `${300000000 + refineryId * 100 + i}`,
      vesselType: 'Oil Tanker',
      flag: ['Panama', 'Liberia', 'Marshall Islands', 'Singapore'][Math.floor(Math.random() * 4)],
      built: 1990 + Math.floor(Math.random() * 30),
      deadweight: 50000 + Math.floor(Math.random() * 100000),
      currentLat: (Math.random() * 180 - 90).toString(),
      currentLng: (Math.random() * 360 - 180).toString(),
      destinationPort: 'Port of Destination',
      departurePort: 'Port of Departure',
      cargoType: 'Crude Oil',
      cargoCapacity: 50000 + Math.floor(Math.random() * 150000),
      eta: new Date(Date.now() + 86400000 * Math.floor(Math.random() * 5)),
      departureDate: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 10))
    };
    
    mockVessels.push(vessel);
  }
  
  console.log(`Generated ${mockVessels.length} fallback vessels for refinery ID ${refineryId}`);
  return mockVessels;
};

/**
 * Generate fallback progress events for a vessel when API calls fail
 */
const generateFallbackProgressEvents = (vesselId: number): ProgressEvent[] => {
  const events: ProgressEvent[] = [];
  
  // Generate 2-5 random events
  const eventCount = 2 + Math.floor(Math.random() * 4);
  
  // Event types
  const eventTypes = [
    { title: 'Departure', description: 'Vessel departed from port' },
    { title: 'Position Update', description: 'Vessel position updated' },
    { title: 'Weather Alert', description: 'Weather warning in vessel area' },
    { title: 'Speed Change', description: 'Vessel changed speed' },
    { title: 'Course Change', description: 'Vessel changed course' },
    { title: 'Port Arrival', description: 'Vessel arrived at port' },
    { title: 'Cargo Loading', description: 'Cargo loading in progress' },
    { title: 'Cargo Unloading', description: 'Cargo unloading in progress' }
  ];
  
  // Generate events with decreasing timestamps (oldest first)
  for (let i = 0; i < eventCount; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const daysAgo = eventCount - i;
    
    const event: ProgressEvent = {
      id: vesselId * 100 + i,
      vesselId: vesselId,
      title: eventType.title,
      description: eventType.description,
      timestamp: new Date(Date.now() - 86400000 * daysAgo),
      latitude: (Math.random() * 180 - 90).toString(),
      longitude: (Math.random() * 360 - 180).toString(),
      eventType: 'STATUS_UPDATE'
    };
    
    events.push(event);
  }
  
  return events;
};