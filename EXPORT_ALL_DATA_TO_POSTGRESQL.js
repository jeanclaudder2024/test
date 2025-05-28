/**
 * COMPLETE DATA EXPORT TO POSTGRESQL FORMAT
 * This script exports ALL your authentic oil vessel tracking data
 * and generates PostgreSQL-compatible INSERT statements
 */

import fs from 'fs';
import path from 'path';

// Use the MySQL database connection from your current setup
import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306,
  ssl: false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

async function exportAllDataToPostgreSQL() {
  let connection;
  
  try {
    console.log('🔗 Connecting to your MySQL database...');
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected successfully!');
    
    // Get all table names
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables with your data`);
    
    let sqlOutput = '';
    sqlOutput += '-- =====================================================\n';
    sqlOutput += '-- COMPLETE DATA EXPORT FROM YOUR OIL VESSEL TRACKING DATABASE\n';
    sqlOutput += '-- Generated: ' + new Date().toISOString() + '\n';
    sqlOutput += '-- =====================================================\n\n';
    
    // Export each table's data
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      try {
        console.log(`📋 Exporting ${tableName}...`);
        
        const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
        
        if (rows.length === 0) {
          sqlOutput += `-- Table ${tableName} is empty\n\n`;
          continue;
        }
        
        sqlOutput += `-- =====================================================\n`;
        sqlOutput += `-- TABLE: ${tableName} (${rows.length} records)\n`;
        sqlOutput += `-- =====================================================\n`;
        
        if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          
          // Create INSERT statements
          sqlOutput += `DELETE FROM ${tableName}; -- Clear existing data\n`;
          
          for (let i = 0; i < rows.length; i += 100) { // Process in batches of 100
            const batch = rows.slice(i, i + 100);
            
            sqlOutput += `INSERT INTO ${tableName} (${columns.map(col => `"${col}"`).join(', ')}) VALUES\n`;
            
            const values = batch.map(row => {
              const rowValues = columns.map(col => {
                const value = row[col];
                if (value === null) return 'NULL';
                if (typeof value === 'string') {
                  return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
                }
                if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
                if (value instanceof Date) return `'${value.toISOString()}'`;
                if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                return value;
              });
              return `(${rowValues.join(', ')})`;
            });
            
            sqlOutput += values.join(',\n');
            sqlOutput += ';\n\n';
          }
        }
        
        console.log(`✅ Exported ${rows.length} records from ${tableName}`);
        
      } catch (error) {
        console.log(`⚠️  Error exporting ${tableName}:`, error.message);
        sqlOutput += `-- Error exporting ${tableName}: ${error.message}\n\n`;
      }
    }
    
    // Add final notes
    sqlOutput += '-- =====================================================\n';
    sqlOutput += '-- EXPORT COMPLETE!\n';
    sqlOutput += '-- Your authentic oil vessel tracking data is ready\n';
    sqlOutput += '-- =====================================================\n';
    
    // Write to file
    const outputFile = 'COMPLETE_POSTGRESQL_DATA_EXPORT.sql';
    fs.writeFileSync(outputFile, sqlOutput);
    
    console.log('🎉 Export completed successfully!');
    console.log(`📁 Data exported to: ${outputFile}`);
    console.log('📊 Your complete database is ready for PostgreSQL import');
    
    // Also create a summary
    const [vesselCount] = await connection.execute('SELECT COUNT(*) as count FROM vessels');
    const [refineryCount] = await connection.execute('SELECT COUNT(*) as count FROM refineries');
    const [portCount] = await connection.execute('SELECT COUNT(*) as count FROM ports');
    const [documentCount] = await connection.execute('SELECT COUNT(*) as count FROM documents');
    const [companyCount] = await connection.execute('SELECT COUNT(*) as count FROM companies');
    
    console.log('\n📊 YOUR DATA SUMMARY:');
    console.log(`✓ ${vesselCount[0].count} authentic oil vessels`);
    console.log(`✓ ${refineryCount[0].count} global refineries`);
    console.log(`✓ ${portCount[0].count} oil terminals and ports`);
    console.log(`✓ ${documentCount[0].count} vessel documents`);
    console.log(`✓ ${companyCount[0].count} oil shipping companies`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the export
exportAllDataToPostgreSQL();