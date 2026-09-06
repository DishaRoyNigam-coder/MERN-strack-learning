// src/components/Product.jsx

import PropTypes from 'prop-types';
import './Product.css';

function Product({ 
  name, 
  price, 
  category, 
  inStock, 
  onSale, 
  salePrice, 
  image, 
  description,
  rating,
  isNew,
  onAddToCart 
}) {
  // Helper function to render stock status
  const renderStockStatus = () => {
    if (inStock) {
      return <span className="stock-status in-stock">✅ In Stock</span>;
    }
    return <span className="stock-status out-of-stock">❌ Out of Stock</span>;
  };

  // Helper function to render price
  const renderPrice = () => {
    if (onSale && salePrice) {
      return (
        <div className="price-container">
          <span className="original-price">${price.toFixed(2)}</span>
          <span className="sale-price">${salePrice.toFixed(2)}</span>
          <span className="sale-badge">🔥 SALE</span>
        </div>
      );
    }
    return <div className="price">${price.toFixed(2)}</div>;
  };

  // Helper function to render rating stars
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating">
        {'⭐'.repeat(fullStars)}
        {hasHalfStar && '✨'}
        {'☆'.repeat(emptyStars)}
        <span className="rating-score">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Helper function to render badges
  const renderBadges = () => {
    return (
      <div className="badges">
        {isNew && <span className="badge badge-new">✨ New</span>}
        {onSale && <span className="badge badge-sale">🔥 Sale</span>}
        {!inStock && <span className="badge badge-out">😢 Out of Stock</span>}
      </div>
    );
  };

  return (
    <div className={`product-card ${!inStock ? 'out-of-stock-card' : ''}`}>
      {/* Image */}
      <div className="product-image">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <div className="image-placeholder">📦</div>
        )}
        {renderBadges()}
      </div>

      {/* Content */}
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{name}</h3>
          <span className="product-category">{category}</span>
        </div>

        <p className="product-description">{description}</p>

        {/* Conditional: Rating */}
        {rating && (
          <div className="product-rating">
            {renderStars()}
          </div>
        )}

        {/* Conditional: Price (with sale support) */}
        {renderPrice()}

        {/* Conditional: Stock Status */}
        <div className="stock-status-container">
          {renderStockStatus()}
          {/* Additional status message using && */}
          {inStock && <span className="stock-message">🛒 Ready to ship</span>}
          {!inStock && <span className="stock-message">🚫 Not available</span>}
        </div>

        {/* Conditional: Add to Cart Button */}
        <button 
          className={`add-to-cart-btn ${!inStock ? 'disabled' : ''}`}
          onClick={() => {
            if (inStock && onAddToCart) {
              onAddToCart(name);
            }
          }}
          disabled={!inStock}
        >
          {inStock ? '🛒 Add to Cart' : '⛔ Out of Stock'}
        </button>
      </div>
    </div>
  );
}

// Default Props
Product.defaultProps = {
  name: 'Product',
  price: 0,
  category: 'Uncategorized',
  inStock: false,
  onSale: false,
  salePrice: null,
  image: null,
  description: 'No description available.',
  rating: null,
  isNew: false,
  onAddToCart: null
};

// Prop Types
Product.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  inStock: PropTypes.bool.isRequired,
  onSale: PropTypes.bool,
  salePrice: PropTypes.number,
  image: PropTypes.string,
  description: PropTypes.string,
  rating: PropTypes.number,
  isNew: PropTypes.bool,
  onAddToCart: PropTypes.func
};

export default Product;