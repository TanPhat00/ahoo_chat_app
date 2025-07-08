const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String },
  avatar: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isTemporary: { type: Boolean, default: false }, // tự huỷ sau thời gian
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
