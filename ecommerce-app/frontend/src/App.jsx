import { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('Loading products...');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setMessage('Products loaded successfully');
      })
      .catch(() => {
        setMessage('Unable to reach backend. Start the backend server first.');
      });
  }, []);

  return (
    <div className="app-shell">
      <header>
        <h1>Shopease</h1>
        <p>Modern ecommerce storefront with a simple API backend.</p>
      </header>

      <section className="card">
        <h2>Featured Products</h2>
        <p>{message}</p>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <strong>${product.price.toFixed(2)}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
