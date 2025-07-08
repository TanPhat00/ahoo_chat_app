// config/corsOptions.js
require('dotenv').config();

const allowedOrigins = process.env.CLIENT_ORIGINS?.split(',') || ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép truy cập khi không có origin (Postman, SSR) hoặc nằm trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

module.exports = corsOptions;
