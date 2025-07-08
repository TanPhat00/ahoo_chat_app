const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const User = require('../models/User');

router.put('/preferences', auth, async (req, res) => {
  try {
    const { language, theme } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { 'preferences.language': language, 'preferences.theme': theme } }, { new: true });
    res.json({ message: 'Cập nhật cài đặt thành công', user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật cài đặt', detail: err.message });
  }
});

module.exports = router;
