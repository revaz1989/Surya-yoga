#!/bin/bash

# Production deployment script for Surya Yoga
# This script should be run on the production server

set -e

echo "🚀 Starting Surya Yoga production deployment..."

# Configuration
APP_DIR="/var/www/suryayoga"
UPLOAD_DIR="/var/lib/suryayoga/uploads"
DATABASE_DIR="/var/lib/suryayoga/database"
USER="suryayoga"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Run as the application user or use sudo for specific commands."
    exit 1
fi

# Check if we're in the correct directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Stopping application service..."
sudo systemctl stop suryayoga || print_warning "Service not running or doesn't exist yet"

print_status "Creating necessary directories..."
sudo mkdir -p "$UPLOAD_DIR" "$DATABASE_DIR"
sudo chown -R $USER:$USER "$UPLOAD_DIR" "$DATABASE_DIR"

print_status "Installing dependencies..."
npm ci --only=production

print_status "Building application..."
npm run build:production

print_status "Migrating uploaded files..."
if [[ -d "public/uploads" ]]; then
    npm run migrate-uploads
    print_status "Upload migration completed"
else
    print_warning "No uploads directory found to migrate"
fi

print_status "Setting up systemd service..."
if [[ ! -f "/etc/systemd/system/suryayoga.service" ]]; then
    sudo cp deployment/systemd-service.conf /etc/systemd/system/suryayoga.service
    sudo systemctl daemon-reload
    sudo systemctl enable suryayoga
    print_status "Systemd service installed and enabled"
else
    sudo systemctl daemon-reload
    print_status "Systemd service reloaded"
fi

print_status "Setting proper permissions..."
sudo chown -R $USER:$USER "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"
sudo chmod -R 644 "$UPLOAD_DIR"
sudo chmod -R 600 "$DATABASE_DIR"

print_status "Starting application service..."
sudo systemctl start suryayoga

print_status "Checking service status..."
sleep 3
if sudo systemctl is-active --quiet suryayoga; then
    print_status "✅ Application is running successfully!"
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "✅ Health check passed!"
    else
        print_warning "⚠️  Health check failed. Check application logs."
    fi
else
    print_error "❌ Application failed to start. Check logs with: sudo journalctl -u suryayoga -f"
    exit 1
fi

print_status "Setting up Nginx (if not already configured)..."
if [[ ! -f "/etc/nginx/sites-available/suryayoga.ge" ]]; then
    sudo cp deployment/nginx.conf /etc/nginx/sites-available/suryayoga.ge
    sudo ln -sf /etc/nginx/sites-available/suryayoga.ge /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    print_status "Nginx configured and reloaded"
else
    print_status "Nginx already configured"
fi

print_status "🎉 Deployment completed successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Test the application at https://suryayoga.ge"
print_status "2. Check that file uploads work correctly"
print_status "3. Monitor logs with: sudo journalctl -u suryayoga -f"
print_status ""
print_status "Useful commands:"
print_status "- View logs: sudo journalctl -u suryayoga -f"
print_status "- Restart app: sudo systemctl restart suryayoga"
print_status "- Check status: sudo systemctl status suryayoga"