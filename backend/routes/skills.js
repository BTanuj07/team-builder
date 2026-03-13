const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skills');
const auth = require('../middleware/auth');

// @route   GET /api/skills
// @desc    Get all skills
// @access  Private
router.get('/', auth, skillController.getSkills);

// @route   POST /api/skills
// @desc    Create new skill
// @access  Private
router.post('/', auth, skillController.createSkill);

module.exports = router;
