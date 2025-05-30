import express from 'express';
import { vessels } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { generateSimplePdf } from './simplePdfGenerator';

const router = express.Router();

// Route to generate a simple PDF document that works reliably
router.post('/api/vessels/:id/simple-pdf', async (req, res) => {
  try {
    const vesselId = parseInt(req.params.id);
    const documentType = req.body.documentType || 'Document';
    
    if (isNaN(vesselId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vessel ID'
      });
    }
    
    // Get vessel details from database
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
    
    // Generate PDF options
    const pdfOptions = {
      title: documentType,
      vesselName: vessel.name,
      type: documentType,
      data: {
        cargoType: vessel.cargoType,
        cargoQuantity: vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} MT` : 'Not specified',
        departurePort: vessel.departurePort,
        destinationPort: vessel.destinationPort,
        sellerName: vessel.sellerName,
        buyerName: vessel.buyerName
      }
    };
    
    // Generate the PDF
    const pdfBuffer = await generateSimplePdf(pdfOptions);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${documentType.replace(/\s+/g, '_')}_${vessel.name.replace(/\s+/g, '_')}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF document:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating document'
    });
  }
});

export default router;