const express = require('express');
const router = express.Router();
const { getOrderPool, memoryStore } = require('../db');

router.post('/', async (req, res) => {
  const { userId, items, totalAmount, address, paymentMethod, paymentDetails } = req.body;

  if (!userId || !items || totalAmount === undefined || !address || !paymentMethod) {
    return res.status(400).json({ message: 'userId, items, totalAmount, address and paymentMethod are required' });
  }

  const orderPayload = {
    user_id: userId,
    items: JSON.stringify(items),
    total_amount: totalAmount,
    address,
    payment_method: paymentMethod,
    payment_details: JSON.stringify(paymentDetails || {}),
  };

  const orderPool = getOrderPool();
  if (orderPool) {
    try {
      await orderPool.query(
        'INSERT INTO orders (user_id, items, total_amount, address, payment_method, payment_details) VALUES (?, ?, ?, ?, ?, ?)',
        [orderPayload.user_id, orderPayload.items, orderPayload.total_amount, orderPayload.address, orderPayload.payment_method, orderPayload.payment_details]
      );
      return res.status(201).json({ message: 'Order placed successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Order database save failed', error: err.message });
    }
  }

  const order = {
    id: memoryStore.orders.length + 1,
    userId,
    items,
    totalAmount,
    address,
    paymentMethod,
    paymentDetails,
    createdAt: new Date().toISOString(),
  };
  memoryStore.orders.push(order);
  return res.status(201).json({ message: 'Order placed successfully', order });
});

router.get('/', async (req, res) => {
  const orderPool = getOrderPool();
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
