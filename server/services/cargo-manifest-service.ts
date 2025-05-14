import PDFDocument from 'pdfkit';

interface CargoManifestData {
  vesselId: number;
  vesselName: string;
  vesselIMO: string;
  vesselMMSI: string | null;
  cargoType: string;
  cargoQuantity: number;
  cargoUnit: string;
  departurePort: string;
  destinationPort: string;
  departureTime: string;
  eta: string;
  generatedTime: string;
  lastPosition: string;
  vesselStatus: string;
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
      { label: 'Vessel Status:', value: data.vesselStatus }
    ];

    vesselDetails.forEach(item => {
      doc.fontSize(12)
        .fillColor('#000000');
      
      doc.font('Helvetica-Bold')
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
        .font('Helvetica')
        .text(item.value, { width: 350 })
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
      { label: 'Quantity:', value: `${data.cargoQuantity.toLocaleString()} ${data.cargoUnit}` },
      { label: 'Departure Port:', value: data.departurePort },
      { label: 'Departure Date:', value: data.departureTime },
      { label: 'Destination Port:', value: data.destinationPort },
      { label: 'Estimated Arrival:', value: data.eta }
    ];

    cargoDetails.forEach(item => {
      doc.fontSize(12)
        .fillColor('#000000');
      
      doc.font('Helvetica-Bold')
        .text(item.label, 50, doc.y, { continued: true, width: 150 })
        .font('Helvetica')
        .text(item.value, { width: 350 })
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