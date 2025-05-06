#!/bin/bash

# This script helps migrate the database schema to Supabase
# Usage: ./migrate-to-supabase.sh

echo "This script will help migrate the database schema to Supabase"
echo "Note: You need to run this script in the Supabase SQL Editor to create all the tables properly"

# Check if we have the Supabase URL and Key available
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "WARNING: SUPABASE_URL or SUPABASE_KEY environment variables are not set."
  echo "You will need to manually run the SQL in the Supabase SQL Editor."
fi

echo ""
echo "======== INSTRUCTIONS ========"
echo "1. Open your Supabase project at https://app.supabase.com"
echo "2. Go to the SQL Editor in the left sidebar"
echo "3. Create a New Query"
echo "4. Copy the SQL from the supabase-schema.sql file in this project"
echo "5. Paste it into the SQL Editor and run the query"
echo "6. Once tables are created, make sure to enable row-level security (RLS) with appropriate policies"
echo "============================="
echo ""
echo "Once the schema is created, you can continue with the data migration process."
echo "The database connection setup has been configured for Supabase in server/db.ts"
echo ""

# Check if the SQL file exists
if [ -f "supabase-schema.sql" ]; then
  echo "The Supabase schema SQL file exists. You can use this for creating the tables."
else
  echo "ERROR: supabase-schema.sql file is missing. Please create it first."
  exit 1
fi

# Instructions for data migration
echo "======== DATA MIGRATION ========"
echo "After schema creation, start the server to begin data migration."
echo "The application will attempt to migrate data automatically when tables are detected."
echo "You can monitor the migration progress in the server logs."
echo "==============================="