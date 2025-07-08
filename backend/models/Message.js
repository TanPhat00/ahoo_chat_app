const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'voice', 'emoji', 'location'],
    default: 'text'
  },
  content: String,
  fileUrl: String,
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{ user: mongoose.Schema.Types.ObjectId, emoji: String }],
  isDeleted: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPinned: { type: Boolean, default: false },
  editedAt: { type: Date },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Message', messageSchema);
