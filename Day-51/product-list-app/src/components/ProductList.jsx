// src/components/ProductList.jsx

import { useState } from 'react';
import './ProductList.css';

// Sample product data
const initialProducts = [
  {
    id: 1,
    name: 'Wireless Headphones Pro',
    price: 79.99,
    category: 'Electronics',
    inStock: true,
    rating: 4.5,
    image: '🎧',
    description: 'Premium noise-canceling headphones with 30-hour battery life.',
    tags: ['best-seller', 'new']
  },
  {
    id: 2,
    name: 'Smart Watch Series 5',
    price: 249.99,
    category: 'Electronics',
    inStock: true,
    rating: 4.7,
    image: '⌚',
    description: 'Track your fitness, heart rate, sleep, and stay connected.',
    tags: ['featured']
  },
  {
    id: 3,
    name: 'Ceramic Coffee Mug',
    price: 12.99,
    category: 'Home',
    inStock: false,
    rating: 4.0,
    image: '☕',
    description: 'Premium ceramic mug with heat-resistant handle and elegant design.',
    tags: []
  },
  {
    id: 4,
    name: 'LED Desk Lamp',
    price: 34.99,
    category: 'Home',
    inStock: true,
    rating: 4.2,
    image: '💡',
    description: 'Adjustable LED desk lamp with 3 brightness levels and USB charging.',
    tags: ['sale']
  },
  {
    id: 5,
    name: 'Premium Notebook Set',
    price: 14.99,
    category: 'Office',
    inStock: true,
    rating: null,
    image: '📓',
    description: 'Set of 3 ruled notebooks with durable covers and ribbon bookmarks.',
    tags: []
  },
  {
    id: 6,
    name: 'Wireless Mouse Pro',
    price: 29.99,
    category: 'Electronics',
    inStock: false,
    rating: 4.3,
    image: '🖱️',
    description: 'Ergonomic wireless mouse with silent clicks and long battery life.',
    tags: ['popular']
  },
  {
    id: 7,
    name: 'Mechanical Keyboard RGB',
    price: 89.99,
    category: 'Electronics',
    inStock: true,
    rating: 4.8,
    image: '⌨️',
    description: 'Mechanical keyboard with RGB backlighting and hot-swappable switches.',
    tags: ['new', 'best-seller']
  },
  {
    id: 8,
    name: 'Desk Organizer Stand',
    price: 29.99,
    category: 'Office',
    inStock: true,
    rating: 4.1,
    image: '🗂️',
    description: 'Multi-purpose desk organizer with laptop stand and cable management.',
    tags: []
  }
];

function ProductList() {
  // State for products (so we can add/remove)
  const [products, setProducts] = useState(initialProducts);
  
  // State for filtering
  const [filterCategory, setFilterCategory] = useState('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // State for new product form
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Electronics',
    inStock: true,
    image: '📦',
    description: ''
  });

  // --- Derived Data: Filtered and Sorted Products ---
  const getFilteredAndSortedProducts = () => {
    let result = [...products];

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter(p => p.category === filterCategory);
    }

    // Filter by stock status
    if (showInStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Default: sort by id (original order)
        result.sort((a, b) => a.id - b.id);
        break;
    }

    return result;
  };

  const displayedProducts = getFilteredAndSortedProducts();

  // --- Helper: Get unique categories ---
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // --- Helper: Render stars ---
  const renderStars = (rating) => {
    if (!rating) return <span className="no-rating">No rating</span>;
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    return (
      <span className="stars">
        {'⭐'.repeat(full)}
        {hasHalf && '✨'}
        {'☆'.repeat(empty)}
        <span className="rating-score">{rating.toFixed(1)}</span>
      </span>
    );
  };

  // --- Handlers: Add Product ---
  const handleAddProduct = (e) => {
    e.preventDefault();
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const productToAdd = {
      id: newId,
      ...newProduct,
      price: parseFloat(newProduct.price) || 0,
      inStock: newProduct.inStock === 'true' || newProduct.inStock === true,
      tags: ['new'],
      rating: null
    };
    setProducts([...products, productToAdd]);
    setNewProduct({ name: '', price: '', category: 'Electronics', inStock: true, image: '📦', description: '' });
    setShowForm(false);
  };

  // --- Handlers: Delete Product ---
  const deleteProduct = (id) => {
    if (window.confirm('Delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // --- Handlers: Toggle Stock ---
  const toggleStock = (id) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, inStock: !p.inStock } : p
    ));
  };

  // --- Handlers: Clear all products ---
  const clearAll = () => {
    if (window.confirm('Delete all products?')) {
      setProducts([]);
    }
  };

  // --- Handlers: Reset to initial ---
  const resetToInitial = () => {
    setProducts(initialProducts);
    setFilterCategory('all');
    setShowInStockOnly(false);
    setSortBy('default');
  };

  // --- Get unique categories for filter ---
  const uniqueCategories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="product-list-container">
      <header className="list-header">
        <h1>🛍️ Product List</h1>
        <p>Rendering arrays with <code>.map()</code> and keys</p>
        <div className="header-actions">
          <span className="product-count">📦 {products.length} products</span>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Close' : '➕ Add Product'}
          </button>
        </div>
      </header>

      {/* --- Add Product Form --- */}
      {showForm && (
        <form className="add-product-form" onSubmit={handleAddProduct}>
          <h3>Add New Product</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
                placeholder="e.g., Wireless Headphones"
              />
            </div>
            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
                placeholder="e.g., 49.99"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="Electronics">Electronics</option>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Emoji / Image</label>
              <input
                type="text"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="e.g., 🎧"
                maxLength="2"
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Brief product description"
              />
            </div>
            <div className="form-group">
              <label>In Stock</label>
              <select
                value={newProduct.inStock}
                onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.value === 'true' })}
              >
                <option value="true">✅ In Stock</option>
                <option value="false">❌ Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">➕ Add Product</button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* --- Filters --- */}
      <div className="filters">
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="rating-desc">Rating: Highest</option>
          </select>
        </div>

        <div className="filter-group checkbox-filter">
          <label>
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
            />
            Only show in-stock items
          </label>
        </div>

        <div className="filter-actions">
          <button className="btn-reset" onClick={resetToInitial}>🔄 Reset</button>
          <button className="btn-clear" onClick={clearAll}>🗑️ Clear All</button>
        </div>
      </div>

      {/* --- Product Grid --- */}
      {displayedProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No products found</h3>
          <p>
            {products.length === 0
              ? 'Add some products to get started!'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {/* ============================================================ */}
          {/* 🚀 THE MAGIC: Rendering the list with .map() and keys */}
          {/* ============================================================ */}
          {displayedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">{product.image || '📦'}</div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <span className="product-category">{product.category}</span>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                  </span>
                </div>
                <div className="product-rating">
                  {renderStars(product.rating)}
                </div>
                <div className="product-tags">
                  {product.tags && product.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="product-actions">
                  <button
                    className="btn-toggle-stock"
                    onClick={() => toggleStock(product.id)}
                  >
                    {product.inStock ? '🔄 Mark Out of Stock' : '🔄 Mark In Stock'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteProduct(product.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Footer Stats --- */}
      <div className="list-footer">
        <span>📊 Showing {displayedProducts.length} of {products.length} products</span>
        <span>🔄 Each product has a <code>key={'{product.id}'}</code> for stable identity</span>
      </div>
    </div>
  );
}

export default ProductList;