import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export class CustomPdfTemplateService {
  private static instance: CustomPdfTemplateService;
  
  public static getInstance(): CustomPdfTemplateService {
    if (!CustomPdfTemplateService.instance) {
      CustomPdfTemplateService.instance = new CustomPdfTemplateService();
    }
    return CustomPdfTemplateService.instance;
  }

  // Color scheme from your template
  private colors = {
    primary: '#1E40AF',      // Deep blue
    secondary: '#F59E0B',    // Orange/gold
    accent: '#10B981',       // Green
    text: '#1F2937',         // Dark gray
    textLight: '#6B7280',    // Light gray
    background: '#F9FAFB',   // Very light gray
    white: '#FFFFFF',
    red: '#DC2626'           // For CLIENT COPY stamp
  };

  // Template assets paths
  private getAssetPath(filename: string): string {
    return path.join(process.cwd(), 'attached_assets', filename);
  }

  public async generateCustomTemplatePDF(
    title: string,
    content: string,
    vesselData: any,
    documentType: string = 'VESSEL_DOCUMENT'
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true
        });

        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Start building the document
        this.addHeader(doc, title, documentType);
        this.addWatermark(doc);
        this.addVesselInfo(doc, vesselData);
        this.addMainContent(doc, content);
        this.addFooter(doc);
        this.addClientCopyStamp(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, title: string, documentType: string): void {
    const pageWidth = doc.page.width;
    
    // Add main logo (PetroDealHub)
    try {
      const logoPath = this.getAssetPath('image001_1752786950475.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 30, { width: 120 });
      }
    } catch (error) {
      console.log('Logo not found, using text header');
    }

    // Add Legal Document Services logo
    try {
      const legalLogoPath = this.getAssetPath('image002_1752786950475.png');
      if (fs.existsSync(legalLogoPath)) {
        doc.image(legalLogoPath, pageWidth - 170, 30, { width: 120 });
      }
    } catch (error) {
      // Fallback to text
      doc.fontSize(12)
         .fillColor(this.colors.text)
         .font('Helvetica-Bold')
         .text('LEGAL DOCUMENT', pageWidth - 170, 40, { width: 120, align: 'center' });
      
      doc.fontSize(8)
         .fillColor(this.colors.textLight)
         .font('Helvetica')
         .text('S E R V I C E S', pageWidth - 170, 55, { width: 120, align: 'center' });
    }

    // Add decorative element
    try {
      const decorPath = this.getAssetPath('image003_1752786950475.png');
      if (fs.existsSync(decorPath)) {
        doc.image(decorPath, (pageWidth / 2) - 25, 35, { width: 50 });
      }
    } catch (error) {
      // Skip decorative element if not found
    }

    // Document title with professional styling
    doc.fontSize(18)
       .fillColor(this.colors.primary)
       .font('Helvetica-Bold')
       .text(title, 50, 100, { width: pageWidth - 100, align: 'center' });

    // Document type
    doc.fontSize(12)
       .fillColor(this.colors.textLight)
       .font('Helvetica')
       .text(documentType, 50, 125, { width: pageWidth - 100, align: 'center' });

    // Add horizontal line
    doc.moveTo(50, 150)
       .lineTo(pageWidth - 50, 150)
       .strokeColor(this.colors.primary)
       .lineWidth(2)
       .stroke();

    // Move cursor down
    doc.y = 170;
  }

  private addWatermark(doc: PDFKit.PDFDocument): void {
    // Add subtle diagonal watermark
    doc.save();
    doc.rotate(45, { origin: [300, 400] });
    doc.fontSize(60)
       .fillColor(this.colors.textLight, 0.05)
       .font('Helvetica-Bold')
       .text('PetroDealHub', 0, 300, { align: 'center' });
    doc.restore();
  }

  private addVesselInfo(doc: PDFKit.PDFDocument, vesselData: any): void {
    if (!vesselData) return;

    const startY = doc.y + 10;
    
    // Vessel Information Header
    doc.fontSize(14)
       .fillColor(this.colors.primary)
       .font('Helvetica-Bold')
       .text('VESSEL INFORMATION', 50, startY);

    // Create info box with border
    const boxY = startY + 25;
    const boxHeight = 80;
    
    doc.rect(50, boxY, doc.page.width - 100, boxHeight)
       .strokeColor(this.colors.primary)
       .lineWidth(1)
       .stroke();

    // Fill background
    doc.rect(51, boxY + 1, doc.page.width - 102, boxHeight - 2)
       .fillColor(this.colors.background)
       .fill();

    // Vessel details in two columns
    const leftCol = 70;
    const rightCol = 320;
    let yPos = boxY + 15;

    doc.fontSize(10)
       .fillColor(this.colors.text)
       .font('Helvetica-Bold');

    // Left column
    doc.text('Vessel Name:', leftCol, yPos);
    doc.font('Helvetica')
       .text(vesselData.name || 'N/A', leftCol + 80, yPos);

    yPos += 15;
    doc.font('Helvetica-Bold')
       .text('IMO Number:', leftCol, yPos);
    doc.font('Helvetica')
       .text(vesselData.imo || 'N/A', leftCol + 80, yPos);

    yPos += 15;
    doc.font('Helvetica-Bold')
       .text('Cargo Type:', leftCol, yPos);
    doc.font('Helvetica')
       .text(vesselData.cargoType || vesselData.oilType || 'N/A', leftCol + 80, yPos);

    // Right column
    yPos = boxY + 15;
    doc.font('Helvetica-Bold')
       .text('Flag:', rightCol, yPos);
    doc.font('Helvetica')
       .text(vesselData.flag || 'N/A', rightCol + 60, yPos);

    yPos += 15;
    doc.font('Helvetica-Bold')
       .text('Status:', rightCol, yPos);
    doc.font('Helvetica')
       .text(vesselData.status || 'Active', rightCol + 60, yPos);

    yPos += 15;
    doc.font('Helvetica-Bold')
       .text('Location:', rightCol, yPos);
    doc.font('Helvetica')
       .text(`${vesselData.latitude || 'N/A'}, ${vesselData.longitude || 'N/A'}`, rightCol + 60, yPos);

    doc.y = boxY + boxHeight + 20;
  }

  private addMainContent(doc: PDFKit.PDFDocument, content: string): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Content header
    doc.fontSize(14)
       .fillColor(this.colors.primary)
       .font('Helvetica-Bold')
       .text('DOCUMENT CONTENT', 50, doc.y);

    doc.y += 20;

    // Clean and format content
    const cleanContent = this.cleanContent(content);
    const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());

    doc.fontSize(11)
       .fillColor(this.colors.text)
       .font('Helvetica');

    paragraphs.forEach((paragraph, index) => {
      // Check for page break
      if (doc.y > pageHeight - 150) {
        doc.addPage();
        doc.y = 50;
      }

      // Check if it's a header (starts with capital letters or contains keywords)
      if (this.isHeaderParagraph(paragraph)) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(this.colors.primary);
      } else {
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor(this.colors.text);
      }

      // Add paragraph with proper spacing
      const textHeight = doc.heightOfString(paragraph, { width: pageWidth - 100 });
      doc.text(paragraph, 50, doc.y, { 
        width: pageWidth - 100,
        align: 'justify'
      });

      doc.y += textHeight + 10;
    });
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Footer line
      doc.moveTo(50, doc.page.height - 80)
         .lineTo(doc.page.width - 50, doc.page.height - 80)
         .strokeColor(this.colors.primary)
         .lineWidth(1)
         .stroke();

      // Footer text
      doc.fontSize(9)
         .fillColor(this.colors.textLight)
         .font('Helvetica')
         .text(
           `Page ${i + 1} of ${pageCount}`,
           50,
           doc.page.height - 65,
           { align: 'center', width: doc.page.width - 100 }
         );

      doc.text(
        'Generated by PetroDealHub Professional Maritime Services',
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      );

      doc.text(
        `Document Date: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`,
        50,
        doc.page.height - 35,
        { align: 'center', width: doc.page.width - 100 }
      );
    }
  }

  private addClientCopyStamp(doc: PDFKit.PDFDocument): void {
    // Add CLIENT COPY stamp on first page
    doc.switchToPage(0);
    
    try {
      const stampPath = this.getAssetPath('image004_1752786950475.png');
      if (fs.existsSync(stampPath)) {
        // Position stamp in upper right corner
        doc.image(stampPath, doc.page.width - 200, 200, { width: 150 });
      } else {
        // Fallback text stamp
        doc.save();
        doc.rotate(15, { origin: [doc.page.width - 150, 250] });
        doc.fontSize(24)
           .fillColor(this.colors.red, 0.7)
           .font('Helvetica-Bold')
           .text('CLIENT COPY', doc.page.width - 200, 220);
        doc.restore();
      }
    } catch (error) {
      console.log('CLIENT COPY stamp not found, using text');
      // Fallback text stamp
      doc.save();
      doc.rotate(15, { origin: [doc.page.width - 150, 250] });
      doc.fontSize(24)
         .fillColor(this.colors.red, 0.7)
         .font('Helvetica-Bold')
         .text('CLIENT COPY', doc.page.width - 200, 220);
      doc.restore();
    }
  }

  private cleanContent(content: string): string {
    // Remove HTML tags
    let cleaned = content.replace(/<[^>]*>/g, '');
    
    // Fix common encoding issues
    cleaned = cleaned
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Add proper paragraph breaks
    cleaned = cleaned.replace(/\. ([A-Z])/g, '.\n\n$1');
    
    return cleaned;
  }

  private isHeaderParagraph(paragraph: string): boolean {
    const trimmed = paragraph.trim();
    return (
      trimmed.length < 100 && 
      (
        trimmed === trimmed.toUpperCase() ||
        /^(OVERVIEW|SUMMARY|DETAILS|INFORMATION|SPECIFICATIONS|CONCLUSION)/i.test(trimmed) ||
        /^\d+\./i.test(trimmed)
      )
    );
  }
}

export const customPdfTemplateService = CustomPdfTemplateService.getInstance();