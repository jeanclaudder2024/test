#!/bin/bash

echo "Building Oil Vessel Tracking Platform for Hostinger..."

# Create dist directory for frontend build
mkdir -p dist

# Copy essential frontend files
cp -r client/src dist/
cp client/index.html dist/
cp -r client/public dist/

# Build frontend with vite
echo "Building frontend..."
npx vite build --outDir dist

# Compile TypeScript server files
echo "Compiling server..."
npx tsc server/index.ts --outDir server --target es2020 --module commonjs --esModuleInterop true --allowSyntheticDefaultImports true

echo "Deployment files ready!"
echo "Upload the entire hostinger-deployment folder to your hosting provider."