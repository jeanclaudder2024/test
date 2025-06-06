import express from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

const router = express.Router();

// Create missing database tables
router.post("/api/setup-tables", async (req, res) => {
  try {
    console.log("Creating missing database tables...");

    // Create oil_types table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS oil_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        category TEXT NOT NULL,
        api_gravity DECIMAL(5,2),
        sulfur_content DECIMAL(5,3),
        viscosity DECIMAL(8,2),
        density DECIMAL(8,4),
        flash_point INTEGER,
        pour_point INTEGER,
        market_price DECIMAL(10,2),
        price_unit TEXT DEFAULT 'barrel',
        description TEXT,
        common_uses TEXT,
        major_producers TEXT,
        trading_symbol TEXT,
        hs_code TEXT,
        un_class TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create vessel_documents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vessel_documents (
        id SERIAL PRIMARY KEY,
        vessel_id INTEGER REFERENCES vessels(id),
        document_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        file_path TEXT,
        file_size INTEGER,
        mime_type TEXT,
        version TEXT DEFAULT '1.0',
        status TEXT DEFAULT 'draft',
        is_required BOOLEAN DEFAULT false,
        expiry_date TIMESTAMP,
        created_by TEXT,
        approved_by TEXT,
        approved_at TIMESTAMP,
        tags TEXT,
        metadata TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert sample oil types
    await db.execute(sql`
      INSERT INTO oil_types (name, display_name, category, api_gravity, sulfur_content, market_price, description, trading_symbol) VALUES
      ('brent_crude', 'Brent Crude Oil', 'crude', 38.06, 0.37, 85.50, 'Light sweet crude oil from North Sea', 'BRENT'),
      ('wti_crude', 'West Texas Intermediate', 'crude', 39.6, 0.24, 82.75, 'Light sweet crude oil benchmark', 'WTI'),
      ('dubai_crude', 'Dubai Crude Oil', 'crude', 31.0, 2.0, 80.25, 'Medium sour crude oil from Middle East', 'DUBAI'),
      ('gasoline', 'Gasoline', 'refined', 60.0, 0.001, 95.30, 'Motor gasoline for automotive use', 'RBOB'),
      ('diesel', 'Diesel Fuel', 'refined', 35.0, 0.005, 90.15, 'Diesel fuel for transportation and heating', 'ULSD'),
      ('jet_fuel', 'Jet Fuel', 'refined', 43.0, 0.003, 88.90, 'Aviation turbine fuel', 'JET'),
      ('fuel_oil', 'Heavy Fuel Oil', 'refined', 15.0, 3.5, 65.40, 'Heavy fuel oil for marine and power generation', 'HFO'),
      ('lng', 'Liquefied Natural Gas', 'lng', NULL, NULL, 12.50, 'Natural gas in liquid form for transport', 'LNG'),
      ('lpg', 'Liquefied Petroleum Gas', 'lpg', NULL, NULL, 85.75, 'Propane and butane mixture', 'LPG'),
      ('naphtha', 'Naphtha', 'petrochemical', 65.0, 0.001, 87.20, 'Light hydrocarbon mixture for petrochemicals', 'NAPHTHA')
      ON CONFLICT (name) DO NOTHING
    `);

    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_oil_types_category ON oil_types(category);
      CREATE INDEX IF NOT EXISTS idx_oil_types_active ON oil_types(is_active);
      CREATE INDEX IF NOT EXISTS idx_vessel_documents_vessel_id ON vessel_documents(vessel_id);
      CREATE INDEX IF NOT EXISTS idx_vessel_documents_type ON vessel_documents(document_type);
      CREATE INDEX IF NOT EXISTS idx_vessel_documents_status ON vessel_documents(status);
    `);

    console.log("Database tables created successfully");

    res.json({
      success: true,
      message: "Database tables created successfully",
      tables: ["oil_types", "vessel_documents"]
    });

  } catch (error) {
    console.error("Error creating database tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create database tables",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as databaseSetupRouter };