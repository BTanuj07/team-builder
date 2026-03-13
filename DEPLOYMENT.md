# Deploy Backend to Render.com

## Prerequisites
- GitHub account
- Render.com account (free)
- Your code pushed to GitHub

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/team-builder.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render.com

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your `team-builder` repository

### 3. Configure Build Settings

**Name:** `team-builder-backend`
**Region:** Singapore (or closest to you)
**Branch:** `main`
**Root Directory:** Leave empty (or use `backend` if you want)
**Environment:** `Node`
**Build Command:** `cd backend && npm install`
**Start Command:** `cd backend && npm start`

### 4. Add Environment Variables

Click "Advanced" and add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_make_it_long_and_random
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key_here
```

### 5. Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your backend will be live at: `https://team-builder-backend-xxxx.onrender.com`

### 6. Test Your Deployment

Visit: `https://your-app-url.onrender.com/health`

You should see:
```json
{
  "status": "ok",
  "message": "Team Builder API is running"
}
```

### 7. Update Mobile App API URL

Update `services/api.ts`:

```typescript
const API_URL = 'https://your-app-url.onrender.com/api';
```

### 8. Seed Database (Optional)

You can seed your production database by running the seed script locally with production MongoDB URI, or create a one-time job on Render:

1. Go to your service → "Shell"
2. Run: `cd backend && node scripts/seed.js`

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month free

### MongoDB Atlas
- Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or add Render's IP addresses to whitelist

### CORS
- After deployment, update the CORS origin in `backend/server.js` with your actual Render URL

### Environment Variables
- Never commit `.env` file to GitHub
- Use Render's environment variables dashboard
- Generate a strong JWT_SECRET for production

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `package.json` has correct dependencies
- Verify Node version compatibility

### Can't Connect to MongoDB
- Check MongoDB Atlas Network Access
- Verify connection string is correct
- Check MongoDB Atlas user permissions

### API Returns 404
- Verify the API URL in mobile app
- Check if service is running in Render dashboard
- Test `/health` endpoint first

## Alternative: Railway.app

If Render doesn't work, try Railway.app:

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables
6. Deploy!

Railway auto-detects Node.js and deploys automatically.
