# Connect Your Oil Vessel Tracker to New GitHub Repository

## Step 1: Create New GitHub Repository

1. Go to **github.com** and sign in
2. Click the **"+"** button (top right) → **"New repository"**
3. Repository settings:
   - **Repository name**: `oil-vessel-tracker` (or your preferred name)
   - **Description**: "Maritime oil vessel tracking platform with real-time monitoring"
   - **Visibility**: Public or Private (your choice)
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Connect Your Local Project

After creating the repository, GitHub will show you commands. Use these:

### Initialize Git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - oil vessel tracking platform"
```

### Connect to your new GitHub repository:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your project files:
   - `package.json`
   - `server/` folder
   - `client/` folder
   - `shared/` folder
   - `render.yaml`
   - All other project files

## Step 4: Ready for Render Deployment

Once your code is on GitHub:
1. Go to **render.com**
2. Connect your GitHub account
3. Select your new repository
4. Deploy with the settings we discussed earlier

## Troubleshooting

If you get errors:
- Make sure you're in your project directory
- Ensure you have Git installed
- Check that the repository URL is correct

Your oil vessel tracking app with authentic Supabase data will be ready for deployment once it's on GitHub!