import express from 'express';
import { storage } from '../storage';
import { Deal, InsertDeal } from '@shared/schema';
import { authenticateToken, requireAdmin } from '../auth';

const router = express.Router();

// Get all deals with comprehensive information
router.get('/api/deals', async (req, res) => {
  try {
    const deals = await storage.getAllDeals();
    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Get deal by ID with full details
router.get('/api/deals/:id', async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    const deal = await storage.getDealById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// Get deals by status
router.get('/api/deals/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const deals = await storage.getDealsByStatus(status);
    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals by status:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Create new comprehensive deal (Admin only)
router.post('/api/admin/deals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dealData: InsertDeal = req.body;
    
    // Generate deal code if not provided
    if (!dealData.dealCode) {
      dealData.dealCode = `DEAL-${Date.now()}`;
    }

    const newDeal = await storage.createDeal(dealData);
    res.status(201).json(newDeal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Update deal (Admin only)
router.put('/api/admin/deals/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    const dealData = req.body;
    const updatedDeal = await storage.updateDeal(dealId, dealData);
    
    if (!updatedDeal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Subscribe to deal (Authenticated users)
router.post('/api/deals/:id/subscribe', authenticateToken, async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { subscriptionType } = req.body;

    if (isNaN(dealId) || !userId) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const subscription = await storage.subscribeToDeal(dealId, userId, subscriptionType);
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error subscribing to deal:', error);
    res.status(500).json({ error: 'Failed to subscribe to deal' });
  }
});

// Get comprehensive deal information with vessel data
router.get('/api/deals/:id/comprehensive', async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    const deal = await storage.getDealById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Get associated vessel information
    let vessel = null;
    if (deal.vesselId) {
      vessel = await storage.getVesselById(deal.vesselId);
    }

    // Calculate additional metrics
    const comprehensiveData = {
      ...deal,
      vessel,
      metrics: {
        pricePerMT: deal.quantityMts ? Number(deal.dealValueUsd) / Number(deal.quantityMts) : null,
        totalBarrels: deal.quantityBarrels,
        totalMTs: deal.quantityMts,
        marketComparison: deal.marketPrice ? Number(deal.pricePerBarrel) - Number(deal.marketPrice) : null,
        dealEfficiency: deal.customerRating ? Number(deal.customerRating) / 5 * 100 : null,
      },
      formattedData: {
        dealValue: `$${Number(deal.dealValueUsd).toLocaleString()} USD`,
        quantity: `${Number(deal.quantityBarrels).toLocaleString()} barrels / ${Number(deal.quantityMts).toLocaleString()} MTs`,
        priceInfo: `$${Number(deal.pricePerBarrel).toFixed(2)} per barrel`,
        marketPrice: `$${Number(deal.marketPrice).toFixed(2)} per barrel`,
        rating: `⭐ ${deal.customerRating}/5 – Based on ${deal.totalReviews} reviews`,
        statusBadge: getStatusBadge(deal.dealStatus),
        verificationStatus: deal.isVerified ? '✔️ Deal Verified by Platform' : '❌ Pending Verification'
      }
    };

    res.json(comprehensiveData);
  } catch (error) {
    console.error('Error fetching comprehensive deal:', error);
    res.status(500).json({ error: 'Failed to fetch comprehensive deal information' });
  }
});

// Helper function for status badges
function getStatusBadge(status: string | null): string {
  switch (status) {
    case 'open':
      return '🔵 Open for Subscription';
    case 'reserved':
      return '🔒 Reserved';
    case 'closed':
      return '✅ Closed';
    case 'cancelled':
      return '❌ Cancelled';
    default:
      return '⚪ Unknown Status';
  }
}

// Delete deal (Admin only)
router.delete('/api/admin/deals/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dealId = parseInt(req.params.id);
    if (isNaN(dealId)) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    const success = await storage.deleteDeal(dealId);
    if (!success) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

export default router;