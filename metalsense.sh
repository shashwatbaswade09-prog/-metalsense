#!/bin/bash

# MetalSense Development Helper Script
# Monorepo Edition

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[MetalSense]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[MetalSense]${NC} $1"
}

error() {
    echo -e "${RED}[MetalSense]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)
    
    if [ "$major_version" -lt 18 ]; then
        error "Node.js version $node_version is not supported. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    log "✅ Node.js $node_version detected"
}

# Install all dependencies
install_deps() {
    log "Installing dependencies for all workspaces..."
    cd "$SCRIPT_DIR"
    npm run install:all
    log "✅ All dependencies installed"
}

# Start development servers
start_dev() {
    log "Starting development servers..."
    cd "$SCRIPT_DIR"
    
    # Check if servers are already running
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        warn "Backend appears to be running on port 3001"
    fi
    
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        warn "Frontend appears to be running on port 5173"
    fi
    
    log "Starting both frontend and backend..."
    npm run dev
}

# Start individual services
start_backend() {
    log "Starting backend server..."
    cd "$SCRIPT_DIR"
    npm run dev:backend
}

start_frontend() {
    log "Starting frontend development server..."
    cd "$SCRIPT_DIR"
    npm run dev:frontend
}

# Build for production
build() {
    log "Building for production..."
    cd "$SCRIPT_DIR"
    npm run build
    log "✅ Build completed"
}

# Run tests
test() {
    log "Running tests..."
    cd "$SCRIPT_DIR"
    npm run test
    log "✅ Tests completed"
}

# Stop development servers
stop() {
    log "Stopping development servers..."
    
    # Kill processes using the ports
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log "Stopping backend (port 3001)..."
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    fi
    
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log "Stopping frontend (port 5173)..."
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    fi
    
    log "✅ Servers stopped"
}

# Clean node_modules and builds
clean() {
    log "Cleaning up..."
    cd "$SCRIPT_DIR"
    npm run clean
    log "✅ Cleanup completed"
}

# Docker operations
docker_build() {
    log "Building Docker images..."
    cd "$SCRIPT_DIR"
    docker-compose build
    log "✅ Docker images built"
}

docker_up() {
    log "Starting Docker services..."
    cd "$SCRIPT_DIR"
    docker-compose up -d
    log "✅ Docker services started"
    log "🌐 Access the application at http://localhost"
}

docker_down() {
    log "Stopping Docker services..."
    cd "$SCRIPT_DIR"
    docker-compose down
    log "✅ Docker services stopped"
}

docker_logs() {
    log "Showing Docker logs..."
    cd "$SCRIPT_DIR"
    docker-compose logs -f
}

# Status check
status() {
    log "Checking service status..."
    
    echo "Backend (port 3001):"
    if curl -s http://localhost:3001/api/v1/hotspots >/dev/null 2>&1; then
        echo "  ✅ Running and responding"
    else
        echo "  ❌ Not responding or not running"
    fi
    
    echo "Frontend (port 5173):"
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo "  ✅ Running and responding"  
    else
        echo "  ❌ Not responding or not running"
    fi
    
    echo "Docker services:"
    cd "$SCRIPT_DIR"
    if docker-compose ps --services --filter "status=running" | grep -q .; then
        docker-compose ps
    else
        echo "  ❌ No Docker services running"
    fi
}

# Show help
show_help() {
    echo "MetalSense Development Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install     Install all dependencies"
    echo "  dev         Start both frontend and backend in development mode"
    echo "  backend     Start only the backend server"
    echo "  frontend    Start only the frontend server"
    echo "  build       Build for production"
    echo "  test        Run tests"
    echo "  stop        Stop all running servers"
    echo "  clean       Clean up node_modules and build artifacts"
    echo "  status      Check the status of services"
    echo ""
    echo "Docker commands:"
    echo "  docker:build    Build Docker images"
    echo "  docker:up       Start services with Docker Compose"
    echo "  docker:down     Stop Docker services"
    echo "  docker:logs     Show Docker logs"
    echo ""
    echo "  help        Show this help message"
}

# Main command handler
case "${1:-help}" in
    install)
        check_dependencies
        install_deps
        ;;
    dev)
        check_dependencies
        start_dev
        ;;
    backend)
        check_dependencies
        start_backend
        ;;
    frontend)
        check_dependencies
        start_frontend
        ;;
    build)
        check_dependencies
        build
        ;;
    test)
        check_dependencies
        test
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    status)
        status
        ;;
    docker:build)
        docker_build
        ;;
    docker:up)
        docker_up
        ;;
    docker:down)
        docker_down
        ;;
    docker:logs)
        docker_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
