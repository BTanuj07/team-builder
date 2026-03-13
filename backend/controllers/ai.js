const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/user');
const Project = require('../models/project');
const Skill = require('../models/skill');
const AILog = require('../models/ai_log');

// Initialize Google AI
const genAI = process.env.GOOGLE_AI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

// @desc    AI Team Builder - Main function
exports.buildTeam = async (req, res) => {
  try {
    const { prompt, projectId } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    if (!genAI) {
      return res.status(503).json({ 
        success: false, 
        message: 'AI service not configured. Please add GOOGLE_AI_API_KEY to .env' 
      });
    }

    // Get user context
    const currentUser = await User.findById(req.user.id).populate('skills');
    
    // Get all available users
    const availableUsers = await User.find({
      _id: { $ne: req.user.id },
      availability: 'available'
    }).populate('skills');

    // Get all skills
    const allSkills = await Skill.find();

    // Build context for AI
    const context = `
You are an AI assistant helping to build hackathon teams.

Current User: ${currentUser.name}
User's Skills: ${currentUser.skills.map(s => s.name).join(', ')}

Available Skills in System: ${allSkills.map(s => s.name).join(', ')}

Available Team Members (${availableUsers.length} users):
${availableUsers.slice(0, 20).map(u => `
- ${u.name} (${u.college || 'No college'})
  Skills: ${u.skills.map(s => s.name).join(', ')}
  Portfolio: ${u.portfolioLinks.join(', ') || 'None'}
`).join('\n')}

User Request: "${prompt}"

Please analyze the request and provide:
1. Required skills for this project
2. Recommended team members (with match reasoning)
3. Suggested role split
4. Draft introduction message
5. Next steps

Format your response as JSON with this structure:
{
  "analysis": "Brief analysis of the request",
  "requiredSkills": ["skill1", "skill2"],
  "recommendedTeam": [
    {
      "userId": "user_id",
      "name": "User Name",
      "role": "Suggested Role",
      "matchReason": "Why this person fits",
      "skills": ["skill1", "skill2"]
    }
  ],
  "roleSplit": {
    "role1": "Description",
    "role2": "Description"
  },
  "draftMessage": "Hi team, I'm forming...",
  "nextSteps": ["step1", "step2"]
}
`;

    // Call Google AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(context);
    const response = await result.response;
    let aiText = response.text();

    // Try to extract JSON from response
    let aiResponse;
    try {
      // Remove markdown code blocks if present
      aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      aiResponse = JSON.parse(aiText);
    } catch (parseError) {
      // If JSON parsing fails, create structured response
      aiResponse = {
        analysis: aiText.substring(0, 500),
        requiredSkills: [],
        recommendedTeam: [],
        roleSplit: {},
        draftMessage: aiText,
        nextSteps: ['Review AI suggestions', 'Approve team members', 'Send invitations']
      };
    }

    // Enhance recommendations with actual user data
    if (aiResponse.recommendedTeam && aiResponse.recommendedTeam.length > 0) {
      aiResponse.recommendedTeam = aiResponse.recommendedTeam.map(rec => {
        const user = availableUsers.find(u => 
          u.name.toLowerCase().includes(rec.name.toLowerCase()) ||
          rec.name.toLowerCase().includes(u.name.toLowerCase())
        );
        if (user) {
          return {
            ...rec,
            userId: user._id,
            email: user.email,
            college: user.college,
            actualSkills: user.skills.map(s => s.name),
            portfolioLinks: user.portfolioLinks
          };
        }
        return rec;
      });
    }

    // Log AI interaction
    await AILog.create({
      prompt,
      response: aiResponse,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: aiResponse,
      requiresApproval: true,
      message: 'AI team recommendations generated. Please review and approve before sending invitations.'
    });

  } catch (err) {
    console.error('AI build team error:', err.message);
    res.status(500).json({ success: false, message: 'AI service error', error: err.message });
  }
};

// @desc    Match skills for a project
exports.matchSkills = async (req, res) => {
  try {
    const { requiredSkills } = req.body;

    if (!requiredSkills || !Array.isArray(requiredSkills)) {
      return res.status(400).json({ success: false, message: 'Required skills array needed' });
    }

    const users = await User.find({
      skills: { $in: requiredSkills },
      _id: { $ne: req.user.id },
      availability: 'available'
    })
      .select('-password')
      .populate('skills');

    // Calculate match scores
    const scoredUsers = users.map(user => {
      const matchedSkills = user.skills.filter(skill => 
        requiredSkills.includes(skill._id.toString())
      );
      return {
        ...user.toObject(),
        matchedSkills: matchedSkills.map(s => s.name),
        matchScore: Math.round((matchedSkills.length / requiredSkills.length) * 100)
      };
    });

    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: scoredUsers.length, matches: scoredUsers });
  } catch (err) {
    console.error('Match skills error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Find teammates for specific roles
exports.findTeammates = async (req, res) => {
  try {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Roles array required. Example: ["React Developer", "Backend Engineer"]' 
      });
    }

    const allUsers = await User.find({
      _id: { $ne: req.user.id },
      availability: 'available'
    }).populate('skills');

    const recommendations = {};

    for (const role of roles) {
      // Simple keyword matching for demo
      const keywords = role.toLowerCase().split(' ');
      
      const matchedUsers = allUsers.filter(user => {
        const userSkills = user.skills.map(s => s.name.toLowerCase()).join(' ');
        return keywords.some(keyword => userSkills.includes(keyword));
      });

      recommendations[role] = matchedUsers.slice(0, 5).map(u => ({
        userId: u._id,
        name: u.name,
        email: u.email,
        college: u.college,
        skills: u.skills.map(s => s.name),
        portfolioLinks: u.portfolioLinks
      }));
    }

    res.json({ success: true, recommendations });
  } catch (err) {
    console.error('Find teammates error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Draft introduction message
exports.draftMessage = async (req, res) => {
  try {
    const { projectTitle, teamMembers, context } = req.body;

    const currentUser = await User.findById(req.user.id);

    const message = `Hi team! 👋

I'm ${currentUser.name}, and I'm excited to form a team for "${projectTitle}".

${context || 'I believe we have the perfect skill mix to build something amazing together.'}

Team Members:
${teamMembers.map((m, i) => `${i + 1}. ${m.name} - ${m.role || 'Team Member'}`).join('\n')}

Let's connect and discuss our approach. Looking forward to working with you all!

Best regards,
${currentUser.name}`;

    res.json({ success: true, message });
  } catch (err) {
    console.error('Draft message error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get AI logs
exports.getAILogs = async (req, res) => {
  try {
    const logs = await AILog.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Get AI logs error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
