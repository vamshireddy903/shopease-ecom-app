const express = require('express');
const router = express.Router();

const products = [
  { id: 1, name: 'Wireless Headphones', price: 89.99, category: 'Audio' },
  { id: 2, name: 'Smart Watch', price: 129.5, category: 'Wearables' },
  { id: 3, name: 'Ergonomic Keyboard', price: 49.0, category: 'Accessories' }
];

router.get('/', (req, res) => {
  res.json(products);
});

router.get('/:id', (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

module.exports = router;
