const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { authPool, memoryStore } = require('../db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (authPool) {
    try {
      await authPool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, hashPassword(password)]
      );
      return res.status(201).json({ message: 'User registered successfully', user: { name, email } });
    } catch (err) {
      return res.status(500).json({ message: 'Database registration failed', error: err.message });
    }
  }

  memoryStore.users.push({ name, email, passwordHash: hashPassword(password) });
  return res.status(201).json({ message: 'User registered successfully', user: { name, email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (authPool) {
    try {
      const [rows] = await authPool.query('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, hashPassword(password)]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      return res.json({ message: 'Login successful', token: 'demo-jwt-token', user: { email } });
    } catch (err) {
      return res.status(500).json({ message: 'Database login failed', error: err.message });
    }
  }

  const user = memoryStore.users.find((item) => item.email === email && item.passwordHash === hashPassword(password));
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({ message: 'Login successful', token: 'demo-jwt-token', user: { email } });
});

module.exports = router;
