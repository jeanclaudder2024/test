import { Request, Response, Router } from "express";
import PDFDocument from "pdfkit";
import { vessels } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

// Create router
export const directPdfRouter = Router();

// Generate a simple PDF document 
directPdfRouter.post('/api/vessels/:id/direct-pdf', async (req: Request, res: Response) => {
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
    
    // Create a PDF document directly
    const doc = new PDFDocument({
      size: 'A4',
      info: {
        Title: `${documentType} - ${vessel.name}`,
        Author: 'PetroDealHub Maritime System',
        Creator: 'PetroDealHub Maritime System',
        Producer: 'PetroDealHub',
        Subject: `${documentType}`,
        CreationDate: new Date()
      },
      autoFirstPage: true,
      compress: true
    });
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${documentType.replace(/\s+/g, '_')}_${vessel.name.replace(/\s+/g, '_')}.pdf`);
    
    // Pipe PDF directly to response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(24)
      .text(documentType, {
        align: 'center'
      })
      .moveDown();
    
    // Add vessel name
    doc.fontSize(18)
      .text(`Vessel: ${vessel.name}`, {
        align: 'center'
      })
      .moveDown();
    
    // Add document date
    doc.fontSize(12)
      .text(`Date: ${new Date().toLocaleDateString()}`, {
        align: 'center'
      })
      .moveDown();
    
    // Add document type specific content
    doc.fontSize(14)
      .text(`Document Type: ${documentType}`, {
        align: 'left'
      })
      .moveDown();
    
    if (documentType === 'Cargo Manifest') {
      // Add cargo details
      doc.fontSize(12)
        .text(`Cargo Type: ${vessel.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Quantity: ${vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} MT` : 'Not specified'}`)
        .moveDown()
        .text(`Origin: ${vessel.departurePort || 'Not specified'}`)
        .moveDown()
        .text(`Destination: ${vessel.destinationPort || 'Not specified'}`)
        .moveDown();
      
      // Add signature line
      doc.moveDown(2)
        .text('________________________', {
          align: 'left'
        })
        .text('Master Signature', {
          align: 'left'
        });
    } 
    else if (documentType === 'Bill of Lading') {
      // Add shipping details
      doc.fontSize(12)
        .text(`B/L Number: BL-${Math.floor(Math.random() * 1000000)}`)
        .moveDown()
        .text(`Shipper: ${vessel.sellerName || 'Not specified'}`)
        .moveDown()
        .text(`Consignee: ${vessel.buyerName || 'Not specified'}`)
        .moveDown()
        .text(`Cargo: ${vessel.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Quantity: ${vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} MT` : 'Not specified'}`)
        .moveDown();
      
      // Add signature line
      doc.moveDown(2)
        .text('________________________', {
          align: 'left'
        })
        .text('Authorized Signature', {
          align: 'left'
        });
    }
    else if (documentType === 'Certificate of Origin') {
      // Add origin details
      doc.fontSize(12)
        .text(`Certificate Number: CO-${Math.floor(Math.random() * 1000000)}`)
        .moveDown()
        .text(`Exporter: ${vessel.sellerName || 'Not specified'}`)
        .moveDown()
        .text(`Importer: ${vessel.buyerName || 'Not specified'}`)
        .moveDown()
        .text(`Goods: ${vessel.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Origin: ${vessel.departurePort ? vessel.departurePort.split(',')[0] : 'Not specified'}`)
        .moveDown();
      
      // Add signature line
      doc.moveDown(2)
        .text('________________________', {
          align: 'left'
        })
        .text('Authorized Signature', {
          align: 'left'
        });
    }
    
    // Add footer
    doc.fontSize(10)
      .text('PetroDealHub Maritime System', {
        align: 'center'
      })
      .text(`Generated: ${new Date().toLocaleString()}`, {
        align: 'center'
      });
    
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