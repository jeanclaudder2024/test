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

export default router;