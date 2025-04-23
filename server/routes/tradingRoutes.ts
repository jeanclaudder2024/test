import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { vessels, refineries, users as usersTable, InsertVessel } from '@shared/schema';
import { eq, and, like, gte, lte } from 'drizzle-orm';

export const tradingRouter = Router();

/**
 * Type for oil price data to be returned to the client
 */
type OilPrice = {
  name: string;
  arabicName: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated: string;
};

/**
 * Type for deal data to be returned to the client
 */
type Deal = {
  id: number;
  vesselId: number;
  vesselName: string;
  brokerId: number;
  brokerName: string;
  refineryId: number;
  refineryName: string;
  cargoType: string;
  volume: number;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  eta: string;
  created: string;
};

/**
 * Oil price static data (normally this would come from a real API)
 */
const oilPriceData: OilPrice[] = [
  { 
    name: 'Brent Crude', 
    arabicName: 'خام برنت',
    price: 82.43, 
    change: 0.56, 
    changePercent: 0.68, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    name: 'WTI Crude', 
    arabicName: 'خام غرب تكساس',
    price: 78.76, 
    change: -0.23, 
    changePercent: -0.29, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    name: 'Dubai Crude', 
    arabicName: 'خام دبي',
    price: 80.12, 
    change: 0.32, 
    changePercent: 0.40, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    name: 'OPEC Basket', 
    arabicName: 'سلة أوبك',
    price: 81.65, 
    change: 0.41, 
    changePercent: 0.50, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    name: 'Bonny Light', 
    arabicName: 'خام بوني لايت',
    price: 83.20, 
    change: 0.65, 
    changePercent: 0.79, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    name: 'Urals', 
    arabicName: 'خام الأورال',
    price: 63.75, 
    change: -0.89, 
    changePercent: -1.38, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    name: 'West Texas Sour', 
    arabicName: 'غرب تكساس الحامض',
    price: 77.90, 
    change: -0.15, 
    changePercent: -0.19, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    name: 'Mars US', 
    arabicName: 'مارس الأمريكي',
    price: 76.30, 
    change: 0.22, 
    changePercent: 0.29, 
    currency: 'USD', 
    lastUpdated: new Date().toISOString() 
  }
];

/**
 * @route GET /api/trading/oil-prices
 * @description Get current oil prices for various types
 * @access Public
 */
tradingRouter.get('/oil-prices', async (req, res) => {
  try {
    // In a real application, this would fetch real-time data from a price API
    // For this demo, we'll return the static data
    
    // Add a small random fluctuation to prices to simulate live updates
    const updatedPrices = oilPriceData.map(price => {
      const randomFluctuation = (Math.random() - 0.5) * 0.4; // Random value between -0.2 and 0.2
      const newPrice = parseFloat((price.price + randomFluctuation).toFixed(2));
      const change = parseFloat((newPrice - (price.price - price.change)).toFixed(2));
      const changePercent = parseFloat(((change / (price.price - price.change)) * 100).toFixed(2));
      
      return {
        ...price,
        price: newPrice,
        change,
        changePercent,
        lastUpdated: new Date().toISOString()
      };
    });
    
    res.json(updatedPrices);
  } catch (error) {
    console.error('Error fetching oil prices:', error);
    res.status(500).json({ message: 'Failed to fetch oil prices' });
  }
});

/**
 * @route GET /api/trading/deals
 * @description Get active oil deals
 * @access Public
 */
tradingRouter.get('/deals', async (req, res) => {
  try {
    // Get query parameters
    const status = req.query.status as string || 'active';
    
    // Get all vessels that have oil cargo
    const allVessels = await storage.getVessels();
    const allRefineries = await storage.getRefineries();
    
    // Create simplified broker data (in a real application, use actual broker data)
    const brokers = [
      { id: 1, name: 'John Doe', company: 'Global Oil Trading Ltd.' },
      { id: 2, name: 'Sarah Johnson', company: 'Maritime Ventures Inc.' },
      { id: 3, name: 'Ahmed Al-Saud', company: 'Gulf Petrochemicals' },
      { id: 4, name: 'Maria Garcia', company: 'European Energy Partners' },
      { id: 5, name: 'Li Wei', company: 'Pacific Rim Trading Corp' }
    ];
    
    // Filter only oil vessels
    const oilVessels = allVessels.filter(v => {
      return v.cargoType && v.cargoType.toLowerCase().includes('crude') || 
             v.cargoType?.toLowerCase().includes('oil') ||
             v.cargoType?.toLowerCase().includes('gas') ||
             v.cargoType?.toLowerCase().includes('condensate') ||
             v.cargoType?.toLowerCase().includes('petroleum');
    });

    // Generate deals from vessels that have oil cargo
    const deals: Deal[] = oilVessels
      .slice(0, 20) // Limit to 20 deals for performance
      .map(vessel => {
        // Try to extract refinery info
        let refineryId = 0;
        let refineryName = '';
        
        // Check destination field manually in a safe way
        const destinationPort = vessel.destinationPort || '';
        
        // Try to find matching refinery based on destination port or current region
        const matchingRefinery = allRefineries.find(r => 
          destinationPort.toLowerCase().includes(r.name.toLowerCase()) ||
          destinationPort.toLowerCase().includes(r.country.toLowerCase())
        );
        
        if (matchingRefinery) {
          refineryId = matchingRefinery.id;
          refineryName = matchingRefinery.name;
        } else {
          // If no match, pick a random refinery from the same region
          const sameRegionRefineries = allRefineries.filter(r => 
            r.region === vessel.currentRegion
          );
          
          if (sameRegionRefineries.length > 0) {
            const randomRefinery = sameRegionRefineries[Math.floor(Math.random() * sameRegionRefineries.length)];
            refineryId = randomRefinery.id;
            refineryName = randomRefinery.name;
          } else {
            // Fallback to any refinery
            const randomRefinery = allRefineries[Math.floor(Math.random() * allRefineries.length)];
            refineryId = randomRefinery.id;
            refineryName = randomRefinery.name;
          }
        }
        
        // Assign a broker based on vessel id
        const brokerId = (vessel.id % brokers.length) + 1;
        const broker = brokers.find(b => b.id === brokerId) || brokers[0];
        
        // Generate a price based on cargo type
        let price: number;
        if (vessel.cargoType?.toLowerCase().includes('light')) {
          price = 80 + (Math.random() * 5);
        } else if (vessel.cargoType?.toLowerCase().includes('heavy')) {
          price = 75 + (Math.random() * 5);
        } else if (vessel.cargoType?.toLowerCase().includes('condensate')) {
          price = 85 + (Math.random() * 5);
        } else {
          price = 78 + (Math.random() * 6);
        }
        
        // Create the deal object
        return {
          id: vessel.id,
          vesselId: vessel.id,
          vesselName: vessel.name || `Vessel ${vessel.id}`,
          brokerId: broker.id,
          brokerName: broker.name,
          refineryId,
          refineryName,
          cargoType: vessel.cargoType || 'Crude Oil',
          volume: vessel.deadweight || Math.round((Math.random() * 1000000) + 500000),
          price: parseFloat(price.toFixed(2)),
          status: 'active' as const,
          eta: (vessel.eta || new Date(Date.now() + (Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString()).toString(),
          created: new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
        };
      });
    
    // Filter by status if provided
    const filteredDeals = status === 'all' ? deals : deals.filter(d => d.status === status);
    
    res.json(filteredDeals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
});

/**
 * @route GET /api/trading/statistics
 * @description Get trading statistics and summaries
 * @access Public
 */
tradingRouter.get('/statistics', async (req, res) => {
  try {
    // In a real application, you would calculate real statistics from your database
    // For this demo, we'll return static data
    
    res.json({
      totalDeals: 257,
      totalValue: 4529000000, // $4.529B
      averagePrice: 82.14,
      tradingVolume: 55250000, // 55.25M barrels
      regionalBreakdown: [
        { region: 'Middle East', percentage: 42 },
        { region: 'North America', percentage: 18 },
        { region: 'Europe', percentage: 15 },
        { region: 'Asia Pacific', percentage: 13 },
        { region: 'Africa', percentage: 8 },
        { region: 'Latin America', percentage: 4 }
      ],
      topBrokers: [
        { id: 1, name: 'John Doe', deals: 42, volume: 8750000 },
        { id: 3, name: 'Ahmed Al-Saud', deals: 36, volume: 7650000 },
        { id: 2, name: 'Sarah Johnson', deals: 31, volume: 6200000 }
      ]
    });
  } catch (error) {
    console.error('Error fetching trading statistics:', error);
    res.status(500).json({ message: 'Failed to fetch trading statistics' });
  }
});