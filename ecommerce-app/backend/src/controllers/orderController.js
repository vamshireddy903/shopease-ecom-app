const pool = require('../config/db');

// Place order: takes items from the user's cart, creates an order,
// "charges" a dummy payment, then clears the cart.
exports.placeOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { shippingAddress, paymentMethod } = req.body;

    await connection.beginTransaction();

    const [cartItems] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify stock
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    const totalAmount = cartItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    // ---- Dummy payment gateway ----
    // In a real app this is where you'd call Stripe/Razorpay/etc.
    const paymentSuccess = true;
    if (!paymentSuccess) {
      await connection.rollback();
      connection.release();
      return res.status(402).json({ message: 'Payment failed' });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method)
       VALUES (?, ?, 'PAID', ?, ?)`,
      [req.user.id, totalAmount, shippingAddress || null, paymentMethod || 'DUMMY']
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.quantity, item.price]
      );
      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Place order error:', err);
    res.status(500).json({ message: 'Server error placing order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    const order = orders[0];
    order.items = items;

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};
