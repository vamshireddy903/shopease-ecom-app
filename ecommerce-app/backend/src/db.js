const mysql = require('mysql2/promise');

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

function createPool(databaseName) {
  const host = getEnv('DB_HOST');
  const port = Number(getEnv('DB_PORT') || '3306');
  const user = getEnv('DB_USER');
  const password = getEnv('DB_PASSWORD');

  if (!host || !user || !password || !databaseName) {
    return null;
  }

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

const authPool = createPool(getEnv('AUTH_DB_NAME') || getEnv('DB_NAME') || 'authdb');
const orderPool = createPool(getEnv('ORDER_DB_NAME') || 'ordersdb');

const memoryStore = {
  users: [],
  orders: [],
};

async function initializeStores() {
  if (authPool) {
    await authPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  if (orderPool) {
    await orderPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        items JSON NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'placed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}

module.exports = {
  authPool,
  orderPool,
  memoryStore,
  initializeStores,
};
