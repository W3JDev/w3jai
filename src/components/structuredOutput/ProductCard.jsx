import React from 'react';
import './styles/ProductCard.css';

/**
 * ProductCard Component
 * Displays a product with image, description, price, and actions
 * 
 * Expected data structure:
 * {
 *   type: "product_card",
 *   title: "Product Name",
 *   image: "https://example.com/image.jpg",
 *   price: 99.99,
 *   originalPrice: 129.99,
 *   currency: "$",
 *   rating: 4.5,
 *   reviewCount: 128,
 *   description: "Description of the product",
 *   features: ["Feature 1", "Feature 2"],
 *   inStock: true,
 *   shipping: "Free shipping",
 *   actions: [
 *     { label: "Add to Cart", action: "add_to_cart", payload: { productId: "123" } },
 *     { label: "Save for Later", action: "save_for_later", payload: { productId: "123" } }
 *   ]
 * }
 */
const ProductCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data) return null;
  
  const {
    title,
    image,
    price,
    originalPrice,
    currency = '$',
    rating,
    reviewCount,
    description,
    features = [],
    inStock = true,
    shipping,
    actions = []
  } = data;
  
  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  // Generate star rating display
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="product-rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full-star">★</span>
        ))}
        {hasHalfStar && <span className="star half-star">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty-star">☆</span>
        ))}
      </div>
    );
  };
  
  // Use a placeholder image if none provided
  const imageUrl = image || 'https://via.placeholder.com/300x300?text=No+Image';
  
  // Calculate discount percentage if original price is provided
  const discountPercentage = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  return (
    <div className={`product-card ${!inStock ? 'product-unavailable' : ''}`}>
      <div className="product-image">
        <img src={imageUrl} alt={title} />
        {discountPercentage > 0 && (
          <div className="discount-badge">{discountPercentage}% OFF</div>
        )}
        {!inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>
      
      <div className="product-content">
        <h3 className="product-title">{title}</h3>
        
        {(rating || reviewCount) && (
          <div className="product-rating">
            {renderStars(rating)}
            {reviewCount && <span className="review-count">({reviewCount} reviews)</span>}
          </div>
        )}
        
        <div className="product-price">
          <span className="current-price">{currency}{typeof price === 'number' ? price.toFixed(2) : price}</span>
          {originalPrice && (
            <span className="original-price">{currency}{typeof originalPrice === 'number' ? originalPrice.toFixed(2) : originalPrice}</span>
          )}
        </div>
        
        {shipping && (
          <div className="product-shipping">{shipping}</div>
        )}
        
        {description && (
          <p className="product-description">{description}</p>
        )}
        
        {features.length > 0 && (
          <ul className="product-features">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        )}
        
        {actions.length > 0 && (
          <div className="product-actions">
            {actions.map((actionItem, index) => (
              <button
                key={index}
                className={`product-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
                onClick={() => handleActionClick(actionItem.action, actionItem.payload)}
                disabled={!inStock && actionItem.action === 'add_to_cart'}
              >
                {actionItem.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
