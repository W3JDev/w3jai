import React from 'react';
import './styles/InfoCard.css';

/**
 * InfoCard Component
 * Displays general information in a card format
 *
 * Expected data structure:
 * {
 *   type: "info_card",
 *   title: "Card Title",
 *   subtitle: "Optional subtitle",
 *   icon: "🔍", // Optional emoji or icon class
 *   image: "https://example.com/image.jpg", // Optional
 *   content: "Main content text",
 *   items: [ // Optional list items
 *     { label: "Item 1", value: "Value 1" },
 *     { label: "Item 2", value: "Value 2" }
 *   ],
 *   footer: "Footer text", // Optional
 *   actions: [ // Optional actions
 *     { label: "Learn More", action: "open_link", payload: { url: "https://example.com" } }
 *   ]
 * }
 */
const InfoCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data) return null;

  const {
    title,
    subtitle,
    icon,
    image,
    content,
    items = [],
    footer,
    actions = []
  } = data;

  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  return (
    <div className="info-card">
      {image && (
        <div className="info-card-image">
          <img src={image} alt={title} />
        </div>
      )}

      <div className="info-card-content">
        <div className="info-card-header">
          {icon && <span className="info-card-icon">{icon}</span>}
          <div className="info-card-titles">
            <h3 className="info-card-title">{title}</h3>
            {subtitle && <div className="info-card-subtitle">{subtitle}</div>}
          </div>
        </div>

        {content && (
          <div className="info-card-main-content">
            {/* Check if content contains newlines and render accordingly */}
            {content.includes('\n') ? (
              content.split('\n').map((line, i) => (
                <p key={i} className="info-card-content-line">{line}</p>
              ))
            ) : (
              content
            )}
          </div>
        )}

        {/* Display categories if present */}
        {data.categories && data.categories.length > 0 && (
          <div className="info-card-categories">
            {data.categories.map((category, index) => (
              <div key={index} className="info-card-category" onClick={() => handleActionClick('view_category', { category_id: category.id })}>
                <h4 className="info-card-category-name">{category.name}</h4>
                {category.description && <p className="info-card-category-description">{category.description}</p>}
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="info-card-items">
            {items.map((item, index) => (
              <div key={index} className="info-card-item">
                <div className="info-card-item-label">{item.label}</div>
                <div className="info-card-item-value">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {footer && (
          <div className="info-card-footer">{footer}</div>
        )}

        {actions.length > 0 && (
          <div className="info-card-actions">
            {actions.map((actionItem, index) => (
              <button
                key={index}
                className={`info-card-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
                onClick={() => handleActionClick(actionItem.action, actionItem.payload)}
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

export default InfoCard;
