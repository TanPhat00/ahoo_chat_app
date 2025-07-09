const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const cloudinary = require('../config/cloudinary');
const auth = require('../middlewares/auth.middleware');
const User = require('../models/User');
const streamifier = require('streamifier');
const multer = require('multer');

// 🔧 Cấu hình avatar mặc định
const DEFAULT_AVATAR = 'https://w7.pngwing.com/pngs/177/551/png-transparent-user-interface-design-computer-icons-default-stephen-salazar-graphy-user-interface-design-computer-wallpaper-sphere-thumbnail.png'; // cập nhật link thực tế của bạn

// Middleware xử lý lỗi multer
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    console.error('[MULTER ERROR]', err);
    return res.status(400).json({
      success: false,
      error: 'Lỗi Multer',
      detail: err.message,
      field: err.field,
      code: err.code,
    });
  } else if (err) {
    console.error('[UNKNOWN UPLOAD ERROR]', err);
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ', detail: err.message });
  }
  next();
}
// put anh user
router.post(
  '/avatar',
  (req, res, next) => {
    console.log('\n===== [DEBUG] Bắt đầu nhận file =====');
    console.log('[DEBUG] Headers:', req.headers['content-type']);
    console.log('[DEBUG] Full headers:', req.headers);
    next();
  },
  auth,
  (req, res, next) => {
    console.log('[DEBUG] Authenticated user:', req.user); // ⚠️ kiểm tra user có đúng không
    next();
  },
  upload.single('avatar'), // ⚠️ field name phải là "avatar"
  (req, res, next) => {
    console.log('[DEBUG] Sau multer - req.file:', req.file);
    console.log('[DEBUG] req.body:', req.body);
    next();
  },
  multerErrorHandler,
  async (req, res) => {
    console.log('[DEBUG] Vào trong xử lý chính');
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Không có file ảnh' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
      }

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

      // Xoá avatar cũ nếu cần
      if (user.avatar && user.avatar !== DEFAULT_AVATAR) {
        const segments = user.avatar.split('/');
        const publicId = segments[segments.length - 1].split('.')[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      }

      user.avatar = result.secure_url;
      await user.save();

      res.json({ success: true, message: 'Cập nhật avatar thành công', avatar: user.avatar });
    } catch (err) {
      console.error('[UPLOAD ERROR]', err);
      res.status(500).json({ success: false, error: 'Lỗi máy chủ', detail: err.message });
    }
  }
);


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
