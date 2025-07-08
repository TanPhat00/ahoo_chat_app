const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middlewares/auth.middleware');

const allowedEmojis = ['❤️', '😂', '👍', '👎', '🎉', '🔥', '😢', '😮'];

router.post('/:messageId', authMiddleware, async (req, res) => {
  const { messageId } = req.params;
  const { emojis } = req.body; // Mảng emoji
  const userId = req.user.id;

  if (!Array.isArray(emojis)) {
    return res.status(400).json({ error: 'emojis phải là mảng' });
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Không tìm thấy tin nhắn' });

    // Gỡ toàn bộ reaction cũ của user
    message.reactions = message.reactions.filter(
      r => r.user.toString() !== userId
    );

    // Lọc ra các emoji hợp lệ
    const validEmojis = emojis.filter(e => allowedEmojis.includes(e));

    // Thêm lại các emoji mới nếu có
    for (const emoji of validEmojis) {
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    res.json({
      message: 'Cập nhật reaction thành công',
      reactions: message.reactions
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

module.exports = router;