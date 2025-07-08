const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Message = require('../models/Message');

// Lấy tất cả tin nhắn trong phòng
router.get('/:roomId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).populate('sender');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
