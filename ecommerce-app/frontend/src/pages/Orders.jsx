import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const justPlacedOrderId = location.state?.justPlacedOrderId;

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loading-state">Loading orders…</div></div>;

  return (
    <div className="page-container">
      <h1>Order History</h1>

      {justPlacedOrderId && (
        <div className="alert alert-success">
          Order #{justPlacedOrderId} placed successfully! 🎉
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Your placed orders will show up here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <span className={`status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <span>Shipping to: {order.shipping_address || '—'}</span>
                <span className="order-total">Total: ₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
