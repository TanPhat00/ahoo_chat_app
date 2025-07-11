require('dotenv').config();

const allowedOrigins = process.env.CLIENT_ORIGINS?.split(',') || [
  'http://localhost:3000',     // server backend
  'http://127.0.0.1:5500',     // Live Server của VSCode
  'http://localhost:5500',     // thủ công
  'file://',                   // mở file trực tiếp
];

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
