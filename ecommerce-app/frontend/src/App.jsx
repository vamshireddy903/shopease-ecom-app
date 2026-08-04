import { useEffect, useMemo, useState } from 'react';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  address: '',
  paymentMethod: 'card',
  cardNumber: '',
  upiId: '',
};

const paymentOptions = [
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
];

function App() {
  const [page, setPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [form, setForm] = useState(emptyForm);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000/api', []);

  useEffect(() => {
    fetch(`${apiUrl}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [apiUrl]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAuth = async (mode) => {
    const endpoint = mode === 'register' ? 'register' : 'login';
    const payload = mode === 'register'
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Authentication failed');
        return;
      }
      setUser(data.user);
      setMessage(data.message || 'Success');
      setPage('home');
      setForm(emptyForm);
    } catch (err) {
      setMessage('Server error. Try again.');
    }
  };

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setMessage(`${product.name} added to cart.`);
  };

  const updateQuantity = (productId, delta) => {
    setCart((current) => current
      .map((item) => item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
      .filter((item) => item.quantity > 0));
  };

  const removeItem = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const submitOrder = async () => {
    if (!user) {
      setOrderStatus('Please login or register before placing an order.');
      setPage('login');
      return;
    }

    if (!form.address) {
      setOrderStatus('Please enter your address.');
      return;
    }

    if (form.paymentMethod === 'card' && !form.cardNumber) {
      setOrderStatus('Please enter a dummy card number.');
      return;
    }

    if (form.paymentMethod === 'upi' && !form.upiId) {
      setOrderStatus('Please enter a dummy UPI ID.');
      return;
    }

    const orderData = {
      userId: user.id || user.email,
      items: cart,
      totalAmount: cartTotal,
      address: form.address,
      paymentMethod: form.paymentMethod,
      paymentDetails: form.paymentMethod === 'card'
        ? { cardNumber: form.cardNumber }
        : { upiId: form.upiId },
    };

    try {
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      if (!response.ok) {
        setOrderStatus(data.message || 'Order failed.');
        return;
      }
      setOrderStatus('Order successful! Thank you for your purchase.');
      setCart([]);
      setPage('home');
    } catch (err) {
      setOrderStatus('Unable to place order. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    setMessage('You have been logged out.');
  };

  const handlePage = (selected) => () => {
    setPage(selected);
    setOrderStatus('');
    setMessage('');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo-section">
          <div className="brand">Shopease</div>
          <div className="nav-links">
            <button type="button" className="link-button" onClick={handlePage('home')}>Home</button>
            <button type="button" className="link-button" onClick={handlePage('menu')}>Shop</button>
            <button type="button" className="link-button" onClick={handlePage('login')}>Login</button>
            <button type="button" className="link-button" onClick={handlePage('register')}>Register</button>
          </div>
        </div>
        <div className="top-actions">
          <input
            className="search-box"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products, categories..."
          />
          <button type="button" className="cart-button" onClick={handlePage('cart')}>Cart ({cart.length})</button>
          {user ? (
            <div className="user-badge">
              <span>Hi, {user.name || user.email}</span>
              <button type="button" className="ghost-button small" onClick={logout}>Logout</button>
            </div>
          ) : null}
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      {page === 'home' && (
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Welcome to Shopease</p>
            <h1>Stylish shopping made simple.</h1>
            <p>Find trending products, checkout in a few clicks, and experience a demo ecommerce flow with login, cart, and payment options.</p>
            <div className="hero-buttons">
              <button type="button" className="primary-button" onClick={handlePage('menu')}>Explore products</button>
              <button type="button" className="ghost-button" onClick={handlePage('cart')}>View cart</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <h3>Fast checkout</h3>
              <p>Add items, enter address, choose card or UPI, and confirm your order.</p>
            </div>
          </div>
        </section>
      )}

      {(page === 'menu' || page === 'home') && (
        <section className="catalog-section">
          <div className="section-header">
            <h2>Recommended products</h2>
            <p>Browse curated items with realistic imagery and add what you want to your cart.</p>
          </div>
          {status === 'error' && <div className="error-banner">Unable to reach backend. Please check the backend server.</div>}
          <div className="product-grid-alt">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card-alt">
                <div className="product-thumb" style={{ backgroundImage: `url(${product.image})` }} />
                <div className="product-info-card">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <strong>${product.price.toFixed(2)}</strong>
                    <button type="button" className="primary-button small" onClick={() => addToCart(product)}>Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {(page === 'login' || page === 'register') && (
        <section className="account-section">
          <div className="account-card">
            <div className="account-header">
              <button type="button" className={page === 'login' ? 'tab active' : 'tab'} onClick={handlePage('login')}>Login</button>
              <button type="button" className={page === 'register' ? 'tab active' : 'tab'} onClick={handlePage('register')}>Register</button>
            </div>
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleAuth(page); }}>
              {page === 'register' && (
                <label>
                  Name
                  <input type="text" value={form.name} onChange={handleField('name')} placeholder="Your full name" />
                </label>
              )}
              <label>
                Email
                <input type="email" value={form.email} onChange={handleField('email')} placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" value={form.password} onChange={handleField('password')} placeholder="Enter a password" />
              </label>
              <button type="submit" className="primary-button block">{page === 'login' ? 'Login' : 'Create account'}</button>
            </form>
            {user && (
              <div className="logged-in-banner">
                <p>Welcome back, {user.name || user.email}!</p>
                <button type="button" className="ghost-button" onClick={logout}>Logout</button>
              </div>
            )}
            {message && <div className="message-box">{message}</div>}
          </div>
        </section>
      )}

      {page === 'cart' && (
        <section className="basket-section">
          <div className="basket-card">
            <h2>Your cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty. Add products from the shop to continue.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.category}</p>
                      <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    <div className="cart-actions">
                      <button type="button" className="ghost-button small" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" className="ghost-button small" onClick={() => updateQuantity(item.id, 1)}>+</button>
                      <button type="button" className="ghost-button small" onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>
                ))}
                <div className="checkout-card">
                  <h3>Checkout summary</h3>
                  <p><strong>Total:</strong> ${cartTotal.toFixed(2)}</p>
                  <label>
                    Delivery address
                    <textarea value={form.address} onChange={handleField('address')} placeholder="Enter delivery address" />
                  </label>
                  <div className="payment-options">
                    {paymentOptions.map((option) => (
                      <label key={option.value} className="radio-label">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={form.paymentMethod === option.value}
                          onChange={handleField('paymentMethod')}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {form.paymentMethod === 'card' ? (
                    <label>
                      Dummy card number
                      <input type="text" value={form.cardNumber} onChange={handleField('cardNumber')} placeholder="1234 5678 9012 3456" />
                    </label>
                  ) : (
                    <label>
                      Dummy UPI ID
                      <input type="text" value={form.upiId} onChange={handleField('upiId')} placeholder="example@upi" />
                    </label>
                  )}
                  <button type="button" className="primary-button block" onClick={submitOrder}>Place order</button>
                  {orderStatus && <div className="message-box">{orderStatus}</div>}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
