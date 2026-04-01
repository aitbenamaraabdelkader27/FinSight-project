#!/bin/bash
# FinSight Setup Script

echo "==================================="
echo "   FinSight - Quick Setup"
echo "==================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python not found. Please install Python 3.9+"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Installing dependencies..."
source venv/bin/activate
pip install -q python-dotenv requests

# Check for Ollama
echo ""
echo "==================================="
echo "   Ollama Setup"
echo "==================================="

if command -v ollama &> /dev/null; then
    echo "Ollama is installed"
    
    # Check if model exists
    if ollama list | grep -q llama3; then
        echo "Llama 3 model found"
    else
        echo "Pulling Llama 3 model..."
        ollama pull llama3
    fi
    
    echo ""
    echo "Setup complete!"
    echo ""
    echo "To run FinSight:"
    echo "  1. Start Ollama: ollama serve"
    echo "  2. Run bot:     python src/main.py"
    echo ""
else
    echo "Ollama not installed"
    echo ""
    echo "To install Ollama, run:"
    echo "  curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    echo "Then run this script again."
fi
