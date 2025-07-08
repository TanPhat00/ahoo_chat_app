// middleware xử lý lỗi chung cho toàn server

module.exports = (err, req, res, next) => {
    console.error('❌ Lỗi:', err);
  
    // Nếu lỗi là từ validation (ví dụ: Joi, Mongoose...)
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: err.message || err.errors
      });
    }
  
    // Nếu lỗi là từ Mongo (duplicate key, v.v.)
    if (err.code && err.code === 11000) {
      return res.status(409).json({
        error: 'Dữ liệu đã tồn tại',
        details: err.keyValue
      });
    }
  
    // Lỗi mặc định
    res.status(err.status || 500).json({
      error: err.message || 'Lỗi máy chủ nội bộ'
    });
  };
  