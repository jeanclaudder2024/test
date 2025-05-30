import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the logo path
const logoPath = path.join(__dirname, '../assets/petrodeal-logo.png');

interface CargoManifestData {
  vesselId: number;
  vesselName: string;
  vesselIMO: string;
  vesselMMSI: string | null;
  cargoType: string;
  cargoCapacity: number | null;
  departurePort: string | null;
  destinationPort: string | null;
  departureDate: string | null;
  eta: string | null;
  generatedTime: string;
  lastPosition: string;
  buyerName?: string | null;
  sellerName?: string | null;
  flag: string;
  built?: number | null;
}

interface NutCargoManifestData extends CargoManifestData {
  nutType: string;
  nutGrade: string;
  nutOrigin: string;
  nutProcessingMethod: string;
  moistureContent: string;
  packaging: string;
}

/**
 * Generates a PDF cargo manifest based on vessel and cargo data
 * @param data Cargo manifest data
 * @returns PDF buffer
 */
export async function generateCargoManifestPDF(data: CargoManifestData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: `Cargo Manifest - ${data.vesselName}`,
        Author: 'PetroDealHub Maritime System',
        Subject: 'Vessel Cargo Manifest',
        Keywords: 'cargo, vessel, shipping, manifest'
      },
      // Ensure PDF is compatible with most viewers
      pdfVersion: '1.7',
      autoFirstPage: true,
      compress: true
    });

    // Collect PDF data chunks
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    // Handle errors in PDF generation
    doc.on('error', (err) => reject(err));

    try {
      // Add header with logo and title
      // Draw a fancy header box with blue background
      doc.rect(50, 50, 495, 80)
        .fillColor('#003366')
        .fill();
        
      // Add the actual PetroDealHub logo - with error handling
      try {
        if (fs.existsSync(logoPath)) {
          // Scale and position the logo properly
          doc.image(logoPath, 60, 55, { width: 70, height: 70 });
        } else {
          console.warn('Logo file not found at path:', logoPath);
        }
      } catch (logoErr) {
        console.error('Error adding logo to PDF:', logoErr);
        // Continue without the logo in case of error
      }
      
      // Add cargo manifest title
      doc.fontSize(22)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('CARGO MANIFEST', 140, 75)
        .font('Helvetica');
        
      // Add decorative element (orange vertical strip)
      doc.rect(495, 50, 50, 80)
        .fillColor('#FF6F00')
        .fill();
      
      // Add decorative line below header
      doc.moveTo(50, 150)
        .lineTo(545, 150)
        .strokeColor('#FF6F00')
        .lineWidth(2)
        .stroke();

      // Add vessel information section
      doc.moveDown(2)
        .fontSize(16)
        .fillColor('#003366')
        .text('VESSEL INFORMATION', { underline: true })
        .moveDown(0.5);

      // Create section background
      doc.rect(50, doc.y - 10, 495, 125)
        .fillColor('#f8f9fa')
        .fill();

      // Vessel details table
      const vesselDetails = [
        { label: 'Vessel Name:', value: data.vesselName },
        { label: 'IMO Number:', value: data.vesselIMO },
        { label: 'MMSI:', value: data.vesselMMSI || 'N/A' },
        { label: 'Last Position:', value: data.lastPosition },
        { label: 'Flag:', value: data.flag },
        { label: 'Year Built:', value: data.built || 'N/A' }
      ];

      vesselDetails.forEach(item => {
        doc.fontSize(12)
          .fillColor('#000000');
        
        doc.font('Helvetica-Bold')
          .text(item.label, 60, doc.y, { continued: true, width: 150 })
          .font('Helvetica')
          .text(String(item.value), { width: 350 })
          .moveDown(0.5);
      });

      // Add cargo information section with nicer styling
      doc.moveDown(1)
        .fontSize(16)
        .fillColor('#003366')
        .text('CARGO INFORMATION', { underline: true })
        .moveDown(0.5);

      // Create section background
      doc.rect(50, doc.y - 10, 495, 125)
        .fillColor('#f0f8ff')
        .fill();

      // Cargo details table
      const cargoDetails = [
        { label: 'Cargo Type:', value: data.cargoType },
        { label: 'Capacity:', value: data.cargoCapacity ? `${data.cargoCapacity.toLocaleString()} MT` : 'Not specified' },
        { label: 'Departure Port:', value: data.departurePort || 'Not specified' },
        { label: 'Departure Date:', value: data.departureDate },
        { label: 'Destination Port:', value: data.destinationPort || 'Not specified' },
        { label: 'Estimated Arrival:', value: data.eta }
      ];

      cargoDetails.forEach(item => {
        doc.fontSize(12)
          .fillColor('#000000');
        
        doc.font('Helvetica-Bold')
          .text(item.label, 60, doc.y, { continued: true, width: 150 })
          .font('Helvetica')
          .text(String(item.value), { width: 350 })
          .moveDown(0.5);
      });

      // Add buyer/seller information
      doc.moveDown(1)
        .fontSize(16)
        .fillColor('#003366')
        .text('COMMERCIAL INFORMATION', { underline: true })
        .moveDown(0.5);

      // Create section background
      doc.rect(50, doc.y - 10, 495, 60)
        .fillColor('#fff8f0')
        .fill();

      const commercialDetails = [
        { label: 'Buyer:', value: data.buyerName || 'Not specified' },
        { label: 'Seller:', value: data.sellerName || 'Not specified' }
      ];

      commercialDetails.forEach(item => {
        doc.fontSize(12)
          .fillColor('#000000');
        
        doc.font('Helvetica-Bold')
          .text(item.label, 60, doc.y, { continued: true, width: 150 })
          .font('Helvetica')
          .text(String(item.value), { width: 350 })
          .moveDown(0.5);
      });

      // Add certification section
      doc.moveDown(2)
        .fontSize(14)
        .fillColor('#003366')
        .text('CERTIFICATION', { underline: true })
        .moveDown(0.5);
      
      // Add certification box with border
      doc.rect(50, doc.y - 5, 495, 60)
        .lineWidth(1)
        .strokeColor('#003366')
        .stroke();
      
      doc.fontSize(11)
        .fillColor('#000000')
        .text('This cargo manifest certifies that the cargo described above is loaded onboard the named vessel.', { align: 'left', width: 475, indent: 10 })
        .moveDown(2);

      // Add signature lines
      doc.fontSize(11)
        .text('________________', 100, doc.y)
        .text('Master Signature', 100)
        .moveUp(2)
        .text('________________', 350, doc.y)
        .text('Date', 350);

      // Add fancy footer with gradient appearance
      doc.rect(50, 730, 495, 50)
        .fillColor('#003366')
        .fill();
      
      doc.rect(50, 730, 495, 5)
        .fillColor('#FF6F00')
        .fill();

      // Add footer
      doc.fontSize(10)
        .fillColor('#FFFFFF')
        .text(
          `Document generated on: ${new Date().toLocaleString()}`,
          50,
          745,
          { align: 'center' }
        )
        .text(
          'PetroDealHub Maritime System - Confidential Document',
          50,
          760,
          { align: 'center' }
        );

      // Add page numbers if more than one page
      let pageCount = 1;
      doc.on('pageAdded', () => {
        pageCount++;
        const currentPage = pageCount;
        
        // Add page number at bottom of each page
        doc.switchToPage(currentPage - 1);
        doc.fontSize(10)
          .fillColor('#FFFFFF')
          .text(
            `Page ${currentPage} of ${pageCount}`,
            50,
            780,
            { align: 'center' }
          );
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating cargo manifest PDF:', error);
      doc.end();
      reject(error);
    }
  });
}

/**
 * Generates a PDF cargo manifest specifically for nut cargo
 * @param data Nut cargo manifest data
 * @returns PDF buffer
 */
export async function generateNutManifestPDF(data: NutCargoManifestData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: `Nut Cargo Manifest - ${data.vesselName}`,
        Author: 'PetroDealHub Maritime System',
        Subject: 'Nut Cargo Manifest',
        Keywords: 'cargo, vessel, shipping, manifest, nuts, food cargo'
      },
      pdfVersion: '1.7',
      autoFirstPage: true,
      compress: true
    });

    // Collect PDF data chunks
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    try {
      // Add header with logo and title
      // Draw a fancy header box with blue background
      doc.rect(50, 50, 495, 80)
        .fillColor('#003366')
        .fill();
        
      // Add the actual PetroDealHub logo - with error handling
      try {
        if (fs.existsSync(logoPath)) {
          // Scale and position the logo properly
          doc.image(logoPath, 60, 55, { width: 70, height: 70 });
        } else {
          console.warn('Logo file not found at path:', logoPath);
        }
      } catch (logoErr) {
        console.error('Error adding logo to PDF:', logoErr);
        // Continue without the logo in case of error
      }
      
      // Add cargo manifest title
      doc.fontSize(22)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('NUT CARGO MANIFEST', 140, 75)
        .font('Helvetica');
        
      // Add decorative element
      doc.rect(495, 50, 50, 80)
        .fillColor('#FF6F00')
        .fill();
        
      // Add decorative line below header
      doc.moveTo(50, 150)
        .lineTo(545, 150)
        .strokeColor('#FF6F00')
        .lineWidth(2)
        .stroke();

      // Add vessel information section
      doc.moveDown(2)
        .fontSize(16)
        .fillColor('#003366')
        .text('VESSEL INFORMATION', { underline: true })
        .moveDown(0.5);

      // Create section background
      doc.rect(50, doc.y - 10, 495, 105)
        .fillColor('#f8f9fa')
        .fill();

      // Vessel details table
      const vesselDetails = [
        { label: 'Vessel Name:', value: data.vesselName },
        { label: 'IMO Number:', value: data.vesselIMO },
        { label: 'MMSI:', value: data.vesselMMSI || 'N/A' },
        { label: 'Last Position:', value: data.lastPosition },
        { label: 'Flag:', value: data.flag }
      ];

      vesselDetails.forEach(item => {
        doc.fontSize(12)
          .fillColor('#000000');
        
        doc.font('Helvetica-Bold')
          .text(item.label, 60, doc.y, { continued: true, width: 150 })
          .font('Helvetica')
          .text(String(item.value), { width: 350 })
          .moveDown(0.5);
      });

      // Add nut cargo information section with nice styling
      doc.moveDown(1)
        .fontSize(16)
        .fillColor('#003366')
        .text('NUT CARGO SPECIFICATIONS', { underline: true })
        .moveDown(0.5);

      // Create section background with nut-themed color
      doc.rect(50, doc.y - 10, 495, 155)
        .fillColor('#fff8dc') // Cream color for nut theme
        .fill();

      // Nut cargo details table
      const nutDetails = [
        { label: 'Nut Type:', value: data.nutType },
        { label: 'Quality Grade:', value: data.nutGrade },
        { label: 'Origin:', value: data.nutOrigin },
        { label: 'Processing Method:', value: data.nutProcessingMethod },
        { label: 'Moisture Content:', value: data.moistureContent },
        { label: 'Packaging:', value: data.packaging },
        { label: 'Capacity:', value: data.cargoCapacity ? `${data.cargoCapacity.toLocaleString()} MT` : 'Not specified' }
      ];

      nutDetails.forEach(item => {
        doc.fontSize(12)
          .fillColor('#000000');
        
        doc.font('Helvetica-Bold')
          .text(item.label, 60, doc.y, { continued: true, width: 150 })
          .font('Helvetica')
          .text(String(item.value), { width: 350 })
          .moveDown(0.5);
      });

      // Add shipping information
      doc.moveDown(1)
        .fontSize(16)
        .fillColor('#003366')
        .text('SHIPPING INFORMATION', { underline: true })
        .moveDown(0.5);

      // Create section background
      doc.rect(50, doc.y - 10, 495, 125)
        .fillColor('#f0f8ff')
        .fill();

      const shippingDetails = [
        { label: 'Departure Port:', value: data.departurePort || 'Not specified' },
        { label: 'Departure Date:', value: data.departureDate },
        { label: 'Destination Port:', value: data.destinationPort || 'Not specified' },
        { label: 'Estimated Arrival:', value: data.eta },
        { label: 'Buyer:', value: data.buyerName || 'Not specified' },
        { label: 'Seller:', value: data.sellerName || 'Not specified' }
      ];

      shippingDetails.forEach(item => {
        doc.fontSize(12)
          .fillColor('#000000');
        
        doc.font('Helvetica-Bold')
          .text(item.label, 60, doc.y, { continued: true, width: 150 })
          .font('Helvetica')
          .text(String(item.value), { width: 350 })
          .moveDown(0.5);
      });

      // Add certification section
      doc.moveDown(1)
        .fontSize(14)
        .fillColor('#003366')
        .text('SIGNATURES', { underline: true })
        .moveDown(0.5);

      // Add signature lines in grid (2x2)
      doc.fontSize(11);
      
      // Row 1
      doc.text('________________', 100, doc.y)
        .text('Master Signature', 100)
        .moveUp(2)
        .text('________________', 350, doc.y)
        .text('Quality Inspector', 350)
        .moveDown(3);
      
      // Row 2
      doc.text('________________', 100, doc.y)
        .text('Food Safety Officer', 100)
        .moveUp(2)
        .text('________________', 350, doc.y)
        .text('Date', 350);

      // Add fancy footer with gradient appearance
      doc.rect(50, 730, 495, 50)
        .fillColor('#003366')
        .fill();
      
      doc.rect(50, 730, 495, 5)
        .fillColor('#FF6F00')
        .fill();

      // Add footer
      doc.fontSize(10)
        .fillColor('#FFFFFF')
        .text(
          `Document generated on: ${new Date().toLocaleString()}`,
          50,
          745,
          { align: 'center' }
        )
        .text(
          'PetroDealHub Maritime System - Confidential Document',
          50,
          760,
          { align: 'center' }
        );

      // Add page numbers if more than one page
      let pageCount = 1;
      doc.on('pageAdded', () => {
        pageCount++;
        const currentPage = pageCount;
        
        // Add page number at bottom of each page
        doc.switchToPage(currentPage - 1);
        doc.fontSize(10)
          .fillColor('#FFFFFF')
          .text(
            `Page ${currentPage} of ${pageCount}`,
            50,
            780,
            { align: 'center' }
          );
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating nut cargo manifest PDF:', error);
      doc.end();
      reject(error);
    }
  });
}