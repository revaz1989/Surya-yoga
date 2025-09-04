# Surya Yoga - Production Deployment Guide

This guide covers deploying the Surya Yoga application to the `suryayoga.ge` domain.

## Prerequisites

- Ubuntu/Debian server with root access
- Node.js 18+ installed
- Nginx installed
- SSL certificate for suryayoga.ge
- Domain DNS pointing to your server

## 1. Server Setup

### Create Application User
```bash
sudo adduser --system --home /var/www/suryayoga --shell /bin/bash suryayoga
sudo mkdir -p /var/lib/suryayoga/{uploads,database}
sudo chown -R suryayoga:suryayoga /var/lib/suryayoga
```

### Install Node.js (if not already installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2. Application Deployment

### Clone and Build
```bash
cd /var/www
sudo git clone https://github.com/your-repo/surya-yoga.git suryayoga
sudo chown -R suryayoga:suryayoga /var/www/suryayoga
cd suryayoga

# Switch to app user
sudo -u suryayoga bash

# Install dependencies and build
npm ci
npm run build
```

### Environment Configuration
```bash
# Copy production environment file
cp .env.production .env.local

# Edit environment variables with actual values
nano .env.local
```

**Required Environment Variables:**
```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://suryayoga.ge
JWT_SECRET=your-super-secure-jwt-secret-key-here-32-chars-minimum
DATABASE_PATH=/var/lib/suryayoga/database/surya-yoga.db
UPLOAD_DIR=/var/lib/suryayoga/uploads
GMAIL_CLIENT_ID=your-gmail-oauth-client-id
GMAIL_CLIENT_SECRET=your-gmail-oauth-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_USER=suryayogageorgia@gmail.com
```

## 3. Google OAuth Setup

### Gmail API Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials:
   - **Authorized redirect URIs:** `https://suryayoga.ge/api/auth/google/callback`
   - **Authorized domains:** `suryayoga.ge`

### Get Refresh Token
```bash
# Use the OAuth playground or run the setup script
node scripts/setup-gmail-oauth.js
```

## 4. Database Setup

### Initialize Database
```bash
# Run as suryayoga user
npm run seed
```

### Backup Strategy
```bash
# Create backup script
sudo cat > /usr/local/bin/backup-suryayoga.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/suryayoga"
mkdir -p $BACKUP_DIR

# Backup database
cp /var/lib/suryayoga/database/surya-yoga.db "$BACKUP_DIR/db_$DATE.db"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/lib/suryayoga uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-suryayoga.sh

# Add to cron for daily backups
echo "0 2 * * * /usr/local/bin/backup-suryayoga.sh" | sudo crontab -
```

## 5. Systemd Service Setup

```bash
# Copy service file
sudo cp deployment/systemd-service.conf /etc/systemd/system/suryayoga.service

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable suryayoga
sudo systemctl start suryayoga

# Check status
sudo systemctl status suryayoga
```

## 6. Nginx Configuration

```bash
# Copy nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/suryayoga.ge

# Enable site
sudo ln -s /etc/nginx/sites-available/suryayoga.ge /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 7. SSL Certificate Setup

### Using Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d suryayoga.ge -d www.suryayoga.ge

# Test renewal
sudo certbot renew --dry-run
```

### Manual Certificate
If using a manual certificate, place files:
- Certificate: `/etc/ssl/certs/suryayoga.ge.crt`
- Private Key: `/etc/ssl/private/suryayoga.ge.key`

## 8. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 9. Monitoring and Logs

### View Application Logs
```bash
# Systemd logs
sudo journalctl -u suryayoga -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Check Endpoint
Create a health check endpoint at `/api/health`:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET() {
  try {
    // Test database connection
    const db = getDatabase()
    db.prepare('SELECT 1').get()
    
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
```

## 10. Performance Optimization

### Enable Gzip in Next.js
Add to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  compress: true,
  // ... existing config
}
```

### PM2 Alternative (Optional)
If you prefer PM2 over systemd:
```bash
npm install -g pm2
pm2 start npm --name "suryayoga" -- start
pm2 startup
pm2 save
```

## 11. Security Checklist

- [ ] SSL certificate configured and auto-renewal enabled
- [ ] Firewall configured (only SSH, HTTP, HTTPS ports open)
- [ ] Strong JWT secret generated and configured
- [ ] Database file permissions restricted (600)
- [ ] Upload directory secured against script execution
- [ ] Security headers configured in Nginx
- [ ] CORS properly configured
- [ ] Regular security updates enabled

## 12. Maintenance Tasks

### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update application
cd /var/www/suryayoga
sudo -u suryayoga git pull
sudo -u suryayoga npm ci
sudo -u suryayoga npm run build
sudo systemctl restart suryayoga
```

### Log Rotation
```bash
# Configure log rotation
sudo cat > /etc/logrotate.d/suryayoga << 'EOF'
/var/log/suryayoga/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 suryayoga suryayoga
    postrotate
        systemctl reload suryayoga
    endscript
}
EOF
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check logs: `sudo journalctl -u suryayoga -f`
   - Verify environment variables
   - Check file permissions

2. **Database errors**
   - Verify database path exists and is writable
   - Check database file permissions
   - Run database migrations

3. **File upload errors**
   - Check upload directory permissions
   - Verify UPLOAD_DIR environment variable
   - Check disk space

4. **Gmail API errors**
   - Verify OAuth credentials
   - Check refresh token validity
   - Confirm API quotas

For additional support, check the application logs and consult the development team.