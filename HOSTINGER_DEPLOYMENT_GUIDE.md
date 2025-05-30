# Oil Vessel Tracking App - Hostinger Deployment Guide

## Step 1: Prepare Files for Upload

### Required Files to Upload:
```
📁 Your hosting folder/
├── 📁 dist/                    # Complete built application (6.3MB)
│   ├── 📁 client/             # Frontend files
│   │   ├── index.html         # Main page
│   │   └── 📁 assets/         # CSS, JS, images
│   └── index.js               # Backend server (714KB)
├── package.json               # Dependencies list
├── package-lock.json          # Exact versions
└── .env                       # Your database settings
```

### Create Your .env File:
Create a file named `.env` with your Supabase credentials:
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
NODE_ENV=production
PORT=3000
```

## Step 2: Upload to Hostinger

### Method A: File Manager (Recommended)
1. **Login to Hostinger Panel**
   - Go to your Hostinger control panel
   - Navigate to "File Manager"

2. **Upload Files**
   - Go to `public_html` or your domain folder
   - Upload these files/folders:
     - `dist/` (entire folder)
     - `package.json`
     - `package-lock.json` 
     - `.env`

3. **Extract if Needed**
   - If you uploaded as ZIP, extract in the correct location
   - Ensure folder structure matches above

### Method B: FTP Upload
1. **Use FTP Client** (FileZilla, WinSCP, etc.)
   - Host: Your Hostinger FTP host
   - Username: Your FTP username
   - Password: Your FTP password

2. **Upload to Correct Directory**
   - Navigate to `public_html/`
   - Upload all required files maintaining folder structure

## Step 3: Install Dependencies

### Using Hostinger Terminal (if available):
1. **Access Terminal** in Hostinger panel
2. **Navigate to your app folder:**
   ```bash
   cd public_html
   ```
3. **Install packages:**
   ```bash
   npm install --production
   ```

### Alternative - Upload node_modules:
If terminal access is limited:
1. **On your computer**, run: `npm install --production`
2. **Upload the entire `node_modules/` folder** to your hosting
3. This will be large (200MB+) but ensures all dependencies are included

## Step 4: Configure Node.js Application

### In Hostinger Panel:
1. **Go to Advanced → Node.js Apps**
2. **Create New App**
   - App root: `/public_html` (or your domain folder)
   - Startup file: `dist/index.js`
   - Node.js version: 18 or higher

3. **Set Environment Variables**
   - Add your DATABASE_URL
   - Add SUPABASE_URL
   - Add SUPABASE_ANON_KEY
   - Add NODE_ENV=production

## Step 5: Start Your Application

### From Hostinger Panel:
1. **Start the Node.js app** in the control panel
2. **Check status** - should show "Running"
3. **View your site** at your domain

### Manual Start (if needed):
If terminal access is available:
```bash
cd public_html
npm start
```

## Step 6: Verify Everything Works

### Check These Features:
- [ ] Website loads at your domain
- [ ] Vessel map displays your 5 authentic vessels
- [ ] Port and refinery icons appear on map
- [ ] Vessel table shows proper port names (not IDs)
- [ ] Vessel detail pages load correctly
- [ ] Database connection working (no errors in logs)

### Common Issues and Solutions:

**Problem: "Module not found" errors**
- Solution: Ensure `node_modules/` folder uploaded or `npm install` completed

**Problem: Database connection fails**
- Solution: Double-check your .env file DATABASE_URL format
- Verify Supabase credentials are correct

**Problem: Static files not loading**
- Solution: Ensure `dist/client/assets/` folder uploaded completely
- Check file permissions (should be 644 for files, 755 for folders)

**Problem: App won't start**
- Solution: Verify Node.js version is 18+
- Check that `dist/index.js` file exists and is executable

## File Structure After Upload:
```
public_html/
├── dist/
│   ├── client/
│   │   ├── index.html
│   │   └── assets/
│   │       ├── index-*.css    (160KB)
│   │       ├── index-*.js     (2.6MB)
│   │       └── *.svg          (all icons)
│   └── index.js               (714KB server)
├── node_modules/              (if uploaded)
├── package.json
├── package-lock.json
└── .env
```

## Your App Features:
- **5 authentic vessels** from your Supabase database
- **68 ports** with proper name resolution
- **Real-time tracking** via WebSocket
- **Interactive maps** with vessel/port/refinery icons
- **No synthetic data** - only your authentic vessel information

## Support:
- Your application uses authentic data from your Supabase database
- All vessel coordinates and information are real
- Port names display correctly instead of IDs
- Application ready for production use

The total upload size is approximately 6.3MB for the application plus dependencies.