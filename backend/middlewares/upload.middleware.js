const multer = require('multer');

// Lưu file vào bộ nhớ RAM (dùng cho cloudinary)
const storage = multer.memoryStorage();

// Chấp nhận các định dạng ảnh cụ thể
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Tối đa 10MB
  fileFilter: (req, file, cb) => {
    console.log('[DEBUG] Nhận file:', file.originalname, file.mimetype);
    upload.single('avatar')
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các định dạng hình ảnh: JPEG, PNG, WEBP, GIF'));
    }
  }
});

module.exports = upload;
