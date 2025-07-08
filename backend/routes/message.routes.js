const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Message = require('../models/Message');

// ✅ Lấy tin nhắn còn hiển thị (ẩn những tin đã xoá hoặc bị ẩn với user)
router.get('/room/:roomId', auth, async (req, res) => {
  try {
    const rawMessages = await Message.find({
      room: req.params.roomId,
      deletedFor: { $ne: req.user.id }
    }).populate('sender');

    const messages = rawMessages.map(msg => {
      if (msg.isDeleted) {
        return {
          _id: msg._id,
          sender: msg.sender,
          type: 'deleted',
          content: 'Tin nhắn đã bị xoá',
          createdAt: msg.createdAt
        };
      }
      return msg;
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// ✅ Lấy toàn bộ tin nhắn không lọc
router.get('/:roomId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).populate('sender');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Xoá tin nhắn cho tất cả mọi người
router.delete('/:id/all', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Tin nhắn không tồn tại' });

    if (message.sender.toString() !== req.user.id)
      return res.status(403).json({ error: 'Không có quyền xoá tin nhắn này' });

    message.isDeleted = true;
    await message.save();

    res.json({ message: 'Đã xoá cho tất cả mọi người' });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại', detail: err.message });
  }
});

// ✅ Xoá tin nhắn chỉ cho bản thân
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Tin nhắn không tồn tại' });

    // Thêm user vào danh sách xoá riêng
    if (!message.deletedFor.includes(req.user.id)) {
      message.deletedFor.push(req.user.id);
      await message.save();
    }

    res.json({ message: 'Đã xoá tin nhắn cho riêng bạn' });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại', detail: err.message });
  }
});

// ✅ Chỉnh sửa tin nhắn
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Tin nhắn không tồn tại' });

    if (message.sender.toString() !== req.user.id)
      return res.status(403).json({ error: 'Không có quyền chỉnh sửa' });

    message.content = content;
    await message.save();

    res.json({ message: 'Đã cập nhật tin nhắn', updated: message });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi chỉnh sửa', detail: err.message });
  }
});

// Xoá toàn bộ tin nhắn giữa người dùng hiện tại và 1 người khác
// DELETE /api/messages/user/:otherUserId
router.delete('/user/:otherUserId', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const otherUserId = req.params.otherUserId;
  
      // Lấy tất cả phòng 1-1 giữa 2 người
      const rooms = await Room.find({
        isGroup: false,
        members: { $all: [userId, otherUserId], $size: 2 }
      });
  
      if (!rooms.length) {
        return res.status(404).json({ error: 'Không có cuộc trò chuyện nào giữa 2 người' });
      }
  
      const roomIds = rooms.map(room => room._id);
  
      // Đánh dấu xoá toàn bộ tin nhắn 1 chiều cho user hiện tại
      await Message.updateMany(
        {
          room: { $in: roomIds },
          deletedFor: { $ne: userId }
        },
        { $addToSet: { deletedFor: userId } }
      );
  
      res.json({ message: 'Đã xoá toàn bộ tin nhắn với người dùng này (1 chiều)' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi máy chủ', detail: err.message });
    }
  });
  
module.exports = router;
