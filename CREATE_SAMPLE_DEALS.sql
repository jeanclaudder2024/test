-- Create sample oil trading deals for testing
INSERT INTO deals (
  deal_code, oil_type, commodity_spec, origin_country, destination_ports, 
  loading_port, quantity_barrels, quantity_mts, deal_value_usd, 
  price_per_barrel, market_price, contract_type, delivery_terms,
  source_company, deal_status, is_verified, customer_rating, 
  total_reviews, deal_date, vessel_id
) VALUES 
('DEAL-2025-001', 'ULSD EN 590', '10ppm Ultra Low Sulfur Diesel', 'Non-Sanctioned', 'Rotterdam, Houston', 'Kharg Island Terminal', 500000, 75000, 45000000, 90.00, 92.50, 'Spot Trial + 12 Months', 'FOB', 'BP Trading', 'open', true, 4.8, 24, '2025-07-09', NULL),

('DEAL-2025-002', 'Gasoline', 'Standard Gasoline Spec', 'UAE', 'Fujairah, Jurong', 'Fujairah Terminal', 300000, 42000, 28500000, 95.00, 96.75, 'Spot Deal', 'CIF', 'Shell Trading', 'reserved', true, 4.5, 18, '2025-07-08', NULL),

('DEAL-2025-003', 'Crude Oil', 'Brent Crude', 'Norway', 'Houston, ASWP', 'Mongstad Terminal', 1000000, 140000, 75000000, 75.00, 76.20, '12 Months Contract', 'FOB', 'Equinor', 'open', true, 4.9, 35, '2025-07-07', NULL),

('DEAL-2025-004', 'Jet Fuel', 'Jet A-1 Specification', 'Singapore', 'Singapore, Hong Kong', 'Singapore Terminal', 200000, 28000, 19000000, 95.00, 97.30, 'Spot Trial', 'CIF', 'ExxonMobil', 'closed', true, 4.7, 22, '2025-07-06', NULL),

('DEAL-2025-005', 'Heavy Fuel Oil', 'IFO 380', 'Russia', 'Mediterranean Ports', 'Novorossiysk', 750000, 105000, 35000000, 46.67, 48.10, '6 Months Optional', 'FOB', 'Lukoil', 'open', false, 4.2, 12, '2025-07-05', NULL),

('DEAL-2025-006', 'Naphtha', 'Full Range Naphtha', 'Saudi Arabia', 'Rotterdam, Antwerp', 'Ras Tanura', 400000, 56000, 32000000, 80.00, 81.50, 'Spot Deal', 'CIF', 'Saudi Aramco', 'reserved', true, 4.6, 28, '2025-07-04', NULL),

('DEAL-2025-007', 'ULSD EN 590', '10ppm Ultra Low Sulfur Diesel', 'Kuwait', 'Hamburg, Le Havre', 'Mina al-Ahmadi', 600000, 84000, 54000000, 90.00, 91.80, 'Trial + 24 Months', 'FOB', 'Kuwait Petroleum', 'open', true, 4.8, 31, '2025-07-03', NULL),

('DEAL-2025-008', 'Gasoline', 'Premium Gasoline 95 RON', 'Italy', 'Barcelona, Marseille', 'Augusta Terminal', 250000, 35000, 24000000, 96.00, 97.50, 'Spot Trial', 'CIF', 'Eni Trading', 'cancelled', false, 3.9, 8, '2025-07-02', NULL);