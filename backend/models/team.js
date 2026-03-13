
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  qrCode: { type: String }, // To store the QR code for joining the team
});

module.exports = mongoose.model('Team', teamSchema);
