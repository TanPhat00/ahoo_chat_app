// backend/controllers/user.controller.js
exports.getProfile = (req, res) => {
    res.status(200).json({ message: 'Lấy thông tin hồ sơ người dùng thành công' });
  };
  
  exports.updateProfile = (req, res) => {
    res.status(200).json({ message: 'Cập nhật hồ sơ người dùng thành công' });
  };
  