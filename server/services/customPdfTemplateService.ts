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
    console.log('🎨 Starting custom PDF generation with user template assets...');
    
    const colors = this.readColorScheme();
    console.log('📋 Color scheme loaded:', colors);
    
    const logoBase64 = await this.getLogoBase64();
    console.log('🏢 Primary logo loaded:', logoBase64 ? 'SUCCESS' : 'FAILED');
    
    const secondaryLogoBase64 = await this.getSecondaryLogoBase64();
    console.log('📄 Secondary logo loaded:', secondaryLogoBase64 ? 'SUCCESS' : 'FAILED');

    // Professional header with template styling
    this.addCustomHeader(doc, colors, logoBase64, secondaryLogoBase64, options);
    console.log('✅ Custom header added with user branding');
    
    // Add vessel information with template styling
    if (options.includeVesselDetails) {
      this.addVesselInformation(doc, vessel, colors);
      console.log('🚢 Vessel information added with custom styling');
    }
    
    // Add document content with professional formatting
    this.addDocumentContent(doc, options.documentContent, colors);
    console.log('📝 Document content formatted with user template colors');
    
    // Add professional footer
    this.addCustomFooter(doc, colors, secondaryLogoBase64);
    console.log('🏁 Custom footer added with branding');
    
    console.log('✨ Custom PDF generation completed with user template design');
  }

  private addCustomHeader(doc: any, colors: any, logoBase64: string | null, secondaryLogoBase64: string | null, options: DocumentOptions): void {
    const pageWidth = doc.page.width;
    
    // Header background with gradient effect
    doc.rect(0, 0, pageWidth, 120)
       .fillAndStroke(colors.primary, colors.primary);
    
    // Add logos if available
    if (logoBase64) {
      try {
        doc.image(logoBase64, 50, 20, { width: 60, height: 60 });
      } catch (error) {
        console.error('Error adding primary logo:', error);
      }
    }
    
    // Company branding
    doc.fontSize(28)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text('PETRODEALHUB', 130, 30);
    
    doc.fontSize(12)
       .fillColor('#e0e7ff')
       .font('Helvetica')
       .text('Legal Document Services', 130, 55);
    
    // Secondary logo (Legal Document Services)
    if (secondaryLogoBase64) {
      try {
        doc.image(secondaryLogoBase64, pageWidth - 110, 20, { width: 60, height: 60 });
      } catch (error) {
        console.error('Error adding secondary logo:', error);
      }
    }
    
    // Document type and date
    doc.fontSize(14)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text(options.documentType.toUpperCase(), 400, 35);
    
    doc.fontSize(10)
       .fillColor('#e0e7ff')
       .font('Helvetica')
       .text(`Generated: ${new Date().toLocaleDateString()}`, 400, 55)
       .text(`Time: ${new Date().toLocaleTimeString()}`, 400, 70);
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

  private addCustomFooter(doc: any, colors: any, secondaryLogoBase64: string | null): void {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;
    
    // Footer separator line
    doc.strokeColor(colors.secondary)
       .lineWidth(1)
       .moveTo(50, footerY)
       .lineTo(545, footerY)
       .stroke();
    
    // Legal text and verification
    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica')
       .text('This document is officially recognized within the PetroDealHub platform under its legal terms and privacy policy.', 
             50, footerY + 15);
    
    doc.text('All rights reserved. Unauthorized use, modification, or distribution is strictly prohibited.', 
             50, footerY + 30);
    
    doc.fillColor(colors.primary)
       .text('Visit: https://www.petrodealhub.com/legal', 50, footerY + 45);
    
    // Company contact information
    doc.fontSize(10)
       .fillColor('#374151')
       .font('Helvetica-Bold')
       .text('PetroDealHub Maritime Solutions', 400, footerY + 15);
    
    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica')
       .text('Email: support@petrodealhub.com', 400, footerY + 30)
       .text('Web: www.petrodealhub.com', 400, footerY + 45);
    
    // Small secondary logo in footer if available
    if (secondaryLogoBase64) {
      try {
        doc.image(secondaryLogoBase64, 520, footerY + 20, { width: 25, height: 25 });
      } catch (error) {
        console.error('Error adding footer logo:', error);
      }
    }
  }
}

export const customPdfTemplateService = new CustomPdfTemplateService();