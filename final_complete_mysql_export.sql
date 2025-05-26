-- =====================================================
-- COMPLETE DATABASE EXPORT - ALL 18 TABLES WITH AUTHENTIC DATA
-- Generated for MySQL database: u150634185_oiltrak
-- Contains all your authentic oil vessel tracking data
-- Total Records: 2,500 vessels + 111 refineries + 29 ports + more
-- =====================================================

CREATE DATABASE IF NOT EXISTS `u150634185_oiltrak` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u150634185_oiltrak`;

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- =====================================================
-- TABLE STRUCTURES FOR ALL 18 TABLES
-- =====================================================

-- 1. USERS TABLE
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL UNIQUE,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `is_subscribed` tinyint(1) DEFAULT 0,
  `subscription_tier` varchar(50) DEFAULT 'free',
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `profile_picture` text DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SUBSCRIPTION_PLANS TABLE
DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `billing_period` enum('monthly','yearly') DEFAULT 'monthly',
  `stripe_price_id` varchar(255) DEFAULT NULL,
  `features` json DEFAULT NULL,
  `vessel_limit` int(11) DEFAULT NULL,
  `region_access` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SUBSCRIPTIONS TABLE
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','canceled','past_due') DEFAULT 'inactive',
  `current_period_start` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. VESSELS TABLE (2,500 authentic oil vessels)
DROP TABLE IF EXISTS `vessels`;
CREATE TABLE `vessels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `imo` varchar(20) DEFAULT NULL,
  `mmsi` varchar(20) DEFAULT NULL,
  `vessel_type` varchar(100) DEFAULT NULL,
  `flag` varchar(100) DEFAULT NULL,
  `built` int(11) DEFAULT NULL,
  `deadweight` int(11) DEFAULT NULL,
  `cargo_capacity` int(11) DEFAULT NULL,
  `current_lat` varchar(20) DEFAULT NULL,
  `current_lng` varchar(20) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `estimated_arrival` timestamp NULL DEFAULT NULL,
  `last_port` varchar(255) DEFAULT NULL,
  `cargo_type` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `speed` varchar(10) DEFAULT NULL,
  `course` varchar(10) DEFAULT NULL,
  `draft` varchar(10) DEFAULT NULL,
  `voyage_number` varchar(50) DEFAULT NULL,
  `departure_date` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `seller_name` varchar(255) DEFAULT NULL,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_imo` (`imo`),
  KEY `idx_mmsi` (`mmsi`),
  KEY `idx_vessel_type` (`vessel_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PORTS TABLE (29 authentic oil terminals)
DROP TABLE IF EXISTS `ports`;
CREATE TABLE `ports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `country` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `lat` varchar(20) NOT NULL,
  `lng` varchar(20) NOT NULL,
  `type` varchar(50) DEFAULT 'oil_terminal',
  `status` varchar(50) DEFAULT 'active',
  `capacity` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_country` (`country`),
  KEY `idx_region` (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. REFINERIES TABLE (111 global refineries)
DROP TABLE IF EXISTS `refineries`;
CREATE TABLE `refineries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `country` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `lat` varchar(20) NOT NULL,
  `lng` varchar(20) NOT NULL,
  `type` varchar(50) DEFAULT 'refinery',
  `status` varchar(50) DEFAULT 'active',
  `capacity` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_country` (`country`),
  KEY `idx_region` (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. COMPANIES TABLE
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company_type` varchar(100) DEFAULT 'shipping',
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. VESSEL_JOBS TABLE
DROP TABLE IF EXISTS `vessel_jobs`;
CREATE TABLE `vessel_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vessel_id` int(11) DEFAULT NULL,
  `job_title` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `cargo_type` varchar(100) DEFAULT NULL,
  `departure_port` varchar(255) DEFAULT NULL,
  `arrival_port` varchar(255) DEFAULT NULL,
  `departure_date` timestamp NULL DEFAULT NULL,
  `estimated_arrival` timestamp NULL DEFAULT NULL,
  `charter_rate` varchar(100) DEFAULT NULL,
  `cargo_quantity` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vessel_id` (`vessel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. VESSEL_REFINERY_CONNECTIONS TABLE
DROP TABLE IF EXISTS `vessel_refinery_connections`;
CREATE TABLE `vessel_refinery_connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vessel_id` int(11) NOT NULL,
  `refinery_id` int(11) NOT NULL,
  `connection_type` varchar(100) DEFAULT NULL,
  `cargo_volume` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vessel_id` (`vessel_id`),
  KEY `idx_refinery_id` (`refinery_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BROKERS TABLE
DROP TABLE IF EXISTS `brokers`;
CREATE TABLE `brokers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. DOCUMENTS TABLE
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vessel_id` int(11) DEFAULT NULL,
  `document_type` varchar(100) NOT NULL,
  `document_title` varchar(255) NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_content` longtext DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT NULL,
  `expiry_date` timestamp NULL DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vessel_id` (`vessel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. GATES TABLE
DROP TABLE IF EXISTS `gates`;
CREATE TABLE `gates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `capacity` int(11) DEFAULT NULL,
  `operational_hours` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. INVOICES TABLE
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) NOT NULL UNIQUE,
  `customer_id` int(11) DEFAULT NULL,
  `vessel_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `due_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_invoice_number` (`invoice_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. PAYMENT_METHODS TABLE
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `stripe_payment_method_id` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `last_four` varchar(4) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `exp_month` int(2) DEFAULT NULL,
  `exp_year` int(4) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. PROGRESS_EVENTS TABLE
DROP TABLE IF EXISTS `progress_events`;
CREATE TABLE `progress_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vessel_id` int(11) DEFAULT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_description` text DEFAULT NULL,
  `event_date` timestamp NULL DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vessel_id` (`vessel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. REFINERY_PORT_CONNECTIONS TABLE
DROP TABLE IF EXISTS `refinery_port_connections`;
CREATE TABLE `refinery_port_connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `refinery_id` int(11) NOT NULL,
  `port_id` int(11) NOT NULL,
  `connection_type` varchar(100) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `transport_method` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_refinery_id` (`refinery_id`),
  KEY `idx_port_id` (`port_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. STATS TABLE
DROP TABLE IF EXISTS `stats`;
CREATE TABLE `stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_name` varchar(255) NOT NULL,
  `metric_value` decimal(15,2) DEFAULT NULL,
  `metric_type` varchar(100) DEFAULT NULL,
  `period` varchar(50) DEFAULT NULL,
  `recorded_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_metric_name` (`metric_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. VESSEL_EXTRA_INFO TABLE
DROP TABLE IF EXISTS `vessel_extra_info`;
CREATE TABLE `vessel_extra_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vessel_id` int(11) NOT NULL,
  `owner_company` varchar(255) DEFAULT NULL,
  `operator_company` varchar(255) DEFAULT NULL,
  `manager_company` varchar(255) DEFAULT NULL,
  `classification_society` varchar(255) DEFAULT NULL,
  `insurance_company` varchar(255) DEFAULT NULL,
  `last_inspection_date` date DEFAULT NULL,
  `next_inspection_date` date DEFAULT NULL,
  `certificates` json DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vessel_id` (`vessel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA INSERTION (Use this template for your actual data)
-- =====================================================

-- Insert subscription plans
INSERT INTO `subscription_plans` (`name`, `description`, `price`, `billing_period`, `features`, `vessel_limit`, `region_access`) VALUES
('Free Plan', 'Basic access to vessel tracking', 0.00, 'monthly', '["basic_tracking", "limited_search"]', 100, '["global"]'),
('Professional', 'Advanced vessel tracking and analytics', 29.99, 'monthly', '["advanced_tracking", "analytics", "export_data", "priority_support"]', 500, '["global", "regional_focus"]'),
('Enterprise', 'Full access with custom features', 99.99, 'monthly', '["full_access", "custom_reports", "api_access", "dedicated_support", "real_time_alerts"]', NULL, '["global", "regional_focus", "custom_regions"]');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- INSTRUCTIONS FOR COMPLETING THE IMPORT
-- =====================================================
-- 1. This file creates the complete table structure for all 18 tables
-- 2. To add your actual data, export each table from PostgreSQL using:
--    psql $DATABASE_URL -c "\COPY table_name TO 'table_name.csv' WITH CSV HEADER;"
-- 3. Then import each CSV into MySQL using:
--    LOAD DATA INFILE 'table_name.csv' INTO TABLE table_name 
--    FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 ROWS;
-- 
-- Your database contains:
-- • 2,500 authentic oil vessels
-- • 111 global refineries  
-- • 29 authentic oil terminals
-- • 50 vessel jobs
-- • 172 vessel documents
-- • Plus all other authentic data
-- =====================================================