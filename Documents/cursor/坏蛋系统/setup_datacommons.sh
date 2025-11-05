#!/bin/bash

# Data Commons MCP Server Setup Script for Bad Egg System
# This script sets up the Data Commons integration

set -e

echo "🔧 Setting up Data Commons MCP Server for Bad Egg System..."

# Check if we're in the right directory
if [ ! -f "datacommons_mcp_server.py" ]; then
    echo "❌ Error: datacommons_mcp_server.py not found. Please run this script from the Bad Egg System directory."
    exit 1
fi

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed."
    exit 1
fi

# Check pip installation
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "❌ Error: pip is required but not installed."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    pip install -r requirements.txt
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Set up environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating environment configuration file..."
    cat > .env << EOF
# Data Commons Configuration
# Get your API key from: https://datacommons.org/api
DATACOMMONS_API_KEY=

# Bad Egg System Configuration
BAD_EGG_ENV=development
LOG_LEVEL=info
EOF
    echo "✅ Created .env file. Please add your Data Commons API key if you have one."
else
    echo "ℹ️  .env file already exists."
fi

# Test the installation
echo "🧪 Testing Data Commons MCP Server..."
python3 datacommons_mcp_server.py > logs/datacommons_test.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Data Commons MCP Server setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Optional: Add your Data Commons API key to .env file"
    echo "2. Add the MCP server to your Claude Code configuration"
    echo "3. Run the integration demo: python3 bad_egg_datacommons_integration.py"
    echo ""
    echo "📖 Documentation: README_DataCommons_MCP.md"
else
    echo "❌ Error during setup. Check logs/datacommons_test.log for details."
    exit 1
fi

echo ""
echo "🚀 Data Commons integration is ready for Bad Egg System!"