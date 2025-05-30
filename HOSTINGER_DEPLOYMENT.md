# Deploy Oil Vessel Tracker to Hostinger

## Option 1: Hostinger Node.js Hosting (Recommended)

### Requirements:
- Hostinger VPS or Business hosting plan (Node.js support)
- NOT shared hosting (doesn't support Node.js applications)

### Steps:
1. **Upload Files via File Manager or FTP:**
   - Upload entire project to `/domains/yourdomain.com/public_html/`
   - Include: `package.json`, `server/`, `client/`, `shared/`, all config files

2. **Install Dependencies:**
   ```bash
   cd /domains/yourdomain.com/public_html/
   npm install --production
   ```

3. **Build Application:**
   ```bash
   npm run build
   ```

4. **Set Environment Variables:**
   Create `.env` file in public_html:
   ```
   NODE_ENV=production
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```

5. **Start Application:**
   ```bash
   npm start
   ```

## Option 2: Static Build for Shared Hosting

If you only have shared hosting, you can build a static version:

### Steps:
1. **Build Static Files:**
   ```bash
   npm run build
   ```

2. **Upload to public_html:**
   - Upload only `dist/client/` contents to `/public_html/`
   - This gives you the frontend only (no backend features)

### Limitations:
- No real-time vessel tracking
- No WebSocket connections
- No server-side API calls
- Static display only

## Option 3: Alternative Hosting (Easier)

Since Hostinger shared hosting doesn't support Node.js well:

1. **Vercel** (Free, drag & drop deployment)
2. **Render** (Free Node.js hosting via GitHub)
3. **Railway** (Easy Node.js deployment)

## Recommendation:
Use **Render with GitHub** for full functionality with your authentic vessel data, or upgrade to Hostinger VPS for Node.js support.

Your application with 5 authentic vessels and 68 ports needs server-side functionality to work properly.