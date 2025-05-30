import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import axios from 'axios';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Risk analytics component for vessel collision prediction and safety zones
interface VesselRiskAnalyticsProps {
  vessel: any;
  nearbyVessels?: any[];
  riskAnalysisEnabled?: boolean;
  safetyZonesEnabled?: boolean;
  collisionPredictionEnabled?: boolean;
  enableRealTimeAlerts?: boolean;
}

const VesselRiskAnalytics: React.FC<VesselRiskAnalyticsProps> = ({
  vessel,
  nearbyVessels = [],
  riskAnalysisEnabled = true,
  safetyZonesEnabled = true,
  collisionPredictionEnabled = true,
  enableRealTimeAlerts = true
}) => {
  const map = useMap();
  const { toast } = useToast();
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [safetyZones, setSafetyZones] = useState<L.Circle[]>([]);
  const [collisionRisks, setCollisionRisks] = useState<any[]>([]);
  const [vesselGroups, setVesselGroups] = useState<L.LayerGroup>();
  
  // Initialize safety layers
  useEffect(() => {
    if (!map || !vessel) return;
    
    // Create layer group for vessel safety zones and collision risks
    const group = L.layerGroup().addTo(map);
    setVesselGroups(group);
    
    // Cleanup on unmount
    return () => {
      if (group) {
        map.removeLayer(group);
      }
    };
  }, [map, vessel]);
  
  // Parse vessel metadata to get course and speed
  const parseVesselMetadata = (vessel: any) => {
    let course = 0;
    let speed = 0;
    
    try {
      if (vessel.metadata && typeof vessel.metadata === 'string') {
        const metadata = JSON.parse(vessel.metadata);
        course = metadata?.course || 0;
        speed = metadata?.currentSpeed || 0;
      }
    } catch (e) {
      console.error("Error parsing vessel metadata:", e);
    }
    
    return { course, speed };
  };

  // Update safety zones when vessel position changes
  useEffect(() => {
    if (!map || !vessel || !vesselGroups || !riskAnalysisEnabled) return;
    
    // Clear previous safety zones
    safetyZones.forEach(zone => {
      vesselGroups.removeLayer(zone);
    });
    
    if (!safetyZonesEnabled) return;
    
    // Create safety zones
    const newSafetyZones = [];
    
    if (vessel.currentLat && vessel.currentLng) {
      // Parse the lat/lng values, ensuring they're numbers
      const lat = typeof vessel.currentLat === 'string' ? parseFloat(vessel.currentLat) : vessel.currentLat;
      const lng = typeof vessel.currentLng === 'string' ? parseFloat(vessel.currentLng) : vessel.currentLng;
      const vesselPos: [number, number] = [lat, lng];
      
      // Inner safety zone (immediate danger)
      const innerZone = L.circle(vesselPos, {
        radius: 500, // 500m
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 5',
      }).addTo(vesselGroups);
      
      innerZone.bindTooltip('Critical Safety Zone (500m)', {
        permanent: false,
        direction: 'center',
        className: 'safety-zone-tooltip'
      });
      
      // Middle safety zone (caution)
      const middleZone = L.circle(vesselPos as [number, number], {
        radius: 1500, // 1.5km
        color: '#ff9800',
        fillColor: '#ff9800',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '5, 5',
      }).addTo(vesselGroups);
      
      middleZone.bindTooltip('Caution Zone (1.5km)', {
        permanent: false,
        direction: 'center',
        className: 'safety-zone-tooltip'
      });
      
      // Outer safety zone (awareness)
      const outerZone = L.circle(vesselPos as [number, number], {
        radius: 5000, // 5km
        color: '#2196f3',
        fillColor: '#2196f3',
        fillOpacity: 0.02,
        weight: 1,
        dashArray: '3, 7',
      }).addTo(vesselGroups);
      
      outerZone.bindTooltip('Awareness Zone (5km)', {
        permanent: false,
        direction: 'center',
        className: 'safety-zone-tooltip'
      });
      
      newSafetyZones.push(innerZone, middleZone, outerZone);
    }
    
    setSafetyZones(newSafetyZones);
  }, [map, vessel, vesselGroups, riskAnalysisEnabled, safetyZonesEnabled]);
  
  // Calculate collision risks with nearby vessels
  useEffect(() => {
    if (!map || !vessel || !vesselGroups || !nearbyVessels.length || !riskAnalysisEnabled) return;
    
    // Clear previous collision risks
    collisionRisks.forEach(risk => {
      if (risk.line) vesselGroups.removeLayer(risk.line);
      if (risk.marker) vesselGroups.removeLayer(risk.marker);
    });
    
    if (!collisionPredictionEnabled) return;
    
    const vesselPos = [parseFloat(vessel.currentLat), parseFloat(vessel.currentLng)];
    const vesselCourse = vessel.metadata?.course || 0;
    const vesselSpeed = vessel.metadata?.currentSpeed || 12;
    
    // Calculate potential collisions
    const newCollisionRisks = [];
    let highestRiskLevel: 'low' | 'medium' | 'high' = 'low';
    
    for (const nearbyVessel of nearbyVessels) {
      if (!nearbyVessel.currentLat || !nearbyVessel.currentLng) continue;
      
      const nearbyPos = [parseFloat(nearbyVessel.currentLat), parseFloat(nearbyVessel.currentLng)];
      const distanceKm = calculateDistance(vesselPos[0], vesselPos[1], nearbyPos[0], nearbyPos[1]);
      
      // Skip if too far away (>10km)
      if (distanceKm > 10) continue;
      
      // Get vessel course and speed from metadata (if available) or use defaults
      let nearbyVesselCourse = 0;
      let nearbyVesselSpeed = 12;
      
      try {
        // Try to parse metadata if it exists
        if (typeof nearbyVessel.metadata === 'string' && nearbyVessel.metadata) {
          const metadata = JSON.parse(nearbyVessel.metadata);
          nearbyVesselCourse = metadata?.course || 0;
          nearbyVesselSpeed = metadata?.currentSpeed || 12;
        }
      } catch (e) {
        // If parsing fails, use defaults
        nearbyVesselCourse = 0;
        nearbyVesselSpeed = 12;
      }
      
      // Calculate CPA (Closest Point of Approach)
      const cpa = calculateCPA(
        vesselPos[0], vesselPos[1], vesselCourse, vesselSpeed,
        nearbyPos[0], nearbyPos[1], nearbyVesselCourse, nearbyVesselSpeed
      );
      
      // Determine risk level based on CPA and current distance
      let riskColor, riskLevel: 'low' | 'medium' | 'high';
      
      if (cpa.distance < 0.5) { // Less than 500m
        riskColor = '#ff0000'; // Red
        riskLevel = 'high';
      } else if (cpa.distance < 1.5) { // Less than 1.5km
        riskColor = '#ff9800'; // Orange
        riskLevel = 'medium';
      } else {
        riskColor = '#2196f3'; // Blue
        riskLevel = 'low';
      }
      
      // Update highest risk level
      if (riskLevel === 'high') {
        highestRiskLevel = 'high';
      } else if (riskLevel === 'medium' && highestRiskLevel !== 'high') {
        highestRiskLevel = 'medium';
      }
      
      // Don't show low risk intersections unless they're very close
      if (riskLevel === 'low' && distanceKm > 5) continue;
      
      // Create collision path
      const pathCoordinates = [
        vesselPos as [number, number],
        [cpa.lat1, cpa.lng1] as [number, number],
        [cpa.lat2, cpa.lng2] as [number, number],
        nearbyPos as [number, number]
      ];
      
      // Draw dashed line
      const collisionLine = L.polyline(pathCoordinates, {
        color: riskColor,
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 5',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(vesselGroups);
      
      // Add CPA marker at intersection point
      const intersectionPoint = [
        (cpa.lat1 + cpa.lat2) / 2,
        (cpa.lng1 + cpa.lng2) / 2
      ];
      
      // Create CPA marker
      const cpaMarker = L.circleMarker(intersectionPoint as [number, number], {
        radius: 5,
        color: riskColor,
        fillColor: riskColor,
        fillOpacity: 0.8,
        weight: 2
      }).addTo(vesselGroups);
      
      // Add tooltip with CPA information
      cpaMarker.bindTooltip(`
        <div style="text-align: center;">
          <strong>Possible Collision Point</strong><br/>
          <div style="color: ${riskColor};">${riskLevelToText(riskLevel)} Risk</div>
          <hr style="margin: 3px 0;"/>
          <div>Distance: ${cpa.distance.toFixed(2)} km</div>
          <div>Time to CPA: ${cpa.timeToMinutes.toFixed(0)} minutes</div>
          <div>With vessel: ${nearbyVessel.name}</div>
        </div>
      `, {
        permanent: false,
        direction: 'top',
        className: 'cpa-tooltip'
      });
      
      // Show alert for high-risk collisions
      if (riskLevel === 'high' && enableRealTimeAlerts) {
        toast({
          title: "⚠️ Collision Risk Detected",
          description: `Possible collision with vessel "${nearbyVessel.name}" in ${cpa.timeToMinutes.toFixed(0)} minutes`,
          variant: "destructive",
          duration: 10000
        });
      }
      
      // Store risk
      newCollisionRisks.push({
        line: collisionLine,
        marker: cpaMarker,
        cpa,
        riskLevel,
        nearbyVessel
      });
    }
    
    setCollisionRisks(newCollisionRisks);
    setRiskLevel(highestRiskLevel);
    
    // Add CSS for tooltips
    const style = document.createElement('style');
    style.textContent = `
      .safety-zone-tooltip {
        background-color: rgba(0, 0, 0, 0.6);
        border: none;
        color: white;
        font-weight: normal;
        font-size: 11px;
        padding: 3px 6px;
      }
      
      .cpa-tooltip {
        background-color: rgba(0, 0, 0, 0.8);
        border: none;
        color: white;
        font-weight: normal;
        padding: 5px 8px;
        max-width: 200px;
      }
    `;
    document.head.appendChild(style);
    
  }, [map, vessel, vesselGroups, nearbyVessels, riskAnalysisEnabled, collisionPredictionEnabled, enableRealTimeAlerts, toast]);
  
  // Calculate CPA (Closest Point of Approach)
  const calculateCPA = (
    lat1: number, lng1: number, course1: number, speed1: number,
    lat2: number, lng2: number, course2: number, speed2: number
  ) => {
    // Convert course to radians
    const course1Rad = (90 - course1) * Math.PI / 180;
    const course2Rad = (90 - course2) * Math.PI / 180;
    
    // Convert speeds to km/h
    const speed1Kmh = speed1 * 1.852; // Convert knots to km/h
    const speed2Kmh = speed2 * 1.852;
    
    // Calculate velocity components
    const vx1 = speed1Kmh * Math.cos(course1Rad);
    const vy1 = speed1Kmh * Math.sin(course1Rad);
    const vx2 = speed2Kmh * Math.cos(course2Rad);
    const vy2 = speed2Kmh * Math.sin(course2Rad);
    
    // Relative velocity
    const vx = vx2 - vx1;
    const vy = vy2 - vy1;
    
    // Current distance
    const dx = (lng2 - lng1) * 111.320 * Math.cos((lat1 + lat2) * Math.PI / 360); // km
    const dy = (lat2 - lat1) * 110.574; // km
    
    // Projected time to CPA
    const dotProduct = dx * vx + dy * vy;
    const relVelocitySquared = vx * vx + vy * vy;
    
    // If relative velocity is very small, they're not moving relative to each other
    if (relVelocitySquared < 0.0001) {
      return {
        distance: Math.sqrt(dx * dx + dy * dy), // Current distance
        timeToMinutes: 9999, // Large number to indicate "never"
        lat1, lng1, // Current position of vessel 1
        lat2, lng2  // Current position of vessel 2
      };
    }
    
    // Time to CPA in hours
    const timeToCPA = -dotProduct / relVelocitySquared;
    
    // CPA positions
    const cpaLat1 = lat1 + (vy1 * timeToCPA) / 110.574;
    const cpaLng1 = lng1 + (vx1 * timeToCPA) / (111.320 * Math.cos(lat1 * Math.PI / 180));
    const cpaLat2 = lat2 + (vy2 * timeToCPA) / 110.574;
    const cpaLng2 = lng2 + (vx2 * timeToCPA) / (111.320 * Math.cos(lat2 * Math.PI / 180));
    
    // Distance at CPA in km
    const cpaDistance = calculateDistance(cpaLat1, cpaLng1, cpaLat2, cpaLng2);
    
    return {
      distance: cpaDistance,
      timeToMinutes: Math.max(0, timeToCPA * 60), // Convert to minutes, minimum 0
      lat1: cpaLat1,
      lng1: cpaLng1,
      lat2: cpaLat2,
      lng2: cpaLng2
    };
  };
  
  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Convert risk level to text
  const riskLevelToText = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };
  
  return null; // This component doesn't render anything directly
};

export default VesselRiskAnalytics;