require('dotenv').config();

let allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'file://'
];

// Nếu biến môi trường CLIENT_ORIGINS tồn tại → ưu tiên dùng
if (process.env.CLIENT_ORIGINS) {
  allowedOrigins = process.env.CLIENT_ORIGINS
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean); // loại bỏ chuỗi rỗng
}

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🟡 Origin gửi đến là:", origin);
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
