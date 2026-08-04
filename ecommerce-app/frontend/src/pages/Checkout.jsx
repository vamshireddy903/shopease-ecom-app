import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

export default function Checkout() {
  const { items, totalPrice, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod: 'DUMMY_CARD',
      });
      await refreshCart();
      navigate('/orders', { state: { justPlacedOrderId: data.orderId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Nothing to check out</h2>
          <p>Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Shipping address</h2>
          <label>
            Delivery address
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street, Bengaluru, KA 560001"
            />
          </label>

          <h2>Payment</h2>
          <p className="dummy-note">This is a dummy payment step — no real charge is made.</p>
          <label>
            Card number
            <input
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="4242 4242 4242 4242"
              maxLength={16}
            />
          </label>
          <div className="form-row">
            <label>
              Expiry
              <input required placeholder="MM/YY" maxLength={5} />
            </label>
            <label>
              CVV
              <input required placeholder="123" maxLength={3} />
            </label>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit" disabled={placing}>
            {placing ? 'Placing order…' : `Pay ₹${totalPrice.toFixed(2)} & place order`}
          </button>
        </form>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div className="summary-row" key={item.cart_item_id}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
