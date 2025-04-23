import React, { useState } from 'react';
import './styles/FullMenuCard.css';

/**
 * FullMenuCard Component
 * Displays the full restaurant menu with categories and items
 * 
 * Expected data structure:
 * {
 *   type: "full_menu_card",
 *   food_categories: [
 *     {
 *       id: 1,
 *       name: "Category Name",
 *       description: "Category description",
 *       items: [
 *         {
 *           id: 1,
 *           name: "Item Name",
 *           price: 19.99,
 *           description: "Item description",
 *           image: "https://example.com/image.jpg",
 *           popular: true
 *         }
 *       ]
 *     }
 *   ],
 *   drinks_categories: [
 *     // Same structure as food_categories
 *   ],
 *   restaurant_info: {
 *     name: "Restaurant Name",
 *     location: "Restaurant Address",
 *     phone: "Phone Number",
 *     hours: {
 *       monday: "Closed",
 *       tuesday: "11:30AM-10:30PM",
 *       // ...
 *     }
 *   },
 *   actions: [
 *     { 
 *       label: "Make a Reservation", 
 *       action: "make_reservation", 
 *       payload: { type: "reservation" },
 *       primary: true
 *     }
 *   ]
 * }
 */
const FullMenuCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data || (!data.food_categories && !data.drinks_categories)) return null;
  
  const {
    food_categories = [],
    drinks_categories = [],
    restaurant_info = {},
    actions = []
  } = data;
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('food');
  
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
  
  // Handle category click
  const handleCategoryClick = (categoryId) => {
    if (onAction) {
      onAction('view_category', { category_id: categoryId });
    }
  };
  
  return (
    <div className="full-menu-card">
      <div className="menu-header">
        <h2 className="restaurant-name">{restaurant_info.name || 'Table & Apron'}</h2>
        {restaurant_info.location && (
          <p className="restaurant-location">{restaurant_info.location}</p>
        )}
      </div>
      
      <div className="menu-tabs">
        <button 
          className={`menu-tab ${activeTab === 'food' ? 'active' : ''}`}
          onClick={() => setActiveTab('food')}
        >
          Food Menu
        </button>
        <button 
          className={`menu-tab ${activeTab === 'drinks' ? 'active' : ''}`}
          onClick={() => setActiveTab('drinks')}
        >
          Drinks Menu
        </button>
        <button 
          className={`menu-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Restaurant Info
        </button>
      </div>
      
      {activeTab === 'food' && (
        <div className="menu-content">
          {food_categories.map((category) => (
            <div key={category.id} className="menu-category">
              <div 
                className="category-header"
                onClick={() => handleCategoryClick(category.id)}
              >
                <h3 className="category-name">{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
              </div>
              
              <div className="category-items">
                {category.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`menu-item ${item.popular ? 'popular-item' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="item-details">
                      <div className="item-name-price">
                        <h4 className="item-name">{item.name}</h4>
                        <span className="item-price">RM {item.price.toFixed(2)}</span>
                      </div>
                      <p className="item-description">{item.description}</p>
                    </div>
                    
                    {item.image && (
                      <div className="item-image-container">
                        <img src={item.image} alt={item.name} className="item-image" />
                        {item.popular && <div className="popular-badge">Popular</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'drinks' && (
        <div className="menu-content">
          {drinks_categories.map((category) => (
            <div key={category.id} className="menu-category">
              <div 
                className="category-header"
                onClick={() => handleCategoryClick(category.id)}
              >
                <h3 className="category-name">{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
              </div>
              
              <div className="category-items">
                {category.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`menu-item ${item.popular ? 'popular-item' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="item-details">
                      <div className="item-name-price">
                        <h4 className="item-name">{item.name}</h4>
                        <span className="item-price">RM {item.price.toFixed(2)}</span>
                      </div>
                      <p className="item-description">{item.description}</p>
                    </div>
                    
                    {item.image && (
                      <div className="item-image-container">
                        <img src={item.image} alt={item.name} className="item-image" />
                        {item.popular && <div className="popular-badge">Popular</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'info' && (
        <div className="restaurant-info">
          <div className="info-section">
            <h3 className="info-title">Hours</h3>
            <div className="hours-list">
              {restaurant_info.hours && Object.entries(restaurant_info.hours).map(([day, hours]) => (
                <div key={day} className="hours-item">
                  <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                  <span className="hours">{hours}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="info-section">
            <h3 className="info-title">Contact</h3>
            {restaurant_info.phone && (
              <div className="contact-item">
                <span className="contact-label">Phone:</span>
                <span className="contact-value">{restaurant_info.phone}</span>
              </div>
            )}
            {restaurant_info.email && (
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <span className="contact-value">{restaurant_info.email}</span>
              </div>
            )}
          </div>
          
          <div className="info-section">
            <h3 className="info-title">Location</h3>
            {restaurant_info.location && (
              <p className="location-text">{restaurant_info.location}</p>
            )}
          </div>
        </div>
      )}
      
      {actions.length > 0 && (
        <div className="menu-actions">
          {actions.map((actionItem, index) => (
            <button
              key={index}
              className={`menu-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
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

export default FullMenuCard;
