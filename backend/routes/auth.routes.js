// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password } = req.body;

    // Kiểm tra bắt buộc
    if (!firstName || !lastName || !username || !email || !password || !phone) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      password: hash
    });

    await user.save();

    res.status(201).json({ message: 'Tạo tài khoản thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ', detail: err.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: 'Email không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Sai mật khẩu' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const { _id, username, email: userEmail, avatar, status } = user;

    res.status(200).json({
      token,
      user: { _id, username, email: userEmail, avatar, status }
    });
  } catch (err) {
    res.status(500).json({ error: 'Đăng nhập thất bại', detail: err.message });
  }
});

module.exports = router;