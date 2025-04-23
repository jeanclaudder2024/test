import { Router } from 'express';
import { storage } from '../storage';
import { cohereService } from '../services/cohereService';
import { z } from 'zod';
import { insertDocumentSchema } from '@shared/schema';

export const documentRouter = Router();

/**
 * @route POST /api/documents/generate
 * @description Generate a shipping document based on vessel data
 * @access Public
 */
documentRouter.post('/generate', async (req, res) => {
  try {
    const { vesselId, documentType } = req.body;

    if (!vesselId || !documentType) {
      return res.status(400).json({ error: 'Vessel ID and document type are required' });
    }

    // Get vessel data for document generation
    const vessel = await storage.getVesselById(Number(vesselId));
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    try {
      // Generate document content using Cohere AI
      const generatedContent = await cohereService.generateShippingDocument(vessel, documentType);
      
      const currentDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(currentDate.getDate() + 90);
      
      // Generate a reference number
      const refNumber = `DOC-${vesselId}-${currentDate.getTime().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Create document record in database
      const document = await storage.createDocument({
        vesselId: vessel.id,
        title: `${documentType} - ${vessel.name}`,
        type: documentType,
        content: generatedContent,
        status: 'active',
        reference: refNumber,
        issuer: 'Vesselian Maritime Authority',
        recipientName: 'Authorized Personnel',
        recipientOrg: 'Maritime Operations',
        language: 'en',
        issueDate: currentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      });
      
      return res.status(201).json({
        success: true,
        document
      });
    } catch (cohereError) {
      console.error('Error generating with Cohere:', cohereError);
      
      // Fallback to template generation
      const fallbackContent = generateTemplateDocument(vessel, documentType);
      
      const currentDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(currentDate.getDate() + 90);
      
      // Generate a reference number
      const refNumber = `DOC-${vesselId}-${currentDate.getTime().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Create document with fallback content
      const document = await storage.createDocument({
        vesselId: vessel.id,
        title: `${documentType} - ${vessel.name}`,
        type: documentType,
        content: fallbackContent,
        status: 'active',
        reference: refNumber,
        issuer: 'Vesselian Maritime Authority',
        recipientName: 'Authorized Personnel',
        recipientOrg: 'Maritime Operations',
        language: 'en',
        issueDate: currentDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      });
      
      return res.status(201).json({
        success: true,
        document,
        fallback: true
      });
    }
  } catch (error: any) {
    console.error('Error generating document:', error);
    return res.status(500).json({
      error: 'Failed to generate document',
      details: error.message
    });
  }
});

/**
 * Fallback function to generate template documents
 */
function generateTemplateDocument(vessel: any, documentType: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  let content = "";
  
  switch (documentType.toLowerCase()) {
    case "bill of lading":
    case "bl":
      content = `BILL OF LADING\n
Shipper: [SHIPPER COMPANY]
Consignee: [CONSIGNEE COMPANY]
Notify Party: [NOTIFY PARTY]

Vessel: ${vessel.name}
Voyage No: VY${new Date().getFullYear()}${Math.floor(Math.random() * 1000)}
Port of Loading: ${vessel.departurePort || 'TBD'}
Port of Discharge: ${vessel.destinationPort || 'TBD'}

Description of Goods:
${vessel.cargoType || 'Crude Oil'}
Quantity: ${vessel.cargoCapacity || 'N/A'} tonnes
Gross Weight: ${vessel.cargoCapacity ? Math.round(vessel.cargoCapacity * 0.9) : 'N/A'} metric tons

SHIPPED on board the vessel, the goods or packages said to contain goods herein mentioned in apparent good order and condition.

Date of Issue: ${currentDate}
Signed: ______________________________
        Master or Agent`;
      break;
    
    case "cargo manifest":
    case "manifest":
      content = `CARGO MANIFEST\n
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo}
Voyage Number: VY${new Date().getFullYear()}${Math.floor(Math.random() * 1000)}
Port of Loading: ${vessel.departurePort || 'TBD'}
Port of Discharge: ${vessel.destinationPort || 'TBD'}
Date: ${currentDate}

CARGO DETAILS:
---------------
Type: ${vessel.cargoType || 'Crude Oil'}
Quantity: ${vessel.cargoCapacity || 'N/A'} tonnes
UN Number: UN1267
Hazard Class: 3
Packing Group: I

SPECIAL INSTRUCTIONS:
---------------------
Temperature requirements: Ambient
Handling requirements: Standard crude oil procedures
Hazard notes: Flammable liquid

TOTAL CARGO: ${vessel.cargoCapacity || 'N/A'} tonnes

Certified by: _________________________
Date: ${currentDate}
Page: 1 of 1`;
      break;
      
    default:
      content = `DOCUMENT: ${documentType.toUpperCase()}\n
Vessel Name: ${vessel.name}
IMO Number: ${vessel.imo}
Flag: ${vessel.flag}
Date Generated: ${currentDate}

This document certifies that vessel ${vessel.name} carrying ${vessel.cargoType || 'cargo'} 
has been properly documented in accordance with international maritime regulations.

Document Reference: ${Math.random().toString(36).substring(2, 10).toUpperCase()}
Valid Until: [90 DAYS FROM ISSUE]

AUTHORIZED SIGNATURE: _______________________
OFFICIAL SEAL: [SEAL]
`;
  }
  
  return content;
}