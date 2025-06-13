import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertMaritimeDocumentSchema } from "@shared/schema";

const router = Router();

// Validation schema for maritime documents
const maritimeDocumentFormSchema = insertMaritimeDocumentSchema.extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  documentType: z.string().min(1, "Document type is required"),
  category: z.string().min(1, "Category is required"),
});

// GET /api/maritime-documents - Get all maritime documents
router.get("/", async (req, res) => {
  try {
    const documents = await storage.getMaritimeDocuments();
    res.json(documents);
  } catch (error) {
    console.error("Error fetching maritime documents:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch maritime documents" 
    });
  }
});

// GET /api/maritime-documents/:id - Get specific maritime document
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid document ID" 
      });
    }

    const document = await storage.getMaritimeDocumentById(id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Maritime document not found" 
      });
    }

    res.json(document);
  } catch (error) {
    console.error("Error fetching maritime document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch maritime document" 
    });
  }
});

// POST /api/maritime-documents - Create new maritime document
router.post("/", async (req, res) => {
  try {
    const validation = maritimeDocumentFormSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data", 
        errors: validation.error.issues 
      });
    }

    const documentData = validation.data;
    const newDocument = await storage.createMaritimeDocument(documentData);
    
    res.status(201).json({
      success: true,
      message: "Maritime document created successfully",
      document: newDocument
    });
  } catch (error) {
    console.error("Error creating maritime document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create maritime document" 
    });
  }
});

// PUT /api/maritime-documents/:id - Update maritime document
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid document ID" 
      });
    }

    const validation = maritimeDocumentFormSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data", 
        errors: validation.error.issues 
      });
    }

    const updatedDocument = await storage.updateMaritimeDocument(id, validation.data);
    if (!updatedDocument) {
      return res.status(404).json({ 
        success: false, 
        message: "Maritime document not found" 
      });
    }

    res.json({
      success: true,
      message: "Maritime document updated successfully",
      document: updatedDocument
    });
  } catch (error) {
    console.error("Error updating maritime document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update maritime document" 
    });
  }
});

// DELETE /api/maritime-documents/:id - Delete maritime document
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid document ID" 
      });
    }

    const deleted = await storage.deleteMaritimeDocument(id);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Maritime document not found" 
      });
    }

    res.json({
      success: true,
      message: "Maritime document deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting maritime document:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete maritime document" 
    });
  }
});

export default router;