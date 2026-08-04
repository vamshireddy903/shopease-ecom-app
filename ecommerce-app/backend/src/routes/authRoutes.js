const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getAuthPool, memoryStore } = require('../db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const authPool = getAuthPool();
  if (authPool) {
    try {
      const [result] = await authPool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, hashPassword(password)]
      );
      return res.status(201).json({ message: 'User registered successfully', user: { id: result.insertId, name, email } });
    } catch (err) {
      return res.status(500).json({ message: 'Database registration failed', error: err.message });
    }
  }

  const id = memoryStore.users.length + 1;
  memoryStore.users.push({ id, name, email, passwordHash: hashPassword(password) });
  return res.status(201).json({ message: 'User registered successfully', user: { id, name, email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const authPool = getAuthPool();
  if (authPool) {
    try {
      const [rows] = await authPool.query('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, hashPassword(password)]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const user = rows[0];
      return res.json({ message: 'Login successful', token: 'demo-jwt-token', user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      return res.status(500).json({ message: 'Database login failed', error: err.message });
    }
  }

  const user = memoryStore.users.find((item) => item.email === email && item.passwordHash === hashPassword(password));
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({ message: 'Login successful', token: 'demo-jwt-token', user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
