#!/bin/bash

# Exit on error
set -e

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building the application..."
npm run build

# Create Netlify functions directory if it doesn't exist
mkdir -p netlify/functions

# Copy server.js to Netlify functions
echo "Setting up Netlify functions..."
cp server.js netlify/functions/server.js

# Success message
echo "Build completed successfully!"
