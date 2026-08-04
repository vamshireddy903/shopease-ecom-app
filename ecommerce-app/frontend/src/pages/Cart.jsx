import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, loading, refreshCart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (loading) return <div className="page-container"><div className="loading-state">Loading cart…</div></div>;

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Add some products to get started.</p>
          <Link className="btn btn-primary" to="/">Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-row" key={item.cart_item_id}>
              <img src={item.image_url} alt={item.name} />
              <div className="cart-row-info">
                <h3>{item.name}</h3>
                <span className="cart-row-price">₹{Number(item.price).toFixed(2)}</span>
              </div>
              <div className="qty-control">
                <button
                  onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                >−</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >+</button>
              </div>
              <span className="cart-row-subtotal">
                ₹{(Number(item.price) * item.quantity).toFixed(2)}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.cart_item_id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
