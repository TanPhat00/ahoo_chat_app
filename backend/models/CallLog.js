const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['voice', 'video'] },
  duration: Number,
  startedAt: Date,
  endedAt: Date,
  status: { type: String, enum: ['missed', 'completed'] }
});

module.exports = mongoose.model('CallLog', callLogSchema);
