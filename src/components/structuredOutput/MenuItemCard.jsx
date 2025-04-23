import React from 'react';
import './styles/MenuItemCard.css';

/**
 * MenuItemCard Component
 * Displays a food menu item with image, description, price, and actions
 *
 * Expected data structure:
 * {
 *   type: "menu_item_card",
 *   title: "Dish Name",
 *   image: "https://example.com/image.jpg",
 *   price: 19.99,
 *   description: "Description of the dish",
 *   ingredients: ["Ingredient 1", "Ingredient 2"], // Optional
 *   allergens: ["Dairy", "Nuts"], // Optional
 *   dietary: ["Vegetarian", "Gluten-Free"], // Optional
 *   calories: 450, // Optional
 *   spiceLevel: "Medium", // Optional
 *   pairing: "Wine pairing suggestion", // Optional
 *   prepTime: "15 minutes", // Optional
 *   popular: true, // Optional
 *   available: true, // Optional
 *   actions: [ // Optional
 *     { label: "Add to Order", action: "add_to_cart", payload: { item_id: "dish_id" } }
 *   ]
 * }
 */
const MenuItemCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data) return null;

  const {
    title,
    image,
    price,
    description,
    ingredients = [],
    allergens = [],
    dietary = [],
    calories,
    spiceLevel,
    pairing,
    prepTime,
    popular = false,
    available = true,
    actions = []
  } = data;

  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  // Use a placeholder image if none provided
  const imageUrl = image || 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className={`menu-card ${!available ? 'menu-card-unavailable' : ''} ${popular ? 'menu-card-popular' : ''}`}>
      <div className="menu-card-image">
        <img src={imageUrl} alt={title} />
        {!available && <div className="unavailable-overlay">Currently Unavailable</div>}
        {popular && <div className="popular-badge">Popular</div>}
      </div>

      <div className="menu-card-content">
        <div className="menu-card-header">
          <h3 className="menu-card-title">{title}</h3>

          {price && (
            <div className="menu-card-price">
              ${typeof price === 'number' ? price.toFixed(2) : price}
            </div>
          )}
        </div>

        {description && (
          <p className="menu-card-description">{description}</p>
        )}

        <div className="menu-card-details">
          {ingredients && ingredients.length > 0 && (
            <div className="menu-card-ingredients">
              <span className="details-label">Ingredients:</span> {ingredients.join(', ')}
            </div>
          )}

          {allergens && allergens.length > 0 && (
            <div className="menu-card-allergens">
              <span className="details-label">Allergens:</span> {allergens.join(', ')}
            </div>
          )}

          {dietary && dietary.length > 0 && (
            <div className="menu-card-dietary">
              <span className="details-label">Dietary:</span>
              <div className="dietary-tags">
                {dietary.map((diet, index) => (
                  <span key={index} className="dietary-tag">{diet}</span>
                ))}
              </div>
            </div>
          )}

          {calories && (
            <div className="menu-card-calories">
              <span className="details-label">Calories:</span> {calories}
            </div>
          )}

          {spiceLevel && (
            <div className="menu-card-spice">
              <span className="details-label">Spice Level:</span> {spiceLevel}
            </div>
          )}

          {prepTime && (
            <div className="menu-card-prep-time">
              <span className="details-label">Prep Time:</span> {prepTime}
            </div>
          )}

          {pairing && (
            <div className="menu-card-pairing">
              <span className="details-label">Pairs well with:</span> {pairing}
            </div>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="menu-card-actions">
            {actions.map((actionItem, index) => (
              <button
                key={index}
                className={`menu-card-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
                onClick={() => handleActionClick(actionItem.action, actionItem.payload)}
                disabled={!available}
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

export default MenuItemCard;
