import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertBrokerCompanySchema, insertCompanyPartnershipSchema, insertUserBrokerConnectionSchema } from '@shared/schema';
import { z } from 'zod';

export const brokerCompanyRouter = Router();

// Get all broker companies
brokerCompanyRouter.get('/', async (req: Request, res: Response) => {
  try {
    const brokerCompanies = await storage.getBrokerCompanies();
    res.json(brokerCompanies);
  } catch (error) {
    console.error('Error fetching broker companies:', error);
    res.status(500).json({ message: 'Failed to fetch broker companies' });
  }
});

// Create broker company
brokerCompanyRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertBrokerCompanySchema.parse(req.body);
    const newBrokerCompany = await storage.createBrokerCompany(validatedData);
    res.status(201).json(newBrokerCompany);
  } catch (error) {
    console.error('Error creating broker company:', error);
    res.status(500).json({ message: 'Failed to create broker company' });
  }
});

// Get company partnerships
brokerCompanyRouter.get('/partnerships', async (req: Request, res: Response) => {
  try {
    const brokerCompanyId = req.query.brokerCompanyId ? parseInt(req.query.brokerCompanyId as string) : undefined;
    const partnerships = await storage.getCompanyPartnerships(brokerCompanyId);
    res.json(partnerships);
  } catch (error) {
    console.error('Error fetching company partnerships:', error);
    res.status(500).json({ message: 'Failed to fetch company partnerships' });
  }
});

// Create company partnership
brokerCompanyRouter.post('/partnerships', async (req: Request, res: Response) => {
  try {
    const validatedData = insertCompanyPartnershipSchema.parse(req.body);
    const newPartnership = await storage.createCompanyPartnership(validatedData);
    res.status(201).json(newPartnership);
  } catch (error) {
    console.error('Error creating company partnership:', error);
    res.status(500).json({ message: 'Failed to create company partnership' });
  }
});

// Get user-broker connections
brokerCompanyRouter.get('/user-connections', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const connections = await storage.getUserBrokerConnections(userId);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching user-broker connections:', error);
    res.status(500).json({ message: 'Failed to fetch user-broker connections' });
  }
});

// Create user-broker connection
brokerCompanyRouter.post('/user-connections', async (req: Request, res: Response) => {
  try {
    const validatedData = insertUserBrokerConnectionSchema.parse(req.body);
    const newConnection = await storage.createUserBrokerConnection(validatedData);
    res.status(201).json(newConnection);
  } catch (error) {
    console.error('Error creating user-broker connection:', error);
    res.status(500).json({ message: 'Failed to create user-broker connection' });
  }
});

// Update user-broker connection
brokerCompanyRouter.put('/user-connections/:id', async (req: Request, res: Response) => {
  try {
    const connectionId = parseInt(req.params.id);
    const updateData = req.body;
    const updatedConnection = await storage.updateUserBrokerConnection(connectionId, updateData);
    res.json(updatedConnection);
  } catch (error) {
    console.error('Error updating user-broker connection:', error);
    res.status(500).json({ message: 'Failed to update user-broker connection' });
  }
});