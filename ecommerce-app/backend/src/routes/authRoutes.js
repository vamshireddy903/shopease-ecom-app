const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({
    message: 'User registered successfully',
    user: { name, email }
  });
});

router.post('/login', (req, res) => {
  const { email } = req.body;
  res.json({
    message: 'Login successful',
    token: 'demo-jwt-token',
    user: { email }
  });
});

module.exports = router;
