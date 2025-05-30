# Maritime Platform - Installation Guide for public_html

## Files to Upload to Your Hosting

Upload these 2 files to your **public_html** folder:

1. **index.php** - Your complete maritime application
2. **config.php** - Database configuration file

## Step-by-Step Installation

### 1. Upload Files
- Log into your hosting file manager
- Navigate to the **public_html** directory
- Upload both files to this folder
- Set file permissions to 644

### 2. Configure Your Database
Edit the **config.php** file with your Supabase credentials:

```php
'supabase_url' => 'https://your-project-id.supabase.co',
'supabase_anon_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key',
'supabase_service_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_key',
```

### 3. Find Your Supabase Credentials
To get your credentials:
1. Go to **supabase.com** and log into your project
2. Go to **Settings > API**
3. Copy the **Project URL** and **anon public key**

### 4. Test Your Application
Visit your domain - your maritime platform should load with:
- Dashboard with vessel and port statistics
- Interactive vessel directory
- Port management system
- Interactive maps with your data

## What This Gives You

✅ **Complete Maritime Platform** running on shared hosting
✅ **All Your Existing Data** from Supabase
✅ **Professional Interface** with React and Tailwind CSS
✅ **Interactive Maps** showing vessel and port locations
✅ **API Endpoints** for data access

## Troubleshooting

**If the page doesn't load:**
- Check file permissions are set to 644
- Verify config.php has correct Supabase credentials
- Ensure both files are in the root public_html folder

**If no data appears:**
- Double-check your Supabase URL and keys
- Make sure your Supabase project is active
- Verify you have data in your vessels and ports tables

## Your Application Features

- **Dashboard**: Overview with statistics
- **Vessels**: Complete vessel directory with details
- **Ports**: Port network with locations
- **Map**: Interactive visualization of vessels and ports

Your clients can immediately test the full maritime platform with all your real data.