import { Request, Response, Router } from "express";
import PDFDocument from "pdfkit";
import { vessels } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

// Create router
export const reliablePdfRouter = Router();

// Generate a simple PDF document that is guaranteed to work
reliablePdfRouter.post('/api/vessels/:id/reliable-pdf', async (req: Request, res: Response) => {
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
    
    // Create a basic PDF document with no external dependencies
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `${documentType} - ${vessel.name}`,
        Author: 'PetroDealHub Maritime System',
      }
    });
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${documentType.replace(/\s+/g, '_')}_${vessel.name.replace(/\s+/g, '_')}.pdf`);
    
    // Pipe PDF directly to response
    doc.pipe(res);
    
    // Add document title
    doc.fontSize(24)
      .fillColor('#F97316')
      .text(documentType.toUpperCase(), { align: 'center' })
      .moveDown(0.5);
    
    // Add vessel name
    doc.fontSize(16)
      .fillColor('#333333')
      .text(`VESSEL: ${vessel.name}`, { align: 'center' })
      .moveDown();
    
    // Add document date
    doc.fontSize(12)
      .fillColor('#333333')
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' })
      .moveDown(2);
    
    // Add document content
    if (documentType === 'Cargo Manifest') {
      doc.fontSize(14)
        .fillColor('#F97316')
        .text('CARGO DETAILS', { underline: true })
        .moveDown();
        
      doc.fontSize(12)
        .fillColor('#333333')
        .text(`Cargo Type: ${vessel.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Quantity: ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'Not specified'}`)
        .moveDown()
        .text(`Origin: ${vessel.departurePort || 'Not specified'}`)
        .moveDown()
        .text(`Destination: ${vessel.destinationPort || 'Not specified'}`)
        .moveDown(2);
    } 
    else if (documentType === 'Bill of Lading') {
      doc.fontSize(14)
        .fillColor('#F97316')
        .text('BILL OF LADING DETAILS', { underline: true })
        .moveDown();
        
      doc.fontSize(12)
        .fillColor('#333333')
        .text(`Bill of Lading Number: BL-${Math.floor(Math.random() * 1000000)}`)
        .moveDown()
        .text(`Shipper: ${vessel.sellerName || 'Not specified'}`)
        .moveDown()
        .text(`Consignee: ${vessel.buyerName || 'Not specified'}`)
        .moveDown()
        .text(`Cargo: ${vessel.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Quantity: ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'Not specified'}`)
        .moveDown(2);
    }
    else if (documentType === 'Certificate of Origin') {
      doc.fontSize(14)
        .fillColor('#F97316')
        .text('CERTIFICATE OF ORIGIN DETAILS', { underline: true })
        .moveDown();
        
      doc.fontSize(12)
        .fillColor('#333333')
        .text(`Certificate Number: CO-${Math.floor(Math.random() * 1000000)}`)
        .moveDown()
        .text(`Exporter: ${vessel.sellerName || 'Not specified'}`)
        .moveDown()
        .text(`Importer: ${vessel.buyerName || 'Not specified'}`)
        .moveDown()
        .text(`Goods: ${vessel.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Origin: ${vessel.departurePort ? vessel.departurePort.split(',')[0] : 'Not specified'}`)
        .moveDown(2);
    }
    
    // Add certification text
    doc.fontSize(12)
      .fillColor('#333333')
      .text('This document certifies that the information contained herein is true and accurate to the best of our knowledge.', { align: 'justify' })
      .moveDown(2);
    
    // Add signature line
    doc.moveTo(100, doc.y)
      .lineTo(250, doc.y)
      .stroke();
      
    doc.moveDown(0.5)
      .fontSize(10)
      .text('Authorized Signature', 100);
    
    // Add footer
    doc.fontSize(10)
      .text('PetroDealHub Maritime System', { align: 'center' })
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    
    // Finalize the PDF file
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF document:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating document'
    });
  }
});