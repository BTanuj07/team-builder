# Render.com Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Code is working locally
- [ ] MongoDB Atlas is configured and accessible
- [ ] `.env` file is in `.gitignore` (already done ✓)
- [ ] All dependencies are in `package.json`
- [ ] Backend has `start` script in `package.json` (already done ✓)

## 📝 Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Render Service
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository

### 3. Configure Service
**Build Command:** `cd backend && npm install`
**Start Command:** `cd backend && npm start`
**Environment:** Node

### 4. Add Environment Variables
Copy these to Render dashboard (replace with your actual values):

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=generate_a_very_long_random_string_for_production_security
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key_here
```

**Get your actual values from:**
- MongoDB URI: From your MongoDB Atlas dashboard
- JWT Secret: Generate a random 64+ character string
- Groq API Key: From your Groq account

### 5. Deploy & Test
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Test: `https://your-app.onrender.com/health`

### 6. Update Mobile App
In `services/api.ts`, change:
```typescript
const API_URL = 'https://your-app-name.onrender.com/api';
```

## 🎯 After Deployment

### Seed Database
```bash
# Option 1: From Render Shell
cd backend && node scripts/seed.js

# Option 2: Locally with production URI
# Update backend/.env with production MONGODB_URI
cd backend
node scripts/seed.js
```

### Test Endpoints
- Health: `https://your-app.onrender.com/health`
- Register: `POST https://your-app.onrender.com/api/auth/register`
- Login: `POST https://your-app.onrender.com/api/auth/login`

## 🚨 Common Issues

### Issue: Build Fails
**Solution:** Check Render logs, ensure all dependencies are in `package.json`

### Issue: MongoDB Connection Error
**Solution:** 
1. Go to MongoDB Atlas → Network Access
2. Add IP: 0.0.0.0/0 (allow all)
3. Wait 2 minutes, redeploy

### Issue: Service Sleeps (Free Tier)
**Solution:** 
- Free tier spins down after 15 min inactivity
- First request takes 30-60 seconds
- Upgrade to paid plan for always-on

### Issue: CORS Error in Mobile App
**Solution:** Update `backend/server.js` CORS config with your Render URL

## 💡 Pro Tips

1. **Use Environment Variables:** Never hardcode secrets
2. **Monitor Logs:** Check Render dashboard for errors
3. **Test Locally First:** Always test before deploying
4. **Keep .env.example Updated:** For team members
5. **Use Strong JWT Secret:** Generate random 64+ character string

## 🔗 Your URLs After Deployment

- **Backend API:** `https://team-builder-backend-xxxx.onrender.com`
- **Health Check:** `https://team-builder-backend-xxxx.onrender.com/health`
- **API Base:** `https://team-builder-backend-xxxx.onrender.com/api`

Replace `xxxx` with your actual Render subdomain.

## 📱 Building APK After Deployment

Once backend is deployed:

1. Update `services/api.ts` with production URL
2. Build APK:
   ```bash
   eas build --platform android --profile preview
   ```
3. Download and install APK on your phone
4. App will now work without local backend!

## ✨ You're Done!

Your backend is now live and accessible from anywhere. Your mobile app can connect to it, and you can build a standalone APK that works independently.
