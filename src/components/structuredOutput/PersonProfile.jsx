import React from 'react';
import './styles/PersonProfile.css';

/**
 * PersonProfile Component
 * Displays information about a person
 * 
 * Expected data structure:
 * {
 *   type: "person_profile",
 *   name: "John Doe",
 *   title: "Software Engineer", // Optional
 *   image: "https://example.com/profile.jpg", // Optional
 *   bio: "Short biography", // Optional
 *   details: [ // Optional
 *     { label: "Email", value: "john@example.com" },
 *     { label: "Phone", value: "555-123-4567" }
 *   ],
 *   social: [ // Optional
 *     { platform: "Twitter", url: "https://twitter.com/johndoe", icon: "🐦" },
 *     { platform: "LinkedIn", url: "https://linkedin.com/in/johndoe", icon: "🔗" }
 *   ],
 *   actions: [ // Optional
 *     { label: "Contact", action: "contact_person", payload: { id: "123" } }
 *   ]
 * }
 */
const PersonProfile = ({ data, onAction }) => {
  // Handle missing data
  if (!data) return null;
  
  const {
    name,
    title,
    image,
    bio,
    details = [],
    social = [],
    actions = []
  } = data;
  
  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  return (
    <div className="person-profile">
      <div className="profile-header">
        {image && (
          <div className="profile-image">
            <img src={image} alt={name} />
          </div>
        )}
        
        <div className="profile-title-section">
          <h3 className="profile-name">{name}</h3>
          {title && <div className="profile-title">{title}</div>}
        </div>
      </div>
      
      {bio && (
        <div className="profile-bio">{bio}</div>
      )}
      
      {details.length > 0 && (
        <div className="profile-details">
          {details.map((detail, index) => (
            <div key={index} className="profile-detail-item">
              <span className="detail-label">{detail.label}:</span>
              <span className="detail-value">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
      
      {social.length > 0 && (
        <div className="profile-social">
          {social.map((item, index) => (
            <a 
              key={index} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              title={item.platform}
            >
              {item.icon ? (
                <span className="social-icon">{item.icon}</span>
              ) : (
                <span className="social-platform">{item.platform}</span>
              )}
            </a>
          ))}
        </div>
      )}
      
      {actions.length > 0 && (
        <div className="profile-actions">
          {actions.map((actionItem, index) => (
            <button
              key={index}
              className={`profile-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
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

export default PersonProfile;
