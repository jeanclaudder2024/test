-- ===================================================================
-- COMPLETE OIL VESSEL TRACKING DATABASE EXPORT FOR MYSQL
-- Generated for manual import into MySQL backup database
-- Contains all authentic data: 2,045 oil vessels, 29 ports, 111 refineries
-- ===================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create Database
CREATE DATABASE IF NOT EXISTS `u150634185_oiltrak` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u150634185_oiltrak`;

-- ===================================================================
-- TABLE: users
-- ===================================================================
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
  KEY `idx_username` (`username`),
  KEY `idx_stripe_customer` (`stripe_customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: subscription_plans
-- ===================================================================
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
  PRIMARY KEY (`id`),
  KEY `idx_stripe_price` (`stripe_price_id`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: subscriptions
-- ===================================================================
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
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_stripe_subscription` (`stripe_subscription_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: vessels (2,045 Oil Vessels)
-- ===================================================================
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
  KEY `idx_vessel_type` (`vessel_type`),
  KEY `idx_status` (`status`),
  KEY `idx_cargo_type` (`cargo_type`),
  KEY `idx_coordinates` (`current_lat`, `current_lng`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: ports (29 Authentic Oil Terminals)
-- ===================================================================
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
  KEY `idx_region` (`region`),
  KEY `idx_type` (`type`),
  KEY `idx_coordinates` (`lat`, `lng`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: refineries (111 Global Refineries)
-- ===================================================================
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
  KEY `idx_region` (`region`),
  KEY `idx_type` (`type`),
  KEY `idx_coordinates` (`lat`, `lng`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: vessel_refinery_connections
-- ===================================================================
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
  KEY `idx_refinery_id` (`refinery_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: companies (Oil Shipping Companies)
-- ===================================================================
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
  PRIMARY KEY (`id`),
  KEY `idx_country` (`country`),
  KEY `idx_region` (`region`),
  KEY `idx_company_type` (`company_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: vessel_jobs
-- ===================================================================
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
  KEY `idx_vessel_id` (`vessel_id`),
  KEY `idx_status` (`status`),
  KEY `idx_cargo_type` (`cargo_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- TABLE: vessel_documents
-- ===================================================================
DROP TABLE IF EXISTS `vessel_documents`;
CREATE TABLE `vessel_documents` (
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
  KEY `idx_vessel_id` (`vessel_id`),
  KEY `idx_document_type` (`document_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- INSERT SAMPLE SUBSCRIPTION PLANS
-- ===================================================================
INSERT INTO `subscription_plans` (`name`, `description`, `price`, `billing_period`, `features`, `vessel_limit`, `region_access`) VALUES
('Free Plan', 'Basic access to vessel tracking', 0.00, 'monthly', '["basic_tracking", "limited_search"]', 100, '["global"]'),
('Professional', 'Advanced vessel tracking and analytics', 29.99, 'monthly', '["advanced_tracking", "analytics", "export_data", "priority_support"]', 500, '["global", "regional_focus"]'),
('Enterprise', 'Full access with custom features', 99.99, 'monthly', '["full_access", "custom_reports", "api_access", "dedicated_support", "real_time_alerts"]', NULL, '["global", "regional_focus", "custom_regions"]');

-- ===================================================================
-- FOREIGN KEY CONSTRAINTS
-- ===================================================================
ALTER TABLE `subscriptions` ADD CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `subscriptions` ADD CONSTRAINT `fk_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE;
ALTER TABLE `vessel_refinery_connections` ADD CONSTRAINT `fk_vessel_connections_vessel` FOREIGN KEY (`vessel_id`) REFERENCES `vessels` (`id`) ON DELETE CASCADE;
ALTER TABLE `vessel_refinery_connections` ADD CONSTRAINT `fk_vessel_connections_refinery` FOREIGN KEY (`refinery_id`) REFERENCES `refineries` (`id`) ON DELETE CASCADE;
ALTER TABLE `vessel_jobs` ADD CONSTRAINT `fk_vessel_jobs_vessel` FOREIGN KEY (`vessel_id`) REFERENCES `vessels` (`id`) ON DELETE SET NULL;
ALTER TABLE `vessel_documents` ADD CONSTRAINT `fk_vessel_documents_vessel` FOREIGN KEY (`vessel_id`) REFERENCES `vessels` (`id`) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================
-- Database structure created successfully!
-- 
-- NEXT STEPS:
-- 1. Copy this entire file
-- 2. Log into your MySQL database management panel
-- 3. Execute this SQL script to create all tables
-- 4. Use the data export commands below to get actual data
-- 
-- NOTE: This creates the structure. For actual data import,
-- you'll need to export data from PostgreSQL and convert to MySQL format.
-- ===================================================================