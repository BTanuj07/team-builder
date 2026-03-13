
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  availability: { type: String, enum: ['available', 'not available'], default: 'available' },
  portfolioLinks: [{ type: String }],
});

module.exports = mongoose.model('User', userSchema);
