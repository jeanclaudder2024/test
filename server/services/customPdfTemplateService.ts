import path from 'path';
import fs from 'fs';

interface VesselData {
  id: number;
  name: string;
  imo?: string;
  flag?: string;
  vesselType?: string;
  built?: number;
  length?: number;
  width?: number;
  deadweight?: number;
  grossTonnage?: number;
  owner?: string;
}

interface DocumentOptions {
  documentType: string;
  documentContent: string;
  includeVesselDetails?: boolean;
  includeLogo?: boolean;
  // Design configuration options
  headerLayout?: 'split' | 'center' | 'left';
  logoSize?: 'small' | 'medium' | 'large';
  contentPosition?: 'top' | 'center' | 'bottom';
  watermarkStyle?: 'diagonal' | 'center' | 'corner';
  colorScheme?: 'professional' | 'maritime' | 'legal';
  useClientCopyStamp?: boolean;
  useSecurityIcon?: boolean;
  backgroundOverlay?: 'none' | 'subtle' | 'strong';
}

export class CustomPdfTemplateService {
  private templateAssetsPath: string;

  constructor() {
    this.templateAssetsPath = path.join(process.cwd(), 'attached_assets');
  }

  private getTemplateAsset(filename: string): string | null {
    try {
      const filePath = path.join(this.templateAssetsPath, filename);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      console.warn(`Template asset not found: ${filename}`);
      return null;
    } catch (error) {
      console.error(`Error accessing template asset ${filename}:`, error);
      return null;
    }
  }

  private async getLogoBase64(): Promise<string | null> {
    try {
      // Try to get the PetroDealHub logo
      const logoPath = this.getTemplateAsset('image001_1752786950475.png');
      if (logoPath && fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
      return null;
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  }

  private async getSecondaryLogoBase64(): Promise<string | null> {
    try {
      // Try to get the Legal Document Services logo
      const logoPath = this.getTemplateAsset('image002_1752786950475.png');
      if (logoPath && fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
      return null;
    } catch (error) {
      console.error('Error loading secondary logo:', error);
      return null;
    }
  }

  private readColorScheme(): any {
    try {
      const colorSchemePath = this.getTemplateAsset('colorschememapping_1752786950476.xml');
      if (colorSchemePath && fs.existsSync(colorSchemePath)) {
        const colorSchemeContent = fs.readFileSync(colorSchemePath, 'utf-8');
        // Parse basic color information from XML (simplified)
        return {
          primary: '#1e40af', // Blue theme from template
          secondary: '#64748b', // Gray theme
          accent: '#f97316', // Orange accent
          background: '#f8fafc' // Light background
        };
      }
    } catch (error) {
      console.error('Error reading color scheme:', error);
    }
    
    // Fallback colors
    return {
      primary: '#1e40af',
      secondary: '#64748b', 
      accent: '#f97316',
      background: '#f8fafc'
    };
  }

  private readHeaderTemplate(): string {
    try {
      const headerPath = this.getTemplateAsset('header_1752786950476.htm');
      if (headerPath && fs.existsSync(headerPath)) {
        return fs.readFileSync(headerPath, 'utf-8');
      }
    } catch (error) {
      console.error('Error reading header template:', error);
    }
    return '';
  }

  async generateCustomPDF(doc: any, vessel: VesselData, options: DocumentOptions): Promise<void> {
    console.log('🎨 Starting custom PDF generation with user background template...');
    
    // Load your background template image (image001.png)
    const backgroundImageBase64 = await this.getLogoBase64();
    console.log('🖼️ Background template image loaded:', backgroundImageBase64 ? 'SUCCESS' : 'FAILED');
    
    if (backgroundImageBase64) {
      // Use your template image as full page background
      this.addFullPageBackground(doc, backgroundImageBase64);
      console.log('✅ Full page background applied using your template image');
    } else {
      console.log('❌ Background template image not found, using fallback design');
    }
    
    // Add document content over the background template
    this.addContentOverBackground(doc, vessel, options);
    console.log('📝 Document content added over background template');
    
    console.log('✨ Custom PDF generation completed with your background template design');
  }

  private addFullPageBackground(doc: any, backgroundImageBase64: string): void {
    try {
      // Add your template image as full page background
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      
      // Place the background image to cover the entire page
      doc.image(backgroundImageBase64, 0, 0, { 
        width: pageWidth, 
        height: pageHeight,
        fit: [pageWidth, pageHeight],
        align: 'center',
        valign: 'center'
      });
      
      console.log('🖼️ Background template image applied to full page');
    } catch (error) {
      console.error('Error applying background image:', error);
    }
  }

  private addContentOverBackground(doc: any, vessel: VesselData, options: DocumentOptions): void {
    // Add content positioned over your background template
    
    // Document title in center area (where content would normally go)
    const pageWidth = doc.page.width;
    const centerX = pageWidth / 2;
    
    // Position content in the lower center area of your template
    doc.fontSize(18)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(options.documentType, centerX - 100, 450, { width: 200, align: 'center' });
    
    // Add vessel information if requested
    if (options.includeVesselDetails && vessel) {
      doc.fontSize(14)
         .fillColor('#555555')
         .font('Helvetica-Bold')
         .text(`VESSEL: ${vessel.name}`, centerX - 100, 490, { width: 200, align: 'center' });
      
      doc.fontSize(11)
         .fillColor('#666666')
         .font('Helvetica')
         .text(`IMO: ${vessel.imo || 'N/A'}`, centerX - 100, 510, { width: 200, align: 'center' })
         .text(`Type: ${vessel.vesselType || 'N/A'}`, centerX - 100, 525, { width: 200, align: 'center' });
    }
    
    // Add document content in lower area
    if (options.documentContent) {
      doc.fontSize(10)
         .fillColor('#444444')
         .font('Helvetica')
         .text(this.processDocumentContent(options.documentContent), 50, 560, { 
           width: pageWidth - 100, 
           align: 'left',
           lineGap: 3
         });
    }
  }

  private addCustomHeader(doc: any, colors: any, logoBase64: string | null, secondaryLogoBase64: string | null, options: DocumentOptions): void {
    const pageWidth = doc.page.width;
    
    // Clean white background (no colored header background like the image)
    doc.rect(0, 0, pageWidth, 100)
       .fillAndStroke('#ffffff', '#ffffff');
    
    // Left side: "LEGAL DOCUMENT SERVICES" exactly like the image
    doc.fontSize(14)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('LEGAL DOCUMENT', 50, 30);
    
    doc.fontSize(8)
       .fillColor('#666666')
       .font('Helvetica')
       .text('S E R V I C E S', 52, 50);
    
    // Right side: "PetroDealHub" branding exactly like the image
    doc.fontSize(28)
       .fillColor('#B0C4DE')  // Light blue color matching the image
       .font('Helvetica-Bold')
       .text('PetroDealHub', pageWidth - 220, 25);
    
    doc.fontSize(10)
       .fillColor('#B0C4DE')
       .font('Helvetica')
       .text('Connecting Tankers, Refineries, and Deals', pageWidth - 220, 55);
    
    // Move down for content spacing
    doc.y = 120;
    
    // Add the large central logo from your template assets
    if (logoBase64) {
      try {
        // Center the large logo like in your image (around page center)
        const logoSize = 150;
        const centerX = (pageWidth - logoSize) / 2;
        const logoY = 200;
        
        doc.image(logoBase64, centerX, logoY, { width: logoSize, height: logoSize });
        
        // Move content below the large central logo
        doc.y = logoY + logoSize + 50;
      } catch (error) {
        console.error('Error adding central logo:', error);
      }
    }
    
    // Add "CLIENT COPY" watermark like in your image
    this.addClientCopyWatermark(doc, pageWidth);
  }

  private addVesselInformation(doc: any, vessel: VesselData, colors: any): void {
    doc.moveDown(3);
    
    // Vessel information box with professional styling
    const vesselBoxY = doc.y + 20;
    doc.rect(50, vesselBoxY, 495, 120)
       .fillAndStroke(colors.background, colors.secondary);
    
    // Vessel name header
    doc.fontSize(20)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text(`VESSEL: ${vessel.name}`, 70, vesselBoxY + 20);
    
    // Technical specifications in organized columns
    doc.fontSize(11)
       .fillColor('#374151')
       .font('Helvetica');
    
    const leftCol = 70;
    const rightCol = 320;
    let currentY = vesselBoxY + 55;
    
    // Left column
    doc.text(`IMO Number: ${vessel.imo || 'Not Available'}`, leftCol, currentY);
    doc.text(`Vessel Type: ${vessel.vesselType || 'Not Available'}`, leftCol, currentY + 15);
    doc.text(`Built Year: ${vessel.built || 'Not Available'}`, leftCol, currentY + 30);
    doc.text(`Length: ${vessel.length || 'Not Available'} m`, leftCol, currentY + 45);
    
    // Right column
    doc.text(`Flag State: ${vessel.flag || 'Not Available'}`, rightCol, currentY);
    doc.text(`Width: ${vessel.width || 'Not Available'} m`, rightCol, currentY + 15);
    doc.text(`Deadweight: ${vessel.deadweight || 'Not Available'} DWT`, rightCol, currentY + 30);
    doc.text(`Owner: ${vessel.owner || 'Not Available'}`, rightCol, currentY + 45);
  }

  private addDocumentContent(doc: any, content: string, colors: any): void {
    doc.moveDown(4);
    
    // Content header
    doc.fontSize(18)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text('DOCUMENT CONTENT', { align: 'center' })
       .moveDown(1);
    
    // Process and format content
    const processedContent = this.processDocumentContent(content);
    
    doc.fontSize(11)
       .fillColor('#374151')
       .font('Helvetica')
       .text(processedContent, {
         width: 495,
         align: 'justify',
         lineGap: 4
       });
  }

  private processDocumentContent(content: string): string {
    // Clean up content and format for PDF
    return content
      .replace(/\[Company Logo\]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  }

  private addClientCopyWatermark(doc: any, pageWidth: number): void {
    // Add "CLIENT COPY" watermark like in your background image
    doc.fontSize(36)
       .fillColor('#FFB6C1')  // Light pink color like in the image
       .font('Helvetica-Bold')
       .rotate(25)  // Slight diagonal rotation like in your image
       .text('CLIENT COPY', pageWidth - 250, 650, { opacity: 0.3 })
       .rotate(-25);  // Reset rotation
  }

  private addCustomFooter(doc: any, colors: any, secondaryLogoBase64: string | null): void {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    
    // Footer positioned at bottom like your image
    const footerY = pageHeight - 60;
    
    // Clean footer background (no colored background like your image)
    doc.rect(0, footerY, pageWidth, 60)
       .fillAndStroke('#ffffff', '#ffffff');
    
    // Add small fingerprint/security icon like in your image
    const iconY = footerY + 10;
    doc.rect(50, iconY, 15, 20)
       .fillAndStroke('#4FACFE', '#4FACFE');
    
    // Add vertical lines pattern for fingerprint effect
    for (let i = 0; i < 5; i++) {
      doc.moveTo(52 + i * 2, iconY + 2)
         .lineTo(52 + i * 2, iconY + 18)
         .stroke('#ffffff');
    }
    
    // Legal text exactly like your image
    doc.fontSize(8)
       .fillColor('#333333')
       .font('Helvetica')
       .text('It is officially recognized within the Petrodealhub platform under its legal terms and privacy policy. All rights reserved. Unauthorized use,', 75, footerY + 15)
       .text('modification, or distribution of this document is strictly prohibited. For full legal terms, visit:', 75, footerY + 28);
    
    // Website link in blue
    doc.fontSize(8)
       .fillColor('#4FACFE')
       .font('Helvetica')
       .text('https://www.petrodealhub.com/legal', 430, footerY + 28);
  }
}

export const customPdfTemplateService = new CustomPdfTemplateService();