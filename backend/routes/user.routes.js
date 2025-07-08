const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const User = require('../models/User');

// 📌 Lấy thông tin người dùng hiện tại
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi máy chủ', detail: err.message });
  }
});

// 📌 Cập nhật hồ sơ người dùng
router.put('/profile', auth, async (req, res) => {
  try {
    const updateFields = {};
    const allowedFields = ['firstName', 'lastName', 'username', 'email', 'phone', 'status'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, error: 'Không có thông tin nào để cập nhật' });
    }

    // Kiểm tra định dạng email
    if (updateFields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateFields.email)) {
      return res.status(400).json({ success: false, error: 'Email không hợp lệ' });
    }

    // Check trùng email hoặc username
    if (updateFields.email) {
      const exists = await User.findOne({ email: updateFields.email, _id: { $ne: req.user.id } });
      if (exists) return res.status(400).json({ success: false, error: 'Email đã được sử dụng' });
    }

    if (updateFields.username) {
      const exists = await User.findOne({ username: updateFields.username, _id: { $ne: req.user.id } });
      if (exists) return res.status(400).json({ success: false, error: 'Username đã được sử dụng' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Hồ sơ đã được cập nhật', user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Cập nhật thất bại', detail: err.message });
  }
});

// 📌 Đổi mật khẩu
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ success: false, error: 'Thiếu mật khẩu cũ hoặc mới' });

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Người dùng không tồn tại' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Mật khẩu cũ không đúng' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi đổi mật khẩu', detail: err.message });
  }
});

// 📌 Cập nhật trạng thái online/busy/away/offline
router.put('/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline', 'busy', 'away'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Trạng thái không hợp lệ' });
    }

    await User.findByIdAndUpdate(req.user.id, { status });
    res.json({ success: true, message: 'Đã cập nhật trạng thái' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi cập nhật trạng thái', detail: err.message });
  }
});
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      status: 'offline',
      lastSeen: new Date(),
    });
    res.json({ message: 'Đăng xuất thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi đăng xuất', detail: err.message });
  }
});

module.exports = router;
