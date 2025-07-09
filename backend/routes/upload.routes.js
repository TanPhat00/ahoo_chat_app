const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const cloudinary = require('../config/cloudinary');
const auth = require('../middlewares/auth.middleware');
const User = require('../models/User');
const streamifier = require('streamifier');

// 🔧 Cấu hình avatar mặc định
const DEFAULT_AVATAR = 'https://w7.pngwing.com/pngs/177/551/png-transparent-user-interface-design-computer-icons-default-stephen-salazar-graphy-user-interface-design-computer-wallpaper-sphere-thumbnail.png'; // cập nhật link thực tế của bạn

// 📌 Cập nhật avatar user
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  console.log('[DEBUG] req.file:', req.file); // Thêm dòng này

  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Không có file ảnh' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });

    // Nếu avatar hiện tại đã tồn tại và giống ảnh mới (dựa theo checksum/url so sánh tuỳ logic)
    // => Bỏ qua bước này vì Cloudinary không trả hash trùng nhau từ buffer.
    // Bạn có thể kiểm tra kích thước/tên nếu muốn, ở đây ta upload mỗi lần đều tạo ảnh mới

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Optional: Nếu có avatar cũ khác mặc định thì có thể xoá khỏi cloudinary
    if (user.avatar && user.avatar !== DEFAULT_AVATAR) {
      const segments = user.avatar.split('/');
      const publicId = segments[segments.length - 1].split('.')[0]; // Extract public ID
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    }

    user.avatar = result.secure_url;
    await user.save();

    res.json({ success: true, message: 'Avatar đã được cập nhật', avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Lỗi máy chủ', detail: err.message });
  }
});

// 📌 Xoá avatar (trở về mặc định)
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });

    if (!user.avatar || user.avatar === DEFAULT_AVATAR) {
      return res.status(400).json({ success: false, error: 'Avatar đã là mặc định' });
    }

    // Xoá avatar cũ khỏi Cloudinary
    const segments = user.avatar.split('/');
    const publicId = segments[segments.length - 1].split('.')[0]; // Extract public ID
    await cloudinary.uploader.destroy(`avatars/${publicId}`);

    user.avatar = DEFAULT_AVATAR;
    await user.save();

    res.json({ success: true, message: 'Đã xoá avatar, quay về mặc định', avatar: DEFAULT_AVATAR });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Không thể xoá avatar', detail: err.message });
  }
});

// 📌 Upload file chat (ảnh, video)
router.post('/message', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Thiếu file' });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chat',
          resource_type: 'auto' // auto: ảnh, video, file
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.json({
      message: 'Upload thành công',
      url: result.secure_url,
      type: result.resource_type
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi upload', detail: err.message });
  }
});

module.exports = router;
