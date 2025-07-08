const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const friendController = require('../controllers/friend.controller');

// 📌 Các route
router.post('/request/:userId', auth, friendController.sendFriendRequest);
router.get('/requests/incoming', auth, friendController.getIncomingRequests);
router.post('/accept/:requestId', auth, friendController.acceptFriendRequest);
router.post('/reject/:requestId', auth, friendController.rejectFriendRequest);
router.get('/list', auth, friendController.getFriendsList);
router.delete('/unfriend/:userId', auth, friendController.unfriend);
router.post('/block/:userId', auth, friendController.blockUser);
router.get('/search', auth, friendController.searchUser);
router.get('/blocklist', auth, friendController.getBlockedUsers); // ✅ bổ sung blocklist

module.exports = router;
