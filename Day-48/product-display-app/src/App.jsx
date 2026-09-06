// src/App.jsx

import { useState } from 'react';
import './App.css';
import Product from './components/Product';
import './components/Product.css';

function App() {
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: "Wireless Headphones Pro",
      price: 79.99,
      category: "Electronics",
      inStock: true,
      onSale: true,
      salePrice: 59.99,
      image: "https://picsum.photos/seed/headphones/400/300",
      description: "Premium noise-canceling headphones with 30-hour battery life.",
      rating: 4.5,
      isNew: true
    },
    {
      id: 2,
      name: "Smart Watch Series 5",
      price: 249.99,
      category: "Electronics",
      inStock: true,
      onSale: false,
      salePrice: null,
      image: "https://picsum.photos/seed/watch/400/300",
      description: "Track your fitness, heart rate, sleep, and stay connected.",
      rating: 4.7,
      isNew: false
    },
    {
      id: 3,
      name: "Ceramic Coffee Mug",
      price: 12.99,
      category: "Home",
      inStock: false,
      onSale: false,
      salePrice: null,
      image: "https://picsum.photos/seed/mug/400/300",
      description: "Premium ceramic mug with heat-resistant handle and elegant design.",
      rating: 4.0,
      isNew: false
    },
    {
      id: 4,
      name: "LED Desk Lamp",
      price: 34.99,
      category: "Home",
      inStock: true,
      onSale: true,
      salePrice: 24.99,
      image: "https://picsum.photos/seed/lamp/400/300",
      description: "Adjustable LED desk lamp with 3 brightness levels and USB charging.",
      rating: 4.2,
      isNew: true
    },
    {
      id: 5,
      name: "Premium Notebook Set",
      price: 14.99,
      category: "Office",
      inStock: true,
      onSale: false,
      salePrice: null,
      image: "https://picsum.photos/seed/notebook/400/300",
      description: "Set of 3 ruled notebooks with durable covers and ribbon bookmarks.",
      rating: null,
      isNew: false
    },
    {
      id: 6,
      name: "Wireless Mouse Pro",
      price: 29.99,
      category: "Electronics",
      inStock: false,
      onSale: false,
      salePrice: null,
      image: "https://picsum.photos/seed/mouse/400/300",
      description: "Ergonomic wireless mouse with silent clicks and long battery life.",
      rating: 4.3,
      isNew: false
    }
  ];

  const handleAddToCart = (productName) => {
    setCart(prev => [...prev, productName]);
    alert(`🛒 Added "${productName}" to cart!`);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛍️ Product Catalog</h1>
        <p>Explore our collection of products.</p>
        <div className="cart-info">
          🛒 Cart: <span className="cart-count">{cart.length}</span> items
        </div>
      </header>

      <div className="product-grid">
        {products.map(product => (
          <Product
            key={product.id}
            name={product.name}
            price={product.price}
            category={product.category}
            inStock={product.inStock}
            onSale={product.onSale}
            salePrice={product.salePrice}
            image={product.image}
            description={product.description}
            rating={product.rating}
            isNew={product.isNew}
            onAddToCart={() => handleAddToCart(product.name)}
          />
        ))}
      </div>

      <footer className="app-footer">
        <p>
          © 2026 Product Catalog. Built with React.
          <br />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            🧪 Demonstrating JSX expressions & conditional rendering
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;