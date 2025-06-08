import OpenAI from 'openai';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ProfessionalDocumentService {
  private static instance: ProfessionalDocumentService;
  
  static getInstance(): ProfessionalDocumentService {
    if (!ProfessionalDocumentService.instance) {
      ProfessionalDocumentService.instance = new ProfessionalDocumentService();
    }
    return ProfessionalDocumentService.instance;
  }

  async generateDocumentContent(title: string, description: string, vesselData?: any): Promise<string> {
    try {
      const prompt = this.buildContentPrompt(title, description, vesselData);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional maritime documentation expert specializing in oil vessel operations, compliance, and technical specifications. Generate comprehensive, professional content that meets industry standards."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating document content:', error);
      throw new Error('Failed to generate document content');
    }
  }

  private buildContentPrompt(title: string, description: string, vesselData?: any): string {
    let prompt = `Create a comprehensive professional maritime document with the following specifications:

Title: ${title}
Description: ${description}

Requirements:
- Write in professional maritime industry language
- Include relevant technical specifications and compliance information
- Structure the content with clear sections and subsections
- Ensure accuracy and industry standard terminology
- Include safety protocols and regulatory compliance where applicable
- Format for professional presentation
- Length: 1500-2500 words

`;

    if (vesselData) {
      prompt += `
Vessel Information to incorporate:
- Name: ${vesselData.name || 'N/A'}
- IMO: ${vesselData.imo || 'N/A'}
- Type: ${vesselData.vesselType || 'N/A'}
- Flag: ${vesselData.flag || 'N/A'}
- Built: ${vesselData.built || 'N/A'}
- Deadweight: ${vesselData.deadweight || 'N/A'}
- Cargo Capacity: ${vesselData.cargoCapacity || 'N/A'}
`;
    }

    prompt += `
Generate professional content that appears to be prepared by maritime experts without any reference to AI generation.`;

    return prompt;
  }

  async generatePDF(documentId: number, vesselData?: any): Promise<string> {
    try {
      const document = await storage.getProfessionalDocumentById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (!document.content) {
        // Generate content if not exists
        const content = await this.generateDocumentContent(document.title, document.description, vesselData);
        await storage.updateProfessionalDocument(documentId, { content });
        document.content = content;
      }

      const pdfPath = await this.createPDF(document, vesselData);
      
      // Update document with PDF path
      await storage.updateProfessionalDocument(documentId, { pdfPath });
      
      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  private async createPDF(document: any, vesselData?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `document_${document.id}_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        const relativePath = `uploads/documents/${fileName}`;

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add company header
        this.addHeader(doc);
        
        // Add watermark
        this.addWatermark(doc);

        // Add document title
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#1a365d')
           .text(document.title, 50, 120, { align: 'center' });

        doc.moveDown(2);

        // Add description
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#4a5568')
           .text(document.description, 50, doc.y, { align: 'center', width: 500 });

        doc.moveDown(2);

        // Add vessel information if provided
        if (vesselData) {
          this.addVesselInfo(doc, vesselData);
        }

        // Add separator line
        doc.moveTo(50, doc.y + 10)
           .lineTo(550, doc.y + 10)
           .strokeColor('#e2e8f0')
           .stroke();

        doc.moveDown(2);

        // Add main content
        this.addContent(doc, document.content);

        // Add footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          resolve(relativePath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: typeof PDFDocument.prototype): void {
    // Company logo placeholder - you can replace with actual logo
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1a365d')
       .text('PetroDealHub', 50, 50, { align: 'center' });
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#718096')
       .text('Professional Maritime Documentation Services', 50, 75, { align: 'center' });
  }

  private addWatermark(doc: PDFDocument): void {
    // Add subtle watermark
    doc.save();
    doc.rotate(45, { origin: [300, 400] })
       .fontSize(80)
       .font('Helvetica-Bold')
       .fillColor('#f7fafc')
       .fillOpacity(0.1)
       .text('PetroDealHub', 200, 350);
    doc.restore();
  }

  private addVesselInfo(doc: PDFDocument, vesselData: any): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3748')
       .text('Vessel Information', 50, doc.y);

    doc.moveDown(0.5);

    const info = [
      ['Vessel Name:', vesselData.name || 'N/A'],
      ['IMO Number:', vesselData.imo || 'N/A'],
      ['Vessel Type:', vesselData.vesselType || 'N/A'],
      ['Flag State:', vesselData.flag || 'N/A'],
      ['Year Built:', vesselData.built || 'N/A'],
      ['Deadweight:', vesselData.deadweight ? `${vesselData.deadweight} MT` : 'N/A'],
    ];

    info.forEach(([label, value]) => {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#4a5568')
         .text(label, 70, doc.y, { continued: true, width: 120 })
         .font('Helvetica')
         .text(value, { width: 350 });
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  }

  private addContent(doc: PDFDocument, content: string): void {
    if (!content) {
      doc.fontSize(12)
         .font('Helvetica-Oblique')
         .fillColor('#a0aec0')
         .text('Content will be generated automatically...', 50, doc.y);
      return;
    }

    // Split content into paragraphs and format
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        // Check if it's a heading (starts with ##, #, or is all caps)
        if (paragraph.startsWith('#') || paragraph === paragraph.toUpperCase()) {
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .fillColor('#2d3748')
             .text(paragraph.replace(/#+\s*/, ''), 50, doc.y, { width: 500 });
          doc.moveDown(0.5);
        } else {
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor('#4a5568')
             .text(paragraph, 50, doc.y, { width: 500, align: 'justify' });
          doc.moveDown(1);
        }

        // Add new page if needed
        if (doc.y > 700) {
          doc.addPage();
          this.addWatermark(doc);
        }
      }
    });
  }

  private addFooter(doc: PDFDocument): void {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Add page number
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#a0aec0')
         .text(`Page ${i + 1} of ${pageCount}`, 50, 750, { align: 'center', width: 500 });
      
      // Add generation date
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 765, { align: 'center', width: 500 });
      
      // Add confidentiality notice
      doc.fontSize(8)
         .text('CONFIDENTIAL - This document contains proprietary maritime information', 50, 780, { align: 'center', width: 500 });
    }
  }
}

export const professionalDocumentService = ProfessionalDocumentService.getInstance();