# Oil Vessel Tracking Platform - Render Deployment

A comprehensive maritime oil brokerage platform with real-time vessel tracking, port management, and intelligent routing capabilities.

## 🚀 Deploy to Render

### Prerequisites
- Render account
- Supabase account with database setup
- Required API keys (optional for enhanced features)

### Quick Deploy

1. **Fork this repository** to your GitHub account

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Optional API keys for enhanced features:
   ```
   OPENAI_API_KEY=your_openai_key
   MYSHIPTRACKING_API_KEY=your_api_key
   MARINE_TRAFFIC_API_KEY=your_api_key
   ```

4. **Build Settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Node Version: 18

### Database Setup

#### Option 1: Use Render PostgreSQL (Recommended)
1. Create a PostgreSQL database in Render
2. Copy the connection string to `DATABASE_URL`
3. Run database migrations: `npm run db:push`

#### Option 2: Use Supabase Database
1. Get your Supabase connection string
2. Set `DATABASE_URL` to your Supabase postgres connection
3. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Features
- ✅ Real-time vessel tracking with WebSocket connections
- ✅ Interactive maps with beautiful icons
- ✅ Port and refinery management
- ✅ Vessel routing and analytics
- ✅ Multi-language support (English/Arabic)
- ✅ Admin panel with subscription management
- ✅ Document generation and cargo manifests

### Architecture
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Express.js with WebSocket support
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Supabase Auth
- **Maps:** Leaflet with custom icons
- **Deployment:** Docker containerized for Render

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `OPENAI_API_KEY` | No | For AI vessel data generation |
| `MYSHIPTRACKING_API_KEY` | No | For real vessel tracking data |
| `MARINE_TRAFFIC_API_KEY` | No | Alternative vessel data source |

### Post-Deployment
1. Visit your deployed URL
2. The app will automatically seed initial data
3. Access admin panel at `/admin` for management
4. Configure vessel tracking sources in settings

### Troubleshooting
- Check Render logs for deployment issues
- Verify all environment variables are set
- Ensure database connection string is correct
- Check that ports 5000 is accessible

### Support
For deployment assistance or API key setup, refer to the respective service documentation:
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)