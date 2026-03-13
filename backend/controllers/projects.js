const Project = require('../models/project');
const User = require('../models/user');

// @desc    Get all projects with filters
exports.getAllProjects = async (req, res) => {
  try {
    const { skills, teamSize, search } = req.query;
    let query = {};

    if (skills) {
      const skillIds = skills.split(',');
      query.requiredSkills = { $in: skillIds };
    }

    if (teamSize) {
      query.teamSize = teamSize;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const projects = await Project.find(query)
      .populate('requiredSkills')
      .populate('createdBy', 'name email college')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Get projects error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('requiredSkills')
      .populate('createdBy', 'name email college skills');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (err) {
    console.error('Get project error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, teamSize, timeline } = req.body;

    if (!title || !description || !requiredSkills || !teamSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide title, description, required skills, and team size' 
      });
    }

    const project = new Project({
      title,
      description,
      requiredSkills,
      teamSize,
      timeline,
      createdBy: req.user.id,
    });

    await project.save();

    const populatedProject = await Project.findById(project.id)
      .populate('requiredSkills')
      .populate('createdBy', 'name email college');

    res.status(201).json({ success: true, project: populatedProject });
  } catch (err) {
    console.error('Create project error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user is project creator
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, requiredSkills, teamSize, timeline } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (requiredSkills) project.requiredSkills = requiredSkills;
    if (teamSize) project.teamSize = teamSize;
    if (timeline) project.timeline = timeline;

    await project.save();

    const updatedProject = await Project.findById(project.id)
      .populate('requiredSkills')
      .populate('createdBy', 'name email college');

    res.json({ success: true, project: updatedProject });
  } catch (err) {
    console.error('Update project error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user is project creator
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's projects
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id })
      .populate('requiredSkills')
      .populate('createdBy', 'name email college')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Get my projects error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
