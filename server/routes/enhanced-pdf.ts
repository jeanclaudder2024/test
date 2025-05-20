import { Request, Response, Router } from "express";
import PDFDocument from "pdfkit";
import { vessels } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Import logo
import { logoBase64 } from "../assets/petrodeal-logo";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create router
export const enhancedPdfRouter = Router();

// Generate an advanced PDF document with OpenAI-enhanced content
enhancedPdfRouter.post('/api/vessels/:id/enhanced-pdf', async (req: Request, res: Response) => {
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

    // Generate enhanced document content using OpenAI
    let enhancedContent;
    try {
      enhancedContent = await generateEnhancedContent(vessel, documentType);
    } catch (error) {
      console.error("Error generating enhanced content:", error);
      // Fallback to basic content if OpenAI fails
      enhancedContent = {
        title: documentType,
        introduction: `This document certifies details related to the vessel ${vessel.name}.`,
        sections: [
          {
            heading: "Vessel Information",
            content: `Name: ${vessel.name}\nIMO: ${vessel.imo}\nFlag: ${vessel.flag}\nVessel Type: ${vessel.vesselType}`
          },
          {
            heading: "Cargo Details",
            content: `Type: ${vessel.cargoType || 'Not specified'}\nQuantity: ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'Not specified'}`
          }
        ],
        conclusion: "This document is valid when properly signed by an authorized representative."
      };
    }
    
    // Create a PDF document with advanced styling
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60
      },
      info: {
        Title: `${documentType} - ${vessel.name}`,
        Author: 'PetroDealHub Maritime System',
        Creator: 'PetroDealHub Maritime System',
        Producer: 'PetroDealHub',
        Subject: `${documentType}`,
        Keywords: `${vessel.name}, ${vessel.imo}, ${vessel.vesselType}, petroleum, shipping`,
        CreationDate: new Date()
      },
      autoFirstPage: true,
      compress: true
    });
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${documentType.replace(/\\s+/g, '_')}_${vessel.name.replace(/\\s+/g, '_')}.pdf`);
    
    // Pipe PDF directly to response
    doc.pipe(res);
    
    // Add watermark to each page
    doc.on('pageAdded', () => {
      // Add watermark text
      doc.save()
        .rotate(45, { origin: [300, 420] })
        .fontSize(60)
        .fillColor('rgba(200, 200, 200, 0.1)')
        .text('PetroDealHub', 100, 400, { align: 'center' })
        .restore();
    });
    
    // Add logo at the top
    doc.image(logoBase64, 60, 60, { width: 120 });
    
    // Add document header with professional design
    doc.fontSize(22)
      .fillColor('#F97316')
      .text(enhancedContent.title.toUpperCase(), 60, 150, { align: 'center' })
      .moveDown(0.5);
    
    // Add ship icon and vessel name
    doc.circle(300, 210, 3).fillAndStroke('#F97316');
    doc.fontSize(16)
      .fillColor('#333333')
      .text(`VESSEL: ${vessel.name}`, 60, 200, { align: 'center' })
      .moveDown();
      
    // Add decorative line
    doc.moveTo(60, 230)
      .lineTo(535, 230)
      .strokeColor('#F97316')
      .lineWidth(1)
      .stroke();
    
    // Add introduction
    doc.moveDown()
      .fontSize(12)
      .fillColor('#333333')
      .text(enhancedContent.introduction, { align: 'justify' })
      .moveDown(1);
    
    // Add sections
    enhancedContent.sections.forEach(section => {
      doc.moveDown(0.5)
        .fontSize(14)
        .fillColor('#F97316')
        .text(section.heading)
        .moveDown(0.5);
        
      doc.fontSize(12)
        .fillColor('#333333')
        .text(section.content, { align: 'justify' })
        .moveDown(1);
    });
    
    // Add the document-specific content
    if (documentType === 'Cargo Manifest') {
      // Add cargo details table
      doc.moveDown()
        .fontSize(14)
        .fillColor('#F97316')
        .text('MANIFEST DETAILS', { align: 'center' })
        .moveDown();
      
      // Draw table header
      const tableTop = doc.y;
      const tableLeft = 60;
      doc.rect(tableLeft, tableTop, 475, 30)
        .fillColor('#F97316')
        .fill();
      
      doc.fillColor('#FFFFFF')
        .fontSize(12)
        .text('ITEM', tableLeft + 10, tableTop + 10)
        .text('DETAILS', tableLeft + 200, tableTop + 10);
      
      // Draw table rows
      let rowTop = tableTop + 30;
      
      // Cargo Type
      doc.rect(tableLeft, rowTop, 175, 30)
        .fillColor('#F5F5F5')
        .fill();
      doc.rect(tableLeft + 175, rowTop, 300, 30)
        .fillColor('#FFFFFF')
        .fill();
      doc.fillColor('#333333')
        .text('Cargo Type', tableLeft + 10, rowTop + 10)
        .text(vessel.cargoType || 'Not specified', tableLeft + 200, rowTop + 10);
      
      // Quantity
      rowTop += 30;
      doc.rect(tableLeft, rowTop, 175, 30)
        .fillColor('#F5F5F5')
        .fill();
      doc.rect(tableLeft + 175, rowTop, 300, 30)
        .fillColor('#FFFFFF')
        .fill();
      doc.fillColor('#333333')
        .text('Quantity', tableLeft + 10, rowTop + 10)
        .text(vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} MT` : 'Not specified', tableLeft + 200, rowTop + 10);
      
      // Origin
      rowTop += 30;
      doc.rect(tableLeft, rowTop, 175, 30)
        .fillColor('#F5F5F5')
        .fill();
      doc.rect(tableLeft + 175, rowTop, 300, 30)
        .fillColor('#FFFFFF')
        .fill();
      doc.fillColor('#333333')
        .text('Origin', tableLeft + 10, rowTop + 10)
        .text(vessel.departurePort || 'Not specified', tableLeft + 200, rowTop + 10);
      
      // Destination
      rowTop += 30;
      doc.rect(tableLeft, rowTop, 175, 30)
        .fillColor('#F5F5F5')
        .fill();
      doc.rect(tableLeft + 175, rowTop, 300, 30)
        .fillColor('#FFFFFF')
        .fill();
      doc.fillColor('#333333')
        .text('Destination', tableLeft + 10, rowTop + 10)
        .text(vessel.destinationPort || 'Not specified', tableLeft + 200, rowTop + 10);
      
      // Table border
      doc.rect(tableLeft, tableTop, 475, rowTop + 30 - tableTop)
        .strokeColor('#CCCCCC')
        .lineWidth(1)
        .stroke();
      
    } 
    else if (documentType === 'Bill of Lading') {
      // Add stylized bill of lading section
      doc.moveDown()
        .fontSize(14)
        .fillColor('#F97316')
        .text('BILL OF LADING: BL-' + Math.floor(Math.random() * 1000000), { align: 'center' })
        .moveDown();
      
      // Add shipper and consignee info in a stylized box
      const boxTop = doc.y;
      const boxHeight = 120;
      
      doc.rect(60, boxTop, 230, boxHeight)
        .fillColor('#F5F5F5')
        .fill()
        .strokeColor('#F97316')
        .lineWidth(1)
        .stroke();
        
      doc.rect(300, boxTop, 235, boxHeight)
        .fillColor('#F5F5F5')
        .fill()
        .strokeColor('#F97316')
        .lineWidth(1)
        .stroke();
      
      doc.fillColor('#F97316')
        .fontSize(12)
        .text('SHIPPER:', 70, boxTop + 10)
        .fillColor('#333333')
        .fontSize(11)
        .text(vessel.sellerName || 'Not specified', 70, boxTop + 30, { width: 210 });
        
      doc.fillColor('#F97316')
        .fontSize(12)
        .text('CONSIGNEE:', 310, boxTop + 10)
        .fillColor('#333333')
        .fontSize(11)
        .text(vessel.buyerName || 'Not specified', 310, boxTop + 30, { width: 210 });
      
      // Continue with the rest of the page after the boxes
      doc.y = boxTop + boxHeight + 20;
    }
    else if (documentType === 'Certificate of Origin') {
      // Add certificate section with a border
      doc.rect(60, doc.y, 475, 200)
        .strokeColor('#F97316')
        .dash(5, { space: 5 })
        .lineWidth(1)
        .stroke();
      
      doc.moveDown()
        .fontSize(14)
        .fillColor('#F97316')
        .text('CERTIFICATE OF ORIGIN', 100, doc.y, { align: 'center' })
        .moveDown();
      
      // Add certificate number with a stylish design
      doc.rect(100, doc.y, 400, 40)
        .fillColor('#F5F5F5')
        .fill()
        .strokeColor('#F97316')
        .lineWidth(1)
        .undash()
        .stroke();
        
      doc.fillColor('#333333')
        .fontSize(12)
        .text(`Certificate Number: CO-${Math.floor(Math.random() * 1000000)}`, 120, doc.y + 15, { align: 'center' });
      
      doc.y += 60;
      
      // Add origin details
      doc.fontSize(12)
        .fillColor('#333333')
        .text(`Goods: ${vessel.cargoType || 'Not specified'}`, 100, doc.y, { align: 'left' })
        .moveDown()
        .text(`Country of Origin: ${vessel.departurePort ? vessel.departurePort.split(',')[0] : 'Not specified'}`, 100, doc.y, { align: 'left' });
    }
    
    // Add conclusion text
    doc.moveDown(2)
      .fontSize(12)
      .fillColor('#333333')
      .text(enhancedContent.conclusion, { align: 'justify' })
      .moveDown(2);
    
    // Add signature line
    doc.moveTo(100, doc.y)
      .lineTo(250, doc.y)
      .strokeColor('#333333')
      .lineWidth(1)
      .stroke();
      
    doc.moveDown(0.5)
      .fontSize(10)
      .fillColor('#333333')
      .text('Authorized Signature', 100, doc.y);
    
    // Add date on the right side
    doc.moveDown(0.5)
      .fontSize(10)
      .fillColor('#333333')
      .text(`Date: ${new Date().toLocaleDateString()}`, 350, doc.y - 20);
    
    // Add footer
    const footerTop = 750;
    doc.moveTo(60, footerTop)
      .lineTo(535, footerTop)
      .strokeColor('#F97316')
      .lineWidth(1)
      .stroke();
      
    doc.fontSize(8)
      .fillColor('#666666')
      .text('PetroDealHub Maritime System - Confidential Document', 60, footerTop + 10, { align: 'center' })
      .text(`Generated: ${new Date().toLocaleString()}`, 60, footerTop + 20, { align: 'center' })
      .text(`Page 1`, 60, footerTop + 30, { align: 'center' });
    
    // Finalize the PDF file
    doc.end();
    
  } catch (error) {
    console.error('Error generating enhanced PDF document:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating document'
    });
  }
});

// Generate enhanced document content using OpenAI
async function generateEnhancedContent(vessel: any, documentType: string) {
  try {
    // Prepare the prompt based on document type with more detailed vessel information
    let promptContent = `Generate a highly professional, detailed and comprehensive ${documentType} for vessel ${vessel.name} (IMO: ${vessel.imo}). Use formal maritime language and industry standard formats. Include all relevant sections that would be found in an official ${documentType}. 

Vessel Details:
- Name: ${vessel.name}
- IMO Number: ${vessel.imo}
- MMSI: ${vessel.mmsi}
- Flag: ${vessel.flag}
- Vessel Type: ${vessel.vesselType}
- Built: ${vessel.built || 'N/A'}
- Deadweight: ${vessel.deadweight || 'N/A'} tonnes
- Current Location: Lat ${vessel.currentLat || 'N/A'}, Lng ${vessel.currentLng || 'N/A'}
`;
    
    // Add document-specific prompt content with more details
    if (documentType === 'Cargo Manifest') {
      promptContent += `
Cargo Information:
- Type: ${vessel.cargoType || 'Crude Oil/Petroleum Products'}
- Quantity: ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'As per official measurement'}
- Loading Port: ${vessel.departurePort || 'As per shipping documents'}
- Discharge Port: ${vessel.destinationPort || 'As per shipping documents'}
- Shipper: ${vessel.sellerName || 'As per contract'}
- Consignee: ${vessel.buyerName || 'As per contract'}
- Voyage Number: V${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}

Include detailed sections for:
1. Cargo specifications with UN numbers and hazard classifications
2. Stowage details
3. Special handling requirements
4. Safety precautions
5. Certification statements
`;
    } 
    else if (documentType === 'Bill of Lading') {
      promptContent += `
Shipment Details:
- Shipper: ${vessel.sellerName || 'As per contract'}
- Consignee: ${vessel.buyerName || 'As per contract'}
- Notify Party: Same as consignee unless otherwise specified
- Cargo: ${vessel.cargoType || 'Crude Oil/Petroleum Products'}
- Quantity: ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'As per official measurement'}
- Port of Loading: ${vessel.departurePort || 'As per shipping documents'}
- Port of Discharge: ${vessel.destinationPort || 'As per shipping documents'}
- Date of Loading: ${new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]}
- Bill of Lading Number: BL${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}

Include all standard Bill of Lading clauses, including:
1. Carrier's responsibility
2. Law and jurisdiction
3. General average
4. Freight and charges
5. Lien clauses
6. Claims and limitations
`;
    }
    else if (documentType === 'Certificate of Origin') {
      promptContent += `
Goods Information:
- Description: ${vessel.cargoType || 'Crude Oil/Petroleum Products'}
- Quantity: ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'As per official measurement'}
- Country of Origin: ${vessel.departurePort ? vessel.departurePort.split(',')[0] : 'As per shipping documents'}
- Exporter: ${vessel.sellerName || 'As per contract'}
- Importer: ${vessel.buyerName || 'As per contract'}
- Certificate Number: CO${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}
- Date of Issue: ${new Date().toISOString().split('T')[0]}

Include all standard Certificate of Origin elements:
1. Declaration of origin
2. Certification by authorized body
3. Product classification
4. Manufacturing process details (where applicable)
5. Compliance statements
`;
    }
    
    // Request the format as JSON and specify the structure with more detailed sections
    promptContent += `

Return a JSON object with the following structure:
{
  "title": "Professional maritime title for the document",
  "documentNumber": "A realistic document number with proper format",
  "introduction": "A comprehensive and detailed introduction paragraph that establishes the document's purpose and legal standing",
  "sections": [
    {
      "heading": "Detailed section heading",
      "content": "Extensive and specific content with proper maritime terminology, specific measurements, precise locations, and exact dates where applicable"
    },
    {
      "heading": "Additional section heading",
      "content": "More detailed content relevant to this specific document type"
    }
    // Include at least 5-7 detailed sections appropriate for this document type
  ],
  "legalStatements": "Formal legal statements and declarations that would appear on an official document",
  "conclusion": "A formal conclusion with verification statements and legal standing"
}`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional maritime document specialist with expertise in international shipping documentation. Generate detailed, accurate, formal, and legally-compliant maritime shipping documents following industry standards. Include proper terminology, classification codes, and legally required statements."
        },
        {
          role: "user",
          content: promptContent
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}