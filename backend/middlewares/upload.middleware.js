// middleware/upload.middleware.js
const multer = require('multer');
const storage = multer.memoryStorage();
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, WEBP, GIF'));
    }
  }
});

module.exports = upload;
