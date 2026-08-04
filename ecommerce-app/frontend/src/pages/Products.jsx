import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    api.get('/products', { params })
      .then(({ data }) => { if (active) setProducts(data); })
      .catch(() => { if (active) setError('Could not load products'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [search, category]);

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="page-container">
      <section className="hero">
        <h1>Everything you need, delivered.</h1>
        <p>Browse our curated catalog and check out in a couple of clicks.</p>
      </section>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products found.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
