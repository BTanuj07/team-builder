# Team Builder Backend API

Backend API for the Team Builder Hackathon App - AI-powered team formation platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB running locally or MongoDB Atlas account
- Google AI API key (for AI features)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
MONGODB_URI=mongodb://localhost:27017/team-builder
JWT_SECRET=your_secret_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

### Seed Database

```bash
npm run seed
```

This creates sample users, skills, and projects.

### Run Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `POST /api/users/skills` - Add skill
- `DELETE /api/users/skills/:skillId` - Remove skill
- `POST /api/users/match` - Match users by skills

### Projects
- `GET /api/projects` - Get all projects (with filters)
- `GET /api/projects/my` - Get user's projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill

### Teams
- `GET /api/teams/:id` - Get team
- `POST /api/teams` - Create team
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members/:userId` - Remove member
- `POST /api/teams/join-qr` - Join team via QR code

### AI Agent (⭐ Key Feature)
- `POST /api/ai/build-team` - AI team builder
- `POST /api/ai/match-skills` - Match users by skills
- `POST /api/ai/find-teammates` - Find teammates for roles
- `POST /api/ai/draft-message` - Draft intro message
- `GET /api/ai/logs` - Get AI interaction logs

## 🤖 AI Team Builder Usage

```javascript
POST /api/ai/build-team
Authorization: Bearer <token>

{
  "prompt": "Build my team for a fintech hack. Need React developer, backend engineer, and pitch presenter"
}

Response:
{
  "success": true,
  "data": {
    "analysis": "...",
    "requiredSkills": ["React", "Node.js", "Pitching"],
    "recommendedTeam": [
      {
        "userId": "...",
        "name": "Arjun Kumar",
        "role": "React Native Developer",
        "matchReason": "Expert in React Native with fintech experience",
        "skills": ["React Native", "JavaScript"]
      }
    ],
    "roleSplit": {...},
    "draftMessage": "Hi team, I'm forming...",
    "nextSteps": [...]
  },
  "requiresApproval": true
}
```

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

## 📝 Sample Login

After seeding:
- Email: `arjun@example.com`
- Password: `password123`

## 🛠️ Tech Stack

- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Google Generative AI (Gemini)
- QR Code generation
- bcryptjs for password hashing

## 📦 Project Structure

```
backend/
├── controllers/     # Request handlers
├── models/          # MongoDB schemas
├── routes/          # API routes
├── middleware/      # Auth middleware
├── scripts/         # Seed scripts
└── server.js        # Entry point
```
