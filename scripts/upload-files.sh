#!/bin/bash

# MT5 Free Tools - Binary File Upload Script
# This script automatically uploads binary files to the repository

set -e

echo "🚀 MT5 Free Tools - Binary Upload Script"
echo "========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Not in a Git repository. Please run this script from the root of mt5-free-tools."
    exit 1
fi

# Configure git
echo "⚙️ Configuring Git..."
git config --local user.email "auto-upload@mt5-tools.local"
git config --local user.name "MT5 Tools Upload Bot"

# Create directories
echo "📁 Creating directory structure..."
mkdir -p products/ea/fibo-auto
mkdir -p products/ea/scalper-execution
mkdir -p products/indicators/fvg-mtf-pro
mkdir -p products/indicators/multi-theme-candle

# Function to copy file with verification
copy_file() {
    local source=$1
    local destination=$2
    
    if [ -f "$source" ]; then
        cp "$source" "$destination"
        echo "✅ Copied: $source -> $destination"
    else
        echo "⚠️  File not found: $source"
    fi
}

# Copy binary files
echo ""
echo "📦 Copying product files..."
copy_file "fibo.auto.ex5" "products/ea/fibo-auto/fibo.auto.ex5"
copy_file "FVG_MTF_Pro_v4.ex5" "products/indicators/fvg-mtf-pro/FVG_MTF_Pro_v4.ex5"
copy_file "MultiThemeCandleAndBG.ex5" "products/indicators/multi-theme-candle/MultiThemeCandleAndBG.ex5"

# Copy preview images
echo ""
echo "🎨 Copying preview images..."
copy_file "fibo.auto.png" "products/ea/fibo-auto/preview.png"
copy_file "FVG_MTF_Pro_v4.png" "products/indicators/fvg-mtf-pro/preview.png"
copy_file "MultiThemeCandleAndBG.png" "products/indicators/multi-theme-candle/preview.png"
copy_file "ScalperExecutionPanel.png" "products/ea/scalper-execution/preview.png"

# Add and commit
echo ""
echo "📝 Committing changes..."
git add products/

if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit."
else
    git commit -m "feat: add binary files and preview images - automated upload"
    echo "✅ Changes committed successfully!"
    
    # Push to remote
    echo ""
    echo "🌐 Pushing to GitHub..."
    if git push origin main; then
        echo "✅ Push successful! Files are now on GitHub."
    else
        echo "⚠️  Push failed. Please check your internet connection and try again."
        exit 1
    fi
fi

echo ""
echo "✨ Done! All files have been uploaded."
echo ""
echo "📊 Repository status:"
git log --oneline -3
