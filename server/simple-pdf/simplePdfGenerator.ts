import PDFDocument from 'pdfkit';

/**
 * Generate a simple PDF document
 * @param {Object} options - Document options
 * @param {string} options.title - Document title
 * @param {string} options.vesselName - Vessel name
 * @param {string} options.type - Document type
 * @param {Object} options.data - Additional data
 * @returns {Promise<Buffer>} PDF document as buffer
 */
export async function generateSimplePdf(options: any): Promise<Buffer> {
  return new Promise((resolve) => {
    // Create a buffer to store PDF data
    const buffers: Buffer[] = [];
    
    // Create a simple PDF document that works reliably
    const doc = new PDFDocument();
    
    // Collect data chunks
    doc.on('data', (chunk) => {
      buffers.push(chunk);
    });
    
    // When document is done, resolve with the complete buffer
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    
    // Add title
    doc.fontSize(24)
      .text(options.title, {
        align: 'center'
      })
      .moveDown();
    
    // Add vessel name
    doc.fontSize(18)
      .text(`Vessel: ${options.vesselName}`, {
        align: 'center'
      })
      .moveDown();
    
    // Add document date
    doc.fontSize(12)
      .text(`Date: ${new Date().toLocaleDateString()}`, {
        align: 'center'
      })
      .moveDown();
    
    // Add document type specific content
    doc.fontSize(14)
      .text(`Document Type: ${options.type}`, {
        align: 'left'
      })
      .moveDown();
    
    if (options.type === 'Cargo Manifest') {
      // Add cargo details
      doc.fontSize(12)
        .text(`Cargo Type: ${options.data.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Quantity: ${options.data.cargoQuantity || 'Not specified'}`)
        .moveDown()
        .text(`Origin: ${options.data.departurePort || 'Not specified'}`)
        .moveDown()
        .text(`Destination: ${options.data.destinationPort || 'Not specified'}`)
        .moveDown();
      
      // Add signature line
      doc.moveDown(2)
        .text('________________________', {
          align: 'left'
        })
        .text('Master Signature', {
          align: 'left'
        });
    } 
    else if (options.type === 'Bill of Lading') {
      // Add shipping details
      doc.fontSize(12)
        .text(`B/L Number: ${Math.floor(Math.random() * 1000000)}`)
        .moveDown()
        .text(`Shipper: ${options.data.sellerName || 'Not specified'}`)
        .moveDown()
        .text(`Consignee: ${options.data.buyerName || 'Not specified'}`)
        .moveDown()
        .text(`Cargo: ${options.data.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Quantity: ${options.data.cargoQuantity || 'Not specified'}`)
        .moveDown();
      
      // Add signature line
      doc.moveDown(2)
        .text('________________________', {
          align: 'left'
        })
        .text('Authorized Signature', {
          align: 'left'
        });
    }
    else if (options.type === 'Certificate of Origin') {
      // Add origin details
      doc.fontSize(12)
        .text(`Certificate Number: CO-${Math.floor(Math.random() * 1000000)}`)
        .moveDown()
        .text(`Exporter: ${options.data.sellerName || 'Not specified'}`)
        .moveDown()
        .text(`Importer: ${options.data.buyerName || 'Not specified'}`)
        .moveDown()
        .text(`Goods: ${options.data.cargoType || 'Not specified'}`)
        .moveDown()
        .text(`Origin: ${options.data.departurePort ? options.data.departurePort.split(',')[0] : 'Not specified'}`)
        .moveDown();
      
      // Add signature line
      doc.moveDown(2)
        .text('________________________', {
          align: 'left'
        })
        .text('Authorized Signature', {
          align: 'left'
        });
    }
    
    // Add footer
    doc.fontSize(10)
      .text('PetroDealHub Maritime System', {
        align: 'center'
      })
      .text(`Generated: ${new Date().toLocaleString()}`, {
        align: 'center'
      });
    
    // Finalize the PDF file
    doc.end();
  });
}