const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true }, // 
  firstName: String,
  lastName: String,
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  phone: String,
  password: String,
  avatar: String,
  status: { type: String, enum: ['online', 'offline', 'busy', 'away'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  devices: [{ deviceId: String, platform: String, lastLogin: Date }],
  lastSeen: Date,
  loginToken: { type: String, default: null },
  social: {
    googleId: String,
    facebookId: String,
    appleId: String,
  },
  createdAt: { type: Date, default: Date.now },
});

// 👇 Tự động tăng `userId`
userSchema.plugin(AutoIncrement, { inc_field: 'userId' });

module.exports = mongoose.model('User', userSchema);
