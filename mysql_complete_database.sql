-- =====================================================
-- COMPLETE MYSQL DATABASE STRUCTURE FOR MARITIME OIL BROKERAGE PLATFORM
-- 31 Tables with Full Relations and Sample Data
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS maritime_oil_brokerage;
CREATE DATABASE maritime_oil_brokerage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE maritime_oil_brokerage;

-- =====================================================
-- 1. USERS TABLE - User authentication and profiles
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    provider VARCHAR(100),
    provider_id VARCHAR(255),
    photo_url VARCHAR(500),
    display_name VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    is_subscribed BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(100) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- =====================================================
-- 2. COMPANIES TABLE - Oil companies and brokers
-- =====================================================
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(500),
    description TEXT,
    logo_url VARCHAR(500),
    established_year INT,
    employee_count INT,
    annual_revenue DECIMAL(15,2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_country (country),
    INDEX idx_region (region)
);

-- =====================================================
-- 3. PORTS TABLE - Global ports and terminals
-- =====================================================
CREATE TABLE ports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    lat VARCHAR(50) NOT NULL,
    lng VARCHAR(50) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(100) DEFAULT 'active',
    capacity INT,
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_region (region),
    INDEX idx_type (type),
    INDEX idx_coordinates (lat, lng)
);

-- =====================================================
-- 4. REFINERIES TABLE - Oil refineries worldwide
-- =====================================================
CREATE TABLE refineries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    lat VARCHAR(50) NOT NULL,
    lng VARCHAR(50) NOT NULL,
    type VARCHAR(100) DEFAULT 'refinery',
    status VARCHAR(100) DEFAULT 'active',
    capacity INT,
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_region (region),
    INDEX idx_coordinates (lat, lng)
);

-- =====================================================
-- 5. VESSELS TABLE - Oil tankers and cargo vessels
-- =====================================================
CREATE TABLE vessels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    imo VARCHAR(50) NOT NULL UNIQUE,
    mmsi VARCHAR(50) NOT NULL,
    vessel_type VARCHAR(100) NOT NULL,
    flag VARCHAR(100) NOT NULL,
    built INT,
    deadweight INT,
    current_lat VARCHAR(50),
    current_lng VARCHAR(50),
    current_port_id INT,
    destination_port_id INT,
    departure_port VARCHAR(255),
    destination_port VARCHAR(255),
    status VARCHAR(100) DEFAULT 'at_sea',
    speed DECIMAL(5,2),
    course INT,
    eta TIMESTAMP,
    cargo_capacity INT,
    cargo_type VARCHAR(100),
    owner VARCHAR(255),
    operator VARCHAR(255),
    manager VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_imo (imo),
    INDEX idx_mmsi (mmsi),
    INDEX idx_vessel_type (vessel_type),
    INDEX idx_flag (flag),
    INDEX idx_status (status),
    INDEX idx_coordinates (current_lat, current_lng),
    FOREIGN KEY (current_port_id) REFERENCES ports(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_port_id) REFERENCES ports(id) ON DELETE SET NULL
);

-- =====================================================
-- 6. CARGO_TYPES TABLE - Oil product classifications
-- =====================================================
CREATE TABLE cargo_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    density DECIMAL(8,4),
    viscosity DECIMAL(8,4),
    api_gravity DECIMAL(6,2),
    sulfur_content DECIMAL(6,4),
    flash_point INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- =====================================================
-- 7. DEALS TABLE - Oil trading deals and contracts
-- =====================================================
CREATE TABLE deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    buyer_company_id INT,
    seller_company_id INT,
    broker_company_id INT,
    cargo_type_id INT,
    quantity DECIMAL(15,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(12,4),
    total_value DECIMAL(18,2),
    currency VARCHAR(10) DEFAULT 'USD',
    deal_date DATE NOT NULL,
    delivery_date DATE,
    loading_port_id INT,
    discharge_port_id INT,
    vessel_id INT,
    status VARCHAR(100) DEFAULT 'pending',
    terms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_buyer (buyer_company_id),
    INDEX idx_seller (seller_company_id),
    INDEX idx_broker (broker_company_id),
    INDEX idx_cargo_type (cargo_type_id),
    INDEX idx_status (status),
    INDEX idx_deal_date (deal_date),
    FOREIGN KEY (buyer_company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (seller_company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (broker_company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(id) ON DELETE SET NULL,
    FOREIGN KEY (loading_port_id) REFERENCES ports(id) ON DELETE SET NULL,
    FOREIGN KEY (discharge_port_id) REFERENCES ports(id) ON DELETE SET NULL,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE SET NULL
);

-- =====================================================
-- 8. DOCUMENTS TABLE - Deal documents and certificates
-- =====================================================
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deal_id (deal_id),
    INDEX idx_type (type),
    INDEX idx_uploaded_by (uploaded_by),
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 9. MARKET_PRICES TABLE - Historical oil prices
-- =====================================================
CREATE TABLE market_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cargo_type_id INT NOT NULL,
    region VARCHAR(100) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    unit VARCHAR(50) NOT NULL,
    price_date DATE NOT NULL,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cargo_type (cargo_type_id),
    INDEX idx_region (region),
    INDEX idx_price_date (price_date),
    FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(id) ON DELETE CASCADE
);

-- =====================================================
-- 10. VESSEL_POSITIONS TABLE - Historical vessel tracking
-- =====================================================
CREATE TABLE vessel_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vessel_id INT NOT NULL,
    lat VARCHAR(50) NOT NULL,
    lng VARCHAR(50) NOT NULL,
    speed DECIMAL(5,2),
    course INT,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(100),
    INDEX idx_vessel_id (vessel_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_coordinates (lat, lng),
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- =====================================================
-- 11. VOYAGE_DETAILS TABLE - Vessel voyage information
-- =====================================================
CREATE TABLE voyage_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vessel_id INT NOT NULL,
    voyage_number VARCHAR(100),
    departure_port_id INT,
    arrival_port_id INT,
    departure_date TIMESTAMP,
    arrival_date TIMESTAMP,
    cargo_type_id INT,
    cargo_quantity DECIMAL(15,2),
    status VARCHAR(100) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vessel_id (vessel_id),
    INDEX idx_departure_port (departure_port_id),
    INDEX idx_arrival_port (arrival_port_id),
    INDEX idx_status (status),
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
    FOREIGN KEY (departure_port_id) REFERENCES ports(id) ON DELETE SET NULL,
    FOREIGN KEY (arrival_port_id) REFERENCES ports(id) ON DELETE SET NULL,
    FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(id) ON DELETE SET NULL
);

-- =====================================================
-- 12. VESSEL_REFINERY_CONNECTIONS TABLE - Vessel-refinery relationships
-- =====================================================
CREATE TABLE vessel_refinery_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vessel_id INT NOT NULL,
    refinery_id INT NOT NULL,
    connection_type VARCHAR(100) DEFAULT 'supply',
    status VARCHAR(100) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    cargo_volume VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vessel_id (vessel_id),
    INDEX idx_refinery_id (refinery_id),
    INDEX idx_connection_type (connection_type),
    INDEX idx_status (status),
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
    FOREIGN KEY (refinery_id) REFERENCES refineries(id) ON DELETE CASCADE
);

-- =====================================================
-- 13. PORT_CONNECTIONS TABLE - Port-to-port connections
-- =====================================================
CREATE TABLE port_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origin_port_id INT NOT NULL,
    destination_port_id INT NOT NULL,
    distance_km DECIMAL(10,2),
    avg_transit_days INT,
    connection_type VARCHAR(100) DEFAULT 'shipping_route',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_origin_port (origin_port_id),
    INDEX idx_destination_port (destination_port_id),
    FOREIGN KEY (origin_port_id) REFERENCES ports(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_port_id) REFERENCES ports(id) ON DELETE CASCADE
);

-- =====================================================
-- 14. REFINERY_PRODUCTS TABLE - Refinery output products
-- =====================================================
CREATE TABLE refinery_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refinery_id INT NOT NULL,
    cargo_type_id INT NOT NULL,
    daily_production DECIMAL(15,2),
    unit VARCHAR(50),
    quality_grade VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_refinery_id (refinery_id),
    INDEX idx_cargo_type (cargo_type_id),
    FOREIGN KEY (refinery_id) REFERENCES refineries(id) ON DELETE CASCADE,
    FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(id) ON DELETE CASCADE
);

-- =====================================================
-- 15. WEATHER_DATA TABLE - Weather information for locations
-- =====================================================
CREATE TABLE weather_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lat VARCHAR(50) NOT NULL,
    lng VARCHAR(50) NOT NULL,
    temperature DECIMAL(5,2),
    humidity INT,
    wind_speed DECIMAL(5,2),
    wind_direction INT,
    weather_condition VARCHAR(100),
    visibility_km DECIMAL(5,2),
    recorded_at TIMESTAMP NOT NULL,
    INDEX idx_coordinates (lat, lng),
    INDEX idx_recorded_at (recorded_at)
);

-- =====================================================
-- 16. NEWS_ARTICLES TABLE - Maritime industry news
-- =====================================================
CREATE TABLE news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    author VARCHAR(255),
    source VARCHAR(255),
    source_url VARCHAR(1000),
    category VARCHAR(100),
    tags TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_published_at (published_at),
    INDEX idx_source (source)
);

-- =====================================================
-- 17. ALERTS TABLE - User notifications and alerts
-- =====================================================
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    severity VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    entity_type VARCHAR(100),
    entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_severity (severity),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 18. SUBSCRIPTIONS TABLE - User subscription plans
-- =====================================================
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    features TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_plan_name (plan_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 19. AUDIT_LOGS TABLE - System activity logging
-- =====================================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 20. REGIONS TABLE - Geographic regions
-- =====================================================
CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    countries TEXT,
    timezone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- =====================================================
-- 21. CURRENCIES TABLE - Supported currencies
-- =====================================================
CREATE TABLE currencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    exchange_rate DECIMAL(12,6) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code)
);

-- =====================================================
-- 22. VESSEL_SPECIFICATIONS TABLE - Detailed vessel specs
-- =====================================================
CREATE TABLE vessel_specifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vessel_id INT NOT NULL,
    length DECIMAL(8,2),
    beam DECIMAL(8,2),
    depth DECIMAL(8,2),
    gross_tonnage INT,
    net_tonnage INT,
    engine_power INT,
    max_speed DECIMAL(5,2),
    fuel_consumption DECIMAL(8,2),
    classification_society VARCHAR(100),
    builder VARCHAR(255),
    build_yard VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vessel_id (vessel_id),
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- =====================================================
-- 23. PORT_FACILITIES TABLE - Port infrastructure details
-- =====================================================
CREATE TABLE port_facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    port_id INT NOT NULL,
    facility_type VARCHAR(100) NOT NULL,
    capacity INT,
    depth DECIMAL(6,2),
    length DECIMAL(8,2),
    equipment TEXT,
    is_operational BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_port_id (port_id),
    INDEX idx_facility_type (facility_type),
    FOREIGN KEY (port_id) REFERENCES ports(id) ON DELETE CASCADE
);

-- =====================================================
-- 24. DEAL_PARTICIPANTS TABLE - Multiple parties in deals
-- =====================================================
CREATE TABLE deal_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    company_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    commission_rate DECIMAL(5,4),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deal_id (deal_id),
    INDEX idx_company_id (company_id),
    INDEX idx_role (role),
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =====================================================
-- 25. CARGO_MOVEMENTS TABLE - Cargo tracking
-- =====================================================
CREATE TABLE cargo_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT,
    vessel_id INT,
    cargo_type_id INT NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    origin_port_id INT,
    destination_port_id INT,
    loading_date TIMESTAMP,
    discharge_date TIMESTAMP,
    status VARCHAR(100) DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deal_id (deal_id),
    INDEX idx_vessel_id (vessel_id),
    INDEX idx_cargo_type (cargo_type_id),
    INDEX idx_status (status),
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE SET NULL,
    FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(id) ON DELETE CASCADE,
    FOREIGN KEY (origin_port_id) REFERENCES ports(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_port_id) REFERENCES ports(id) ON DELETE SET NULL
);

-- =====================================================
-- 26. QUALITY_CERTIFICATES TABLE - Oil quality reports
-- =====================================================
CREATE TABLE quality_certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cargo_movement_id INT,
    certificate_number VARCHAR(255) NOT NULL,
    inspector VARCHAR(255),
    inspection_date DATE,
    api_gravity DECIMAL(6,2),
    sulfur_content DECIMAL(6,4),
    water_content DECIMAL(6,4),
    sediment_content DECIMAL(6,4),
    flash_point INT,
    pour_point INT,
    viscosity DECIMAL(8,4),
    results TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cargo_movement (cargo_movement_id),
    INDEX idx_certificate_number (certificate_number),
    FOREIGN KEY (cargo_movement_id) REFERENCES cargo_movements(id) ON DELETE CASCADE
);

-- =====================================================
-- 27. PAYMENT_TERMS TABLE - Deal payment conditions
-- =====================================================
CREATE TABLE payment_terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_schedule TEXT,
    advance_percentage DECIMAL(5,2),
    balance_due_days INT,
    currency VARCHAR(10) DEFAULT 'USD',
    bank_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deal_id (deal_id),
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

-- =====================================================
-- 28. VESSEL_OWNERSHIP TABLE - Vessel ownership history
-- =====================================================
CREATE TABLE vessel_ownership (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vessel_id INT NOT NULL,
    owner_company_id INT,
    operator_company_id INT,
    manager_company_id INT,
    ownership_type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vessel_id (vessel_id),
    INDEX idx_owner (owner_company_id),
    INDEX idx_operator (operator_company_id),
    INDEX idx_is_current (is_current),
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (operator_company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- =====================================================
-- 29. MARKET_ANALYSIS TABLE - Market intelligence
-- =====================================================
CREATE TABLE market_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    cargo_type_id INT,
    analysis_date DATE NOT NULL,
    demand_trend VARCHAR(50),
    supply_trend VARCHAR(50),
    price_forecast DECIMAL(12,4),
    volatility_index DECIMAL(5,2),
    key_factors TEXT,
    analyst VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_region (region),
    INDEX idx_cargo_type (cargo_type_id),
    INDEX idx_analysis_date (analysis_date),
    FOREIGN KEY (cargo_type_id) REFERENCES cargo_types(id) ON DELETE SET NULL
);

-- =====================================================
-- 30. NOTIFICATIONS TABLE - System notifications
-- =====================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 31. API_KEYS TABLE - API access management
-- =====================================================
CREATE TABLE api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    permissions TEXT,
    rate_limit INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_api_key (api_key),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample users
INSERT INTO users (username, email, password, display_name, subscription_tier) VALUES
('admin', 'admin@maritime.com', '$2b$10$hash', 'System Administrator', 'premium'),
('broker1', 'broker1@oilco.com', '$2b$10$hash', 'John Smith', 'professional'),
('trader1', 'trader1@petrol.com', '$2b$10$hash', 'Sarah Johnson', 'basic');

-- Insert regions
INSERT INTO regions (name, code, description, countries) VALUES
('Middle East', 'ME', 'Oil-rich Middle Eastern region', 'Saudi Arabia,UAE,Kuwait,Qatar,Iran,Iraq'),
('Asia-Pacific', 'AP', 'Asian and Pacific markets', 'China,Japan,South Korea,Singapore,Australia'),
('Europe', 'EU', 'European markets', 'UK,Germany,France,Netherlands,Norway'),
('North America', 'NA', 'North American markets', 'USA,Canada,Mexico'),
('Latin America', 'LA', 'Latin American markets', 'Brazil,Argentina,Venezuela,Colombia'),
('Africa', 'AF', 'African markets', 'Nigeria,Algeria,Libya,Egypt');

-- Insert currencies
INSERT INTO currencies (code, name, symbol, exchange_rate) VALUES
('USD', 'US Dollar', '$', 1.0),
('EUR', 'Euro', '€', 0.85),
('GBP', 'British Pound', '£', 0.73),
('JPY', 'Japanese Yen', '¥', 110.0),
('CNY', 'Chinese Yuan', '¥', 6.5);

-- Insert cargo types
INSERT INTO cargo_types (name, category, description, density, api_gravity, sulfur_content) VALUES
('Crude Oil - Brent', 'Crude Oil', 'North Sea Brent crude oil', 0.825, 38.3, 0.37),
('Crude Oil - WTI', 'Crude Oil', 'West Texas Intermediate crude', 0.827, 39.6, 0.24),
('Diesel', 'Refined Products', 'Marine gas oil / diesel fuel', 0.845, 35.0, 0.10),
('Gasoline', 'Refined Products', 'Motor gasoline', 0.720, 60.0, 0.08),
('Jet Fuel', 'Refined Products', 'Aviation turbine fuel', 0.775, 51.0, 0.30),
('Heavy Fuel Oil', 'Refined Products', 'Bunker fuel for ships', 0.950, 18.0, 2.50),
('LPG', 'Gas Products', 'Liquefied petroleum gas', 0.540, 112.0, 0.01),
('Naphtha', 'Refined Products', 'Light petroleum distillate', 0.750, 57.0, 0.05);

-- Insert companies
INSERT INTO companies (name, type, country, region, contact_email, description, employee_count) VALUES
('Saudi Aramco', 'Oil Producer', 'Saudi Arabia', 'Middle East', 'contact@aramco.com', 'World largest oil producer', 70000),
('ExxonMobil', 'Oil Producer', 'USA', 'North America', 'info@exxonmobil.com', 'Major American oil company', 75000),
('Shell', 'Oil Producer', 'Netherlands', 'Europe', 'contact@shell.com', 'Global oil and gas company', 86000),
('BP', 'Oil Producer', 'UK', 'Europe', 'info@bp.com', 'British petroleum company', 70000),
('TotalEnergies', 'Oil Producer', 'France', 'Europe', 'contact@totalenergies.com', 'French multinational oil company', 105000),
('Maritime Brokers Ltd', 'Broker', 'Singapore', 'Asia-Pacific', 'deals@maritimebrokers.com', 'Leading oil trading broker', 250),
('Global Oil Trading', 'Trader', 'USA', 'North America', 'trade@globaloil.com', 'Commodity trading house', 180);

-- Insert ports
INSERT INTO ports (name, country, region, lat, lng, type, capacity, description) VALUES
('Port of Singapore', 'Singapore', 'Asia-Pacific', '1.2966', '103.8547', 'Container/Oil Terminal', 50000000, 'World busiest transshipment port'),
('Port of Rotterdam', 'Netherlands', 'Europe', '51.9244', '4.4777', 'Container/Oil Terminal', 47000000, 'Largest port in Europe'),
('Port of Houston', 'USA', 'North America', '29.7604', '-95.3698', 'Oil Terminal', 35000000, 'Major US oil port'),
('Ras Tanura', 'Saudi Arabia', 'Middle East', '26.7019', '50.1647', 'Oil Terminal', 60000000, 'World largest oil port'),
('Port of Fujairah', 'UAE', 'Middle East', '25.1212', '56.3264', 'Oil Terminal', 25000000, 'Major Middle East oil hub'),
('Port of Antwerp', 'Belgium', 'Europe', '51.2194', '4.4025', 'Container/Oil Terminal', 23000000, 'Major European oil port');

-- Insert refineries
INSERT INTO refineries (name, country, region, lat, lng, capacity, description) VALUES
('Ras Tanura Refinery', 'Saudi Arabia', 'Middle East', '26.7019', '50.1647', 550000, 'One of world largest refineries'),
('Baytown Refinery', 'USA', 'North America', '29.7355', '-94.9774', 584000, 'ExxonMobil largest refinery'),
('Pernis Refinery', 'Netherlands', 'Europe', '51.8897', '4.3675', 416000, 'Shell largest refinery'),
('Yanbu Refinery', 'Saudi Arabia', 'Middle East', '24.0889', '38.0618', 400000, 'Major Saudi refinery'),
('Milford Haven Refinery', 'UK', 'Europe', '51.7073', '-5.0423', 270000, 'Major UK refinery'),
('Pulau Bukom Refinery', 'Singapore', 'Asia-Pacific', '1.2371', '103.7574', 500000, 'Major Asian refinery');

-- Insert vessels
INSERT INTO vessels (name, imo, mmsi, vessel_type, flag, built, deadweight, current_lat, current_lng, status, cargo_capacity, cargo_type, owner) VALUES
('Seaways Laura', '9234567', '235012345', 'Oil Tanker', 'Liberia', 2015, 164000, '25.2048', '55.2708', 'at_sea', 160000, 'Crude Oil', 'Frontline Ltd'),
('Nordic Pioneer', '9345678', '235023456', 'Oil Tanker', 'Norway', 2018, 318000, '51.5074', '-0.1278', 'in_port', 310000, 'Crude Oil', 'Nordic Tankers'),
('Ocean Victory', '9456789', '235034567', 'Oil Tanker', 'Marshall Islands', 2020, 175000, '29.7604', '-95.3698', 'loading', 170000, 'Crude Oil', 'DHT Holdings'),
('Global Spirit', '9567890', '235045678', 'Product Tanker', 'Singapore', 2019, 75000, '1.2966', '103.8547', 'discharging', 70000, 'Refined Products', 'Scorpio Tankers'),
('Atlantic Dawn', '9678901', '235056789', 'Oil Tanker', 'Greece', 2017, 299000, '26.7019', '50.1647', 'at_anchor', 290000, 'Crude Oil', 'Euronav'),
('Pacific Star', '9789012', '235067890', 'Product Tanker', 'Panama', 2021, 50000, '51.9244', '4.4777', 'in_port', 48000, 'Diesel', 'Hafnia Limited');

-- Insert deals
INSERT INTO deals (title, buyer_company_id, seller_company_id, cargo_type_id, quantity, unit, price_per_unit, deal_date, loading_port_id, discharge_port_id, vessel_id, status) VALUES
('Brent Crude 2M Barrels', 2, 1, 1, 2000000, 'barrels', 85.50, '2024-01-15', 4, 3, 1, 'completed'),
('WTI Crude 1.5M Barrels', 3, 2, 2, 1500000, 'barrels', 82.75, '2024-01-20', 3, 2, 2, 'active'),
('Diesel 500K MT', 4, 3, 3, 500000, 'MT', 950.00, '2024-01-25', 1, 6, 4, 'pending'),
('Gasoline 300K MT', 5, 4, 4, 300000, 'MT', 1200.00, '2024-02-01', 2, 1, 6, 'active');

-- Insert vessel refinery connections
INSERT INTO vessel_refinery_connections (vessel_id, refinery_id, connection_type, status, cargo_volume) VALUES
(1, 1, 'supply', 'active', '2M barrels'),
(2, 3, 'supply', 'active', '1.8M barrels'),
(3, 2, 'supply', 'scheduled', '1.5M barrels'),
(4, 6, 'delivery', 'active', '500K MT'),
(5, 1, 'supply', 'active', '2.5M barrels'),
(6, 3, 'delivery', 'completed', '400K MT');

-- Insert vessel positions (recent tracking data)
INSERT INTO vessel_positions (vessel_id, lat, lng, speed, course, timestamp) VALUES
(1, '25.2048', '55.2708', 12.5, 285, '2024-01-30 10:00:00'),
(1, '25.1950', '55.2580', 12.8, 285, '2024-01-30 11:00:00'),
(2, '51.5074', '-0.1278', 0.0, 0, '2024-01-30 10:00:00'),
(3, '29.7604', '-95.3698', 0.0, 0, '2024-01-30 10:00:00'),
(4, '1.2966', '103.8547', 8.5, 180, '2024-01-30 10:00:00'),
(5, '26.7019', '50.1647', 0.0, 0, '2024-01-30 10:00:00'),
(6, '51.9244', '4.4777', 0.0, 0, '2024-01-30 10:00:00');

-- Insert market prices
INSERT INTO market_prices (cargo_type_id, region, price, unit, price_date, source) VALUES
(1, 'Europe', 87.50, 'USD/barrel', '2024-01-30', 'ICE Brent'),
(1, 'Asia-Pacific', 86.25, 'USD/barrel', '2024-01-30', 'Platts'),
(2, 'North America', 84.75, 'USD/barrel', '2024-01-30', 'NYMEX WTI'),
(3, 'Europe', 965.00, 'USD/MT', '2024-01-30', 'Platts'),
(4, 'Asia-Pacific', 1180.00, 'USD/MT', '2024-01-30', 'MOPS'),
(5, 'Middle East', 1050.00, 'USD/MT', '2024-01-30', 'Platts'),
(6, 'Europe', 450.00, 'USD/MT', '2024-01-30', 'Platts'),
(7, 'Asia-Pacific', 580.00, 'USD/MT', '2024-01-30', 'Argus');

-- Insert alerts
INSERT INTO alerts (user_id, type, title, message, severity) VALUES
(1, 'price_alert', 'Brent Crude Price Alert', 'Brent crude oil price has exceeded $90/barrel', 'high'),
(2, 'vessel_alert', 'Vessel Arrival', 'Nordic Pioneer has arrived at Rotterdam', 'info'),
(3, 'deal_alert', 'Deal Completion', 'Diesel cargo deal has been successfully completed', 'info');

-- Insert voyage details
INSERT INTO voyage_details (vessel_id, voyage_number, departure_port_id, arrival_port_id, departure_date, cargo_type_id, cargo_quantity, status) VALUES
(1, 'SL001', 4, 2, '2024-01-25 08:00:00', 1, 2000000, 'active'),
(2, 'NP002', 4, 2, '2024-01-20 14:00:00', 1, 1800000, 'completed'),
(3, 'OV003', 3, 1, '2024-01-28 06:00:00', 2, 1500000, 'active'),
(4, 'GS004', 6, 1, '2024-01-26 12:00:00', 3, 500000, 'active'),
(5, 'AD005', 4, 3, '2024-01-22 10:00:00', 1, 2500000, 'completed'),
(6, 'PS006', 2, 1, '2024-01-24 16:00:00', 3, 400000, 'completed');

-- Insert port connections
INSERT INTO port_connections (origin_port_id, destination_port_id, distance_km, avg_transit_days) VALUES
(4, 2, 6500, 15),  -- Ras Tanura to Rotterdam
(4, 1, 8200, 18),  -- Ras Tanura to Singapore
(3, 2, 7800, 16),  -- Houston to Rotterdam
(1, 6, 1650, 4),   -- Singapore to Antwerp
(2, 3, 7800, 16),  -- Rotterdam to Houston
(5, 1, 4200, 10);  -- Fujairah to Singapore

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_vessels_status_type ON vessels(status, vessel_type);
CREATE INDEX idx_deals_date_status ON deals(deal_date, status);
CREATE INDEX idx_positions_vessel_time ON vessel_positions(vessel_id, timestamp);
CREATE INDEX idx_prices_type_date ON market_prices(cargo_type_id, price_date);
CREATE INDEX idx_connections_vessel_refinery ON vessel_refinery_connections(vessel_id, refinery_id);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active vessels with current positions
CREATE VIEW active_vessels AS
SELECT 
    v.*,
    vp.lat as position_lat,
    vp.lng as position_lng,
    vp.timestamp as last_position_update
FROM vessels v
LEFT JOIN vessel_positions vp ON v.id = vp.vessel_id
WHERE v.status != 'decommissioned'
AND vp.timestamp = (
    SELECT MAX(timestamp) 
    FROM vessel_positions vp2 
    WHERE vp2.vessel_id = v.id
);

-- Current market prices
CREATE VIEW current_market_prices AS
SELECT 
    mp.*,
    ct.name as cargo_name,
    ct.category
FROM market_prices mp
JOIN cargo_types ct ON mp.cargo_type_id = ct.id
WHERE mp.price_date = (
    SELECT MAX(price_date)
    FROM market_prices mp2
    WHERE mp2.cargo_type_id = mp.cargo_type_id
    AND mp2.region = mp.region
);

-- Active deals with company details
CREATE VIEW active_deals_view AS
SELECT 
    d.*,
    buyer.name as buyer_name,
    seller.name as seller_name,
    broker.name as broker_name,
    ct.name as cargo_name,
    lp.name as loading_port_name,
    dp.name as discharge_port_name,
    v.name as vessel_name
FROM deals d
LEFT JOIN companies buyer ON d.buyer_company_id = buyer.id
LEFT JOIN companies seller ON d.seller_company_id = seller.id
LEFT JOIN companies broker ON d.broker_company_id = broker.id
LEFT JOIN cargo_types ct ON d.cargo_type_id = ct.id
LEFT JOIN ports lp ON d.loading_port_id = lp.id
LEFT JOIN ports dp ON d.discharge_port_id = dp.id
LEFT JOIN vessels v ON d.vessel_id = v.id
WHERE d.status IN ('pending', 'active', 'loading', 'transit');

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

DELIMITER //

-- Procedure to update vessel position
CREATE PROCEDURE UpdateVesselPosition(
    IN p_vessel_id INT,
    IN p_lat VARCHAR(50),
    IN p_lng VARCHAR(50),
    IN p_speed DECIMAL(5,2),
    IN p_course INT
)
BEGIN
    -- Update vessel current position
    UPDATE vessels 
    SET current_lat = p_lat, 
        current_lng = p_lng, 
        speed = p_speed, 
        course = p_course,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = p_vessel_id;
    
    -- Insert position history
    INSERT INTO vessel_positions (vessel_id, lat, lng, speed, course, timestamp)
    VALUES (p_vessel_id, p_lat, p_lng, p_speed, p_course, CURRENT_TIMESTAMP);
END //

-- Function to calculate distance between two points
CREATE FUNCTION CalculateDistance(
    lat1 DECIMAL(10,8),
    lng1 DECIMAL(11,8),
    lat2 DECIMAL(10,8),
    lng2 DECIMAL(11,8)
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE distance DECIMAL(10,2);
    SET distance = (
        6371 * ACOS(
            COS(RADIANS(lat1)) * 
            COS(RADIANS(lat2)) * 
            COS(RADIANS(lng2) - RADIANS(lng1)) + 
            SIN(RADIANS(lat1)) * 
            SIN(RADIANS(lat2))
        )
    );
    RETURN distance;
END //

DELIMITER ;

-- =====================================================
-- GRANTS AND SECURITY
-- =====================================================

-- Create database users with appropriate permissions
-- CREATE USER 'maritime_read'@'%' IDENTIFIED BY 'secure_password';
-- CREATE USER 'maritime_write'@'%' IDENTIFIED BY 'secure_password';
-- CREATE USER 'maritime_admin'@'%' IDENTIFIED BY 'secure_password';

-- Grant permissions
-- GRANT SELECT ON maritime_oil_brokerage.* TO 'maritime_read'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON maritime_oil_brokerage.* TO 'maritime_write'@'%';
-- GRANT ALL PRIVILEGES ON maritime_oil_brokerage.* TO 'maritime_admin'@'%';

-- =====================================================
-- DATABASE STATISTICS AND INFORMATION
-- =====================================================

SELECT 'Database created successfully!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'maritime_oil_brokerage';
SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'maritime_oil_brokerage' ORDER BY table_name;

-- =====================================================
-- END OF MYSQL DATABASE STRUCTURE
-- =====================================================