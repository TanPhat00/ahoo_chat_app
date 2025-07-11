// config/corsOptions.js
require('dotenv').config();

const allowedOrigins = process.env.CLIENT_ORIGINS?.split(',') || 
[
  'http://localhost:3000',     // server backend
  'http://127.0.0.1:5500',     // nếu bạn dùng Live Server của VSCode
  'http://localhost:5500',     // nếu bạn chạy thủ công
  'file://'                    // nếu bạn chạy trực tiếp file HTML
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🟡 Origin gửi đến là:", origin); // THÊM DÒNG NÀY

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
