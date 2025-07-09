const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer abc123

    if (!token) {
      return res.status(401).json({ error: 'Thiếu token' });
    }

    const user = await User.findOne({ loginToken: token });
    if (!user) {
      return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    req.user = {
      id: user._id, // ✅ quan trọng
      // _id: user._id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err);
    res.status(500).json({ error: 'Lỗi xác thực', detail: err.message });
  }
};
