const mysql = require('mysql2/promise');

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

const host = getEnv('DB_HOST');
const port = Number(getEnv('DB_PORT') || '3306');
const user = getEnv('DB_USER');
const password = getEnv('DB_PASSWORD');
const authDbName = getEnv('AUTH_DB_NAME') || getEnv('DB_NAME') || 'authdb';
const orderDbName = getEnv('ORDER_DB_NAME') || 'ordersdb';

function createPool(databaseName) {
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

const basePool = host && user && password ? mysql.createPool({
  host,
  port,
  user,
  password,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
}) : null;

let authPool = null;
let orderPool = null;

const memoryStore = {
  users: [],
  orders: [],
};

async function ensureDatabase(databaseName) {
  if (!basePool) {
    throw new Error('Base DB connection is not configured');
  }
  await basePool.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
}

async function initializeStores() {
  if (!basePool) {
    throw new Error('Database environment is not configured');
  }

  await ensureDatabase(authDbName);
  await ensureDatabase(orderDbName);

  authPool = createPool(authDbName);
  orderPool = createPool(orderDbName);

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

function getAuthPool() {
  return authPool;
}

function getOrderPool() {
  return orderPool;
}

module.exports = {
  getAuthPool,
  getOrderPool,
  memoryStore,
  initializeStores,
};
