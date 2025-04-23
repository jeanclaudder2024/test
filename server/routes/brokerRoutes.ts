import { Router } from 'express';
import { brokerService } from '../services/brokerService';
import { z } from 'zod';

export const brokerRouter = Router();

// Get all brokers
brokerRouter.get('/', async (req, res) => {
  try {
    const brokers = await brokerService.getBrokers();
    res.json(brokers);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

// Get broker by ID
brokerRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid broker ID' });
    }

    const broker = await brokerService.getBrokerById(id);
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.json(broker);
  } catch (error) {
    console.error('Error fetching broker:', error);
    res.status(500).json({ error: 'Failed to fetch broker' });
  }
});

// Create a new broker
brokerRouter.post('/', async (req, res) => {
  try {
    // Basic validation
    const schema = z.object({
      name: z.string().min(1),
      company: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      country: z.string().optional(),
      active: z.boolean().optional(),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const brokerData = validation.data;
    const broker = await brokerService.createBroker(brokerData);

    res.status(201).json(broker);
  } catch (error) {
    console.error('Error creating broker:', error);
    res.status(500).json({ error: 'Failed to create broker' });
  }
});

// Update a broker
brokerRouter.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid broker ID' });
    }

    // Basic validation
    const schema = z.object({
      name: z.string().min(1).optional(),
      company: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      country: z.string().optional(),
      active: z.boolean().optional(),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const brokerData = validation.data;
    const broker = await brokerService.updateBroker(id, brokerData);

    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.json(broker);
  } catch (error) {
    console.error('Error updating broker:', error);
    res.status(500).json({ error: 'Failed to update broker' });
  }
});

// Delete a broker
brokerRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid broker ID' });
    }

    const success = await brokerService.deleteBroker(id);
    if (!success) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting broker:', error);
    res.status(500).json({ error: 'Failed to delete broker' });
  }
});

// Elite Membership Routes

// Upgrade broker to elite membership
brokerRouter.post('/:id/elite-membership', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid broker ID' });
    }

    // Validate request body
    const schema = z.object({
      subscription: z.enum(['monthly', 'annual']),
      shippingAddress: z.string().min(10),
      documents: z.object({
        passportUploaded: z.boolean(),
        photoUploaded: z.boolean(),
      }),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { subscription, shippingAddress, documents } = validation.data;

    // Check if all required documents are uploaded
    if (!documents.passportUploaded || !documents.photoUploaded) {
      return res.status(400).json({ error: 'Required documents missing' });
    }

    // Upgrade the broker to elite membership
    const updatedBroker = await brokerService.upgradeToEliteMembership(
      id,
      subscription,
      shippingAddress
    );

    if (!updatedBroker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.json({
      success: true,
      message: 'Elite membership upgrade successful',
      broker: updatedBroker
    });
  } catch (error) {
    console.error('Error upgrading to elite membership:', error);
    res.status(500).json({ error: 'Failed to upgrade to elite membership' });
  }
});

// Check elite membership status
brokerRouter.get('/:id/elite-membership/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid broker ID' });
    }

    const isActive = await brokerService.hasActiveEliteMembership(id);
    const broker = await brokerService.getBrokerById(id);

    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.json({
      brokerId: id,
      isEliteMember: broker.eliteMember || false,
      membershipActive: isActive,
      membershipId: broker.membershipId,
      memberSince: broker.eliteMemberSince,
      expirationDate: broker.eliteMemberExpires,
      subscription: broker.subscriptionPlan
    });
  } catch (error) {
    console.error('Error checking elite membership status:', error);
    res.status(500).json({ error: 'Failed to check elite membership status' });
  }
});

// Renew elite membership
brokerRouter.post('/:id/elite-membership/renew', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid broker ID' });
    }

    // Validate request body
    const schema = z.object({
      subscription: z.enum(['monthly', 'annual'])
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { subscription } = validation.data;

    // Renew the membership
    const updatedBroker = await brokerService.renewEliteMembership(id, subscription);

    if (!updatedBroker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    res.json({
      success: true,
      message: 'Elite membership renewal successful',
      broker: updatedBroker
    });
  } catch (error) {
    console.error('Error renewing elite membership:', error);
    res.status(500).json({ error: 'Failed to renew elite membership' });
  }
});
