# Server Deployment Guide

## Option 1: VPS with Docker (Recommended)

### Server Requirements
- Ubuntu 22.04 LTS or similar
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ storage
- Docker & Docker Compose installed

### Step-by-Step Deployment

#### 1. Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin -y

# Log out and back in for group changes to take effect
```

#### 2. Clone and Configure

```bash
# Clone your repository
git clone <your-repo-url>
cd promo_site

# Create production environment file
cp .env.production.example .env.production
nano .env.production  # Edit with your actual values
```

#### 3. Deploy with Docker Compose

```bash
# Build and start containers
docker compose -f docker-compose.yml --env-file .env.production up -d

# Check logs
docker compose logs -f

# Verify containers are running
docker compose ps
```

#### 4. Setup Nginx Reverse Proxy (Optional but Recommended)

Install Nginx for SSL and domain routing:

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/promo_site
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/promo_site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### Maintenance Commands

```bash
# View logs
docker compose logs -f promo_app

# Restart application
docker compose restart promo_app

# Update application
git pull
docker compose down
docker compose up -d --build

# Backup database
docker exec promo_site_db pg_dump -U promo_user promo_db > backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i promo_site_db psql -U promo_user promo_db < backup_file.sql
```

---

## Option 2: Vercel (Easiest, but requires external database)

Your site is already configured for Vercel (see VERCEL_SETUP.md).

### Quick Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set up environment variables (PayPal, Email, DATABASE_URL)
4. Deploy

**Note:** You'll need to use an external database like Neon (see NEON_SETUP.md) since Vercel is serverless.

---

## Option 3: Cloud Platforms

### AWS (Elastic Beanstalk or ECS)
- More complex but highly scalable
- Good for enterprise applications
- Supports Docker deployments

### DigitalOcean App Platform
- Middle ground between VPS and PaaS
- Docker support
- Managed database options

### Google Cloud Run
- Serverless container platform
- Auto-scaling
- Pay per use

---

## Environment Variables Checklist

Before deployment, ensure you have:
- ✅ Database credentials (or Neon connection string)
- ✅ PayPal Client ID and Secret (PRODUCTION mode)
- ✅ Email credentials for notifications
- ✅ Domain name configured (A records pointing to server IP)

---

## Security Checklist

- ✅ Use strong database passwords
- ✅ Enable firewall (UFW on Ubuntu)
- ✅ Setup SSL/HTTPS
- ✅ Keep Docker images updated
- ✅ Regular backups
- ✅ Monitor logs for suspicious activity
- ✅ Never commit .env files to Git

---

## Monitoring & Performance

### Setup Basic Monitoring

```bash
# Install htop for resource monitoring
sudo apt install htop -y

# Monitor Docker stats
docker stats

# Check disk usage
df -h
```

### Log Rotation

Docker logs can grow large. Configure log rotation in docker-compose.yml:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Troubleshooting

### Application won't start
```bash
docker compose logs promo_app
# Check for environment variable issues
```

### Database connection issues
```bash
docker compose logs promo_db
# Verify DATABASE_URL is correct
# Ensure database container is healthy
```

### Port conflicts
```bash
sudo lsof -i :3001
# Kill conflicting process or change port in docker-compose.yml
```

---

## Cost Estimates (Monthly)

- **DigitalOcean Basic Droplet**: $12-24/month (2GB RAM)
- **AWS Lightsail**: $10-20/month (similar specs)
- **Vercel** (with Neon database): $20/month (Vercel free + Neon Pro)
- **Hetzner Cloud**: €4-8/month (very affordable)

---

## Need Help?

- Check existing setup docs: VERCEL_SETUP.md, NEON_SETUP.md
- Docker documentation: https://docs.docker.com
- Next.js deployment: https://nextjs.org/docs/deployment
