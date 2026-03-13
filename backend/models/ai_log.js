
const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  response: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AILog', aiLogSchema);
