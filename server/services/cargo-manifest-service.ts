import PDFDocument from 'pdfkit';

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
  return new Promise((resolve) => {
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
      }
    });

    // Collect PDF data chunks
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add header with logo and title
    doc.fontSize(20)
      .fillColor('#003366')
      .text('CARGO MANIFEST', { align: 'center' })
      .moveDown(0.5);

    // Add top border line
    doc.moveTo(50, 90)
      .lineTo(545, 90)
      .strokeColor('#FF6F00')
      .lineWidth(3)
      .stroke();

    // Add vessel information section
    doc.moveDown(1)
      .fontSize(16)
      .fillColor('#003366')
      .text('VESSEL INFORMATION', { underline: true })
      .moveDown(0.5);

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
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
        .font('Helvetica')
        .text(String(item.value), { width: 350 })
        .moveDown(0.5);
    });

    // Add cargo information section
    doc.moveDown(1)
      .fontSize(16)
      .fillColor('#003366')
      .text('CARGO INFORMATION', { underline: true })
      .moveDown(0.5);

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
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
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

    const commercialDetails = [
      { label: 'Buyer:', value: data.buyerName || 'Not specified' },
      { label: 'Seller:', value: data.sellerName || 'Not specified' }
    ];

    commercialDetails.forEach(item => {
      doc.fontSize(12)
        .fillColor('#000000');
      
      doc.font('Helvetica-Bold')
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
        .font('Helvetica')
        .text(String(item.value), { width: 350 })
        .moveDown(0.5);
    });

    // Add certification section
    doc.moveDown(2)
      .fontSize(14)
      .fillColor('#003366')
      .text('CERTIFICATION', { underline: true })
      .moveDown(0.5)
      .fontSize(11)
      .fillColor('#000000')
      .text('This cargo manifest certifies that the cargo described above is loaded onboard the named vessel.', { align: 'left' })
      .moveDown(2);

    // Add signature lines
    doc.fontSize(11)
      .text('________________', 100, doc.y)
      .text('Master Signature', 100)
      .moveUp(2)
      .text('________________', 350, doc.y)
      .text('Date', 350);

    // Add bottom border line
    doc.moveTo(50, 730)
      .lineTo(545, 730)
      .strokeColor('#FF6F00')
      .lineWidth(2)
      .stroke();

    // Add footer
    doc.fontSize(10)
      .fillColor('#666666')
      .text(
        `Document generated on: ${new Date().toLocaleString()}`,
        50,
        750,
        { align: 'center' }
      )
      .text(
        'PetroDealHub Maritime System - Confidential Document',
        50,
        765,
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
         .fillColor('#666666')
         .text(
           `Page ${currentPage} of ${pageCount}`,
           50,
           780,
           { align: 'center' }
         );
    });

    // Finalize the PDF
    doc.end();
  });
}

/**
 * Generates a PDF cargo manifest specifically for nut cargo
 * @param data Nut cargo manifest data
 * @returns PDF buffer
 */
export async function generateNutManifestPDF(data: NutCargoManifestData): Promise<Buffer> {
  return new Promise((resolve) => {
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
      }
    });

    // Collect PDF data chunks
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add header with logo and title
    doc.fontSize(20)
      .fillColor('#003366')
      .text('NUT CARGO MANIFEST', { align: 'center' })
      .moveDown(0.5);

    // Add top border line
    doc.moveTo(50, 90)
      .lineTo(545, 90)
      .strokeColor('#FF6F00')
      .lineWidth(3)
      .stroke();

    // Add vessel information section
    doc.moveDown(1)
      .fontSize(16)
      .fillColor('#003366')
      .text('VESSEL INFORMATION', { underline: true })
      .moveDown(0.5);

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
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
        .font('Helvetica')
        .text(String(item.value), { width: 350 })
        .moveDown(0.5);
    });

    // Add nut cargo information section
    doc.moveDown(1)
      .fontSize(16)
      .fillColor('#003366')
      .text('NUT CARGO SPECIFICATIONS', { underline: true })
      .moveDown(0.5);

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
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
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
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
        .font('Helvetica')
        .text(String(item.value), { width: 350 })
        .moveDown(0.5);
    });

    // Add food safety section
    doc.moveDown(1)
      .fontSize(16)
      .fillColor('#003366')
      .text('FOOD SAFETY CERTIFICATION', { underline: true })
      .moveDown(0.5)
      .fontSize(11)
      .fillColor('#000000')
      .text('This cargo has been inspected and certified to meet all international food safety standards for nut products, including absence of prohibited pesticides, mycotoxins within acceptable limits, and proper handling procedures to prevent contamination.', { align: 'left' })
      .moveDown(1);

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

    // Add bottom border line
    doc.moveTo(50, 730)
      .lineTo(545, 730)
      .strokeColor('#FF6F00')
      .lineWidth(2)
      .stroke();

    // Add footer
    doc.fontSize(10)
      .fillColor('#666666')
      .text(
        `Document generated on: ${new Date().toLocaleString()}`,
        50,
        750,
        { align: 'center' }
      )
      .text(
        'PetroDealHub Maritime System - Confidential Document',
        50,
        765,
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
         .fillColor('#666666')
         .text(
           `Page ${currentPage} of ${pageCount}`,
           50,
           780,
           { align: 'center' }
         );
    });

    // Finalize the PDF
    doc.end();
  });
}