// src/components/ProductList.jsx

import React, { useState, useMemo, useCallback } from 'react';
import { generateProducts } from '../data/products';
import './ProductList.css';

// Generate products once outside the component
const allProducts = generateProducts(300);

// Helper: format price
const formatPrice = (price) => `$${price.toFixed(2)}`;

// Helper: render stars
const renderStars = (rating) => {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return '⭐'.repeat(full) + (hasHalf ? '✨' : '') + '☆'.repeat(empty);
};

// ---- Child Component (memoized) ----
const ProductCard = React.memo(({ product, onToggleStock }) => {
  // This component only re-renders when the product or onToggleStock changes
  return (
    <div className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}>
      <div className="product-image">{product.image}</div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <span className="product-category">{product.category}</span>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <span className="product-price">{formatPrice(product.price)}</span>
          <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
            {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </span>
        </div>
        <div className="product-rating">{renderStars(product.rating)}</div>
        <button
          className="toggle-stock-btn"
          onClick={() => onToggleStock(product.id)}
        >
          {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
        </button>
      </div>
    </div>
  );
});

// ---- Main Component ----
function ProductList() {
  // State
  const [products, setProducts] = useState(allProducts);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOptimization, setShowOptimization] = useState(true);
  const [renderCount, setRenderCount] = useState(0);

  // Track renders
  const incrementRenderCount = useCallback(() => {
    setRenderCount((prev) => prev + 1);
  }, []);

  // --- Expensive Calculation: Filtering & Sorting ---
  // 🔥 WITHOUT useMemo: This runs on EVERY render
  const getFilteredProductsUnoptimized = () => {
    // Simulate expensive operation (e.g., sorting 1000 items)
    let result = [...products];

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter((p) => p.category === filterCategory);
    }

    // Filter by stock
    if (showOnlyInStock) {
      result = result.filter((p) => p.inStock);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
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
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => a.id - b.id);
        break;
    }

    return result;
  };

  // 🔥 WITH useMemo: Only re-calculates when dependencies change
  const getFilteredProductsOptimized = useMemo(() => {
    // This runs only when products, filterCategory, searchQuery, sortBy, or showOnlyInStock changes
    console.log('🔄 Re-calculating filtered products (useMemo)');

    let result = [...products];

    if (filterCategory !== 'all') {
      result = result.filter((p) => p.category === filterCategory);
    }

    if (showOnlyInStock) {
      result = result.filter((p) => p.inStock);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

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
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => a.id - b.id);
        break;
    }

    return result;
  }, [products, filterCategory, searchQuery, sortBy, showOnlyInStock]);

  // Choose which version to use
  const filteredProducts = showOptimization
    ? getFilteredProductsOptimized
    : getFilteredProductsUnoptimized();

  // --- Callbacks (using useCallback) ---
  const handleToggleStock = useCallback((id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  }, []);

  const handleSetFilter = useCallback((category) => {
    setFilterCategory(category);
  }, []);

  const handleSetSort = useCallback((sort) => {
    setSortBy(sort);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleToggleStockFilter = useCallback(() => {
    setShowOnlyInStock((prev) => !prev);
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    return ['all', ...new Set(products.map((p) => p.category))];
  }, [products]);

  // Stats
  const totalProducts = products.length;
  const filteredCount = filteredProducts.length;

  return (
    <div className="product-list-container">
      <header className="list-header">
        <h1>🛍️ Product Catalog</h1>
        <p>Performance optimization with useMemo & useCallback</p>
        <div className="header-stats">
          <span>📦 Total: {totalProducts}</span>
          <span>🔍 Showing: {filteredCount}</span>
          <span>🔄 Renders: {renderCount}</span>
        </div>
      </header>

      {/* Optimization Toggle */}
      <div className="optimization-toggle">
        <label>
          <input
            type="checkbox"
            checked={showOptimization}
            onChange={() => setShowOptimization((prev) => !prev)}
          />
          Use useMemo (optimized)
        </label>
        <span className="toggle-hint">
          {showOptimization
            ? '✅ Filtering only runs when dependencies change'
            : '❌ Filtering runs on EVERY render'}
        </span>
        <button className="render-btn" onClick={incrementRenderCount}>
          🔄 Trigger Re-render
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Category</label>
          <select
            value={filterCategory}
            onChange={(e) => handleSetFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Sort</label>
          <select value={sortBy} onChange={(e) => handleSetSort(e.target.value)}>
            <option value="default">Default</option>
            <option value="price-asc">Price: Low→High</option>
            <option value="price-desc">Price: High→Low</option>
            <option value="name-asc">Name: A→Z</option>
            <option value="name-desc">Name: Z→A</option>
            <option value="rating-desc">Rating: Highest</option>
          </select>
        </div>

        <div className="filter-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={showOnlyInStock}
              onChange={handleToggleStockFilter}
            />
            Only show in-stock items
          </label>
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleStock={handleToggleStock}
            />
          ))
        )}
      </div>

      <div className="list-footer">
        <span>
          {showOptimization
            ? '🚀 Optimized: useMemo prevents re-calculation on every render'
            : '🐌 Unoptimized: filtering runs on EVERY render'}
        </span>
      </div>
    </div>
  );
}

export default ProductList;