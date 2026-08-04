const express = require('express');
const router = express.Router();
const { orderPool, memoryStore } = require('../db');

router.post('/', async (req, res) => {
  const { userId, items, totalAmount } = req.body;

  if (!userId || !items || totalAmount === undefined) {
    return res.status(400).json({ message: 'userId, items and totalAmount are required' });
  }

  if (orderPool) {
    try {
      await orderPool.query(
        'INSERT INTO orders (user_id, items, total_amount) VALUES (?, ?, ?)',
        [userId, JSON.stringify(items), totalAmount]
      );
      return res.status(201).json({ message: 'Order placed successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Order database save failed', error: err.message });
    }
  }

  const order = { id: memoryStore.orders.length + 1, userId, items, totalAmount, createdAt: new Date().toISOString() };
  memoryStore.orders.push(order);
  return res.status(201).json({ message: 'Order placed successfully', order });
});

router.get('/', async (req, res) => {
  if (orderPool) {
    try {
      const [rows] = await orderPool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ message: 'Order fetch failed', error: err.message });
    }
  }

  return res.json(memoryStore.orders);
});

module.exports = router;
