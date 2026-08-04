const express = require('express');
const router = express.Router();

let cartItems = [];

router.get('/', (req, res) => {
  res.json(cartItems);
});

router.post('/add', (req, res) => {
  const item = req.body;
  cartItems.push(item);
  res.status(201).json({ message: 'Item added to cart', cartItems });
});

module.exports = router;
