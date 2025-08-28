#!/bin/bash
set -e

echo "Installing server dependencies..."
npm install

echo "Building shared package..."
cd ../shared
npm install
npm run build

echo "Building server..."
cd ../server
npm run build

echo "Build complete!"