require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initializeStores } = require('./db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

async function startServer() {
  try {
    await initializeStores();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize backend stores:', err);
    process.exit(1);
  }
}

startServer();
