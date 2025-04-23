import React from 'react';
import './styles/LocationCard.css';

/**
 * LocationCard Component
 * Displays location information with optional map
 * 
 * Expected data structure:
 * {
 *   type: "location_card",
 *   title: "Restaurant Name",
 *   address: "123 Main St, City, State 12345",
 *   coordinates: { lat: 37.7749, lng: -122.4194 }, // Optional
 *   image: "https://example.com/location.jpg", // Optional
 *   description: "Description of the location", // Optional
 *   hours: [ // Optional
 *     { day: "Monday", hours: "9 AM - 5 PM" },
 *     { day: "Tuesday", hours: "9 AM - 5 PM" }
 *   ],
 *   contact: { // Optional
 *     phone: "555-123-4567",
 *     email: "info@example.com",
 *     website: "https://example.com"
 *   },
 *   rating: 4.5, // Optional
 *   reviewCount: 123, // Optional
 *   actions: [ // Optional
 *     { label: "Get Directions", action: "open_maps", payload: { address: "123 Main St" } }
 *   ]
 * }
 */
const LocationCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data) return null;
  
  const {
    title,
    address,
    coordinates,
    image,
    description,
    hours = [],
    contact = {},
    rating,
    reviewCount,
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
      <div className="location-rating-stars">
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
  
  return (
    <div className="location-card">
      {image && (
        <div className="location-image">
          <img src={image} alt={title} />
        </div>
      )}
      
      <div className="location-content">
        <h3 className="location-title">{title}</h3>
        
        {(rating || reviewCount) && (
          <div className="location-rating">
            {renderStars(rating)}
            {reviewCount && <span className="review-count">({reviewCount} reviews)</span>}
          </div>
        )}
        
        <div className="location-address">
          <span className="address-icon">📍</span> {address}
        </div>
        
        {description && (
          <p className="location-description">{description}</p>
        )}
        
        {hours.length > 0 && (
          <div className="location-hours">
            <h4 className="section-title">Hours</h4>
            <ul className="hours-list">
              {hours.map((item, index) => (
                <li key={index} className="hours-item">
                  <span className="day">{item.day}:</span>
                  <span className="hours">{item.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {(contact.phone || contact.email || contact.website) && (
          <div className="location-contact">
            <h4 className="section-title">Contact</h4>
            {contact.phone && (
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-value">{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-value">{contact.email}</span>
              </div>
            )}
            {contact.website && (
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                  {contact.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        )}
        
        {actions.length > 0 && (
          <div className="location-actions">
            {actions.map((actionItem, index) => (
              <button
                key={index}
                className={`location-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
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

export default LocationCard;
