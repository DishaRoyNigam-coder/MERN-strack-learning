import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/products';
import { useCart } from '../context/CartContext';

function ProductList() {
  const [search, setSearch] = useState('');
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
  });
  const { addItem } = useCart();

  if (isLoading) {
    return <div className="text-center py-8">⏳ Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">❌ {error.message}</div>;
  }

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered?.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-4xl text-center">{product.image}</div>
            <h3 className="font-semibold mt-2">{product.name}</h3>
            <p className="text-lg font-bold text-blue-600">${product.price}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
            </p>
            <button
              onClick={() => addItem(product)}
              disabled={product.stock <= 0}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {product.stock > 0 ? '🛒 Add to Cart' : 'Sold Out'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;