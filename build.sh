#!/bin/bash
# Build script for Render deployment

echo "🚀 Building AidLocator for production..."

# Install dependencies
npm install

# Build the React app
npm run build

echo "✅ Build completed successfully!"