import { Request, Response, Router } from "express";
import PDFDocument from "pdfkit";
import { vessels } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Import logo
const { logoBase64 } = require("../assets/petrodeal-logo");

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
    // Prepare the prompt based on document type
    let promptContent = `Generate professional and detailed content for a ${documentType} for vessel ${vessel.name} with IMO ${vessel.imo}. `;
    
    // Add document-specific prompt content
    if (documentType === 'Cargo Manifest') {
      promptContent += `The vessel is carrying ${vessel.cargoType || 'cargo'} with a capacity of ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'unspecified amount'}. `;
      promptContent += `The vessel is traveling from ${vessel.departurePort || 'origin port'} to ${vessel.destinationPort || 'destination port'}. `;
    } 
    else if (documentType === 'Bill of Lading') {
      promptContent += `The shipper is ${vessel.sellerName || 'unspecified'} and the consignee is ${vessel.buyerName || 'unspecified'}. `;
      promptContent += `The cargo is ${vessel.cargoType || 'unspecified'} with quantity ${vessel.cargoCapacity ? vessel.cargoCapacity.toLocaleString() + ' MT' : 'unspecified'}. `;
    }
    else if (documentType === 'Certificate of Origin') {
      promptContent += `The goods are ${vessel.cargoType || 'unspecified'} originating from ${vessel.departurePort ? vessel.departurePort.split(',')[0] : 'unspecified country'}. `;
      promptContent += `The exporter is ${vessel.sellerName || 'unspecified'} and the importer is ${vessel.buyerName || 'unspecified'}. `;
    }
    
    // Request the format as JSON and specify the structure
    promptContent += `Return a JSON object with the following structure:
    {
      "title": "Professional title for the document",
      "introduction": "A professional introduction paragraph",
      "sections": [
        {
          "heading": "Section heading",
          "content": "Detailed section content with professional maritime terminology"
        },
        // Additional sections as needed
      ],
      "conclusion": "A formal conclusion paragraph"
    }`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional maritime document specialist. Generate detailed, accurate and formal maritime shipping documents."
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