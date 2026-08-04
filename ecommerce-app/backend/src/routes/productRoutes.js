const express = require('express');
const router = express.Router();

const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 89.99,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=500&q=80',
    description: 'Comfortable over-ear headphones with premium sound quality.',
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 129.5,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=500&q=80',
    description: 'Track your fitness, notifications, and health in style.',
  },
  {
    id: 3,
    name: 'Ergonomic Keyboard',
    price: 49.0,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1512256636268-d8e8a8d7f0df?auto=format&fit=crop&w=500&q=80',
    description: 'Sculpted keyboard designed for typing comfort and speed.',
  },
  {
    id: 4,
    name: 'Sleek Wireless Mouse',
    price: 34.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1561154464-02c207e0c457?auto=format&fit=crop&w=500&q=80',
    description: 'Responsive wireless mouse with long battery life.',
  },
  {
    id: 5,
    name: 'Travel Backpack',
    price: 69.0,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    description: 'Durable backpack built for daily commute and travel.',
  },
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
