const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Message = require('../models/Message');

router.get('/:chatId/media', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
      sender: req.user.id,
      type: { $in: ['image', 'video'] },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tải media', detail: err.message });
  }
});

module.exports = router;