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
        Title: `${documentType} - ${vessel.name} - ${new Date().toISOString().split('T')[0]}`,
        Author: 'PetroDealHub Maritime Documentation System',
        Creator: 'PetroDealHub International Maritime Services',
        Producer: 'PetroDealHub Marine Documentation Division',
        Subject: `Official ${documentType} for Vessel ${vessel.name} (IMO: ${vessel.imo})`,
        Keywords: `${vessel.name}, ${vessel.imo}, ${vessel.vesselType}, petroleum, shipping, maritime, official, cargo, document, certificate, international`,
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
    
    // Add document header with highly professional maritime design
    doc.fontSize(24)
      .fillColor('#00457c') // Maritime blue color
      .text(enhancedContent.title.toUpperCase(), 60, 130, { align: 'center' })
      .moveDown(0.2);
    
    // Add document number with appropriate styling
    doc.fontSize(12)
      .fillColor('#00457c')
      .text(`Document No: ${enhancedContent.documentNumber || 'N/A'}`, 60, 170, { align: 'center' })
      .moveDown(0.5);
    
    // Add vessel details box with border
    const vesselBoxTop = 190;
    doc.rect(160, vesselBoxTop, 280, 70)
      .fillAndStroke('#f5f9ff', '#00457c'); // Light blue background with blue border
      
    // Add vessel name in bold
    doc.fontSize(14)
      .fillColor('#00457c')
      .text(`VESSEL: ${vessel.name}`, 170, vesselBoxTop + 10, { align: 'center', width: 260 });
    
    // Add vessel details in a clean format
    doc.fontSize(10)
      .fillColor('#333333')
      .text(`IMO: ${vessel.imo} | Flag: ${vessel.flag} | Type: ${vessel.vesselType}`, 170, vesselBoxTop + 30, 
        { align: 'center', width: 260 })
      .text(`Built: ${vessel.built || 'N/A'} | DWT: ${vessel.deadweight ? vessel.deadweight.toLocaleString() + ' MT' : 'N/A'}`, 
        170, vesselBoxTop + 45, { align: 'center', width: 260 });
    
    // Add decorative double line with maritime styling
    doc.moveTo(60, 280)
      .lineTo(535, 280)
      .strokeColor('#00457c')
      .lineWidth(2)
      .stroke();
    
    doc.moveTo(60, 284)
      .lineTo(535, 284)
      .strokeColor('#00457c')
      .lineWidth(0.5)
      .stroke();
    
    // Add formal document reference
    doc.moveDown(1.5)
      .fontSize(9)
      .fillColor('#666666')
      .text(`REF: PD/${new Date().getFullYear()}/V${vessel.id}/${documentType.substring(0,3).toUpperCase()}/${Math.floor(1000 + Math.random() * 9000)}`, 
        { align: 'right' })
      .moveDown(0.5);
    
    // Add introduction with professional styling
    doc.moveDown(0.5)
      .fontSize(11)
      .fillColor('#333333')
      .text(enhancedContent.introduction, { align: 'justify' })
      .moveDown(1);
    
    // Add sections with improved professional maritime formatting
    enhancedContent.sections.forEach((section, index) => {
      // Section header with maritime styling
      doc.moveDown(0.5)
        .fontSize(13)
        .fillColor('#00457c') // Maritime blue
        .text(section.heading.toUpperCase(), { align: 'left' })
        .moveDown(0.2);
        
      // Add subtle section number indicator
      doc.circle(doc.x - 10, doc.y - 15, 3)
        .fillAndStroke('#00457c');
        
      // Add subtle separator line
      const sectionLineY = doc.y - 5;
      doc.moveTo(60, sectionLineY)
        .lineTo(200, sectionLineY)
        .strokeColor('#00457c')
        .lineWidth(0.5)
        .stroke()
        .moveDown(0.2);
        
      // Section content with professional typography
      doc.fontSize(10.5)
        .fillColor('#333333')
        .text(section.content, { align: 'justify', lineGap: 2 })
        .moveDown(1);
        
      // Add alternating section background for better readability (for even sections)
      if (index % 2 === 1 && index < enhancedContent.sections.length - 1) {
        const bgStartY = doc.y - 5;
        const bgHeight = 1.5; // A thin separator
        doc.rect(60, bgStartY, 475, bgHeight)
          .fill('#f0f5fb');
      }
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
    
    // Add legal statements section
    if (enhancedContent.legalStatements) {
      doc.moveDown(1)
        .fontSize(9)
        .fillColor('#444444')
        .text(enhancedContent.legalStatements, { align: 'justify' })
        .moveDown(1);
        
      // Add decorative separator before conclusion
      doc.moveTo(160, doc.y)
        .lineTo(435, doc.y)
        .strokeColor('#00457c')
        .lineWidth(0.5)
        .stroke()
        .moveDown(1);
    }
      
    // Add conclusion text with professional styling
    doc.moveDown(1)
      .fontSize(11)
      .fillColor('#333333')
      .text(enhancedContent.conclusion, { align: 'justify' })
      .moveDown(2);
    
    // Add professional maritime signature block with seal and official formatting
    const signatureY = doc.y;
    
    // Add signature box with professional maritime styling
    doc.rect(60, signatureY, 230, 80)
      .lineWidth(0.5)
      .strokeColor('#00457c')
      .fillColor('#f8fafd')
      .fillAndStroke();

    // Add official signature line
    doc.moveTo(80, signatureY + 50)
      .lineTo(270, signatureY + 50)
      .lineWidth(0.5)
      .strokeColor('#00457c')
      .stroke();
      
    // Add signature labels
    doc.fontSize(10)
      .fillColor('#00457c')
      .text('AUTHORIZED REPRESENTATIVE', 80, signatureY + 10, { width: 190 })
      .fontSize(8)
      .fillColor('#444444')
      .text('Signature & Official Seal', 80, signatureY + 55, { width: 190 });
      
    // Add date block with professional design
    doc.rect(310, signatureY, 230, 80)
      .strokeColor('#00457c')
      .fillColor('#f8fafd')
      .fillAndStroke();
      
    // Add date line
    doc.moveTo(330, signatureY + 50)
      .lineTo(520, signatureY + 50)
      .strokeColor('#00457c')
      .lineWidth(0.5)
      .stroke();
      
    // Add date info
    const today = new Date().toISOString().split('T')[0];
    doc.fontSize(10)
      .fillColor('#00457c')
      .text('OFFICIAL CERTIFICATION DATE', 330, signatureY + 10, { width: 190 })
      .fontSize(9)
      .fillColor('#333333')
      .text(today, 330, signatureY + 35, { width: 190 })
      .fontSize(8)
      .fillColor('#444444')
      .text('Document Validity Starts From This Date', 330, signatureY + 55, { width: 190 });
    
    // Add digital stamp/seal image (circular stamp effect)
    const stampCenterX = 210;
    const stampCenterY = signatureY + 35;
    const stampRadius = 25;
    
    // Create circular stamp effect
    doc.save()
      .circle(stampCenterX, stampCenterY, stampRadius)
      .lineWidth(1)
      .strokeColor('#00457c')
      .stroke()
      .restore();
      
    // Inner stamp circle
    doc.save()
      .circle(stampCenterX, stampCenterY, stampRadius - 3)
      .lineWidth(0.5)
      .strokeColor('#00457c')
      .stroke()
      .restore();
      
    // Stamp text
    doc.save()
      .translate(stampCenterX, stampCenterY)
      .rotate(-30)
      .fontSize(7)
      .fillColor('#00457c')
      .text('PETRODEAL MARITIME', -stampRadius + 5, -4, { align: 'center', width: (stampRadius - 5) * 2 })
      .rotate(60)
      .text('OFFICIAL DOCUMENT', -stampRadius + 5, -4, { align: 'center', width: (stampRadius - 5) * 2 })
      .restore();
    
    // Add professional footer with legal info
    const footerTop = 750;
    
    // Add double-line footer separator
    doc.moveTo(60, footerTop - 10)
      .lineTo(535, footerTop - 10)
      .strokeColor('#00457c')
      .lineWidth(1.5)
      .stroke();
      
    doc.moveTo(60, footerTop - 6)
      .lineTo(535, footerTop - 6)
      .strokeColor('#00457c')
      .lineWidth(0.5)
      .stroke();
      
    // Footer content with professional formatting and detailed information
    doc.fontSize(7)
      .fillColor('#333333')
      .text(`DOCUMENT ID: PDH-${new Date().getFullYear()}-${vessel.id}-${Math.floor(10000 + Math.random() * 90000)}`, 
        60, footerTop + 5, { align: 'left', width: 250 })
      .text(`Generated: ${new Date().toLocaleString()}`, 
        60, footerTop + 15, { align: 'left', width: 250 });
        
    doc.fontSize(7)
      .fillColor('#333333')
      .text(`PetroDealHub Maritime Documentation System - Official Maritime Document`, 
        310, footerTop + 5, { align: 'right', width: 225 })
      .text(`Page 1 of 1 - Secure Document - Verify at validate.petrodealhub.com`, 
        310, footerTop + 15, { align: 'right', width: 225 });
    
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