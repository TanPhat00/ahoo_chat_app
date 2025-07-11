const io = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: {
    token: "JWT_TOKEN_NẾU_BẠN_DÙNG_AUTH"
  }
});

// 👉 Khi kết nối thành công
socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // Tham gia phòng
  socket.emit("chat:joinRoom", "roomId_123");

  // Gửi tin nhắn
  socket.emit("chat:sendMessage", {
    roomId: "roomId_123",
    message: {
      sender: { _id: "USER_ID_123" },
      type: "text",
      content: "Xin chào từ script test!",
      fileUrl: "",
      replyTo: null
    }
  });
});

// Nhận tin nhắn
socket.on("chat:receiveMessage", (data) => {
  console.log("📥 Tin nhắn nhận được:", data);
});

// Lỗi
socket.on("chat:error", (err) => {
  console.error("❌ Lỗi chat:", err);
});
