import React from 'react';
import './styles/EventCard.css';

/**
 * EventCard Component
 * Displays information about an event
 * 
 * Expected data structure:
 * {
 *   type: "event_card",
 *   title: "Event Title",
 *   date: "2023-04-15T19:00:00", // ISO date string
 *   endDate: "2023-04-15T22:00:00", // Optional ISO date string
 *   location: "Event Venue, City", // Optional
 *   image: "https://example.com/event.jpg", // Optional
 *   description: "Event description", // Optional
 *   organizer: "Event Organizer", // Optional
 *   price: "$20", // Optional
 *   tags: ["Music", "Live"], // Optional
 *   actions: [ // Optional
 *     { label: "Register", action: "register_event", payload: { eventId: "123" } }
 *   ]
 * }
 */
const EventCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data) return null;
  
  const {
    title,
    date,
    endDate,
    location,
    image,
    description,
    organizer,
    price,
    tags = [],
    actions = []
  } = data;
  
  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
  };
  
  // Format time only
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleTimeString(undefined, options);
  };
  
  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  // Format date range
  const getDateTimeDisplay = () => {
    if (!date) return '';
    
    const startDate = new Date(date);
    
    if (!endDate) {
      return formatDateTime(date);
    }
    
    const end = new Date(endDate);
    
    // Same day event
    if (startDate.toDateString() === end.toDateString()) {
      return `${formatDateTime(date)} - ${formatTime(endDate)}`;
    }
    
    // Multi-day event
    return `${formatDateTime(date)} - ${formatDateTime(endDate)}`;
  };
  
  return (
    <div className="event-card">
      {image && (
        <div className="event-image">
          <img src={image} alt={title} />
        </div>
      )}
      
      <div className="event-content">
        <h3 className="event-title">{title}</h3>
        
        <div className="event-datetime">
          <span className="datetime-icon">🗓️</span>
          <span className="datetime-text">{getDateTimeDisplay()}</span>
        </div>
        
        {location && (
          <div className="event-location">
            <span className="location-icon">📍</span>
            <span className="location-text">{location}</span>
          </div>
        )}
        
        {description && (
          <p className="event-description">{description}</p>
        )}
        
        <div className="event-details">
          {organizer && (
            <div className="event-detail">
              <span className="detail-label">Organizer:</span>
              <span className="detail-value">{organizer}</span>
            </div>
          )}
          
          {price && (
            <div className="event-detail">
              <span className="detail-label">Price:</span>
              <span className="detail-value">{price}</span>
            </div>
          )}
        </div>
        
        {tags.length > 0 && (
          <div className="event-tags">
            {tags.map((tag, index) => (
              <span key={index} className="event-tag">{tag}</span>
            ))}
          </div>
        )}
        
        {actions.length > 0 && (
          <div className="event-actions">
            {actions.map((actionItem, index) => (
              <button
                key={index}
                className={`event-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
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

export default EventCard;
