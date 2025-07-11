const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Message = require('../models/Message');
const Room = require('../models/Room'); // ✅ Bổ sung model Room

// ✅ API: Lấy tất cả tin nhắn trong phòng
router.get('/:roomId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username avatar' }
      })
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ✅ API: Tìm hoặc tạo phòng 1-1
router.post('/create-or-get-room', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ success: false, error: 'Thiếu otherUserId' });
    }

    // Kiểm tra phòng đã tồn tại giữa 2 người chưa
    let room = await Room.findOne({
      isGroup: false,
      members: { $all: [userId, otherUserId], $size: 2 }
    });

    // Nếu chưa có → tạo mới
    if (!room) {
      room = new Room({
        isGroup: false,
        members: [userId, otherUserId],
      });
      await room.save();
    }

    res.json({ success: true, roomId: room._id, room });
  } catch (err) {
    console.error('❌ Lỗi tạo/lấy phòng:', err.message);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ', detail: err.message });
  }
});


// ✅ Lấy tất cả phòng mà user đang tham gia
router.get('/my-rooms', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate('members', 'username avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ success: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

module.exports = router;
