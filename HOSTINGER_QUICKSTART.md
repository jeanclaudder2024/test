# PetroDealHub - Hostinger VPS Quick Start

## 🚀 Fast Deployment on Hostinger VPS

### What You'll Need
- Hostinger VPS (any plan works, but VPS 2 or higher recommended)
- Domain name (can buy through Hostinger)
- Your PetroDealHub project files

### Option 1: Automated Setup (Recommended)

**Step 1:** Connect to your Hostinger VPS
```bash
ssh root@your-vps-ip
```

**Step 2:** Download and run the setup script
```bash
wget https://raw.githubusercontent.com/yourusername/petrodealhub/main/hostinger-deploy.sh
chmod +x hostinger-deploy.sh
./hostinger-deploy.sh
```

**Step 3:** Upload your project files
```bash
cd /var/www/petrodealhub
# Upload your PetroDealHub files here
```

**Step 4:** Complete the setup
```bash
npm install
npm run build
node test-db.js
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**Step 5:** Install SSL certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Manual Upload via Hostinger File Manager

1. **Compress your project**
   ```bash
   # On your local machine
   tar -czf petrodealhub.tar.gz petrodealhub/
   ```

2. **Upload via Hostinger Control Panel**
   - Log into Hostinger control panel
   - Go to VPS management
   - Use File Manager to upload petrodealhub.tar.gz
   - Extract to /var/www/petrodealhub

3. **Run setup script**
   ```bash
   ssh root@your-vps-ip
   cd /var/www/petrodealhub
   ./hostinger-deploy.sh yourdomain.com
   ```

### Hostinger DNS Configuration

1. Log into Hostinger control panel
2. Go to "DNS Zone Editor" for your domain
3. Add these records:
   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP
   
   Type: A
   Name: www  
   Value: YOUR_VPS_IP
   ```

### Essential Environment Variables

Edit `/var/www/petrodealhub/.env`:
```env
DATABASE_URL=postgresql://petrodealhub_user:password@localhost:5432/petrodealhub
SESSION_SECRET=your_32_character_secret
STRIPE_SECRET_KEY=sk_live_your_stripe_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
NODE_ENV=production
PORT=5000
```

### Verification Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs petrodealhub

# Test health endpoint
curl https://yourdomain.com/api/health

# Check database
node test-db.js
```

### Quick Troubleshooting

**App won't start:**
```bash
pm2 logs petrodealhub
pm2 restart petrodealhub
```

**Domain not working:**
- Check DNS propagation: https://dnschecker.org/
- Verify Nginx: `nginx -t`
- Restart Nginx: `systemctl restart nginx`

**Database issues:**
```bash
node test-db.js
systemctl status postgresql
```

### Hostinger-Specific Tips

1. **VPS Access:** Use Hostinger's VPS management panel for easy SSH access
2. **Backups:** Enable automatic backups in Hostinger control panel
3. **Monitoring:** Use Hostinger's built-in VPS monitoring tools
4. **Support:** Contact Hostinger support for VPS infrastructure issues

### Success Indicators

✅ `pm2 status` shows "online"  
✅ `https://yourdomain.com/api/health` returns "healthy"  
✅ SSL certificate shows green lock in browser  
✅ Stripe payments process correctly  

Your PetroDealHub platform is now live and ready to generate revenue!

---

**Need help?** Check the complete guide: `HOSTINGER_VPS_DEPLOYMENT.md`