import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const brokerRouter = Router();

// Get broker profile
brokerRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    // For demo purposes, return the first broker
    // In a real app, this would use authentication to get the current broker
    const brokers = await storage.getBrokers();
    if (brokers.length === 0) {
      return res.status(404).json({ message: 'No brokers found' });
    }
    res.json(brokers[0]);
  } catch (error) {
    console.error('Error getting broker profile:', error);
    res.status(500).json({ message: 'Error fetching broker profile' });
  }
});

// Get broker stats
brokerRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    // Simulated broker stats data
    res.json({
      activeConnections: 12,
      pendingDeals: 5,
      completedDeals: 37,
      totalRevenue: 385000
    });
  } catch (error) {
    console.error('Error getting broker stats:', error);
    res.status(500).json({ message: 'Error fetching broker stats' });
  }
});

// Get broker connections
brokerRouter.get('/connections/:brokerId', async (req: Request, res: Response) => {
  try {
    const brokerId = parseInt(req.params.brokerId);
    if (isNaN(brokerId)) {
      return res.status(400).json({ message: 'Invalid broker ID' });
    }
    
    // Simulated broker-company connections
    const connections = [
      {
        id: 1,
        brokerId: brokerId,
        companyId: 1,
        connectionType: 'both',
        status: 'active',
        connectionDate: '2025-01-15T00:00:00.000Z',
        lastActivityDate: '2025-05-10T00:00:00.000Z',
        dealsCount: 7,
        totalVolume: 145000,
        notes: 'Regular business partner with strong relationship'
      },
      {
        id: 2,
        brokerId: brokerId,
        companyId: 2,
        connectionType: 'seller',
        status: 'active',
        connectionDate: '2025-02-20T00:00:00.000Z',
        lastActivityDate: '2025-05-18T00:00:00.000Z',
        dealsCount: 3,
        totalVolume: 85000,
        notes: 'Primary supplier for Middle East crude oil'
      },
      {
        id: 3,
        brokerId: brokerId,
        companyId: 3,
        connectionType: 'buyer',
        status: 'pending',
        connectionDate: '2025-05-01T00:00:00.000Z',
        lastActivityDate: null,
        dealsCount: 0,
        totalVolume: 0,
        notes: 'New potential buyer, awaiting approval'
      }
    ];
    
    res.json(connections);
  } catch (error) {
    console.error('Error getting broker connections:', error);
    res.status(500).json({ message: 'Error fetching broker connections' });
  }
});

// Create broker-company connection
brokerRouter.post('/connections', async (req: Request, res: Response) => {
  try {
    const connectionSchema = z.object({
      brokerId: z.number(),
      companyId: z.number(),
      connectionType: z.enum(['buyer', 'seller', 'both']),
      notes: z.string().optional()
    });
    
    const validationResult = connectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ message: errorMessage });
    }
    
    const { brokerId, companyId, connectionType, notes } = validationResult.data;
    
    // Simulate creating a connection (would store in database in a real app)
    const newConnection = {
      id: Date.now(),
      brokerId,
      companyId,
      connectionType,
      status: 'pending',
      connectionDate: new Date().toISOString(),
      lastActivityDate: null,
      dealsCount: 0,
      totalVolume: 0,
      notes
    };
    
    res.status(201).json(newConnection);
  } catch (error) {
    console.error('Error creating broker connection:', error);
    res.status(500).json({ message: 'Error creating broker connection' });
  }
});

// Get broker deals
brokerRouter.get('/deals/:brokerId', async (req: Request, res: Response) => {
  try {
    const brokerId = parseInt(req.params.brokerId);
    if (isNaN(brokerId)) {
      return res.status(400).json({ message: 'Invalid broker ID' });
    }
    
    // Simulated broker deals
    const deals = [
      {
        id: 1,
        brokerId: brokerId,
        brokerName: 'Abdullah Al-Saud',
        sellerId: 1,
        sellerName: 'Saudi Aramco',
        buyerId: 4,
        buyerName: 'Shell Global',
        vesselId: 1028,
        vesselName: 'Seawise Giant II',
        cargoType: 'Crude Oil',
        volume: 280000,
        volumeUnit: 'MT',
        price: 85,
        currency: 'USD',
        status: 'completed',
        departurePortId: 12,
        departurePortName: 'Ras Tanura Port',
        destinationPortId: 18,
        destinationPortName: 'Rotterdam Port',
        estimatedDeparture: '2025-03-10T00:00:00.000Z',
        estimatedArrival: '2025-03-28T00:00:00.000Z',
        createdAt: '2025-02-25T00:00:00.000Z',
        lastUpdated: '2025-04-02T00:00:00.000Z',
        commissionRate: 0.015,
        commissionAmount: 357000
      },
      {
        id: 2,
        brokerId: brokerId,
        brokerName: 'Abdullah Al-Saud',
        sellerId: 2,
        sellerName: 'Abu Dhabi National Oil Company',
        buyerId: 6,
        buyerName: 'BP',
        vesselId: 1045,
        vesselName: 'Gulf Prosperity',
        cargoType: 'Jet Fuel',
        volume: 120000,
        volumeUnit: 'MT',
        price: 105,
        currency: 'USD',
        status: 'pending',
        departurePortId: 15,
        departurePortName: 'Jebel Ali Port',
        destinationPortId: 22,
        destinationPortName: 'Singapore Port',
        estimatedDeparture: '2025-05-25T00:00:00.000Z',
        estimatedArrival: '2025-06-12T00:00:00.000Z',
        createdAt: '2025-05-01T00:00:00.000Z',
        lastUpdated: '2025-05-05T00:00:00.000Z',
        commissionRate: 0.01,
        commissionAmount: 126000
      },
      {
        id: 3,
        brokerId: brokerId,
        brokerName: 'Abdullah Al-Saud',
        sellerId: 3,
        sellerName: 'Kuwait Petroleum Corporation',
        buyerId: 5,
        buyerName: 'ExxonMobil',
        vesselId: null,
        vesselName: null,
        cargoType: 'Diesel',
        volume: 85000,
        volumeUnit: 'MT',
        price: 95,
        currency: 'USD',
        status: 'draft',
        departurePortId: null,
        departurePortName: null,
        destinationPortId: null,
        destinationPortName: null,
        estimatedDeparture: null,
        estimatedArrival: null,
        createdAt: '2025-05-12T00:00:00.000Z',
        lastUpdated: null,
        commissionRate: 0.0125,
        commissionAmount: 100938
      }
    ];
    
    res.json(deals);
  } catch (error) {
    console.error('Error getting broker deals:', error);
    res.status(500).json({ message: 'Error fetching broker deals' });
  }
});

// Get recent broker deals
brokerRouter.get('/deals/recent', async (req: Request, res: Response) => {
  try {
    // Simulated recent deals (would fetch from database in a real app)
    const recentDeals = [
      {
        id: 1,
        brokerId: 1,
        brokerName: 'Abdullah Al-Saud',
        sellerId: 1,
        sellerName: 'Saudi Aramco',
        buyerId: 4,
        buyerName: 'Shell Global',
        vesselName: 'Seawise Giant II',
        cargoType: 'Crude Oil',
        volume: 280000,
        volumeUnit: 'MT',
        price: 85,
        currency: 'USD',
        status: 'completed',
        createdAt: '2025-04-15T00:00:00.000Z',
        commissionRate: 0.015
      },
      {
        id: 2,
        brokerId: 1,
        brokerName: 'Abdullah Al-Saud',
        sellerId: 2,
        sellerName: 'Abu Dhabi National Oil Company',
        buyerId: 6,
        buyerName: 'BP',
        vesselName: 'Gulf Prosperity',
        cargoType: 'Jet Fuel',
        volume: 120000,
        volumeUnit: 'MT',
        price: 105,
        currency: 'USD',
        status: 'pending',
        createdAt: '2025-05-01T00:00:00.000Z',
        commissionRate: 0.01
      },
      {
        id: 3,
        brokerId: 1,
        brokerName: 'Abdullah Al-Saud',
        sellerId: 3,
        sellerName: 'Kuwait Petroleum Corporation',
        buyerId: 5,
        buyerName: 'ExxonMobil',
        vesselName: null,
        cargoType: 'Diesel',
        volume: 85000,
        volumeUnit: 'MT',
        price: 95,
        currency: 'USD',
        status: 'draft',
        createdAt: '2025-05-12T00:00:00.000Z',
        commissionRate: 0.0125
      },
      {
        id: 4,
        brokerId: 1,
        brokerName: 'Abdullah Al-Saud',
        sellerId: 1,
        sellerName: 'Saudi Aramco',
        buyerId: 7,
        buyerName: 'Total Energies',
        vesselName: 'Arabian Pearl',
        cargoType: 'Gasoline',
        volume: 95000,
        volumeUnit: 'MT',
        price: 110,
        currency: 'USD',
        status: 'confirmed',
        createdAt: '2025-05-10T00:00:00.000Z',
        commissionRate: 0.01
      }
    ];
    
    res.json(recentDeals);
  } catch (error) {
    console.error('Error getting recent deals:', error);
    res.status(500).json({ message: 'Error fetching recent deals' });
  }
});

// Create broker deal
brokerRouter.post('/deals', async (req: Request, res: Response) => {
  try {
    const dealSchema = z.object({
      brokerId: z.number(),
      sellerId: z.number(),
      sellerName: z.string(),
      buyerId: z.number(),
      buyerName: z.string(),
      vesselName: z.string().optional().nullable(),
      cargoType: z.string(),
      volume: z.number().positive(),
      volumeUnit: z.string(),
      price: z.number().positive(),
      currency: z.string(),
      status: z.string(),
      commissionRate: z.number(),
      createdAt: z.string()
    });
    
    const validationResult = dealSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ message: errorMessage });
    }
    
    const dealData = validationResult.data;
    
    // Simulate creating a deal (would store in database in a real app)
    const newDeal = {
      id: Date.now(),
      ...dealData,
      brokerName: 'Abdullah Al-Saud', // Would be retrieved from the authenticated user
    };
    
    res.status(201).json(newDeal);
  } catch (error) {
    console.error('Error creating broker deal:', error);
    res.status(500).json({ message: 'Error creating broker deal' });
  }
});