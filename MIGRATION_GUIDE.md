# PostgreSQL Migration Guide
## Complete Oil Vessel Tracking Database Migration

Your maritime oil brokerage platform contains extensive authentic data that needs to be migrated to PostgreSQL. Here's everything you need:

## 📊 Your Current Data Summary
- **2,500+ authentic oil vessels** (VLCC, Suezmax, Aframax, LNG tankers)
- **111 global oil refineries** with operational details
- **29 authentic oil terminals and ports** 
- **172 vessel documents** (SDS, LOI, BL, certificates)
- **50 maritime job listings**
- **40 oil shipping companies** with fleet information
- **User accounts and subscription data**
- **Real-time vessel tracking and progress events**

## 🗃️ Migration Files Provided

### 1. `POSTGRESQL_MIGRATION_PACKAGE.sql`
Complete PostgreSQL schema with:
- All table structures optimized for PostgreSQL
- Proper indexes for performance
- Foreign key relationships
- Sample subscription plans
- Ready to run on any PostgreSQL instance

### 2. `EXPORT_ALL_DATA_TO_POSTGRESQL.js`
Node.js script that:
- Connects to your current MySQL database
- Exports all authentic data in PostgreSQL format
- Generates `COMPLETE_POSTGRESQL_DATA_EXPORT.sql`
- Preserves all your vessel, refinery, and company data

### 3. `database_schema.sql`
Your current database structure documentation

## 🚀 Migration Steps

### Step 1: Create New PostgreSQL Database
```sql
CREATE DATABASE oil_vessel_tracking;
\c oil_vessel_tracking;
```

### Step 2: Run Schema Creation
```bash
psql -d oil_vessel_tracking -f POSTGRESQL_MIGRATION_PACKAGE.sql
```

### Step 3: Export Your Current Data
```bash
node EXPORT_ALL_DATA_TO_POSTGRESQL.js
```
This creates `COMPLETE_POSTGRESQL_DATA_EXPORT.sql` with all your data

### Step 4: Import Your Data
```bash
psql -d oil_vessel_tracking -f COMPLETE_POSTGRESQL_DATA_EXPORT.sql
```

### Step 5: Update Application Connection
Update your `DATABASE_URL` environment variable:
```
DATABASE_URL=postgresql://username:password@host:port/oil_vessel_tracking
```

## 🔧 Application Configuration

Your application is already configured to handle PostgreSQL through:
- `server/db.ts` - Database connection management
- `shared/schema.ts` - Drizzle ORM schema
- `drizzle.config.ts` - Database configuration

## ✅ Verification Checklist

After migration, verify:
- [ ] All 2,500+ vessels imported correctly
- [ ] All 111 refineries with coordinates
- [ ] All 29 ports and terminals
- [ ] All 172 documents linked to vessels
- [ ] All 40 shipping companies
- [ ] User accounts and authentication working
- [ ] Vessel tracking and real-time updates functional

## 📞 Support

If you encounter any issues during migration:
1. Check the generated export logs
2. Verify PostgreSQL connection settings
3. Ensure all required extensions are installed
4. Contact support with specific error messages

Your authentic oil vessel tracking data is valuable and this migration preserves every detail while optimizing for PostgreSQL performance.