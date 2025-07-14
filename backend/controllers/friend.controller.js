const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

// 📌 Gửi lời mời kết bạn
// 📌 Gửi lời mời kết bạn từ BODY
exports.sendFriendRequest = async (req, res) => {
  try {
    const targetId = req.body.userId; // <-- Lấy từ body

    if (req.user.id === targetId)
      return res.status(400).json({ error: 'Không thể kết bạn với chính mình' });

    const targetUser = await User.findById(targetId);
    if (!targetUser)
      return res.status(404).json({ error: 'Người dùng không tồn tại' });

    const alreadyFriend = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: targetId, status: 'accepted' },
        { sender: targetId, receiver: req.user.id, status: 'accepted' }
      ]
    });
    if (alreadyFriend)
      return res.status(400).json({ error: 'Hai người đã là bạn bè' });

    const pendingRequest = await FriendRequest.findOne({
      sender: req.user.id,
      receiver: targetId,
      status: 'pending'
    });
    if (pendingRequest)
      return res.status(400).json({ error: 'Đã gửi lời mời rồi' });

    const reverseRequest = await FriendRequest.findOne({
      sender: targetId,
      receiver: req.user.id,
      status: 'pending'
    });
    if (reverseRequest)
      return res.status(400).json({ error: 'Người kia đã gửi lời mời trước đó' });

    const blocked = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, receiver: targetId, status: 'blocked' },
        { sender: targetId, receiver: req.user.id, status: 'blocked' }
      ]
    });
    if (blocked)
      return res.status(400).json({ error: 'Không thể kết bạn (đã bị chặn)' });

    const request = new FriendRequest({ sender: req.user.id, receiver: targetId });
    await request.save();
    res.json({ message: 'Đã gửi lời mời kết bạn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Danh sách lời mời đến
exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user.id,
      status: 'pending'
    }).populate('sender');

    const result = requests.map(req => ({
      _id: req._id,
      sender: {
        _id: req.sender._id,
        username: req.sender.username,
        avatar: req.sender.avatar,
        email: req.sender.email
      },
      createdAt: req.createdAt
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Chấp nhận lời mời
exports.acceptFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.receiver.toString() !== req.user.id)
      return res.status(403).json({ error: 'Không có quyền chấp nhận' });

    request.status = 'accepted';
    await request.save();
    res.json({ message: 'Đã chấp nhận lời mời kết bạn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Từ chối lời mời
exports.rejectFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.receiver.toString() !== req.user.id)
      return res.status(403).json({ error: 'Không có quyền từ chối' });

    request.status = 'rejected';
    await request.save();
    res.json({ message: 'Đã từ chối lời mời kết bạn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Danh sách bạn bè
exports.getFriendsList = async (req, res) => {
  try {
    const friends = await FriendRequest.find({
      $or: [
        { sender: req.user.id, status: 'accepted' },
        { receiver: req.user.id, status: 'accepted' }
      ]
    }).populate('sender receiver');

    const result = friends.map(f => {
      const other = f.sender._id.toString() === req.user.id ? f.receiver : f.sender;
      return {
        _id: other._id,
        username: other.username,
        phone: other.phone,
        email: other.email,
        avatar: other.avatar
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Huỷ kết bạn
exports.unfriend = async (req, res) => {
  try {
    const { userId } = req.params;

    const deleted = await FriendRequest.findOneAndDelete({
      $or: [
        { sender: req.user.id, receiver: userId, status: 'accepted' },
        { sender: userId, receiver: req.user.id, status: 'accepted' }
      ]
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Không tìm thấy mối quan hệ bạn bè' });
    }

    res.json({ message: 'Đã huỷ kết bạn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Chặn người dùng
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findById(userId);
    if (!userExists) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    const alreadyBlocked = await FriendRequest.findOne({
      sender: req.user.id,
      receiver: userId,
      status: 'blocked'
    });
    if (alreadyBlocked)
      return res.status(400).json({ error: 'Đã chặn người này rồi' });

    await FriendRequest.deleteMany({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    });

    const blocked = new FriendRequest({
      sender: req.user.id,
      receiver: userId,
      status: 'blocked'
    });
    await blocked.save();

    res.json({ message: 'Đã chặn người dùng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Danh sách người dùng đã bị chặn
exports.getBlockedUsers = async (req, res) => {
  try {
    const blocked = await FriendRequest.find({
      sender: req.user.id,
      status: 'blocked'
    }).populate('receiver', 'username email phone avatar');

    const result = blocked.map(r => r.receiver);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Tìm người dùng
exports.searchUser = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.id }
    }).select('_id username email phone avatar');

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
