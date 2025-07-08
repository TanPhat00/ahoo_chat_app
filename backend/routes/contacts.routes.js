const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const User = require('../models/User');

router.post('/sync', auth, async (req, res) => {
  try {
    const { contacts } = req.body; // [{ phone }, { email }]
    const found = await User.find({
      $or: [
        { phone: { $in: contacts.map(c => c.phone) } },
        { email: { $in: contacts.map(c => c.email) } },
      ],
      _id: { $ne: req.user.id },
    }).select('_id username phone email avatar');
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi đồng bộ danh bạ', detail: err.message });
  }
});

module.exports = router;