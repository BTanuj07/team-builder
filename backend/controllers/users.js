const User = require('../models/user');
const Skill = require('../models/skill');

// @desc    Get all users with filters
exports.getAllUsers = async (req, res) => {
  try {
    const { skills, availability, college, search } = req.query;
    let query = {};

    if (skills) {
      const skillIds = skills.split(',');
      query.skills = { $in: skillIds };
    }

    if (availability) {
      query.availability = availability;
    }

    if (college) {
      query.college = new RegExp(college, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('skills')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('skills');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, college, skills, availability, portfolioLinks } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only allow users to update their own profile
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (name) user.name = name;
    if (college) user.college = college;
    if (skills) user.skills = skills;
    if (availability) user.availability = availability;
    if (portfolioLinks) user.portfolioLinks = portfolioLinks;

    await user.save();

    const updatedUser = await User.findById(user.id).select('-password').populate('skills');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add skill to user
exports.addSkill = async (req, res) => {
  try {
    const { skillId } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only allow users to update their own profile
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!user.skills.includes(skillId)) {
      user.skills.push(skillId);
      await user.save();
    }

    const updatedUser = await User.findById(user.id).select('-password').populate('skills');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Add skill error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove skill from user
exports.removeSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only allow users to update their own profile
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    user.skills = user.skills.filter(skill => skill.toString() !== skillId);
    await user.save();

    const updatedUser = await User.findById(user.id).select('-password').populate('skills');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Remove skill error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Match users by skills
exports.matchUsersBySkills = async (req, res) => {
  try {
    const { requiredSkills } = req.body;

    if (!requiredSkills || !Array.isArray(requiredSkills)) {
      return res.status(400).json({ success: false, message: 'Required skills array is needed' });
    }

    const users = await User.find({
      skills: { $in: requiredSkills },
      _id: { $ne: req.user.id },
      availability: 'available'
    })
      .select('-password')
      .populate('skills');

    // Calculate match score
    const scoredUsers = users.map(user => {
      const matchedSkills = user.skills.filter(skill => 
        requiredSkills.includes(skill._id.toString())
      );
      return {
        ...user.toObject(),
        matchScore: (matchedSkills.length / requiredSkills.length) * 100
      };
    });

    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: scoredUsers.length, users: scoredUsers });
  } catch (err) {
    console.error('Match users error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
