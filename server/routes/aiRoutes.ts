import { Router } from "express";
import { openAIService } from "../services/openaiService";
import { storage } from "../storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export const aiRouter = Router();

// Schema for vessel insights request
const vesselInsightsSchema = z.object({
  vesselId: z.number()
});

// Schema for refinery insights request
const refineryInsightsSchema = z.object({
  refineryId: z.number()
});

// Schema for market analysis request
const marketAnalysisSchema = z.object({
  regionFilter: z.string().optional(),
  vesselTypeFilter: z.string().optional(),
  limit: z.number().optional()
});

// Schema for routing optimization request
const routingOptimizationSchema = z.object({
  vesselId: z.number()
});

// Schema for maritime query request
const maritimeQuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  includeVessels: z.boolean().optional(),
  includeRefineries: z.boolean().optional(),
  regionFilter: z.string().optional()
});

/**
 * @route GET /api/ai/vessel-insights/:vesselId
 * @description Get AI-powered insights for a specific vessel
 * @access Public
 */
aiRouter.get("/vessel-insights/:vesselId", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.vesselId);
    if (isNaN(vesselId)) {
      return res.status(400).json({ message: "Invalid vessel ID" });
    }

    // Get vessel data
    const vessel = await storage.getVesselById(vesselId);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found" });
    }

    // Get AI insights for the vessel
    const insights = await openAIService.getVesselInsights(vessel);

    // Return the insights
    res.json(insights);
  } catch (error: any) {
    console.error("Error getting vessel insights:", error);
    res.status(500).json({ message: "Failed to get vessel insights", error: error.message });
  }
});

/**
 * @route GET /api/ai/refinery-insights/:refineryId
 * @description Get AI-powered insights for a specific refinery
 * @access Public
 */
aiRouter.get("/refinery-insights/:refineryId", async (req, res) => {
  try {
    const refineryId = parseInt(req.params.refineryId);
    if (isNaN(refineryId)) {
      return res.status(400).json({ message: "Invalid refinery ID" });
    }

    // Get refinery data
    const refinery = await storage.getRefineryById(refineryId);
    if (!refinery) {
      return res.status(404).json({ message: "Refinery not found" });
    }

    // Get AI insights for the refinery
    const insights = await openAIService.getRefineryInsights(refinery);

    // Return the insights
    res.json(insights);
  } catch (error: any) {
    console.error("Error getting refinery insights:", error);
    res.status(500).json({ message: "Failed to get refinery insights", error: error.message });
  }
});

/**
 * @route GET /api/ai/market-analysis
 * @description Get AI-powered market analysis for global oil shipping
 * @access Public
 */
aiRouter.get("/market-analysis", async (req, res) => {
  try {
    const regionFilter = req.query.region as string | undefined;
    const vesselTypeFilter = req.query.vesselType as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Get filtered vessels and refineries
    let vessels = await storage.getVessels();
    let refineries = await storage.getRefineries();

    // Apply region filter if provided
    if (regionFilter && regionFilter !== 'all') {
      vessels = vessels.filter(v => v.currentRegion === regionFilter);
      refineries = refineries.filter(r => r.region === regionFilter);
    }

    // Apply vessel type filter if provided
    if (vesselTypeFilter && vesselTypeFilter !== 'all') {
      vessels = vessels.filter(v => v.vesselType === vesselTypeFilter);
    }

    // Apply limit to reduce processing time if needed
    if (limit && limit > 0) {
      vessels = vessels.slice(0, limit);
      refineries = refineries.slice(0, limit);
    }

    // Get AI market analysis
    const marketAnalysis = await openAIService.getMarketAnalysis(vessels, refineries);

    // Return the analysis
    res.json(marketAnalysis);
  } catch (error: any) {
    console.error("Error getting market analysis:", error);
    res.status(500).json({ message: "Failed to get market analysis", error: error.message });
  }
});

/**
 * @route GET /api/ai/routing-optimization/:vesselId
 * @description Get AI-powered routing optimization for a specific vessel
 * @access Public
 */
aiRouter.get("/routing-optimization/:vesselId", async (req, res) => {
  try {
    const vesselId = parseInt(req.params.vesselId);
    if (isNaN(vesselId)) {
      return res.status(400).json({ message: "Invalid vessel ID" });
    }

    // Get vessel data
    const vessel = await storage.getVesselById(vesselId);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found" });
    }

    // Get AI routing optimization
    const optimization = await openAIService.getRoutingOptimization(vessel);

    // Return the optimization
    res.json(optimization);
  } catch (error: any) {
    console.error("Error getting routing optimization:", error);
    res.status(500).json({ message: "Failed to get routing optimization", error: error.message });
  }
});

/**
 * @route POST /api/ai/query
 * @description Get answer to a natural language query about maritime shipping
 * @access Public
 */
aiRouter.post("/query", async (req, res) => {
  try {
    // Validate request body
    const validation = maritimeQuerySchema.safeParse(req.body);
    if (!validation.success) {
      const errorMessage = fromZodError(validation.error).message;
      return res.status(400).json({ message: errorMessage });
    }

    const { query, includeVessels = true, includeRefineries = true, regionFilter } = validation.data;

    // Get filtered vessels and refineries for context if requested
    let vessels = includeVessels ? await storage.getVessels() : [];
    let refineries = includeRefineries ? await storage.getRefineries() : [];

    // Apply region filter if provided
    if (regionFilter && regionFilter !== 'all') {
      vessels = vessels.filter(v => v.currentRegion === regionFilter);
      refineries = refineries.filter(r => r.region === regionFilter);
    }

    // Limit the number of entities to avoid large context
    const MAX_ENTITIES = 50;
    if (vessels.length > MAX_ENTITIES) {
      vessels = vessels.slice(0, MAX_ENTITIES);
    }
    if (refineries.length > MAX_ENTITIES) {
      refineries = refineries.slice(0, MAX_ENTITIES);
    }

    // Get AI answer to the query
    const answer = await openAIService.answerMaritimeQuery(query, vessels, refineries);

    // Return the answer
    res.json(answer);
  } catch (error: any) {
    console.error("Error answering maritime query:", error);
    res.status(500).json({ message: "Failed to answer query", error: error.message });
  }
});

/**
 * @route GET /api/ai/dashboard
 * @description Get an AI-powered dashboard with insights about global shipping
 * @access Public
 */
aiRouter.get("/dashboard", async (req, res) => {
  try {
    const regionFilter = req.query.region as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Get filtered vessels and refineries
    let vessels = await storage.getVessels();
    let refineries = await storage.getRefineries();

    // Apply region filter if provided
    if (regionFilter && regionFilter !== 'all') {
      vessels = vessels.filter(v => v.currentRegion === regionFilter);
      refineries = refineries.filter(r => r.region === regionFilter);
    }

    // Apply limit to reduce processing time if needed
    if (limit && limit > 0) {
      vessels = vessels.slice(0, limit);
      refineries = refineries.slice(0, limit);
    }

    // Generate AI dashboard
    const dashboard = await openAIService.generateAIDashboard(vessels, refineries);

    // Return the dashboard
    res.json(dashboard);
  } catch (error: any) {
    console.error("Error generating AI dashboard:", error);
    res.status(500).json({ message: "Failed to generate AI dashboard", error: error.message });
  }
});

export default aiRouter;