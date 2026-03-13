const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai');
const auth = require('../middleware/auth');

// @route   POST /api/ai/build-team
// @desc    AI Team Builder - Main endpoint
// @access  Private
router.post('/build-team', auth, aiController.buildTeam);

// @route   POST /api/ai/match-skills
// @desc    Match users by skills
// @access  Private
router.post('/match-skills', auth, aiController.matchSkills);

// @route   POST /api/ai/find-teammates
// @desc    Find teammates for specific roles
// @access  Private
router.post('/find-teammates', auth, aiController.findTeammates);

// @route   POST /api/ai/draft-message
// @desc    Draft introduction message
// @access  Private
router.post('/draft-message', auth, aiController.draftMessage);

// @route   GET /api/ai/logs
// @desc    Get AI interaction logs
// @access  Private
router.get('/logs', auth, aiController.getAILogs);

module.exports = router;
