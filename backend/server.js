require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const multer = require('multer');
const upload = multer();

// 🔧 Config
const corsOptions = require('./config/corsOptions');
require('./config/cloudinary'); // Cloudinary config

// 📦 Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const uploadRoutes = require('./routes/upload.routes');
const messageRoutes = require('./routes/message.routes'); 
const reactionRoutes = require('./routes/reaction.routes');
const friendRoutes = require('./routes/friend.routes');

// 🔌 Socket & Middleware
const chatSocket = require('./sockets/chat.socket');
const errorHandler = require('./middlewares/errorHandler');

// 🧩 App + Server
const app = express();
const server = http.createServer(app);

// 🛡 Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/reactions', reactionRoutes);

// 🛠 Error Handler
app.use(errorHandler);

// 🔌 MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:');
    console.error('📛 Error name:', err.name);
    console.error('📛 Error message:', err.message);
    console.error('📛 Full error:', err);
    process.exit(1);
  });

  const io = new Server(server, {
    cors: corsOptions
  });
  
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);
  chatSocket(io, socket);

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
