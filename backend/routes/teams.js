const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teams');
const auth = require('../middleware/auth');

// @route   GET /api/teams
// @desc    Get all teams
// @access  Private
router.get('/', auth, teamController.getAllTeams);

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Private
router.get('/:id', auth, teamController.getTeam);

// @route   POST /api/teams
// @desc    Create new team
// @access  Private
router.post('/', auth, teamController.createTeam);

// @route   POST /api/teams/:id/members
// @desc    Add member to team
// @access  Private
router.post('/:id/members', auth, teamController.addMember);

// @route   DELETE /api/teams/:id/members/:userId
// @desc    Remove member from team
// @access  Private
router.delete('/:id/members/:userId', auth, teamController.removeMember);

// @route   POST /api/teams/join-qr
// @desc    Join team by scanning QR code
// @access  Private
router.post('/join-qr', auth, teamController.joinByQR);

module.exports = router;
