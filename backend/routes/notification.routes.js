const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');

let notifications = []; // Hoặc bạn có thể dùng MongoDB

router.get('/', auth, (req, res) => {
  const userNoti = notifications.filter(n => n.userId === req.user.id);
  res.json(userNoti);
});

router.post('/', auth, (req, res) => {
  const { content, type } = req.body;
  notifications.push({ userId: req.user.id, content, type, createdAt: new Date() });
  res.json({ message: 'Đã thêm thông báo' });
});

module.exports = router;
