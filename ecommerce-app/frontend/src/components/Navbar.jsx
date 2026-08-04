import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">Shop</span>Ease
        </Link>

        <nav className="nav-links">
          <Link to="/">Catalog</Link>
          {user && <Link to="/orders">Orders</Link>}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/cart" className="cart-link">
                Cart
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
