import type { Express } from "express";
import { storage } from "../storage";
import { authenticateToken } from "../auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

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
  // Broker Card Application routes
  app.post('/api/broker-card-application', authenticateToken, upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'passportDocument', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const userId = req.user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Check if user already has an application
      const existingApplication = await storage.getBrokerCardApplication(userId);
      if (existingApplication) {
        return res.status(400).json({ error: 'You already have a broker card application' });
      }
      
      // Prepare file paths
      let passportPhotoPath = null;
      let passportDocumentPath = null;
      
      if (files.passportPhoto && files.passportPhoto[0]) {
        passportPhotoPath = files.passportPhoto[0].path;
      }
      
      if (files.passportDocument && files.passportDocument[0]) {
        passportDocumentPath = files.passportDocument[0].path;
      }
      
      // Create application data
      const applicationData = {
        submittedBy: userId,
        fullName: req.body.fullName,
        dateOfBirth: req.body.dateOfBirth,
        nationality: req.body.nationality,
        passportNumber: req.body.passportNumber,
        passportExpiry: req.body.passportExpiry,
        placeOfBirth: req.body.placeOfBirth || null,
        gender: req.body.gender || null,
        maritalStatus: req.body.maritalStatus || null,
        streetAddress: req.body.streetAddress,
        city: req.body.city,
        state: req.body.state || null,
        postalCode: req.body.postalCode || null,
        country: req.body.country,
        phoneNumber: req.body.phoneNumber,
        alternatePhone: req.body.alternatePhone || null,
        emergencyContact: req.body.emergencyContact || null,
        emergencyPhone: req.body.emergencyPhone || null,
        companyName: req.body.companyName,
        jobTitle: req.body.jobTitle,
        yearsExperience: req.body.yearsExperience,
        previousLicenses: req.body.previousLicenses || null,
        specializations: req.body.specializations || null,
        businessAddress: req.body.businessAddress || null,
        businessPhone: req.body.businessPhone || null,
        businessEmail: req.body.businessEmail || null,
        linkedinProfile: req.body.linkedinProfile || null,
        references: req.body.references || null,
        passportPhotoPath,
        passportDocumentPath,
        applicationStatus: 'pending'
      };
      
      const application = await storage.createBrokerCardApplication(applicationData);
      res.json({ success: true, application });
    } catch (error) {
      console.error('Error submitting broker card application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // Get broker card application
  app.get('/api/broker-card-application', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const application = await storage.getBrokerCardApplication(userId);
      res.json(application);
    } catch (error) {
      console.error('Error fetching broker card application:', error);
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  });

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

  // Get all transaction documents for broker
  app.get('/api/broker/all-transaction-documents', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const documents = await storage.getAllTransactionDocumentsByBroker(userId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching all transaction documents:', error);
      res.status(500).json({ error: 'Failed to fetch transaction documents' });
    }
  });

  // Download transaction document
  app.get('/api/transaction-documents/:id/download', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const documentId = parseInt(req.params.id);
      
      // Get document details
      const document = await storage.getTransactionDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      // Verify user has access to this document (must be the broker who uploaded it)
      if (document.uploadedBy !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Send file
      res.download(document.filePath, document.originalFilename, (err) => {
        if (err) {
          console.error('Error downloading transaction document:', err);
          res.status(500).json({ error: 'Download failed' });
        }
      });
    } catch (error) {
      console.error('Error downloading transaction document:', error);
      res.status(500).json({ error: 'Failed to download document' });
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

  // Admin endpoints for broker management
  
  // Get broker documents for admin
  app.get('/api/admin/brokers/:brokerId/documents', authenticateToken, async (req, res) => {
    try {
      const brokerId = parseInt(req.params.brokerId);
      const documents = await storage.getBrokerDocuments(brokerId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching broker documents:', error);
      res.status(500).json({ error: 'Failed to fetch broker documents' });
    }
  });

  // Get broker messages for admin
  app.get('/api/admin/brokers/:brokerId/messages', authenticateToken, async (req, res) => {
    try {
      const brokerId = parseInt(req.params.brokerId);
      const messages = await storage.getBrokerDealMessages(brokerId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching broker messages:', error);
      res.status(500).json({ error: 'Failed to fetch broker messages' });
    }
  });

  // Send message to broker from admin
  app.post('/api/admin/brokers/:brokerId/messages', authenticateToken, async (req, res) => {
    try {
      const brokerId = parseInt(req.params.brokerId);
      const adminId = req.user.id;
      const { dealId, message } = req.body;

      const messageData = {
        dealId: dealId || null,
        senderId: adminId,
        receiverId: brokerId,
        message: message
      };

      const newMessage = await storage.createDealMessage(messageData);
      res.json(newMessage);
    } catch (error) {
      console.error('Error sending message to broker:', error);
      res.status(500).json({ error: 'Failed to send message' });
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

  // Get transaction steps for a deal
  app.get('/api/broker-deals/:dealId/steps', authenticateToken, async (req, res) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const steps = await storage.getTransactionSteps(dealId);
      res.json(steps);
    } catch (error) {
      console.error('Error fetching transaction steps:', error);
      res.status(500).json({ error: 'Failed to fetch transaction steps' });
    }
  });

  // Submit transaction step
  app.patch('/api/transaction-steps/:stepId/submit', authenticateToken, async (req, res) => {
    try {
      const stepId = parseInt(req.params.stepId);
      const { notes } = req.body;
      
      const updatedStep = await storage.submitTransactionStep(stepId, notes);
      res.json(updatedStep);
    } catch (error) {
      console.error('Error submitting transaction step:', error);
      res.status(500).json({ error: 'Failed to submit transaction step' });
    }
  });

  // Get documents for a transaction step
  app.get('/api/transaction-steps/:stepId/documents', authenticateToken, async (req, res) => {
    try {
      const stepId = parseInt(req.params.stepId);
      const documents = await storage.getTransactionStepDocuments(stepId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching step documents:', error);
      res.status(500).json({ error: 'Failed to fetch step documents' });
    }
  });

  // Upload transaction document
  app.post('/api/transaction-documents/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      const { stepId, dealId, documentType } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const documentData = {
        stepId: parseInt(stepId),
        dealId: parseInt(dealId),
        documentType: documentType || 'Transaction Document',
        originalFilename: file.originalname,
        storedFilename: file.filename,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId
      };

      const document = await storage.createTransactionDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error('Error uploading transaction document:', error);
      res.status(500).json({ error: 'Failed to upload transaction document' });
    }
  });

  // Send deal message
  app.post('/api/deal-messages', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { dealId, messageContent, messageType } = req.body;

      const messageData = {
        dealId: parseInt(dealId),
        senderId: userId,
        messageContent,
        messageType: messageType || 'general'
      };

      const message = await storage.createDealMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error('Error sending deal message:', error);
      res.status(500).json({ error: 'Failed to send deal message' });
    }
  });

  // Create broker payment intent
  app.post('/api/broker/create-payment-intent', authenticateToken, async (req, res) => {
    try {
      const { amount, brokerData } = req.body;
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: stripeCustomerId,
        metadata: {
          userId: userId.toString(),
          brokerData: JSON.stringify(brokerData),
          paymentType: 'broker_membership',
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Error creating broker payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Confirm broker payment
  app.post('/api/broker/payment-confirm', authenticateToken, async (req, res) => {
    try {
      const { paymentIntentId, brokerData } = req.body;
      const userId = req.user.id;

      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not successful' });
      }

      // Update broker profile with payment completion
      await storage.updateBrokerProfile(userId, {
        ...brokerData,
        profileCompleted: true,
        paymentStatus: 'completed',
        membershipStartDate: new Date(),
        membershipEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });

      // Create payment record
      await storage.createBrokerPayment({
        userId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'succeeded',
        stripePaymentId: paymentIntentId,
        paymentMethod: 'card',
      });

      res.json({ success: true, message: 'Payment confirmed and profile updated' });
    } catch (error) {
      console.error('Error confirming broker payment:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  });

  // Generate membership card
  app.post('/api/broker/generate-membership-card', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      const brokerProfile = await storage.getBrokerProfile(userId);

      if (!user || !brokerProfile) {
        return res.status(404).json({ error: 'User or broker profile not found' });
      }

      // Generate membership card data
      const membershipCard = {
        membershipId: `OE-${userId.toString().padStart(6, '0')}`,
        memberName: `${brokerProfile.firstName} ${brokerProfile.lastName}`,
        email: user.email,
        joinDate: brokerProfile.membershipStartDate,
        expiryDate: brokerProfile.membershipEndDate,
        membershipType: 'Elite Oil Broker',
        specializations: brokerProfile.specialization,
        status: 'Active',
      };

      res.json(membershipCard);
    } catch (error) {
      console.error('Error generating membership card:', error);
      res.status(500).json({ error: 'Failed to generate membership card' });
    }
  });

  // Download membership card
  app.get('/api/broker/download-membership-card', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      const brokerProfile = await storage.getBrokerProfile(userId);

      if (!user || !brokerProfile) {
        return res.status(404).json({ error: 'User or broker profile not found' });
      }

      // Simple PDF response for membership card
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="membership-card.pdf"');
      res.send(Buffer.from('PDF content for membership card'));
    } catch (error) {
      console.error('Error downloading membership card:', error);
      res.status(500).json({ error: 'Failed to download membership card' });
    }
  });

  // Submit broker card application
  app.post('/api/broker/submit-card-application', authenticateToken, upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'passportDocument', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const userId = req.user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Extract form data
      const applicationData = {
        // Personal Information
        fullName: req.body.fullName,
        dateOfBirth: req.body.dateOfBirth,
        nationality: req.body.nationality,
        passportNumber: req.body.passportNumber,
        passportExpiry: req.body.passportExpiry,
        placeOfBirth: req.body.placeOfBirth,
        gender: req.body.gender,
        maritalStatus: req.body.maritalStatus,
        
        // Contact Information
        streetAddress: req.body.streetAddress,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        country: req.body.country,
        phoneNumber: req.body.phoneNumber,
        alternatePhone: req.body.alternatePhone,
        emergencyContact: req.body.emergencyContact,
        emergencyPhone: req.body.emergencyPhone,
        
        // Professional Information
        companyName: req.body.companyName,
        jobTitle: req.body.jobTitle,
        yearsExperience: req.body.yearsExperience,
        previousLicenses: req.body.previousLicenses,
        specializations: req.body.specializations,
        businessAddress: req.body.businessAddress,
        businessPhone: req.body.businessPhone,
        businessEmail: req.body.businessEmail,
        linkedinProfile: req.body.linkedinProfile,
        references: req.body.references,
        
        // File paths
        passportPhotoPath: files.passportPhoto?.[0]?.path || null,
        passportDocumentPath: files.passportDocument?.[0]?.path || null,
        
        // Status and dates
        applicationStatus: 'pending',
        submittedAt: new Date(),
        submittedBy: userId
      };

      // Save application to database
      const application = await storage.createBrokerCardApplication(applicationData);
      
      // Update user's broker membership status to indicate application submitted
      await storage.updateUser(userId, {
        profileCompleteness: 75, // Increase profile completeness
        onboardingCompleted: true
      });

      res.json({
        success: true,
        message: 'Broker card application submitted successfully',
        application: {
          id: application.id,
          status: application.applicationStatus,
          submittedAt: application.submittedAt
        }
      });
    } catch (error) {
      console.error('Error submitting broker card application:', error);
      res.status(500).json({ error: 'Failed to submit broker card application' });
    }
  });

  // Get broker card application status
  app.get('/api/broker/card-application-status', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const application = await storage.getBrokerCardApplication(userId);
      
      if (!application) {
        return res.json({ 
          hasApplication: false, 
          status: null,
          message: 'No application found' 
        });
      }

      res.json({
        hasApplication: true,
        status: application.applicationStatus,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        cardGeneratedAt: application.cardGeneratedAt,
        adminNotes: application.adminNotes
      });
    } catch (error) {
      console.error('Error fetching broker card application status:', error);
      res.status(500).json({ error: 'Failed to fetch application status' });
    }
  });
}