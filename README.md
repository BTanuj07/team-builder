# Team Builder - AI-Powered Hackathon Team Formation App

🏆 **Hackathon-Ready Mobile App** for students to create profiles, list skills, post projects, and find teammates using an AI assistant.

## 🎯 Project Overview

Team Builder is a hybrid mobile application that helps hackathon participants form optimal teams based on skills, availability, and project requirements. The app features an AI agent that can understand natural language requests and recommend team compositions.

## ✨ Key Features

### Core Features
- ✅ User profiles with skills and portfolio
- ✅ Project posting and browsing
- ✅ Skill-based team matching
- ✅ Search and filters
- ✅ Team management dashboard

### AI Agent (⭐ Main Feature)
- 🤖 Natural language team building
- 🎯 Smart skill matching
- 👥 Teammate recommendations
- 💬 Auto-generated intro messages
- 📊 Role split suggestions

### Native Features
- 🔐 Biometric authentication
- 📱 QR code team joining
- 🔔 Push notifications
- 🌓 Dark/light theme
- 💾 Offline caching

## 🏗️ Architecture

```
team-builder-app/
├── app/                    # Expo Router (React Native)
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx
├── backend/               # Node.js + Express API
│   ├── controllers/       # Business logic
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth middleware
│   └── server.js
├── mobile/               # Legacy screens (to be migrated)
└── frontend/             # Web UI (optional)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Expo CLI
- Google AI API key

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your credentials
```

### 3. Seed Database

```bash
npm run seed
```

### 4. Start Backend

```bash
npm run backend
```

Backend runs on `http://localhost:5000`

### 5. Start Mobile App

```bash
npm start
```

## 🤖 AI Team Builder Demo

**User Prompt:**
```
"Build my team for a fintech hack. Need React developer, backend engineer, and pitch presenter"
```

**AI Response:**
```json
{
  "analysis": "Fintech project requiring full-stack development and presentation skills",
  "requiredSkills": ["React", "Node.js", "Pitching"],
  "recommendedTeam": [
    {
      "name": "Arjun Kumar",
      "role": "React Native Developer",
      "matchReason": "Expert in React Native with fintech experience",
      "skills": ["React Native", "JavaScript", "Firebase"]
    },
    {
      "name": "Sneha Patel",
      "role": "Backend Engineer",
      "matchReason": "Strong Node.js and database skills",
      "skills": ["Node.js", "MongoDB", "Backend Development"]
    },
    {
      "name": "Riya Sharma",
      "role": "Product & Pitch",
      "matchReason": "Experienced in product management and pitching",
      "skills": ["Product Management", "Pitching", "UI/UX Design"]
    }
  ],
  "draftMessage": "Hi team! I'm forming a fintech hackathon team...",
  "nextSteps": ["Review team", "Send invitations", "Schedule kickoff"]
}
```

## 📱 Mobile App Screens

1. **Login/Register** - Biometric auth
2. **Profile** - Skills, portfolio, availability
3. **Project Feed** - Browse hackathon projects
4. **Search** - Filter by skills, team size
5. **AI Assistant** - Natural language team building
6. **Team Dashboard** - Manage your teams
7. **QR Scanner** - Join teams instantly

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### AI Agent
- `POST /api/ai/build-team` - Main AI endpoint
- `POST /api/ai/match-skills`
- `POST /api/ai/find-teammates`
- `POST /api/ai/draft-message`

### Users & Projects
- `GET /api/users` - Search users
- `GET /api/projects` - Browse projects
- `POST /api/projects` - Create project
- `POST /api/teams` - Create team

See [backend/README.md](backend/README.md) for full API documentation.

## 🛠️ Tech Stack

### Mobile App
- React Native (Expo)
- Expo Router
- Axios
- Expo Local Authentication
- React Native QR Scanner

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Google Generative AI (Gemini)
- QR Code generation

### AI
- Google Gemini Pro
- Natural language processing
- Skill matching algorithms

## 📝 Sample Credentials

After seeding the database:

```
Email: arjun@example.com
Password: password123
```

All sample users have the same password.

## 🎓 Hackathon Demo Flow

### Flow 1: User Onboarding
1. Register with biometric
2. Add skills (React, Node.js, etc.)
3. Set availability

### Flow 2: Browse Projects
1. View project feed
2. Filter by skills
3. Apply to join team

### Flow 3: AI Team Builder ⭐
1. Open AI Assistant
2. Type: "Build my team for a fintech hack"
3. Review AI recommendations
4. Approve team members
5. Send auto-generated invitations

## 🏆 What Impresses Judges

1. **AI Workflow** - Natural language → Team recommendations
2. **Native Features** - Biometric login, QR joining
3. **Matching Algorithm** - Smart skill-based matching
4. **Complete System** - Working backend + mobile + AI

## 📦 Project Status

✅ Backend API complete
✅ Database models & seeding
✅ AI agent implementation
✅ Authentication system
✅ Team matching algorithm
🚧 Mobile UI (in progress)
🚧 Biometric auth integration
🚧 QR code scanner

## 🤝 Contributing

This is a hackathon project. Focus on:
- Mobile UI screens
- AI prompt engineering
- Matching algorithm improvements
- Native feature integration

## 📄 License

MIT License - Built for RVCE Hackathon 2024

---

**Built with ❤️ for hackathon teams**
