import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./supabase-storage";
import { supabaseAuthRoutes } from "./supabase-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Setup Supabase Authentication Routes (Primary Auth System)
  supabaseAuthRoutes(app);

  // Simple test route
  app.get('/api/test', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Oil vessel tracking API is running with Supabase authentication!',
      timestamp: new Date().toISOString()
    });
  });

  // Get vessels (example route)
  app.get('/api/vessels', async (req, res) => {
    try {
      const vessels = await storage.getVessels();
      res.json({ success: true, vessels });
    } catch (error) {
      console.error('Error fetching vessels:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch vessels' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}