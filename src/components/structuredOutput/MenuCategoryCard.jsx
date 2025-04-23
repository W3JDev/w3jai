import React from 'react';
import './styles/MenuCategoryCard.css';

/**
 * MenuCategoryCard Component
 * Displays a menu category with its items
 * 
 * Expected data structure:
 * {
 *   type: "menu_category_card",
 *   title: "Category Name",
 *   description: "Category description",
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
 *   actions: [
 *     { 
 *       label: "View All Items", 
 *       action: "view_category", 
 *       payload: { category_id: 1 },
 *       primary: true
 *     }
 *   ]
 * }
 */
const MenuCategoryCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data || !data.items) return null;
  
  const {
    title,
    description,
    items = [],
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
  
  return (
    <div className="menu-category-card">
      <div className="category-header">
        <h2 className="category-title">{title}</h2>
        {description && <p className="category-description">{description}</p>}
      </div>
      
      <div className="category-items">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`category-item ${item.popular ? 'popular-item' : ''}`}
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
        ))}
      </div>
      
      {actions.length > 0 && (
        <div className="category-actions">
          {actions.map((actionItem, index) => (
            <button
              key={index}
              className={`category-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
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

export default MenuCategoryCard;
