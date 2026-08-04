import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setItems(data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function addToCart(productId, quantity = 1) {
    await api.post('/cart', { productId, quantity });
    await refreshCart();
  }

  async function updateQuantity(cartItemId, quantity) {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await refreshCart();
  }

  async function removeFromCart(cartItemId) {
    await api.delete(`/cart/${cartItemId}`);
    await refreshCart();
  }

  async function clearCart() {
    await api.delete('/cart');
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
