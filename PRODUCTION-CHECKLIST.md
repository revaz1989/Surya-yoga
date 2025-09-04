# Surya Yoga - Production Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code and Configuration
- [x] Database configuration updated for production paths
- [x] Environment variables configured (.env.production created)
- [x] JWT secrets generated and secured
- [x] CORS and security middleware implemented
- [x] File upload paths configured for production
- [x] API endpoints updated with production URLs
- [x] Next.js configuration optimized for production
- [x] Health check endpoint implemented

### ✅ Security Configuration
- [x] Security headers configured in Next.js
- [x] CORS middleware with domain restrictions
- [x] Cookie security settings (httpOnly, secure, sameSite)
- [x] File upload security (type validation, size limits)
- [x] Input validation and sanitization
- [x] SQL injection protection (prepared statements)

### ✅ Google OAuth Setup
- [x] Gmail API credentials configured for suryayoga.ge
- [x] OAuth redirect URIs updated to production domain
- [x] Email templates using production URLs
- [x] OAuth setup script created for easy configuration

## Deployment Files Created

### ✅ Environment Configuration
- [x] `.env.example` - Template with all required variables
- [x] `.env.production` - Production environment configuration

### ✅ Server Configuration
- [x] `deployment/nginx.conf` - Nginx reverse proxy configuration
- [x] `deployment/systemd-service.conf` - Systemd service configuration
- [x] `src/middleware.ts` - CORS and security middleware

### ✅ Containerization (Optional)
- [x] `deployment/docker/Dockerfile` - Multi-stage Docker build
- [x] `deployment/docker/docker-compose.yml` - Complete stack setup

### ✅ Documentation and Scripts
- [x] `DEPLOYMENT.md` - Comprehensive deployment guide
- [x] `scripts/setup-gmail-oauth.js` - OAuth setup automation
- [x] `src/app/api/health/route.ts` - Health check endpoint

## Post-Deployment Verification

### 🔄 Required Manual Steps

1. **Domain and SSL Setup**
   - [ ] DNS records pointing to server
   - [ ] SSL certificate installed and configured
   - [ ] HTTPS redirects working

2. **Google Cloud Console Configuration**
   - [ ] Create/configure Google Cloud project
   - [ ] Enable Gmail API
   - [ ] Create OAuth 2.0 credentials with:
     - Authorized redirect URI: `https://suryayoga.ge/api/auth/google/callback`
     - Authorized domains: `suryayoga.ge`
   - [ ] Run OAuth setup script: `npm run setup-gmail`

3. **Server Environment Setup**
   - [ ] Create application user and directories
   - [ ] Set proper file permissions
   - [ ] Configure database path: `/var/lib/suryayoga/database/`
   - [ ] Configure upload directory: `/var/lib/suryayoga/uploads/`
   - [ ] Install and start systemd service
   - [ ] Configure Nginx reverse proxy

4. **Environment Variables Configuration**
   ```bash
   # Update these in .env.production:
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://suryayoga.ge
   JWT_SECRET=[generate-secure-32char-key]
   DATABASE_PATH=/var/lib/suryayoga/database/surya-yoga.db
   UPLOAD_DIR=/var/lib/suryayoga/uploads
   GMAIL_CLIENT_ID=[from-google-cloud-console]
   GMAIL_CLIENT_SECRET=[from-google-cloud-console]
   GMAIL_REFRESH_TOKEN=[from-oauth-setup-script]
   GMAIL_USER=suryayogageorgia@gmail.com
   ```

### 🧪 Testing Checklist

After deployment, verify these endpoints and features:

#### Core Application
- [ ] Homepage loads: `https://suryayoga.ge`
- [ ] Health check: `https://suryayoga.ge/api/health`
- [ ] Static assets load (CSS, JS, images)
- [ ] Both languages work (Georgian and English)

#### Authentication System
- [ ] User registration works
- [ ] Email verification emails sent and received
- [ ] Login/logout functionality
- [ ] Password reset flow
- [ ] Admin authentication

#### News System
- [ ] News list page displays
- [ ] Individual news posts load
- [ ] Comments system works
- [ ] Admin can create/edit news posts
- [ ] File uploads work for admin

#### Security Features
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers present (check with browser dev tools)
- [ ] File uploads restricted to allowed types
- [ ] CORS working correctly
- [ ] Admin-only endpoints protected

### 🔍 Monitoring Setup

After deployment, set up monitoring for:

- [ ] Application logs: `sudo journalctl -u suryayoga -f`
- [ ] Nginx access logs: `sudo tail -f /var/log/nginx/access.log`
- [ ] Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] Health check endpoint monitoring
- [ ] SSL certificate expiration alerts
- [ ] Database backup automation

### 🚀 Performance Optimization

- [ ] Gzip compression enabled in Nginx
- [ ] Static file caching configured
- [ ] Image optimization working
- [ ] Database queries optimized
- [ ] Upload file size limits appropriate

### 🔐 Security Hardening

- [ ] Firewall configured (only necessary ports open)
- [ ] Regular security updates scheduled
- [ ] Database file permissions secured (600)
- [ ] Upload directory secured against script execution
- [ ] Sensitive files not publicly accessible
- [ ] CSRF protection enabled
- [ ] Rate limiting configured (optional)

## Maintenance Schedule

### Daily
- [ ] Monitor application logs for errors
- [ ] Check health endpoint status

### Weekly
- [ ] Review server resource usage
- [ ] Check SSL certificate status
- [ ] Verify database backups

### Monthly
- [ ] Update system packages
- [ ] Update Node.js dependencies
- [ ] Review and rotate logs
- [ ] Test backup restoration process

## Emergency Procedures

### Application Down
1. Check systemd service: `sudo systemctl status suryayoga`
2. Check logs: `sudo journalctl -u suryayoga -f`
3. Restart service: `sudo systemctl restart suryayoga`
4. Check nginx: `sudo systemctl status nginx`

### Database Issues
1. Check database file permissions
2. Verify database path in environment variables
3. Restore from backup if necessary
4. Check disk space

### SSL Certificate Issues
1. Check certificate expiration: `openssl x509 -in /etc/ssl/certs/suryayoga.ge.crt -text -noout`
2. Renew Let's Encrypt: `sudo certbot renew`
3. Reload Nginx: `sudo systemctl reload nginx`

## Contact Information

- **Domain:** suryayoga.ge
- **Repository:** [GitHub repository URL]
- **Email:** suryayogageorgia@gmail.com
- **Support:** [Development team contact]