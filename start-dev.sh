#!/bin/bash

# MetalSense Development Startup Script

echo "🚀 Starting MetalSense Development Environment"

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to start Python service
start_python_service() {
    echo "🐍 Starting Python Environmental Calculations Service..."
    cd python-service
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "📦 Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Start the service
    echo "🌟 Starting Python service on port 8001..."
    python main.py &
    PYTHON_PID=$!
    echo "Python service PID: $PYTHON_PID" > ../python_service.pid
    cd ..
}

# Function to start Node.js services
start_node_services() {
    echo "🟢 Starting Node.js services..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing Node.js dependencies..."
        npm install
    fi
    
    # Start development servers
    echo "🌟 Starting development servers..."
    npm run dev &
    NODE_PID=$!
    echo "Node services PID: $NODE_PID" > node_services.pid
}

# Check if Python service is already running
if check_port 8001; then
    echo "⚠️  Python service already running on port 8001"
else
    start_python_service
fi

# Check if Node.js services are already running
if check_port 5173 || check_port 4000; then
    echo "⚠️  Node.js services already running"
else
    start_node_services
fi

echo "✅ All services started!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:4000" 
echo "🐍 Python API: http://localhost:8001"
echo "📊 Python API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "🛑 Stopping services..."; kill $(cat python_service.pid node_services.pid 2>/dev/null) 2>/dev/null; rm -f python_service.pid node_services.pid; exit' INT
wait
