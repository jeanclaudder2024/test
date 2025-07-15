import type { Express } from "express";
import { storage } from "../storage";
import { authenticateToken } from "../auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function registerBrokerRoutes(app: Express) {
  // Get broker stats
  app.get('/api/broker/stats', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getBrokerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching broker stats:', error);
      res.status(500).json({ error: 'Failed to fetch broker stats' });
    }
  });

  // Get broker deals
  app.get('/api/broker/deals', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const deals = await storage.getBrokerDeals(userId);
      res.json(deals);
    } catch (error) {
      console.error('Error fetching broker deals:', error);
      res.status(500).json({ error: 'Failed to fetch broker deals' });
    }
  });

  // Create broker deal
  app.post('/api/broker/deals', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Prepare data matching the Drizzle schema (using camelCase field names)
      const dealData = {
        brokerId: userId,
        sellerCompanyId: req.body.sellerCompanyId ? parseInt(req.body.sellerCompanyId) : null,
        buyerCompanyId: req.body.buyerCompanyId ? parseInt(req.body.buyerCompanyId) : null,
        vesselId: req.body.vesselId ? parseInt(req.body.vesselId) : null,
        dealTitle: req.body.dealTitle || req.body.title || 'Untitled Deal',
        dealDescription: req.body.dealDescription || req.body.description || null,
        cargoType: req.body.cargoType || req.body.dealType || 'Oil',
        quantity: parseFloat(req.body.quantity || '0'),
        quantityUnit: req.body.quantityUnit || 'MT',
        pricePerUnit: parseFloat(req.body.pricePerUnit || req.body.price || '0'),
        totalValue: parseFloat(req.body.totalValue || '0'),
        currency: req.body.currency || 'USD',
        status: req.body.status || 'pending',
        priority: req.body.priority || 'medium',
        commissionRate: parseFloat(req.body.commissionRate || '0.0150'),
        commissionAmount: req.body.commissionAmount ? parseFloat(req.body.commissionAmount) : null,
        originPort: req.body.originPort || req.body.origin || null,
        destinationPort: req.body.destinationPort || req.body.destination || null,
        // Convert date strings to Date objects if they exist
        departureDate: req.body.departureDate ? new Date(req.body.departureDate) : null,
        arrivalDate: req.body.arrivalDate ? new Date(req.body.arrivalDate) : null,
        progressPercentage: parseInt(req.body.progressPercentage || '0'),
        completionDate: req.body.completionDate ? new Date(req.body.completionDate) : null,
        notes: req.body.notes || null,
        // Add the required fields for transaction progress tracking
        currentStep: parseInt(req.body.currentStep || '1'),
        transactionType: req.body.transactionType || 'CIF-ASWP',
        overallProgress: parseFloat(req.body.overallProgress || '0.00')
      };
      
      const deal = await storage.createBrokerDeal(dealData);
      res.json(deal);
    } catch (error) {
      console.error('Error creating broker deal:', error);
      res.status(500).json({ error: 'Failed to create broker deal' });
    }
  });

  // Update broker deal
  app.put('/api/broker/deals/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const dealId = parseInt(req.params.id);
      const deal = await storage.updateBrokerDeal(dealId, userId, req.body);
      
      if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
      }
      
      res.json(deal);
    } catch (error) {
      console.error('Error updating broker deal:', error);
      res.status(500).json({ error: 'Failed to update broker deal' });
    }
  });

  // Delete broker deal
  app.delete('/api/broker/deals/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const dealId = parseInt(req.params.id);
      const success = await storage.deleteBrokerDeal(dealId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Deal not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting broker deal:', error);
      res.status(500).json({ error: 'Failed to delete broker deal' });
    }
  });

  // Get broker documents
  app.get('/api/broker/documents', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const documents = await storage.getBrokerDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching broker documents:', error);
      res.status(500).json({ error: 'Failed to fetch broker documents' });
    }
  });

  // Upload broker document
  app.post('/api/broker/documents', authenticateToken, upload.single('document'), async (req, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      const { description, dealId } = req.body;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const documentData = {
        brokerId: userId,
        fileName: file.originalname,
        fileType: path.extname(file.originalname),
        fileSize: file.size,
        filePath: file.path,
        description,
        dealId: dealId ? parseInt(dealId) : null
      };
      
      const document = await storage.createBrokerDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error('Error uploading broker document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  });

  // Download broker document
  app.get('/api/broker/documents/:id/download', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const documentId = parseInt(req.params.id);
      const document = await storage.getBrokerDocument(documentId, userId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      if (fs.existsSync(document.filePath)) {
        res.download(document.filePath, document.fileName);
        
        // Update download count
        await storage.updateBrokerDocumentDownloadCount(documentId);
      } else {
        res.status(404).json({ error: 'File not found on server' });
      }
    } catch (error) {
      console.error('Error downloading broker document:', error);
      res.status(500).json({ error: 'Failed to download document' });
    }
  });

  // Get admin files sent to broker
  app.get('/api/broker/admin-files', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const adminFiles = await storage.getBrokerAdminFiles(userId);
      res.json(adminFiles);
    } catch (error) {
      console.error('Error fetching admin files:', error);
      res.status(500).json({ error: 'Failed to fetch admin files' });
    }
  });

  // Mark admin file as read
  app.post('/api/broker/admin-files/:id/read', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const fileId = parseInt(req.params.id);
      await storage.markBrokerAdminFileAsRead(fileId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking admin file as read:', error);
      res.status(500).json({ error: 'Failed to mark file as read' });
    }
  });

  // Get broker profile
  app.get('/api/broker/profile', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getBrokerProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error('Error fetching broker profile:', error);
      res.status(500).json({ error: 'Failed to fetch broker profile' });
    }
  });

  // Update broker profile
  app.put('/api/broker/profile', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.updateBrokerProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error('Error updating broker profile:', error);
      res.status(500).json({ error: 'Failed to update broker profile' });
    }
  });

  // Generate sample data for broker
  app.post('/api/broker/generate-sample-data', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Generate sample deals
      const sampleDeals = [
        {
          dealTitle: 'Crude Oil Export to Asia',
          companyName: 'Pacific Energy Trading',
          dealValue: '$2,500,000',
          oilType: 'Brent Crude',
          quantity: '50,000 barrels',
          status: 'active',
          progress: 65,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          documentsCount: 3,
          notes: 'High-priority deal with established client'
        },
        {
          dealTitle: 'Diesel Fuel Supply Contract',
          companyName: 'Atlantic Maritime Corp',
          dealValue: '$1,200,000',
          oilType: 'Diesel',
          quantity: '25,000 barrels',
          status: 'pending',
          progress: 25,
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          documentsCount: 1,
          notes: 'Awaiting regulatory approval'
        },
        {
          dealTitle: 'Gasoline Distribution Agreement',
          companyName: 'Gulf Coast Logistics',
          dealValue: '$800,000',
          oilType: 'Gasoline',
          quantity: '20,000 barrels',
          status: 'completed',
          progress: 100,
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          expectedCloseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          documentsCount: 5,
          notes: 'Successfully completed with bonus commission'
        }
      ];

      // Create sample deals
      for (const dealData of sampleDeals) {
        await storage.createBrokerDeal({ ...dealData, brokerId: userId });
      }

      // Generate sample documents
      const sampleDocuments = [
        {
          brokerId: userId,
          fileName: 'Contract_Pacific_Energy.pdf',
          fileType: '.pdf',
          fileSize: 2048576,
          filePath: 'uploads/sample_contract.pdf',
          description: 'Main contract for Pacific Energy Trading deal',
          downloadCount: 3,
          isAdminFile: false
        },
        {
          brokerId: userId,
          fileName: 'Shipping_Manifest_Atlantic.xlsx',
          fileType: '.xlsx',
          fileSize: 1024000,
          filePath: 'uploads/sample_manifest.xlsx',
          description: 'Shipping manifest for Atlantic Maritime contract',
          downloadCount: 1,
          isAdminFile: false
        },
        {
          brokerId: userId,
          fileName: 'Compliance_Certificate.pdf',
          fileType: '.pdf',
          fileSize: 512000,
          filePath: 'uploads/sample_compliance.pdf',
          description: 'Regulatory compliance certificate',
          downloadCount: 2,
          isAdminFile: false
        }
      ];

      // Create sample documents
      for (const docData of sampleDocuments) {
        await storage.createBrokerDocument(docData);
      }

      // Generate sample admin files
      const sampleAdminFiles = [
        {
          brokerId: userId,
          fileName: 'Q4_Market_Report.pdf',
          fileType: '.pdf',
          fileSize: 3072000,
          sentBy: 'Admin Team',
          sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          description: 'Quarterly market analysis and trends report',
          category: 'report',
          isRead: false
        },
        {
          brokerId: userId,
          fileName: 'New_Compliance_Guidelines.docx',
          fileType: '.docx',
          fileSize: 1536000,
          sentBy: 'Compliance Team',
          sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          description: 'Updated compliance guidelines for Q1 2025',
          category: 'compliance',
          isRead: false
        }
      ];

      // Create sample admin files
      for (const fileData of sampleAdminFiles) {
        await storage.createBrokerAdminFile(fileData);
      }

      res.json({ success: true, message: 'Sample data generated successfully' });
    } catch (error) {
      console.error('Error generating sample data:', error);
      res.status(500).json({ error: 'Failed to generate sample data' });
    }
  });
}