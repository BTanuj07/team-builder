const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projects');
const auth = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects with filters
// @access  Private
router.get('/', auth, projectController.getAllProjects);

// @route   GET /api/projects/my
// @desc    Get user's projects
// @access  Private
router.get('/my', auth, projectController.getMyProjects);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', auth, projectController.getProjectById);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', auth, projectController.createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', auth, projectController.updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router;
