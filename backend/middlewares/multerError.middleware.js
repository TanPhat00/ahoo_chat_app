const multer = require('multer');

// Middleware xử lý lỗi multer
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'Lỗi Multer',
      detail: err.message,
      field: err.field,
      code: err.code,
    });
  } else if (err) {
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ', detail: err.message });
  }
  next();
}
