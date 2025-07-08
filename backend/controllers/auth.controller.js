// backend/controllers/auth.controller.js
exports.register = (req, res) => {
    res.status(201).json({ message: 'User registered successfully' });
  };
  
  exports.login = (req, res) => {
    res.status(200).json({ message: 'Login successful' });
  };
  
  exports.forgotPassword = (req, res) => {
    res.status(200).json({ message: 'Password reset link sent' });
  };
  