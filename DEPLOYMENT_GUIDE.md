# Cricket Analytics Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Cricket Analytics application in various environments with optimal performance configurations.

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **NPM**: v8.0.0 or higher
- **Memory**: Minimum 2GB RAM, Recommended 4GB+
- **Storage**: 500MB+ for application, 1GB+ for cricket data
- **OS**: Linux, macOS, or Windows

### Development Tools
- Git for version control
- Code editor (VS Code recommended)
- Terminal/Command prompt

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd cric-poc
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Data Setup
Ensure your cricket match JSON files are in the `data/` directory:
```
data/
├── match1.json
├── match2.json
├── ...
└── match19145.json
```

### 4. Generate Performance Index
```bash
npm run prebuild
```

This creates the metadata index for optimal performance.

## Development Deployment

### Local Development
```bash
# Start development server
npm run dev

# Server will start on http://localhost:3000
# Or http://localhost:3001 if 3000 is occupied
```

### Development Features
- Hot reload for code changes
- Detailed error messages
- Performance monitoring logs
- Automatic cache rebuilding

### Environment Variables (Optional)
Create `.env.local` for development configuration:
```env
# Development settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
CACHE_DURATION=300000  # 5 minutes in milliseconds
```

## Production Deployment

### 1. Build Optimization
```bash
# Build production bundle
npm run build

# This automatically runs prebuild + next build
```

### 2. Production Start
```bash
# Start production server
npm start
```

### 3. Environment Variables
Create `.env.production` for production:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
CACHE_DURATION=600000  # 10 minutes
DISK_CACHE_DURATION=86400000  # 24 hours
```

## Platform-Specific Deployments

### Vercel Deployment
1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Configure vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy**:
```bash
vercel --prod
```

### Netlify Deployment
1. **Configure netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. **Deploy via Git**:
Connect repository to Netlify dashboard for automatic deployments.

### Docker Deployment
1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate performance index
RUN npm run prebuild

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  cricket-analytics:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data:ro
    restart: unless-stopped
```

3. **Deploy**:
```bash
docker-compose up -d
```

### AWS EC2 Deployment
1. **Launch EC2 Instance**:
   - Choose Ubuntu 20.04 LTS
   - t3.medium or larger
   - Configure security groups (port 3000)

2. **Server Setup**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

3. **Application Deployment**:
```bash
# Clone and setup application
git clone <repository-url>
cd cric-poc
npm install
npm run build

# Start with PM2
pm2 start npm --name "cricket-analytics" -- start
pm2 save
pm2 startup
```

### Nginx Configuration
Create `/etc/nginx/sites-available/cricket-analytics`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Performance Optimization for Production

### 1. Caching Strategy
```javascript
// Environment-specific cache durations
const CACHE_DURATIONS = {
  development: {
    memory: 5 * 60 * 1000,     // 5 minutes
    disk: 60 * 60 * 1000       // 1 hour
  },
  production: {
    memory: 10 * 60 * 1000,    // 10 minutes
    disk: 24 * 60 * 60 * 1000  // 24 hours
  }
};
```

### 2. Memory Management
Monitor and optimize memory usage:
```bash
# Check memory usage
node --max-old-space-size=4096 server.js

# Monitor with PM2
pm2 monit
```

### 3. Performance Monitoring
```javascript
// Add performance monitoring
const startTime = Date.now();
// ... API operation
console.log(`Operation took ${Date.now() - startTime}ms`);
```

## Security Considerations

### 1. Environment Variables
Never commit sensitive data. Use environment variables:
```env
# .env.production (not committed)
DATABASE_URL=your-database-url
API_SECRET=your-secret-key
```

### 2. CORS Configuration
Configure CORS for production:
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting
Implement rate limiting for production:
```javascript
// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
```

## Monitoring and Maintenance

### 1. Health Checks
Create health check endpoint:
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
```

### 2. Logging Strategy
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Performance Metrics
Monitor key metrics:
- API response times
- Memory usage
- Cache hit rates
- Error rates
- User session data

## Backup and Recovery

### 1. Data Backup
```bash
# Backup cricket data
tar -czf cricket-data-backup-$(date +%Y%m%d).tar.gz data/

# Backup application
git archive --format=tar.gz --output=app-backup-$(date +%Y%m%d).tar.gz HEAD
```

### 2. Index Regeneration
If index gets corrupted:
```bash
# Remove corrupted index
rm data/.match-index.json

# Regenerate index
npm run prebuild
```

### 3. Disaster Recovery
1. Restore from backup
2. Regenerate performance index
3. Restart application
4. Verify functionality

## Troubleshooting

### Common Issues

#### 1. Slow Performance
```bash
# Check if index exists
ls -la data/.match-index.json

# Regenerate if missing
npm run prebuild

# Check memory usage
top -p $(pgrep node)
```

#### 2. Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Restart application
pm2 restart cricket-analytics
```

#### 3. Port Conflicts
```bash
# Check port usage
netstat -tlnp | grep :3000

# Kill process using port
sudo kill -9 $(lsof -t -i:3000)
```

### Debug Mode
Enable debug logging:
```bash
DEBUG=* npm run dev
```

### Performance Testing
```bash
# Run performance tests
node scripts/test-performance.js

# Load testing with artillery
npm install -g artillery
artillery quick --count 10 --num 10 http://localhost:3000/api/matches
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple Node.js instances
- Shared file system for data

### Vertical Scaling
- Increase server resources
- Optimize Node.js memory settings
- Use SSD storage for better I/O

### Database Migration
For larger datasets, consider:
- MongoDB for document storage
- PostgreSQL for relational queries
- Redis for caching layer

## Maintenance Schedule

### Daily
- Monitor application logs
- Check memory usage
- Verify API response times

### Weekly
- Review error logs
- Update dependencies
- Performance optimization review

### Monthly
- Security updates
- Backup verification
- Capacity planning review

## Support and Documentation

### Getting Help
1. Check application logs
2. Review this deployment guide
3. Run performance tests
4. Check GitHub issues

### Documentation Updates
Keep documentation current with:
- Deployment changes
- Configuration updates
- Performance improvements
- Security patches

This deployment guide ensures optimal performance and reliability for the Cricket Analytics application across all environments. 