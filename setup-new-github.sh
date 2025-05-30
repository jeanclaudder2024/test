#!/bin/bash
# Script to disconnect from old GitHub repository and connect to new one

echo "🔄 Removing old GitHub connection..."
git remote remove origin

echo "📝 Please enter your new GitHub repository URL:"
echo "Example: https://github.com/yourusername/your-new-repo-name.git"
read -p "New repository URL: " NEW_REPO_URL

echo "🔗 Adding new GitHub repository..."
git remote add origin "$NEW_REPO_URL"

echo "📤 Pushing to new repository..."
git add .
git commit -m "Clean oil vessel tracking platform ready for deployment"
git branch -M main
git push -u origin main

echo "✅ Successfully connected to new GitHub repository!"
echo "🚀 Now you can deploy to Render using this repository."