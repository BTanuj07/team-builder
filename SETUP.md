# Team Builder - Complete Setup Guide

## 📋 Prerequisites Checklist

- [ ] Node.js 16+ installed
- [ ] MongoDB installed (or MongoDB Atlas account)
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Android Studio (for Android development) or Xcode (for iOS)
- [ ] Google AI API key (get from https://makersuite.google.com/app/apikey)
- [ ] Git installed

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

```bash
# Root dependencies (Expo/React Native)
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Use in `.env` file

### 3. Backend Configuration

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Required `.env` values:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-builder
JWT_SECRET=your_random_secret_key_here_change_this
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Get Google AI API Key:**
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env`

### 4. Seed Database

```bash
# From root directory
npm run seed

# Or from backend directory
cd backend
npm run seed
```

**Expected output:**
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Created 30 skills
✅ Created 8 users
✅ Created 3 projects
🎉 Database seeded successfully!

📝 Sample Login Credentials:
Email: arjun@example.com
Password: password123
```

### 5. Start Backend Server

```bash
# From root directory
npm run backend

# Or from backend directory
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
📱 Environment: development
```

**Test backend:**
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","message":"Team Builder API is running"}
```

### 6. Start Mobile App

```bash
# From root directory
npm start
```

**Choose platform:**
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

### 7. Test API Endpoints

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "college": "RVCE"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "arjun@example.com",
    "password": "password123"
  }'
```

Save the `token` from response for authenticated requests.

#### Test AI Team Builder
```bash
curl -X POST http://localhost:5000/api/ai/build-team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "prompt": "Build my team for a fintech hack. Need React developer, backend engineer, and pitch presenter"
  }'
```

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running: `mongod`
- Check MongoDB status: `brew services list` (macOS)
- Verify connection string in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Google AI API Error
```
Error: API key not valid
```

**Solution:**
- Verify API key in `.env`
- Check API key is active at https://makersuite.google.com
- Ensure no extra spaces in `.env` file

### Expo/React Native Issues
```
Error: Unable to resolve module
```

**Solution:**
```bash
# Clear cache
expo start -c

# Or
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📱 Mobile Development Setup

### Android Setup

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK

2. **Set Environment Variables**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Create Virtual Device**
   - Open Android Studio
   - Tools → AVD Manager
   - Create Virtual Device
   - Choose Pixel 4 or similar

4. **Run App**
   ```bash
   npm start
   # Press 'a' for Android
   ```

### iOS Setup (macOS only)

1. **Install Xcode**
   - Download from App Store
   - Install Command Line Tools

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Run App**
   ```bash
   npm start
   # Press 'i' for iOS
   ```

## 🧪 Testing the Complete Flow

### 1. Backend Health Check
```bash
curl http://localhost:5000/health
```

### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@test.com","password":"test123"}'
```

### 3. Get All Skills
```bash
curl http://localhost:5000/api/skills \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Project",
    "description": "Test description",
    "requiredSkills": ["SKILL_ID_1", "SKILL_ID_2"],
    "teamSize": 4,
    "timeline": "24 hours"
  }'
```

### 5. AI Team Builder
```bash
curl -X POST http://localhost:5000/api/ai/build-team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt":"Build team for AI hackathon"}'
```

## 📊 Verify Setup

✅ **Backend Running:** http://localhost:5000/health returns OK
✅ **MongoDB Connected:** No connection errors in backend logs
✅ **Database Seeded:** 8 users, 30 skills, 3 projects created
✅ **API Working:** Can register, login, get users
✅ **AI Working:** AI endpoint returns team recommendations
✅ **Mobile App:** Expo app loads without errors

## 🎯 Next Steps

1. **Mobile UI Development**
   - Create login screen
   - Build profile screen
   - Implement AI assistant UI

2. **Native Features**
   - Add biometric authentication
   - Implement QR code scanner
   - Add push notifications

3. **Testing**
   - Test all API endpoints
   - Test mobile flows
   - Test AI recommendations

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Google AI Documentation](https://ai.google.dev/)
- [Express.js Documentation](https://expressjs.com/)

## 🆘 Need Help?

- Check backend logs for errors
- Verify all environment variables
- Ensure MongoDB is running
- Check API key is valid
- Clear caches and reinstall dependencies

---

**Setup complete! Ready to build amazing teams! 🚀**
