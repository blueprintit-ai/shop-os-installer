#!/bin/bash
set -e

# Shop OS Foundation — macOS Setup Script
# One command to install all prerequisites and Shop OS

echo "🚀 Shop OS Foundation — macOS Setup"
echo "=========================================="
echo ""
echo "This script will install:"
echo "  • Homebrew (if needed)"
echo "  • Node.js"
echo "  • Claude Code"
echo "  • Obsidian"
echo "  • Shop OS Vault + Installer"
echo ""
echo "You'll be prompted for your license key after prerequisites are installed."
echo ""

# 1. Check/install Homebrew
if ! command -v brew &> /dev/null; then
  echo "📦 Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv)"
else
  echo "✓ Homebrew found"
fi

# 2. Check/install Node.js
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js via Homebrew..."
  brew install node
else
  echo "✓ Node.js found"
fi

# 3. Check/install Claude Code
if ! [ -d ~/.claude ]; then
  echo "📦 Installing Claude Code..."
  curl -fsSL https://claude.ai/install.sh | bash
else
  echo "✓ Claude Code found"
fi

# 4. Check/install Obsidian
if ! command -v obsidian &> /dev/null && ! [ -d /Applications/Obsidian.app ]; then
  echo "📦 Installing Obsidian via Homebrew..."
  brew install --cask obsidian
else
  echo "✓ Obsidian found"
fi

# 5. Run Shop OS installer
echo ""
echo "=========================================="
echo "✨ Prerequisites complete!"
echo ""
echo "Next: Running Shop OS installer..."
echo ""

npx -y @blueprintit/shop-os-install

echo ""
echo "=========================================="
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. If this is your first time, sign in to Claude Code (you'll be prompted)"
echo "  2. Open your Shop OS Vault folder in Obsidian"
echo "  3. Run /os-setup in Claude Code to personalize your vault"
echo ""
