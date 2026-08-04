const express = require('express');
const router = express.Router();

const orders = [];

router.post('/', (req, res) => {
  const order = { id: orders.length + 1, ...req.body, createdAt: new Date().toISOString() };
  orders.push(order);
  res.status(201).json({ message: 'Order placed successfully', order });
});

router.get('/', (req, res) => {
  res.json(orders);
});

module.exports = router;
