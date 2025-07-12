require('dotenv').config();

let allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://chatvoitoi.onrender.com',
];

// Gộp thêm từ biến môi trường nếu có
if (process.env.CLIENT_ORIGINS) {
  const envOrigins = process.env.CLIENT_ORIGINS
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  allowedOrigins = [...new Set([...allowedOrigins, ...envOrigins])]; // loại trùng
}

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🟡 Origin gửi đến là:', JSON.stringify(origin));

    // Chấp nhận:
    // - request không có origin (ví dụ từ Postman, curl)
    // - origin nằm trong danh sách cho phép
    // - origin là null (trường hợp file://)
    if (!origin || allowedOrigins.includes(origin) || origin === null) {
      callback(null, true);
    } else {
      console.warn('❌ CORS từ chối:', origin);
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

module.exports = {
  corsOptions,
  allowedOrigins,
};
