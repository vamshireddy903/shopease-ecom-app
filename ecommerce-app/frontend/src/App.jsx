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

const categoryButtons = [
  'All',
  'Electronics',
  'Wearables',
  'Accessories',
  'Home',
  'Gifts',
  'Travel',
  'Fashion',
  'Deals',
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

  const filteredProducts = products.filter((product) => {
    if (!searchTerm || searchTerm.toLowerCase() === 'all') return true;
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category === 'All' ? '' : category);
    setPage('menu');
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
      <header className="header-bar">
        <div className="brand-block">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-name">Shopease</div>
            <div className="brand-subtitle">Shop with speed and style</div>
          </div>
        </div>

        <div className="search-block">
          <select className="category-select" value="all" disabled>
            <option value="all">All</option>
          </select>
          <input
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Shopease"
          />
          <button type="button" className="search-button">Search</button>
        </div>

        <div className="action-links">
          <button type="button" className="nav-link" onClick={handlePage('login')}>{user ? `Hello, ${user.name || user.email}` : 'Sign in'}</button>
          <button type="button" className="nav-link" onClick={handlePage('cart')}>Cart ({cart.length})</button>
        </div>
      </header>

      <nav className="category-nav">
        {categoryButtons.map((category) => (
          <button key={category} type="button" className="category-nav-item" onClick={() => handleCategoryClick(category)}>
            {category}
          </button>
        ))}
      </nav>

      {message && <div className="toast">{message}</div>}

      {page === 'home' && (
        <main>
          <section className="hero-banner">
            <div className="hero-copy">
              <span className="hero-badge">Daily Deals</span>
              <h1>Everything you need, delivered fast.</h1>
              <p>Save big on trending tech, accessories, and lifestyle essentials.</p>
              <div className="hero-actions">
                <button type="button" className="primary-button" onClick={handlePage('menu')}>See today&apos;s deals</button>
                <button type="button" className="ghost-button" onClick={handlePage('cart')}>Go to cart</button>
              </div>
              <div className="hero-notice">
                Limited offer: Use the dummy payment flow to quickly place an order.
              </div>
            </div>
            <div className="hero-image-panel">
              <div className="hero-image-card">
                <img src={products[0]?.image || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80'} alt="Featured product" />
                <div className="hero-image-text">
                  <span>Best seller</span>
                  <strong>Wireless Headphones</strong>
                </div>
              </div>
              <div className="hero-image-card alt">
                <img src={products[1]?.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'} alt="Featured product" />
                <div className="hero-image-text">
                  <span>New arrival</span>
                  <strong>Smart Watch</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="feature-strip">
            <div className="feature-card">
              <strong>Free delivery</strong>
              <p>Fast dummy delivery on all orders.</p>
            </div>
            <div className="feature-card">
              <strong>Secure checkout</strong>
              <p>Dummy card and UPI payments supported.</p>
            </div>
            <div className="feature-card">
              <strong>Deals every day</strong>
              <p>Save more with our curated collections.</p>
            </div>
          </section>

          <section className="products-section">
            <div className="section-header">
              <div>
                <h2>Popular picks</h2>
                <p>Trending products customers love this week.</p>
              </div>
              <button type="button" className="ghost-button small" onClick={handlePage('menu')}>Browse all</button>
            </div>
            <div className="product-grid-alt">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-card-alt">
                  <div className="product-thumb" style={{ backgroundImage: `url(${product.image})` }} />
                  <div className="product-info-card">
                    <p className="product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-footer">
                      <span className="price">${product.price.toFixed(2)}</span>
                      <button type="button" className="primary-button small" onClick={() => addToCart(product)}>Add to cart</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === 'menu' && (
        <main className="products-page">
          <section className="page-intro">
            <h2>Shop the latest selections</h2>
            <p>Browse all products and add your favorites to cart with one click.</p>
          </section>
          <div className="product-grid-alt">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card-alt">
                <div className="product-thumb" style={{ backgroundImage: `url(${product.image})` }} />
                <div className="product-info-card">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <span className="price">${product.price.toFixed(2)}</span>
                    <button type="button" className="primary-button small" onClick={() => addToCart(product)}>Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}

      {(page === 'login' || page === 'register') && (
        <section className="account-section">
          <div className="account-card auth-card">
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
            <div className="basket-top">
              <div>
                <h2>Shopping cart</h2>
                <p>{cart.length === 0 ? 'Your cart is empty.' : `${cart.length} item(s) ready for checkout.`}</p>
              </div>
              <button type="button" className="ghost-button small" onClick={handlePage('menu')}>Continue shopping</button>
            </div>
            {cart.length === 0 ? (
              <div className="empty-cart">Your cart is empty. Add products from the shop to continue.</div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-meta">
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
EOF