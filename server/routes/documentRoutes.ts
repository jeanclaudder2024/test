import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import OpenAI from "openai";
import { AdminDocument, InsertAdminDocument } from "@shared/schema";

const router = Router();

// Initialize OpenAI client if API key is present
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Validation schema for documents
const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  documentType: z.string().min(1, "Document type is required"),
  status: z.enum(["active", "inactive", "draft"]).default("draft"),
  category: z.enum(["general", "technical", "legal", "commercial"]).default("general"),
  tags: z.string().optional(),
  isTemplate: z.boolean().default(false),
  vesselId: z.number().optional(), // Optional vessel association
});

type DocumentData = z.infer<typeof documentSchema>;

// GET /api/documents - Get all documents
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const documents = await storage.getDocuments();
    res.json({ 
      success: true, 
      data: documents 
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch documents" 
    });
  }
});

// GET /api/documents/:id - Get specific document
router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid document ID" 
      });
    }

    const document = await storage.getDocumentById(id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    res.json({ 
      success: true, 
      data: document 
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch document" 
    });
  }
});

// POST /api/documents - Create new document
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validation = documentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data", 
        errors: validation.error.issues 
      });
    }

    const documentData = {
      ...validation.data,
      createdBy: req.user?.id
    };

    const newDocument = await storage.createDocument(documentData);
    
    res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: newDocument
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create document" 
    });
  }
});

// PUT /api/documents/:id - Update document
router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid document ID" 
      });
    }

    const validation = documentSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data", 
        errors: validation.error.issues 
      });
    }

    const updatedDocument = await storage.updateDocument(id, validation.data);
    if (!updatedDocument) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    res.json({
      success: true,
      message: "Document updated successfully",
      data: updatedDocument
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update document" 
    });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid document ID" 
      });
    }

    const deleted = await storage.deleteDocument(id);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete document" 
    });
  }
});

// POST /api/documents/:id/generate-content - Generate content using AI
router.post("/:id/generate-content", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: "AI service not configured. Please set OPENAI_API_KEY."
      });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid document ID" 
      });
    }

    const document = await storage.getDocumentById(id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    // Generate content based on title and description
    const prompt = `Generate professional maritime documentation content based on the following:

Title: ${document.title}
Description: ${document.description || 'N/A'}
Document Type: ${document.documentType}
Category: ${document.category}

Create comprehensive content that:
1. Follows maritime industry standards and regulations
2. Uses professional technical language
3. Includes relevant sections based on the document type
4. Provides detailed information suitable for oil vessel operations
5. Includes safety considerations and compliance requirements where relevant

Format the content with clear sections and proper structure.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional maritime documentation expert specializing in oil vessel operations, compliance, and technical specifications. Generate comprehensive, accurate, and professionally formatted content for the shipping industry."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    // Update the document with generated content
    const updatedDocument = await storage.updateDocument(id, {
      content: generatedContent
    });

    res.json({
      success: true,
      message: "Content generated successfully",
      data: updatedDocument
    });

  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate content" 
    });
  }
});

// GET /api/documents/vessel/:vesselId - Get documents for a specific vessel
router.get("/vessel/:vesselId", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const vesselId = parseInt(req.params.vesselId);
    if (isNaN(vesselId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid vessel ID" 
      });
    }

    const documents = await storage.getDocumentsByVesselId(vesselId);
    res.json({ 
      success: true, 
      data: documents 
    });
  } catch (error) {
    console.error("Error fetching vessel documents:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch vessel documents" 
    });
  }
});

export default router;