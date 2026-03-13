
const Team = require('../models/team');
const QRCode = require('qrcode');

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'name email college skills')
      .populate('project')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: teams.length, teams });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'name email college skills')
      .populate('project');
    
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({ success: true, team });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, project } = req.body;

    const team = new Team({
      name,
      project,
      members: [req.user.id],
    });

    // Generate QR code for team joining
    const qrData = JSON.stringify({ teamId: team._id, name: team.name });
    const qrCode = await QRCode.toDataURL(qrData);
    team.qrCode = qrCode;

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('members', 'name email college skills')
      .populate('project');

    res.status(201).json({ success: true, team: populatedTeam });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }

    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email college skills')
      .populate('project');

    res.json({ success: true, team: updatedTeam });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    team.members = team.members.filter(m => m.toString() !== userId);
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email college skills')
      .populate('project');

    res.json({ success: true, team: updatedTeam });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.joinByQR = async (req, res) => {
  try {
    const { teamId } = req.body;

    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!team.members.includes(req.user.id)) {
      team.members.push(req.user.id);
      await team.save();
    }

    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email college skills')
      .populate('project');

    res.json({ success: true, team: updatedTeam, message: 'Successfully joined team!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
