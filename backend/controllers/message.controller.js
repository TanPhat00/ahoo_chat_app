const Message = require('../models/Message');

// ✅ Lấy danh sách tin nhắn trong phòng
exports.getMessagesInRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.id;

    const messages = await Message.find({
      room: roomId,
      deletedFor: { $ne: userId }
    })
      .populate('sender', 'username avatar')
      .populate('replyTo')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// ✅ Xoá tin nhắn cho user hiện tại (soft delete)
exports.deleteMessageForUser = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Tin nhắn không tồn tại' });

    if (!message.deletedFor.includes(req.user.id)) {
      message.deletedFor.push(req.user.id);
      await message.save();
    }

    res.json({ message: 'Đã xoá tin nhắn cho bạn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
