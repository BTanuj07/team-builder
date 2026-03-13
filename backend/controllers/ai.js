const Groq = require('groq-sdk');
const User = require('../models/user');
const Project = require('../models/project');
const Skill = require('../models/skill');
const AILog = require('../models/ai_log');

// Initialize Groq
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// @desc    AI Team Builder - Main function
exports.buildTeam = async (req, res) => {
  try {
    const { prompt, projectId } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
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

    // If Groq is not configured, use intelligent matching algorithm
    if (!groq) {
      console.log('Groq not configured, using intelligent matching...');
      
      // Extract keywords from prompt
      const promptLower = prompt.toLowerCase();
      const keywords = promptLower.split(/\s+/).filter(k => k.length > 2); // Filter out short words
      
      // Find relevant skills based on prompt
      const relevantSkills = allSkills.filter(skill => 
        keywords.some(keyword => 
          skill.name.toLowerCase().includes(keyword) || 
          keyword.includes(skill.name.toLowerCase())
        )
      );

      // If no relevant skills found, return empty response
      if (relevantSkills.length === 0) {
        return res.json({
          success: true,
          data: {
            analysis: `I couldn't find any relevant skills matching "${prompt}". Please try describing your project with specific technologies or skills (e.g., "React", "Python", "UI/UX Design").`,
            requiredSkills: [],
            recommendedTeam: [],
            roleSplit: {},
            draftMessage: '',
            nextSteps: ['Try a more specific prompt with technology names', 'Browse available skills in user profiles']
          },
          requiresApproval: false,
          message: 'No relevant skills found. Please refine your search.'
        });
      }

      // Match users based on skills
      const matchedUsers = availableUsers
        .map(user => {
          const matchedSkills = user.skills.filter(userSkill =>
            relevantSkills.some(relSkill => relSkill._id.toString() === userSkill._id.toString())
          );
          return {
            user,
            matchScore: matchedSkills.length,
            matchedSkills
          };
        })
        .filter(match => match.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4);

      // If no users match, return empty response
      if (matchedUsers.length === 0) {
        return res.json({
          success: true,
          data: {
            analysis: `I found relevant skills (${relevantSkills.map(s => s.name).join(', ')}) but no available users currently have these skills. Try different skills or check back later.`,
            requiredSkills: relevantSkills.map(s => s.name),
            recommendedTeam: [],
            roleSplit: {},
            draftMessage: '',
            nextSteps: ['Try different skill combinations', 'Create a project and wait for interested members', 'Invite specific users you know']
          },
          requiresApproval: false,
          message: 'No matching users found with these skills.'
        });
      }

      // Build response
      const aiResponse = {
        analysis: `Based on your request "${prompt}", I've identified ${matchedUsers.length} team members with relevant skills. This team combines expertise in ${relevantSkills.slice(0, 3).map(s => s.name).join(', ')} to help you achieve your goals.`,
        requiredSkills: relevantSkills.slice(0, 5).map(s => s.name),
        recommendedTeam: matchedUsers.map(match => ({
          userId: match.user._id,
          name: match.user.name,
          email: match.user.email,
          college: match.user.college,
          role: match.matchedSkills[0]?.name || 'Team Member',
          matchReason: `Has ${match.matchScore} relevant skill${match.matchScore > 1 ? 's' : ''}: ${match.matchedSkills.map(s => s.name).join(', ')}`,
          skills: match.user.skills.map(s => s.name),
          portfolioLinks: match.user.portfolioLinks
        })),
        roleSplit: {
          'Technical Lead': 'Oversees technical architecture and implementation',
          'Developer': 'Implements features and functionality',
          'Designer': 'Creates user interface and experience',
          'Project Manager': 'Coordinates team and manages timeline'
        },
        draftMessage: `Hi team! I'm ${currentUser.name}, and I'm excited to form a team for this project: "${prompt}". I believe we have the perfect skill mix to build something amazing together. Let's connect and discuss our approach!`,
        nextSteps: [
          'Review team member profiles',
          'Send connection requests',
          'Schedule kickoff meeting',
          'Define project scope and timeline',
          'Start building!'
        ]
      };

      // Log AI interaction
      await AILog.create({
        prompt,
        response: aiResponse,
        userId: req.user.id
      });

      return res.json({
        success: true,
        data: aiResponse,
        requiresApproval: true,
        message: 'Team recommendations generated using intelligent matching. Review and approve before sending invitations.'
      });
    }

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

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping to build hackathon teams. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let aiText = completion.choices[0].message.content;

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
