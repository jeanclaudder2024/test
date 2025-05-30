import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';

/**
 * Generates a simple PDF document for vessel documents
 * This bare-bones version ensures compatibility with all PDF readers
 */
export async function generateBasicPdf(req: Request, res: Response) {
  try {
    const { vesselId, documentType } = req.body;
    const vesselName = req.body.vesselName || 'Vessel';
    
    // Create a basic PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: `${documentType} - ${vesselName}`,
        Author: 'PetroDealHub Maritime System',
        Subject: 'Vessel Document',
        Keywords: 'vessel, shipping, document'
      }
    });
    
    // Setup document response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${documentType.replace(/\s+/g, '_')}_${vesselName.replace(/\s+/g, '_')}.pdf"`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Basic document header
    doc.fontSize(24)
      .font('Helvetica-Bold')
      .text(documentType.toUpperCase(), { align: 'center' })
      .moveDown(0.5);
      
    doc.fontSize(16)
      .font('Helvetica')
      .text(`Vessel: ${vesselName}`, { align: 'center' })
      .moveDown(1);
    
    // Add divider
    doc.moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#000000')
      .lineWidth(1)
      .stroke();
      
    doc.moveDown(1);
    
    // Document content based on type
    if (documentType === 'Cargo Manifest') {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('CARGO DETAILS', { underline: true })
        .moveDown(0.5);
        
      doc.fontSize(12)
        .font('Helvetica')
        .text(`Cargo Type: ${req.body.cargo || 'Crude Oil'}`)
        .moveDown(0.3)
        .text(`Quantity: ${req.body.quantity ? req.body.quantity.toLocaleString() : '100,000'} Barrels`)
        .moveDown(0.3)
        .text(`Origin: ${req.body.origin || 'N/A'}`)
        .moveDown(0.3)
        .text(`Destination: ${req.body.destination || 'N/A'}`)
        .moveDown(1);
        
      doc.font('Helvetica-Bold')
        .text('CERTIFICATION', { underline: true })
        .moveDown(0.5);
        
      doc.font('Helvetica')
        .text('I hereby certify that the cargo listed above has been loaded onto the vessel in accordance with all applicable regulations and standards.')
        .moveDown(2);
        
      doc.text('____________________', 100, doc.y)
        .moveDown(0.5)
        .text('Master Signature', 100)
        .moveDown(0.5);
        
      doc.text('____________________', 350, doc.y - 45)
        .moveDown(0.5)
        .text('Date', 350);
    } 
    else if (documentType === 'Bill of Lading') {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('SHIPMENT DETAILS', { underline: true })
        .moveDown(0.5);
        
      doc.fontSize(12)
        .font('Helvetica')
        .text(`B/L Number: ${Math.floor(Math.random() * 1000000)}`)
        .moveDown(0.3)
        .text(`Shipper: ${req.body.sellerName || 'ACME Oil Trading Ltd.'}`)
        .moveDown(0.3)
        .text(`Consignee: ${req.body.buyerName || 'Global Energy Corp.'}`)
        .moveDown(0.3)
        .text(`Cargo: ${req.body.cargo || 'Crude Oil'}`)
        .moveDown(0.3)
        .text(`Quantity: ${req.body.quantity ? req.body.quantity.toLocaleString() : '100,000'} Barrels`)
        .moveDown(0.3)
        .text(`Loading Port: ${req.body.origin || 'N/A'}`)
        .moveDown(0.3)
        .text(`Discharge Port: ${req.body.destination || 'N/A'}`)
        .moveDown(1);
        
      doc.font('Helvetica-Bold')
        .text('TERMS AND CONDITIONS', { underline: true })
        .moveDown(0.5);
        
      doc.font('Helvetica')
        .text('This Bill of Lading is evidence of the contract of carriage and it is agreed that the Carrier's responsibility as a common carrier shall be subject to the terms and conditions printed on this document.')
        .moveDown(2);
        
      doc.text('____________________', 100, doc.y)
        .moveDown(0.5)
        .text('Master Signature', 100)
        .moveDown(0.5);
    }
    else if (documentType === 'Certificate of Origin') {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('ORIGIN DETAILS', { underline: true })
        .moveDown(0.5);
        
      doc.fontSize(12)
        .font('Helvetica')
        .text(`Certificate Number: CO-${Math.floor(Math.random() * 1000000)}`)
        .moveDown(0.3)
        .text(`Exporter: ${req.body.sellerName || 'ACME Oil Trading Ltd.'}`)
        .moveDown(0.3)
        .text(`Importer: ${req.body.buyerName || 'Global Energy Corp.'}`)
        .moveDown(0.3)
        .text(`Description of Goods: ${req.body.cargo || 'Crude Oil'}`)
        .moveDown(0.3)
        .text(`Quantity: ${req.body.quantity ? req.body.quantity.toLocaleString() : '100,000'} Barrels`)
        .moveDown(0.3)
        .text(`Country of Origin: ${req.body.origin ? req.body.origin.split(',').pop()?.trim() || 'Saudi Arabia' : 'Saudi Arabia'}`)
        .moveDown(1);
        
      doc.font('Helvetica-Bold')
        .text('DECLARATION', { underline: true })
        .moveDown(0.5);
        
      doc.font('Helvetica')
        .text('The undersigned hereby declares that the above details and statements are correct and that the goods were produced in the country shown above.')
        .moveDown(2);
        
      doc.text('____________________', 100, doc.y)
        .moveDown(0.5)
        .text('Authorized Signature', 100)
        .moveDown(0.5);
        
      doc.text('____________________', 350, doc.y - 45)
        .moveDown(0.5)
        .text('Date', 350);
    }
    else {
      // Generic document content
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('DOCUMENT INFORMATION', { underline: true })
        .moveDown(0.5);
        
      doc.fontSize(12)
        .font('Helvetica')
        .text(`Document Type: ${documentType}`)
        .moveDown(0.3)
        .text(`Vessel ID: ${vesselId}`)
        .moveDown(0.3)
        .text(`Vessel Name: ${vesselName}`)
        .moveDown(0.3)
        .text(`Date Generated: ${new Date().toLocaleDateString()}`)
        .moveDown(1);
    }
    
    // Footer
    doc.fontSize(10)
      .text('This document was generated by the PetroDealHub Maritime System', 50, 750, { align: 'center' });
      
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF document:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating document'
    });
  }
}