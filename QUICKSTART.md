# Team Builder - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (2 min)

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Configure Backend (1 min)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/team-builder
JWT_SECRET=your_secret_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here
```

Get Google AI key: https://makersuite.google.com/app/apikey

### Step 3: Seed Database (30 sec)

```bash
npm run seed
```

Creates 8 users, 30 skills, 3 projects.

### Step 4: Start Backend (30 sec)

```bash
npm run backend
```

Backend runs on http://localhost:5000

### Step 5: Start Mobile App (1 min)

```bash
# In new terminal
npm start
```

Press `a` for Android or `i` for iOS

## 🎯 Demo Login

```
Email: arjun@example.com
Password: password123
```

## ✨ Key Features to Demo

### 1. AI Team Builder (⭐ Main Feature)
1. Open AI Assistant tab
2. Type: "Build my team for a fintech hack"
3. See AI recommendations
4. Approve and send invitations

### 2. Biometric Login
1. Login once with email/password
2. Logout
3. Click "Login with Biometrics"
4. Use fingerprint/face ID

### 3. Projects Feed
1. Browse hackathon projects
2. Search and filter
3. View team requirements

### 4. Profile Management
1. View your profile
2. See your skills
3. Manage availability

### 5. QR Team Join
1. Go to Teams tab
2. Click "Scan QR Code"
3. Join team instantly

## 📱 Project Structure

```
team-builder-app/
├── app/                    # React Native screens
│   ├── (auth)/            # Login, Register
│   ├── (tabs)/            # Main app tabs
│   └── index.tsx          # Entry point
├── services/              # API services
│   ├── api.ts             # Axios config
│   ├── authService.ts     # Auth + Biometric
│   ├── aiService.ts       # AI Team Builder
│   ├── projectService.ts
│   ├── userService.ts
│   ├── skillService.ts
│   └── teamService.ts
└── backend/               # Node.js API
    ├── controllers/       # Business logic
    ├── models/           # MongoDB schemas
    ├── routes/           # API endpoints
    └── server.js
```

## 🔧 Troubleshooting

### MongoDB not running
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

### Port 5000 in use
```bash
# Kill process
lsof -i :5000
kill -9 <PID>
```

### Expo not starting
```bash
# Clear cache
expo start -c
```

## 🎓 API Testing

### Test AI Team Builder
```bash
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@example.com","password":"password123"}'

# Copy token, then:
curl -X POST http://localhost:5000/api/ai/build-team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt":"Build team for fintech hack"}'
```

## 📚 Documentation

- [README.md](README.md) - Full project overview
- [SETUP.md](SETUP.md) - Detailed setup guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - What's built

## 🏆 What's Working

✅ Complete backend API
✅ AI team building
✅ Mobile app with all core screens
✅ Biometric authentication
✅ Skill matching algorithm
✅ Database with sample data
✅ JWT authentication
✅ QR code generation

## 🎯 Ready to Demo!

The app is 95% complete and ready for hackathon demo. All core features work:
- AI Team Builder ⭐
- Biometric Login
- Projects Feed
- Profile Management
- Team Overview

---

**Need help?** Check [SETUP.md](SETUP.md) for detailed instructions.
