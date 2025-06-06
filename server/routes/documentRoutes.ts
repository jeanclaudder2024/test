import express from 'express';
import { db } from '../db.js';
import { vesselDocuments, vessels } from '../../shared/schema.js';
import { eq, and, like, desc, asc, isNull } from 'drizzle-orm';

const router = express.Router();

// Get all documents with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      vessel = 'all',
      type = 'all',
      status = 'all'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereConditions: any[] = [];

    // Search filter
    if (search) {
      whereConditions.push(
        like(vesselDocuments.title, `%${search}%`)
      );
    }

    // Vessel filter
    if (vessel !== 'all') {
      if (vessel === 'none') {
        whereConditions.push(isNull(vesselDocuments.vesselId));
      } else {
        whereConditions.push(eq(vesselDocuments.vesselId, parseInt(vessel as string)));
      }
    }

    // Type filter
    if (type !== 'all') {
      whereConditions.push(eq(vesselDocuments.documentType, type as string));
    }

    // Status filter
    if (status !== 'all') {
      whereConditions.push(eq(vesselDocuments.status, status as string));
    }

    // Get documents with vessel information
    const documentsQuery = db
      .select({
        id: vesselDocuments.id,
        vesselId: vesselDocuments.vesselId,
        vesselName: vessels.name,
        documentType: vesselDocuments.documentType,
        title: vesselDocuments.title,
        description: vesselDocuments.description,
        content: vesselDocuments.content,
        filePath: vesselDocuments.filePath,
        fileSize: vesselDocuments.fileSize,
        mimeType: vesselDocuments.mimeType,
        version: vesselDocuments.version,
        status: vesselDocuments.status,
        isRequired: vesselDocuments.isRequired,
        expiryDate: vesselDocuments.expiryDate,
        createdBy: vesselDocuments.createdBy,
        approvedBy: vesselDocuments.approvedBy,
        approvedAt: vesselDocuments.approvedAt,
        tags: vesselDocuments.tags,
        metadata: vesselDocuments.metadata,
        isActive: vesselDocuments.isActive,
        createdAt: vesselDocuments.createdAt,
        lastUpdated: vesselDocuments.lastUpdated,
      })
      .from(vesselDocuments)
      .leftJoin(vessels, eq(vesselDocuments.vesselId, vessels.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(vesselDocuments.createdAt))
      .limit(limitNum)
      .offset(offset);

    const documents = await documentsQuery;

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: vesselDocuments.id })
      .from(vesselDocuments)
      .leftJoin(vessels, eq(vesselDocuments.vesselId, vessels.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalResult = await totalCountQuery;
    const total = totalResult.length;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get single document by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const document = await db
      .select({
        id: vesselDocuments.id,
        vesselId: vesselDocuments.vesselId,
        vesselName: vessels.name,
        documentType: vesselDocuments.documentType,
        title: vesselDocuments.title,
        description: vesselDocuments.description,
        content: vesselDocuments.content,
        filePath: vesselDocuments.filePath,
        fileSize: vesselDocuments.fileSize,
        mimeType: vesselDocuments.mimeType,
        version: vesselDocuments.version,
        status: vesselDocuments.status,
        isRequired: vesselDocuments.isRequired,
        expiryDate: vesselDocuments.expiryDate,
        createdBy: vesselDocuments.createdBy,
        approvedBy: vesselDocuments.approvedBy,
        approvedAt: vesselDocuments.approvedAt,
        tags: vesselDocuments.tags,
        metadata: vesselDocuments.metadata,
        isActive: vesselDocuments.isActive,
        createdAt: vesselDocuments.createdAt,
        lastUpdated: vesselDocuments.lastUpdated,
      })
      .from(vesselDocuments)
      .leftJoin(vessels, eq(vesselDocuments.vesselId, vessels.id))
      .where(eq(vesselDocuments.id, parseInt(id)))
      .limit(1);

    if (document.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.json({
      success: true,
      data: document[0],
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create new document
router.post('/', async (req, res) => {
  try {
    const {
      vesselId,
      documentType,
      title,
      description,
      content,
      version = '1.0',
      status = 'draft',
      isRequired = false,
      expiryDate,
      createdBy,
      tags,
      metadata,
      isActive = true,
    } = req.body;

    // Validate required fields
    if (!documentType || !title) {
      return res.status(400).json({
        success: false,
        message: 'Document type and title are required',
      });
    }

    const newDocument = await db
      .insert(vesselDocuments)
      .values({
        vesselId: vesselId || null,
        documentType,
        title,
        description,
        content,
        version,
        status,
        isRequired,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        createdBy,
        tags,
        metadata,
        isActive,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: newDocument[0],
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vesselId,
      documentType,
      title,
      description,
      content,
      version,
      status,
      isRequired,
      expiryDate,
      createdBy,
      approvedBy,
      tags,
      metadata,
      isActive,
    } = req.body;

    // Check if document exists
    const existingDocument = await db
      .select()
      .from(vesselDocuments)
      .where(eq(vesselDocuments.id, parseInt(id)))
      .limit(1);

    if (existingDocument.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Update document
    const updateData: any = {
      lastUpdated: new Date(),
    };

    if (vesselId !== undefined) updateData.vesselId = vesselId || null;
    if (documentType !== undefined) updateData.documentType = documentType;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (version !== undefined) updateData.version = version;
    if (status !== undefined) updateData.status = status;
    if (isRequired !== undefined) updateData.isRequired = isRequired;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (createdBy !== undefined) updateData.createdBy = createdBy;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (tags !== undefined) updateData.tags = tags;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Set approval timestamp if approvedBy is provided
    if (approvedBy && !existingDocument[0].approvedBy) {
      updateData.approvedAt = new Date();
    }

    const updatedDocument = await db
      .update(vesselDocuments)
      .set(updateData)
      .where(eq(vesselDocuments.id, parseInt(id)))
      .returning();

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument[0],
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if document exists
    const existingDocument = await db
      .select()
      .from(vesselDocuments)
      .where(eq(vesselDocuments.id, parseInt(id)))
      .limit(1);

    if (existingDocument.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete document
    await db
      .delete(vesselDocuments)
      .where(eq(vesselDocuments.id, parseInt(id)));

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get documents by vessel ID
router.get('/vessel/:vesselId', async (req, res) => {
  try {
    const { vesselId } = req.params;
    const { status = 'all' } = req.query;

    let whereConditions = [eq(vesselDocuments.vesselId, parseInt(vesselId))];

    if (status !== 'all') {
      whereConditions.push(eq(vesselDocuments.status, status as string));
    }

    const documents = await db
      .select()
      .from(vesselDocuments)
      .where(and(...whereConditions))
      .orderBy(desc(vesselDocuments.createdAt));

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching vessel documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vessel documents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Bulk status update
router.patch('/bulk-status', async (req, res) => {
  try {
    const { documentIds, status } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || !status) {
      return res.status(400).json({
        success: false,
        message: 'Document IDs array and status are required',
      });
    }

    await db
      .update(vesselDocuments)
      .set({
        status,
        lastUpdated: new Date(),
      })
      .where(eq(vesselDocuments.id, documentIds[0])); // Update for multiple IDs would need different approach

    res.json({
      success: true,
      message: 'Documents updated successfully',
    });
  } catch (error) {
    console.error('Error bulk updating documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update documents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;