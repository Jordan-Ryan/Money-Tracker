#!/bin/bash

# Personal Finance Tracker - GitHub Pages Deployment Script

echo "🚀 Starting deployment to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ Error: Build failed. Check for errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
npm run deploy

echo "🎉 Deployment completed!"
echo "📱 Your app should be available at: https://yourusername.github.io/your-repo-name"
echo "⚠️  Don't forget to:"
echo "   1. Update the homepage URL in package.json"
echo "   2. Configure GitHub Pages in your repository settings"
echo "   3. Select 'gh-pages' branch as source"