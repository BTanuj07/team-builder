# Team Builder API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "college": "RVCE"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "college": "RVCE"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "college": "RVCE",
    "skills": [...],
    "availability": "available"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": [...],
    "portfolioLinks": [...]
  }
}
```

---

## 👥 User Endpoints

### Get All Users
```http
GET /users?skills=<skillIds>&availability=available&search=<query>
Authorization: Bearer <token>
```

**Query Parameters:**
- `skills` - Comma-separated skill IDs
- `availability` - "available" or "not available"
- `college` - College name
- `search` - Search by name or email

**Response:**
```json
{
  "success": true,
  "count": 10,
  "users": [
    {
      "id": "...",
      "name": "Arjun Kumar",
      "email": "arjun@example.com",
      "college": "RVCE",
      "skills": [...],
      "availability": "available"
    }
  ]
}
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "college": "RVCE",
  "skills": ["skillId1", "skillId2"],
  "availability": "available",
  "portfolioLinks": ["https://github.com/user"]
}
```

### Add Skill
```http
POST /users/skills
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "skillId": "507f1f77bcf86cd799439011"
}
```

### Remove Skill
```http
DELETE /users/skills/:skillId
Authorization: Bearer <token>
```

### Match Users by Skills
```http
POST /users/match
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "requiredSkills": ["skillId1", "skillId2", "skillId3"]
}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "users": [
    {
      "id": "...",
      "name": "Arjun Kumar",
      "matchScore": 100,
      "skills": [...]
    }
  ]
}
```

---

## 📋 Project Endpoints

### Get All Projects
```http
GET /projects?skills=<skillIds>&teamSize=<number>&search=<query>
Authorization: Bearer <token>
```

**Query Parameters:**
- `skills` - Comma-separated skill IDs
- `teamSize` - Number of team members
- `search` - Search by title or description

### Get Project by ID
```http
GET /projects/:id
Authorization: Bearer <token>
```

### Get My Projects
```http
GET /projects/my
Authorization: Bearer <token>
```

### Create Project
```http
POST /projects
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "FinTech Payment App",
  "description": "Build a mobile payment solution",
  "requiredSkills": ["skillId1", "skillId2"],
  "teamSize": 4,
  "timeline": "24 hours"
}
```

### Update Project
```http
PUT /projects/:id
Authorization: Bearer <token>
```

### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer <token>
```

---

## 🎯 Skills Endpoints

### Get All Skills
```http
GET /skills
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "skills": [
    {
      "id": "...",
      "name": "React"
    },
    {
      "id": "...",
      "name": "Node.js"
    }
  ]
}
```

### Create Skill
```http
POST /skills
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Flutter"
}
```

---

## 👨‍👩‍👧‍👦 Team Endpoints

### Get Team
```http
GET /teams/:id
Authorization: Bearer <token>
```

### Create Team
```http
POST /teams
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "FinTech Warriors",
  "project": "projectId"
}
```

**Response:**
```json
{
  "success": true,
  "team": {
    "id": "...",
    "name": "FinTech Warriors",
    "members": [...],
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Add Member
```http
POST /teams/:id/members
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

### Remove Member
```http
DELETE /teams/:id/members/:userId
Authorization: Bearer <token>
```

### Join Team by QR Code
```http
POST /teams/join-qr
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "teamId": "507f1f77bcf86cd799439011"
}
```

---

## 🤖 AI Agent Endpoints (⭐ Key Feature)

### AI Team Builder
```http
POST /ai/build-team
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "prompt": "Build my team for a fintech hack. Need React developer, backend engineer, and pitch presenter"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Fintech project requiring full-stack development...",
    "requiredSkills": ["React", "Node.js", "Pitching"],
    "recommendedTeam": [
      {
        "userId": "...",
        "name": "Arjun Kumar",
        "role": "React Native Developer",
        "matchReason": "Expert in React Native with fintech experience",
        "skills": ["React Native", "JavaScript", "Firebase"],
        "email": "arjun@example.com",
        "college": "RVCE"
      }
    ],
    "roleSplit": {
      "Frontend": "React Native developer for mobile UI",
      "Backend": "Node.js engineer for API development",
      "Presentation": "Product manager for pitch"
    },
    "draftMessage": "Hi team! I'm forming a fintech hackathon team...",
    "nextSteps": [
      "Review team recommendations",
      "Approve team members",
      "Send invitations",
      "Schedule kickoff meeting"
    ]
  },
  "requiresApproval": true,
  "message": "AI team recommendations generated. Please review and approve."
}
```

### Match Skills
```http
POST /ai/match-skills
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "requiredSkills": ["skillId1", "skillId2"]
}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "matches": [
    {
      "id": "...",
      "name": "Arjun Kumar",
      "matchedSkills": ["React", "JavaScript"],
      "matchScore": 100
    }
  ]
}
```

### Find Teammates
```http
POST /ai/find-teammates
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roles": ["React Developer", "Backend Engineer", "UI/UX Designer"]
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": {
    "React Developer": [
      {
        "userId": "...",
        "name": "Arjun Kumar",
        "skills": ["React", "JavaScript"],
        "college": "RVCE"
      }
    ],
    "Backend Engineer": [...]
  }
}
```

### Draft Message
```http
POST /ai/draft-message
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "projectTitle": "FinTech Payment App",
  "teamMembers": [
    { "name": "Arjun", "role": "Frontend" },
    { "name": "Sneha", "role": "Backend" }
  ],
  "context": "We're building a revolutionary payment solution"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hi team! 👋\n\nI'm John Doe, and I'm excited to form a team for \"FinTech Payment App\".\n\nWe're building a revolutionary payment solution\n\nTeam Members:\n1. Arjun - Frontend\n2. Sneha - Backend\n\nLet's connect and discuss our approach. Looking forward to working with you all!\n\nBest regards,\nJohn Doe"
}
```

### Get AI Logs
```http
GET /ai/logs
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "logs": [
    {
      "prompt": "Build team for fintech hack",
      "response": {...},
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 📊 Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 🔒 Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

---

## 🧪 Example cURL Commands

### Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","college":"RVCE"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Use AI Team Builder
```bash
curl -X POST http://localhost:5000/api/ai/build-team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"prompt":"Build my team for a fintech hack"}'
```

---

**For more examples, see the [backend/README.md](backend/README.md) file.**
