const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const auth = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users with filters
// @access  Private
router.get('/', auth, userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, userController.updateProfile);

// @route   POST /api/users/:id/skills
// @desc    Add skill to user
// @access  Private
router.post('/:id/skills', auth, userController.addSkill);

// @route   DELETE /api/users/:id/skills/:skillId
// @desc    Remove skill from user
// @access  Private
router.delete('/:id/skills/:skillId', auth, userController.removeSkill);

// @route   POST /api/users/match
// @desc    Match users by skills
// @access  Private
router.post('/match', auth, userController.matchUsersBySkills);

module.exports = router;
