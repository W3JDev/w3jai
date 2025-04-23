import React from 'react';
import './styles/ActionButtons.css';

/**
 * ActionButtons Component
 * Displays a set of action buttons or suggestion chips
 * 
 * Expected data structure:
 * {
 *   type: "action_buttons",
 *   title: "Suggested Actions", // Optional
 *   description: "Choose an option below", // Optional
 *   style: "buttons" | "chips", // Optional, defaults to "buttons"
 *   layout: "horizontal" | "vertical", // Optional, defaults to "horizontal"
 *   buttons: [
 *     { 
 *       label: "View Menu", 
 *       action: "send_message", 
 *       payload: { message: "Show me the menu" },
 *       primary: true, // Optional, makes this a primary button
 *       icon: "🍽️" // Optional
 *     }
 *   ]
 * }
 */
const ActionButtons = ({ data, onAction }) => {
  // Handle missing data
  if (!data || !data.buttons || data.buttons.length === 0) return null;
  
  const {
    title,
    description,
    style = 'buttons',
    layout = 'horizontal',
    buttons = []
  } = data;
  
  // Handle button clicks
  const handleButtonClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  // Determine CSS classes based on style and layout
  const containerClass = `action-buttons-container ${style === 'chips' ? 'chips-style' : 'buttons-style'} ${layout === 'vertical' ? 'vertical-layout' : 'horizontal-layout'}`;
  
  return (
    <div className="action-buttons-wrapper">
      {title && <h3 className="action-buttons-title">{title}</h3>}
      {description && <p className="action-buttons-description">{description}</p>}
      
      <div className={containerClass}>
        {buttons.map((button, index) => (
          <button
            key={index}
            className={`action-button ${button.primary ? 'primary' : 'secondary'} ${style === 'chips' ? 'chip' : 'button'}`}
            onClick={() => handleButtonClick(button.action, button.payload)}
          >
            {button.icon && <span className="button-icon">{button.icon}</span>}
            <span className="button-label">{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;
