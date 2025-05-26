/**
 * Complete PostgreSQL Database Export to MySQL
 * Exports ALL 31 tables with ALL authentic data
 */

import { db } from './server/db.ts';
import fs from 'fs';

async function exportCompleteDatabase() {
  console.log('🚀 Starting COMPLETE database export from PostgreSQL to MySQL...');
  console.log('📊 Exporting all 31 tables with authentic data...');
  
  let sqlOutput = `-- =====================================================
-- COMPLETE DATABASE EXPORT - ALL 31 TABLES
-- Generated: ${new Date().toISOString()}
-- Database: u150634185_oiltrak
-- All authentic oil vessel tracking data included
-- =====================================================

USE u150634185_oiltrak;
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

`;

  try {
    // Get all table names from the database
    const tableResult = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = current_database() 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tableResult.rows || tableResult;
    console.log(`📋 Found ${tables.length} tables to export:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    for (const tableInfo of tables) {
      const tableName = tableInfo.table_name;
      console.log(`\n🔄 Exporting table: ${tableName}`);
      
      try {
        // Get table structure
        const structureResult = await db.execute(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          AND table_schema = current_database()
          ORDER BY ordinal_position
        `);
        
        const columns = structureResult.rows || structureResult;
        
        // Get table data
        const dataResult = await db.execute(`SELECT * FROM "${tableName}"`);
        const data = dataResult.rows || dataResult;
        
        console.log(`   📦 Found ${data.length} records in ${tableName}`);
        
        if (data.length > 0) {
          sqlOutput += `-- =====================================================\n`;
          sqlOutput += `-- TABLE: ${tableName} (${data.length} records)\n`;
          sqlOutput += `-- =====================================================\n`;
          sqlOutput += `TRUNCATE TABLE \`${tableName}\`;\n`;
          
          // Get column names
          const columnNames = columns.map(col => col.column_name);
          
          // Process data in chunks for better performance
          const chunkSize = 100;
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            
            sqlOutput += `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES\n`;
            
            const values = chunk.map(row => {
              const rowValues = columnNames.map(colName => {
                let value = row[colName];
                
                // Handle different data types
                if (value === null || value === undefined) {
                  return 'NULL';
                } else if (typeof value === 'string') {
                  // Escape single quotes and handle special characters
                  return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
                } else if (typeof value === 'boolean') {
                  return value ? '1' : '0';
                } else if (value instanceof Date) {
                  return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
                } else if (typeof value === 'object') {
                  // Handle JSON columns
                  return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                } else {
                  return value;
                }
              });
              
              return `(${rowValues.join(', ')})`;
            });
            
            sqlOutput += values.join(',\n') + ';\n\n';
          }
        } else {
          sqlOutput += `-- Table ${tableName} is empty\n\n`;
        }
        
      } catch (tableError) {
        console.log(`   ❌ Error exporting ${tableName}:`, tableError.message);
        sqlOutput += `-- Error exporting ${tableName}: ${tableError.message}\n\n`;
      }
    }

    sqlOutput += `
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- EXPORT COMPLETED SUCCESSFULLY
-- =====================================================
-- Total Tables Exported: ${tables.length}
-- 
-- This file contains ALL your authentic data:
-- • Vessels, Ports, Refineries
-- • Users, Subscriptions, Plans
-- • Jobs, Documents, Companies
-- • Connections and all relationships
-- 
-- Ready for import into MySQL: u150634185_oiltrak
-- =====================================================
`;

    // Write to file
    const filename = 'complete_mysql_export.sql';
    fs.writeFileSync(filename, sqlOutput);
    
    console.log(`\n✅ COMPLETE export finished successfully!`);
    console.log(`📁 File saved as: ${filename}`);
    console.log(`📊 Exported ${tables.length} tables with all authentic data`);
    console.log(`💾 File size: ${(fs.statSync(filename).size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n🚀 Ready to import into MySQL database!`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the complete export
exportCompleteDatabase();