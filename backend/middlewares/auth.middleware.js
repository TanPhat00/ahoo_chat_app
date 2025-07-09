const User = require('../models/User');

module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer 1234|abcdef...

  if (!token) return res.status(401).json({ error: 'Thiếu token' });

  try {
    const user = await User.findOne({ loginToken: token });
    if (!user) return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });

    req.user = {
      id: user.userId, // hoặc user._id nếu không có userId
      username: user.username,
      email: user.email,
    };
    next();
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xác thực', detail: err.message });
  }
};
