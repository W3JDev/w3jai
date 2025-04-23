import React from 'react';
import './styles/DietaryOptionsCard.css';

/**
 * DietaryOptionsCard Component
 * Displays menu items filtered by dietary preferences
 * 
 * Expected data structure:
 * {
 *   type: "dietary_options_card",
 *   title: "Vegetarian Options",
 *   description: "Here are our vegetarian friendly options:",
 *   items: [
 *     {
 *       id: 1,
 *       name: "Item Name",
 *       price: 19.99,
 *       description: "Item description",
 *       image: "https://example.com/image.jpg",
 *       popular: true
 *     }
 *   ],
 *   dietary: "vegetarian", // or "vegan", "gluten-free", etc.
 *   allergens_excluded: ["dairy", "nuts"], // Optional
 *   actions: [
 *     { 
 *       label: "See Full Menu", 
 *       action: "view_menu", 
 *       payload: { category: "all" },
 *       primary: false
 *     }
 *   ]
 * }
 */
const DietaryOptionsCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data || !data.items) return null;
  
  const {
    title,
    description,
    items = [],
    dietary,
    allergens_excluded = [],
    actions = []
  } = data;
  
  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  // Handle item click
  const handleItemClick = (itemId) => {
    if (onAction) {
      onAction('view_item', { item_id: itemId });
    }
  };
  
  // Get dietary icon
  const getDietaryIcon = (dietaryType) => {
    const icons = {
      'vegetarian': '🥗',
      'vegan': '🌱',
      'gluten-free': '🌾',
      'dairy-free': '🥛',
      'nut-free': '🥜'
    };
    
    return icons[dietaryType] || '🍽️';
  };
  
  return (
    <div className="dietary-options-card">
      <div className="dietary-header">
        <div className="dietary-icon">{getDietaryIcon(dietary)}</div>
        <div className="dietary-titles">
          <h2 className="dietary-title">{title}</h2>
          {description && <p className="dietary-description">{description}</p>}
        </div>
      </div>
      
      {allergens_excluded && allergens_excluded.length > 0 && (
        <div className="allergens-excluded">
          <span className="allergens-label">Excluded allergens:</span>
          <div className="allergens-tags">
            {allergens_excluded.map((allergen, index) => (
              <span key={index} className="allergen-tag">
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="dietary-items">
        {items.length > 0 ? (
          items.map((item) => (
            <div 
              key={item.id} 
              className={`dietary-item ${item.popular ? 'popular-item' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="item-image-container">
                <img 
                  src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'} 
                  alt={item.name} 
                  className="item-image" 
                />
                {item.popular && <div className="popular-badge">Popular</div>}
              </div>
              
              <div className="item-details">
                <div className="item-header">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price">RM {item.price.toFixed(2)}</div>
                </div>
                <p className="item-description">{item.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-items-message">
            No items found matching these dietary preferences. Please contact our staff for possible modifications.
          </div>
        )}
      </div>
      
      {actions.length > 0 && (
        <div className="dietary-actions">
          {actions.map((actionItem, index) => (
            <button
              key={index}
              className={`dietary-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
              onClick={() => handleActionClick(actionItem.action, actionItem.payload)}
            >
              {actionItem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DietaryOptionsCard;
