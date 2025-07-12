
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io, socket) => {

  console.log(`🟣 Socket active: ${socket.id}`);
  
  // ✅ Lấy userId từ socket.handshake.auth.userId (client truyền lên)
  const userId = socket.handshake.auth?.userId;

  if (userId) {
    // ✅ Set user online
    User.findByIdAndUpdate(userId, { status: 'online' }, { new: true })
      .then(() => {
        console.log(`🟢 User ${userId} is online`);
        io.emit('user:statusChanged', { userId, status: 'online' }); // Gửi cho mọi client
      });
  }

  // 👉 Gửi tin nhắn mới
  socket.on('chat:sendMessage', async ({ roomId, message }) => {
    try {
      const newMsg = new Message({
        room: roomId,
        sender: message.sender._id,
        type: message.type || 'text',
        content: message.content || '',
        fileUrl: message.fileUrl || '',
        replyTo: message.replyTo || null
      });

      const saved = await newMsg.save();
      const populated = await saved.populate('sender', 'username avatar');

      io.to(roomId).emit('chat:receiveMessage', { message: populated });
    } catch (err) {
      console.error('💥 Lỗi gửi tin nhắn:', err.message);
      socket.emit('chat:error', { error: 'Không gửi được tin nhắn' });
    }
  });
  // ✅ Xoá tin nhắn
  socket.on('chat:deleteMessage', ({ messageId, roomId }) => {
    console.log(`❌ Tin nhắn ${messageId} bị xoá trong phòng ${roomId}`);
    socket.to(roomId).emit('chat:messageDeleted', { messageId });
  });

  // ✅ Sửa tin nhắn
  socket.on('chat:editMessage', ({ messageId, newContent, roomId }) => {
    console.log(`✏️ Tin nhắn ${messageId} được sửa trong phòng ${roomId}`);
    socket.to(roomId).emit('chat:messageEdited', { messageId, newContent });
  });

  // Tham gia phòng
  socket.on('chat:joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`🔵 ${socket.id} đã vào phòng ${roomId}`);
  });

  // Rời phòng
  socket.on('chat:leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`⚪ ${socket.id} đã rời phòng ${roomId}`);
  });

  socket.on('disconnect', () => {
    if (userId) {
      User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() })
        .then(() => {
          console.log(`🔴 User ${userId} is offline`);
          io.emit('user:statusChanged', { userId, status: 'offline' });
        });
    }
  });
};
