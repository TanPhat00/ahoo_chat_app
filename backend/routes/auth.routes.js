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

    if (!firstName || !lastName || !username || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin'
      });
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
    
    console.log('[REGISTER SUCCESS]', user);
    res.status(200).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ',
      detail: err.message
    });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Email không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Sai mật khẩu' });
    }

    const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.userId,
        username: user.username,
        email: user.email,
        avatar: user.avatar || null,
        status: user.status || 'offline',
        isVerified: user.isVerified,
        lastSeen: user.lastSeen,
        social: user.social
      }
    });

    console.log('[LOGIN SUCCESS]', {
      id: user._id,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({
      success: false,
      error: 'Đăng nhập thất bại',
      detail: err.message
    });
  }
});

module.exports = router;