import { Router } from "express";
import { storage } from "../storage";
import { insertPartSchema, insertWorkOrderSchema, insertPartUsageSchema, insertSupplierSchema } from "@shared/schema";
import { z } from "zod";

export const partsRouter = Router();

// Parts endpoints
partsRouter.get("/parts", async (req, res) => {
  try {
    const parts = await storage.getParts();
    res.json(parts);
  } catch (error) {
    console.error("Error fetching parts:", error);
    res.status(500).json({ error: "Failed to fetch parts" });
  }
});

partsRouter.get("/parts/:id", async (req, res) => {
  try {
    const partId = parseInt(req.params.id);
    if (isNaN(partId)) {
      return res.status(400).json({ error: "Invalid part ID" });
    }
    
    const part = await storage.getPartById(partId);
    if (!part) {
      return res.status(404).json({ error: "Part not found" });
    }
    
    res.json(part);
  } catch (error) {
    console.error("Error fetching part:", error);
    res.status(500).json({ error: "Failed to fetch part" });
  }
});

partsRouter.post("/parts", async (req, res) => {
  try {
    const validatedData = insertPartSchema.parse(req.body);
    const part = await storage.createPart(validatedData);
    res.status(201).json(part);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating part:", error);
    res.status(500).json({ error: "Failed to create part" });
  }
});

partsRouter.put("/parts/:id", async (req, res) => {
  try {
    const partId = parseInt(req.params.id);
    if (isNaN(partId)) {
      return res.status(400).json({ error: "Invalid part ID" });
    }
    
    const validatedData = insertPartSchema.partial().parse(req.body);
    const updatedPart = await storage.updatePart(partId, validatedData);
    
    if (!updatedPart) {
      return res.status(404).json({ error: "Part not found" });
    }
    
    res.json(updatedPart);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating part:", error);
    res.status(500).json({ error: "Failed to update part" });
  }
});

partsRouter.delete("/parts/:id", async (req, res) => {
  try {
    const partId = parseInt(req.params.id);
    if (isNaN(partId)) {
      return res.status(400).json({ error: "Invalid part ID" });
    }
    
    // Check if part exists
    const part = await storage.getPartById(partId);
    if (!part) {
      return res.status(404).json({ error: "Part not found" });
    }
    
    // Delete the part
    await storage.deletePart(partId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting part:", error);
    res.status(500).json({ error: "Failed to delete part" });
  }
});

// Work Orders endpoints
partsRouter.get("/work-orders", async (req, res) => {
  try {
    const workOrders = await storage.getWorkOrders();
    res.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res.status(500).json({ error: "Failed to fetch work orders" });
  }
});

partsRouter.get("/work-orders/:id", async (req, res) => {
  try {
    const workOrderId = parseInt(req.params.id);
    if (isNaN(workOrderId)) {
      return res.status(400).json({ error: "Invalid work order ID" });
    }
    
    const workOrder = await storage.getWorkOrderById(workOrderId);
    if (!workOrder) {
      return res.status(404).json({ error: "Work order not found" });
    }
    
    res.json(workOrder);
  } catch (error) {
    console.error("Error fetching work order:", error);
    res.status(500).json({ error: "Failed to fetch work order" });
  }
});

partsRouter.get("/work-orders/vessel/:vesselId", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.vesselId);
    if (isNaN(vesselId)) {
      return res.status(400).json({ error: "Invalid vessel ID" });
    }
    
    const workOrders = await storage.getWorkOrdersByVesselId(vesselId);
    res.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders for vessel:", error);
    res.status(500).json({ error: "Failed to fetch work orders for vessel" });
  }
});

partsRouter.get("/work-orders/refinery/:refineryId", async (req, res) => {
  try {
    const refineryId = parseInt(req.params.refineryId);
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: "Invalid refinery ID" });
    }
    
    const workOrders = await storage.getWorkOrdersByRefineryId(refineryId);
    res.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders for refinery:", error);
    res.status(500).json({ error: "Failed to fetch work orders for refinery" });
  }
});

partsRouter.post("/work-orders", async (req, res) => {
  try {
    const validatedData = insertWorkOrderSchema.parse(req.body);
    const workOrder = await storage.createWorkOrder(validatedData);
    res.status(201).json(workOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating work order:", error);
    res.status(500).json({ error: "Failed to create work order" });
  }
});

partsRouter.put("/work-orders/:id", async (req, res) => {
  try {
    const workOrderId = parseInt(req.params.id);
    if (isNaN(workOrderId)) {
      return res.status(400).json({ error: "Invalid work order ID" });
    }
    
    const validatedData = insertWorkOrderSchema.partial().parse(req.body);
    const updatedWorkOrder = await storage.updateWorkOrder(workOrderId, validatedData);
    
    if (!updatedWorkOrder) {
      return res.status(404).json({ error: "Work order not found" });
    }
    
    res.json(updatedWorkOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating work order:", error);
    res.status(500).json({ error: "Failed to update work order" });
  }
});

partsRouter.delete("/work-orders/:id", async (req, res) => {
  try {
    const workOrderId = parseInt(req.params.id);
    if (isNaN(workOrderId)) {
      return res.status(400).json({ error: "Invalid work order ID" });
    }
    
    // Check if work order exists
    const workOrder = await storage.getWorkOrderById(workOrderId);
    if (!workOrder) {
      return res.status(404).json({ error: "Work order not found" });
    }
    
    // Delete the work order
    await storage.deleteWorkOrder(workOrderId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting work order:", error);
    res.status(500).json({ error: "Failed to delete work order" });
  }
});

// Part Usage endpoints
partsRouter.get("/part-usages", async (req, res) => {
  try {
    const partUsages = await storage.getPartUsages();
    res.json(partUsages);
  } catch (error) {
    console.error("Error fetching part usages:", error);
    res.status(500).json({ error: "Failed to fetch part usages" });
  }
});

partsRouter.get("/part-usages/work-order/:workOrderId", async (req, res) => {
  try {
    const workOrderId = parseInt(req.params.workOrderId);
    if (isNaN(workOrderId)) {
      return res.status(400).json({ error: "Invalid work order ID" });
    }
    
    const partUsages = await storage.getPartUsageByWorkOrderId(workOrderId);
    res.json(partUsages);
  } catch (error) {
    console.error("Error fetching part usages for work order:", error);
    res.status(500).json({ error: "Failed to fetch part usages for work order" });
  }
});

partsRouter.post("/part-usages", async (req, res) => {
  try {
    const validatedData = insertPartUsageSchema.parse(req.body);
    
    // Verify both work order and part exist
    const workOrder = await storage.getWorkOrderById(validatedData.workOrderId);
    if (!workOrder) {
      return res.status(404).json({ error: "Work order not found" });
    }
    
    const part = await storage.getPartById(validatedData.partId);
    if (!part) {
      return res.status(404).json({ error: "Part not found" });
    }
    
    // Check if there's enough quantity
    if (part.quantity < validatedData.quantity) {
      return res.status(400).json({ 
        error: "Insufficient part quantity", 
        available: part.quantity,
        requested: validatedData.quantity
      });
    }
    
    const partUsage = await storage.createPartUsage(validatedData);
    res.status(201).json(partUsage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating part usage:", error);
    res.status(500).json({ error: "Failed to create part usage" });
  }
});

partsRouter.put("/part-usages/:id", async (req, res) => {
  try {
    const partUsageId = parseInt(req.params.id);
    if (isNaN(partUsageId)) {
      return res.status(400).json({ error: "Invalid part usage ID" });
    }
    
    const validatedData = insertPartUsageSchema.partial().parse(req.body);
    const updatedPartUsage = await storage.updatePartUsage(partUsageId, validatedData);
    
    if (!updatedPartUsage) {
      return res.status(404).json({ error: "Part usage not found" });
    }
    
    res.json(updatedPartUsage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating part usage:", error);
    res.status(500).json({ error: "Failed to update part usage" });
  }
});

partsRouter.delete("/part-usages/:id", async (req, res) => {
  try {
    const partUsageId = parseInt(req.params.id);
    if (isNaN(partUsageId)) {
      return res.status(400).json({ error: "Invalid part usage ID" });
    }
    
    // Delete the part usage (this will also restore the part quantity)
    await storage.deletePartUsage(partUsageId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting part usage:", error);
    res.status(500).json({ error: "Failed to delete part usage" });
  }
});

// Supplier endpoints
partsRouter.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

partsRouter.get("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ error: "Invalid supplier ID" });
    }
    
    const supplier = await storage.getSupplierById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ error: "Failed to fetch supplier" });
  }
});

partsRouter.post("/suppliers", async (req, res) => {
  try {
    const validatedData = insertSupplierSchema.parse(req.body);
    const supplier = await storage.createSupplier(validatedData);
    res.status(201).json(supplier);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating supplier:", error);
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

partsRouter.put("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ error: "Invalid supplier ID" });
    }
    
    const validatedData = insertSupplierSchema.partial().parse(req.body);
    const updatedSupplier = await storage.updateSupplier(supplierId, validatedData);
    
    if (!updatedSupplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    res.json(updatedSupplier);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating supplier:", error);
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

partsRouter.delete("/suppliers/:id", async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    if (isNaN(supplierId)) {
      return res.status(400).json({ error: "Invalid supplier ID" });
    }
    
    // Check if supplier exists
    const supplier = await storage.getSupplierById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    
    // Delete the supplier
    await storage.deleteSupplier(supplierId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});