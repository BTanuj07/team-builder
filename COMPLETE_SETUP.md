# Team Builder - Complete Setup Guide

## ✅ What's Working

This is a complete Team Builder hackathon app with:
- **Backend**: Node.js + Express + MongoDB with 28 API endpoints
- **Frontend**: React Native (Expo) mobile app with 6 screens
- **AI Integration**: Google Gemini AI for team building suggestions
- **Authentication**: JWT-based auth with AsyncStorage
- **Features**: Project feed, AI assistant, team management, skill matching

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service)
net start MongoDB

# Or start manually
mongod
```

### Step 3: Seed Database

```bash
npm run seed
```

This creates:
- 8 demo users (including arjun@example.com)
- 30 skills
- 3 sample projects

### Step 4: Start Backend Server

```bash
npm run backend
```

Backend will run on `http://localhost:5000`

### Step 5: Configure Mobile App IP Address

**IMPORTANT**: For physical device testing, update the IP address in `services/api.ts`:

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   ```

2. Update `services/api.ts` line 9:
   ```typescript
   return 'http://YOUR_COMPUTER_IP:5000/api'; // Replace with your IP
   ```

### Step 6: Start Expo App

```bash
npm start
```

Then:
- Scan QR code with Expo Go app on your phone
- Or press `a` for Android emulator
- Or press `i` for iOS simulator

## 📱 Demo Credentials

```
Email: arjun@example.com
Password: password123
```

## 🔧 Troubleshooting

### "Cannot connect to server"
- Verify backend is running (`npm run backend`)
- Check IP address in `services/api.ts` matches your computer's IP
- Ensure phone and computer are on same WiFi network
- Check firewall isn't blocking port 5000

### "MongoDB connection error"
- Start MongoDB service
- Verify MongoDB is running on port 27017
- Check `backend/.env` has correct MONGODB_URI

### "Module not found" errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- For backend: `cd backend && npm install`

### App won't reload in Expo Go
- Shake device and tap "Reload"
- Or press `r` in terminal where `npm start` is running
- Close and reopen Expo Go app

## 📚 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user profile
- POST `/api/users/:id/skills` - Add skill to user
- DELETE `/api/users/:id/skills/:skillId` - Remove skill

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create project
- GET `/api/projects/:id` - Get project by ID
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project
- POST `/api/projects/:id/join` - Join project
- POST `/api/projects/:id/leave` - Leave project

### Skills
- GET `/api/skills` - Get all skills
- POST `/api/skills` - Create skill
- GET `/api/skills/:id` - Get skill by ID

### Teams
- GET `/api/teams` - Get all teams
- POST `/api/teams` - Create team
- GET `/api/teams/:id` - Get team by ID
- PUT `/api/teams/:id` - Update team
- DELETE `/api/teams/:id` - Delete team
- POST `/api/teams/:id/join` - Join team
- POST `/api/teams/:id/leave` - Leave team
- GET `/api/teams/:id/qr` - Get team QR code

### AI Assistant
- POST `/api/ai/suggest-team` - Get AI team suggestions
- POST `/api/ai/match-skills` - Match skills for project
- POST `/api/ai/chat` - Chat with AI assistant

## 🎯 Features Implemented

### Mobile App Screens
1. **Login** - Email/password authentication
2. **Register** - New user registration
3. **Projects Feed** - Browse and join projects
4. **AI Assistant** - Chat with AI for team suggestions
5. **Teams** - View and manage teams
6. **Profile** - User profile with skills

### Backend Features
- JWT authentication with bcrypt password hashing
- MongoDB models for User, Project, Skill, Team, Message, AILog
- Google Gemini AI integration for intelligent team building
- Skill matching algorithm
- QR code generation for teams
- Complete CRUD operations for all resources

## 📦 Tech Stack

- **Frontend**: React Native, Expo SDK 54, Expo Router, TypeScript
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **AI**: Google Gemini AI
- **Auth**: JWT, bcryptjs
- **Storage**: AsyncStorage (Expo Go compatible)

## 🎉 Ready to Demo!

Your app is now fully configured and ready to use. Start the backend, update the IP address, and launch the mobile app to begin building teams!
