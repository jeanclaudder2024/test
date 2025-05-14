import { Request, Response } from 'express';
import { db } from '../db';
import { vessels } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateCargoManifestPDF } from '../services/cargo-manifest-service';

/**
 * Generate a cargo manifest for a vessel
 */
export async function generateCargoManifest(req: Request, res: Response) {
  try {
    const vesselId = parseInt(req.params.id);
    
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
    
    // Generate manifest content
    const manifestData = {
      vesselId: vessel.id,
      vesselName: vessel.name,
      vesselIMO: vessel.imo,
      vesselMMSI: vessel.mmsi,
      cargoType: vessel.cargoType || 'Not specified',
      cargoQuantity: vessel.cargoQuantity || 0,
      cargoUnit: vessel.cargoUnit || 'MT',
      departurePort: vessel.departurePort || 'Unknown',
      destinationPort: vessel.destinationPort || 'Unknown',
      departureTime: vessel.departureTime ? new Date(vessel.departureTime).toLocaleDateString() : 'Not specified',
      eta: vessel.eta ? new Date(vessel.eta).toLocaleDateString() : 'Not specified',
      generatedTime: new Date().toISOString(),
      lastPosition: vessel.currentLat && vessel.currentLng ? 
        `${vessel.currentLat}, ${vessel.currentLng}` : 'Unknown',
      vesselStatus: vessel.status || 'Unknown'
    };
    
    // Generate PDF document
    const pdfBuffer = await generateCargoManifestPDF(manifestData);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Cargo_Manifest_${vessel.name}_${new Date().toISOString().slice(0,10)}.pdf"`);
    
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