import express from "express";
import { authenticateToken } from "../auth";
import { storage } from "../storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Request, Response } from "express";
import { insertBrokerDealSchema, insertBrokerDocumentSchema } from "@shared/schema";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'broker-documents');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, JPEG, PNG files are allowed.'));
    }
  }
});

// Get broker profile
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Admin users have full access without payment restrictions
    if (req.user!.role === 'admin') {
      const profile = await storage.getBrokerProfile(req.user!.id);
      res.json(profile);
      return;
    }
    
    const profile = await storage.getBrokerProfile(req.user!.id);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching broker profile:', error);
    res.status(500).json({ message: 'Error fetching broker profile' });
  }
});

// Update broker profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const profile = await storage.updateBrokerProfile(req.user!.id, req.body);
    res.json(profile);
  } catch (error) {
    console.error('Error updating broker profile:', error);
    res.status(500).json({ message: 'Error updating broker profile' });
  }
});

// Get broker deals
router.get('/deals', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Admin users have full access without payment restrictions
    if (req.user!.role === 'admin') {
      const deals = await storage.getBrokerDeals(req.user!.id);
      res.json(deals);
      return;
    }
    
    const deals = await storage.getBrokerDeals(req.user!.id);
    res.json(deals);
  } catch (error) {
    console.error('Error fetching broker deals:', error);
    res.status(500).json({ message: 'Error fetching broker deals' });
  }
});

// Create new broker deal
router.post('/deals', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = insertBrokerDealSchema.safeParse({
      ...req.body,
      brokerId: req.user!.id
    });

    if (!validation.success) {
      return res.status(400).json({ 
        message: fromZodError(validation.error).message 
      });
    }

    const deal = await storage.createBrokerDeal(validation.data);
    res.status(201).json(deal);
  } catch (error) {
    console.error('Error creating broker deal:', error);
    res.status(500).json({ message: 'Error creating broker deal' });
  }
});

// Update broker deal
router.put('/deals/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dealId = parseInt(req.params.id);
    const deal = await storage.updateBrokerDeal(dealId, req.user!.id, req.body);
    res.json(deal);
  } catch (error) {
    console.error('Error updating broker deal:', error);
    res.status(500).json({ message: 'Error updating broker deal' });
  }
});

// Delete broker deal
router.delete('/deals/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dealId = parseInt(req.params.id);
    await storage.deleteBrokerDeal(dealId, req.user!.id);
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting broker deal:', error);
    res.status(500).json({ message: 'Error deleting broker deal' });
  }
});

// Get broker documents
router.get('/documents', authenticateToken, async (req: Request, res: Response) => {
  try {
    const documents = await storage.getBrokerDocuments(req.user!.id);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching broker documents:', error);
    res.status(500).json({ message: 'Error fetching broker documents' });
  }
});

// Upload broker document
router.post('/documents/upload', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { dealId, description } = req.body;
    
    const documentData = {
      brokerId: req.user!.id,
      dealId: dealId ? parseInt(dealId) : undefined,
      name: req.file.originalname,
      originalName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      fileSize: (req.file.size / 1024 / 1024).toFixed(2) + 'MB',
      filePath: req.file.path,
      description: description || '',
      uploadedBy: req.user!.email || 'Unknown',
    };

    const document = await storage.createBrokerDocument(documentData);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading broker document:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Download broker document
router.get('/documents/:id/download', authenticateToken, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const document = await storage.getBrokerDocument(documentId, req.user!.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update download count
    await storage.incrementDocumentDownloadCount(documentId);

    // Send file
    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading broker document:', error);
    res.status(500).json({ message: 'Error downloading document' });
  }
});

// Delete broker document
router.delete('/documents/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    await storage.deleteBrokerDocument(documentId, req.user!.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting broker document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

// Get admin files sent to broker
router.get('/admin-files', authenticateToken, async (req: Request, res: Response) => {
  try {
    const files = await storage.getBrokerAdminFiles(req.user!.id);
    res.json(files);
  } catch (error) {
    console.error('Error fetching admin files:', error);
    res.status(500).json({ message: 'Error fetching admin files' });
  }
});

// Mark admin file as read
router.post('/admin-files/:id/mark-read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const fileId = parseInt(req.params.id);
    await storage.markBrokerAdminFileAsRead(fileId, req.user!.id);
    res.json({ message: 'File marked as read' });
  } catch (error) {
    console.error('Error marking file as read:', error);
    res.status(500).json({ message: 'Error marking file as read' });
  }
});

// Get broker statistics
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getBrokerStats(req.user!.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching broker statistics:', error);
    res.status(500).json({ message: 'Error fetching broker statistics' });
  }
});

// Create broker payment intent
router.post('/create-payment-intent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { amount, brokerData } = req.body;
    const userId = req.user!.id;
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
router.post('/payment-confirm', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, brokerData } = req.body;
    const userId = req.user!.id;

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
router.post('/generate-membership-card', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
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
router.get('/download-membership-card', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
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

export default router;