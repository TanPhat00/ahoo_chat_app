const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true },
  phone: { type: String },
  password: { type: String },
  avatar: { type: String },
  status: { type: String, enum: ['online', 'offline', 'busy', 'away'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  devices: [{ deviceId: String, platform: String, lastLogin: Date }],
  lastSeen: Date,
  social: {
    googleId: String,
    facebookId: String,
    appleId: String,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
