import { Request, Response } from 'express';
import { db } from '../db';
import { vessels } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateCargoManifestPDF } from '../services/cargo-manifest-service';
import { generateNutManifestPDF } from '../services/cargo-manifest-service';

/**
 * Generate a cargo manifest for a vessel
 */
export async function generateCargoManifest(req: Request, res: Response) {
  try {
    const vesselId = parseInt(req.params.id);
    const manifestType = req.query.type as string || 'standard';
    
    if (isNaN(vesselId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid vessel ID' 
      });
    }
    
    // Get vessel data from database
    const [vessel] = await db
      .select()
      .from(vessels)
      .where(eq(vessels.id, vesselId));
    
    if (!vessel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vessel not found' 
      });
    }
    
    // Generate manifest content with available vessel data
    const manifestData = {
      vesselId: vessel.id,
      vesselName: vessel.name,
      vesselIMO: vessel.imo,
      vesselMMSI: vessel.mmsi,
      cargoType: vessel.cargoType || 'Not specified',
      cargoCapacity: vessel.cargoCapacity,
      departurePort: vessel.departurePort,
      destinationPort: vessel.destinationPort,
      departureDate: vessel.departureDate ? new Date(vessel.departureDate).toLocaleDateString() : 'Not specified',
      eta: vessel.eta ? new Date(vessel.eta).toLocaleDateString() : 'Not specified',
      generatedTime: new Date().toISOString(),
      lastPosition: vessel.currentLat && vessel.currentLng ? 
        `${vessel.currentLat}, ${vessel.currentLng}` : 'Unknown',
      buyerName: vessel.buyerName || 'Not specified',
      sellerName: vessel.sellerName || 'Not specified',
      flag: vessel.flag,
      built: vessel.built
    };
    
    let pdfBuffer;
    
    // Check if this is a nut-specific cargo manifest
    if (manifestType === 'nut' || (vessel.cargoType && vessel.cargoType.toLowerCase().includes('nut'))) {
      // Add nut-specific data
      const nutManifestData = {
        ...manifestData,
        nutType: determineNutType(vessel.cargoType) || 'Mixed Nuts',
        nutGrade: 'Grade A', // This would come from a real database field
        nutOrigin: vessel.departurePort || 'Unknown origin',
        nutProcessingMethod: 'Dry Roasted', // This would come from a real database field
        moistureContent: '< 5%', // This would come from a real database field
        packaging: 'Bulk - Food Grade Containers' // This would come from a real database field
      };
      
      pdfBuffer = await generateNutManifestPDF(nutManifestData);
      
    } else {
      // Generate standard PDF document
      pdfBuffer = await generateCargoManifestPDF(manifestData);
    }
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 
      `attachment; filename="Cargo_Manifest_${vessel.name}_${new Date().toISOString().slice(0,10)}.pdf"`);
    
    // Send PDF as response
    return res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating cargo manifest:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error generating cargo manifest' 
    });
  }
}

/**
 * Helper function to determine nut type from cargo description
 */
function determineNutType(cargoType: string | null): string | null {
  if (!cargoType) return null;
  
  const cargoLower = cargoType.toLowerCase();
  
  if (cargoLower.includes('almond')) return 'Almonds';
  if (cargoLower.includes('cashew')) return 'Cashews';
  if (cargoLower.includes('walnut')) return 'Walnuts';
  if (cargoLower.includes('peanut')) return 'Peanuts';
  if (cargoLower.includes('pistachio')) return 'Pistachios';
  if (cargoLower.includes('pecan')) return 'Pecans';
  if (cargoLower.includes('hazelnut')) return 'Hazelnuts';
  if (cargoLower.includes('brazil')) return 'Brazil Nuts';
  if (cargoLower.includes('macadamia')) return 'Macadamias';
  
  return 'Mixed Nuts';
}