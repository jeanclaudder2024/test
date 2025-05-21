import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { oilCompanies } from './companyData';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const companyRouter = Router();

// Get all companies
companyRouter.get('/', async (req: Request, res: Response) => {
  try {
    // For the demo, return the preloaded oil company data
    res.json(oilCompanies);
  } catch (error) {
    console.error('Error getting companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// Get recommended companies
companyRouter.get('/recommended', async (req: Request, res: Response) => {
  try {
    // For the demo, return the top 5 oil companies as recommended
    // In a real app, this would use the broker's preferences or machine learning
    res.json(oilCompanies.slice(0, 5));
  } catch (error) {
    console.error('Error getting recommended companies:', error);
    res.status(500).json({ message: 'Error fetching recommended companies' });
  }
});

// Get company by ID
companyRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const company = oilCompanies.find(company => company.id === id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error getting company by ID:', error);
    res.status(500).json({ message: 'Error fetching company' });
  }
});

// Get company by region
companyRouter.get('/region/:region', async (req: Request, res: Response) => {
  try {
    const region = req.params.region;
    if (!region) {
      return res.status(400).json({ message: 'Region is required' });
    }
    
    const filteredCompanies = oilCompanies.filter(
      company => company.region && company.region.toLowerCase() === region.toLowerCase()
    );
    
    res.json(filteredCompanies);
  } catch (error) {
    console.error('Error getting companies by region:', error);
    res.status(500).json({ message: 'Error fetching companies by region' });
  }
});

// Get vessels for a company
companyRouter.get('/:id/vessels', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const company = oilCompanies.find(company => company.id === id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Generate some sample vessels for the company based on their fleet size
    const fleetSize = company.fleetSize || 10;
    const vessels = [];
    
    for (let i = 1; i <= Math.min(fleetSize, 15); i++) {
      const vesselTypes = ['Oil Tanker', 'LNG Carrier', 'Chemical Tanker', 'Product Carrier', 'VLCC'];
      const vesselType = vesselTypes[Math.floor(Math.random() * vesselTypes.length)];
      
      const flags = [company.country, 'Panama', 'Liberia', 'Marshall Islands', 'Singapore'];
      const flag = flags[Math.floor(Math.random() * flags.length)];
      
      const statuses = ['active', 'in port', 'maintenance', 'loading', 'unloading'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      vessels.push({
        id: id * 1000 + i,
        name: `${company.name.split(' ')[0]} ${['Voyager', 'Explorer', 'Pioneer', 'Champion', 'Navigator', 'Fortune'][Math.floor(Math.random() * 6)]} ${i}`,
        mmsi: Math.floor(Math.random() * 900000000) + 100000000,
        imo: Math.floor(Math.random() * 9000000) + 1000000,
        type: vesselType,
        flag: flag,
        status: status,
        lat: (Math.random() * 140) - 70,
        lng: (Math.random() * 340) - 170,
      });
    }
    
    res.json(vessels);
  } catch (error) {
    console.error('Error getting company vessels:', error);
    res.status(500).json({ message: 'Error fetching company vessels' });
  }
});