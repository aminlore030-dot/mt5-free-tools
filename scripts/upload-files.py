#!/usr/bin/env python3
"""
MT5 Free Tools - Automatic Binary File Upload Script
Usage: python3 upload-files.py [--commit-message "Your message"]
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def run_command(cmd, check=True):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except subprocess.CalledProcessError as e:
        return e.returncode, e.stdout, e.stderr

def main():
    parser = argparse.ArgumentParser(description='Upload binary files to MT5 Free Tools repository')
    parser.add_argument('--commit-message', default='feat: add binary files and preview images',
                       help='Custom commit message')
    args = parser.parse_args()
    
    print("\n🚀 MT5 Free Tools - Binary Upload Script")
    print("="*50)
    
    # Check if in git repo
    if not Path('.git').exists():
        print("❌ Not in a Git repository. Please run from the root of mt5-free-tools.")
        sys.exit(1)
    
    # Configure git
    print("⚙️  Configuring Git...")
    run_command('git config --local user.email "auto-upload@mt5-tools.local"')
    run_command('git config --local user.name "MT5 Tools Upload Bot"')
    
    # Create directories
    print("📁 Creating directory structure...")
    dirs = [
        'products/ea/fibo-auto',
        'products/ea/scalper-execution',
        'products/indicators/fvg-mtf-pro',
        'products/indicators/multi-theme-candle',
    ]
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)
    
    # Files to copy
    files_to_copy = [
        ('fibo.auto.ex5', 'products/ea/fibo-auto/fibo.auto.ex5'),
        ('FVG_MTF_Pro_v4.ex5', 'products/indicators/fvg-mtf-pro/FVG_MTF_Pro_v4.ex5'),
        ('MultiThemeCandleAndBG.ex5', 'products/indicators/multi-theme-candle/MultiThemeCandleAndBG.ex5'),
        ('fibo.auto.png', 'products/ea/fibo-auto/preview.png'),
        ('FVG_MTF_Pro_v4.png', 'products/indicators/fvg-mtf-pro/preview.png'),
        ('MultiThemeCandleAndBG.png', 'products/indicators/multi-theme-candle/preview.png'),
        ('ScalperExecutionPanel.png', 'products/ea/scalper-execution/preview.png'),
    ]
    
    # Copy files
    print("\n📦 Copying product files...")
    copied_count = 0
    for src, dst in files_to_copy:
        if Path(src).exists():
            os.makedirs(Path(dst).parent, exist_ok=True)
            os.system(f'cp "{src}" "{dst}"')
            print(f"✅ {src} -> {dst}")
            copied_count += 1
        else:
            print(f"⚠️  Not found: {src}")
    
    if copied_count == 0:
        print("\n❌ No files found to copy!")
        sys.exit(1)
    
    # Git operations
    print("\n📝 Committing changes...")
    run_command('git add products/')
    
    returncode, stdout, stderr = run_command('git diff --cached --quiet', check=False)
    
    if returncode == 0:
        print("ℹ️  No changes to commit.")
    else:
        run_command(f'git commit -m "{args.commit_message}"')
        print("✅ Changes committed!")
        
        print("\n🌐 Pushing to GitHub...")
        returncode, stdout, stderr = run_command('git push origin main', check=False)
        
        if returncode == 0:
            print("✅ Push successful! Files are now on GitHub.")
        else:
            print("⚠️  Push failed. Check your connection.")
            print(stderr)
            sys.exit(1)
    
    print("\n✨ Done!")
    print("\n📊 Latest commits:")
    run_command('git log --oneline -3')

if __name__ == '__main__':
    main()
