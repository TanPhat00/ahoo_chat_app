const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceId: String,
  fcmToken: String,
  platform: { type: String, enum: ['android', 'ios', 'web'] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);
