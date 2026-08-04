import { useEffect, useMemo, useState } from 'react';

const initialForm = {
  mode: 'browse',
  email: '',
  password: '',
  name: '',
  message: '',
};

function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [form, setForm] = useState(initialForm);

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

  const handleField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const switchMode = (mode) => () => {
    setForm({ ...initialForm, mode });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const endpoint = form.mode === 'register' ? 'register' : 'login';
    const payload = form.mode === 'register'
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setForm((current) => ({
        ...current,
        message: data.message || 'Action complete',
      }));
    } catch (err) {
      setForm((current) => ({
        ...current,
        message: 'Server error. Try again.',
      }));
    }
  };

  return (
    <div className="app-shell">
      <header className="store-header">
        <div>
          <div className="brand">Shopease</div>
          <p className="brand-subtitle">Modern ecommerce storefront with product discovery and account actions.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-button" onClick={switchMode('login')}>Login</button>
          <button type="button" className="primary-button" onClick={switchMode('register')}>Register</button>
        </div>
      </header>

      <main className="main-grid">
        <aside className="panel card">
          <div className="panel-title">Account</div>
          <p className="panel-copy">Quick access to login or register. Orders and checkout remain demo-only.</p>

          <div className="mode-tabs">
            <button type="button" className={form.mode === 'login' ? 'tab active' : 'tab'} onClick={switchMode('login')}>Login</button>
            <button type="button" className={form.mode === 'register' ? 'tab active' : 'tab'} onClick={switchMode('register')}>Register</button>
          </div>

          <form className="account-form" onSubmit={submitForm}>
            {form.mode === 'register' && (
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
            <button type="submit" className="primary-button block">{form.mode === 'login' ? 'Login' : 'Create account'}</button>
          </form>

          {form.message && <div className="message-box">{form.message}</div>}
        </aside>

        <section className="products-panel">
          <div className="card hero-card">
            <div>
              <p className="eyebrow">Featured store</p>
              <h2>Discover top products with one click</h2>
              <p>Browse and preview products, then use the account panel to login or register.</p>
            </div>
            <button type="button" className="primary-button">Shop now</button>
          </div>

          <div className="card product-list">
            <div className="product-list-header">
              <h2>Trending Products</h2>
              <span>{status === 'loading' ? 'Loading...' : `${products.length} items`}</span>
            </div>
            {status === 'error' && <div className="error-text">Unable to reach backend. Please check the backend server.</div>}
            <div className="product-grid">
              {products.map((product) => (
                <article key={product.id} className="product-card product-card-large">
                  <div className="product-image">{product.name.charAt(0)}</div>
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.category}</p>
                    <div className="product-meta">
                      <strong>${product.price.toFixed(2)}</strong>
                      <button type="button" className="ghost-button">Add to cart</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
