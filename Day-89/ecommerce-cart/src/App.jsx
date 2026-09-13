import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from './api/products';
import { useCart } from './context/CartContext';
import ProductList from './components/ProductList';
import Cart from './components/Cart';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();
  useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🛍️ Shop</h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            🛒 Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <ProductList />
      </main>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <p>🛍️ E-Commerce Cart • React Query + Context API</p>
      </footer>
    </div>
  );
}

export default App;