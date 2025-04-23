import React from 'react';
import { parseStructuredOutput, extractTextContent } from '../utils/structuredOutput/parser';
import { getComponentByType } from '../utils/structuredOutput/componentRegistry';
import menuIntegration from '../utils/menuIntegration';

/**
 * Renders structured output from AI responses
 * Automatically detects and renders the appropriate component based on the output type
 */
const StructuredOutputRenderer = ({ content, onAction }) => {
  // Parse the content for structured output
  const structuredData = parseStructuredOutput(content);
  const textContent = extractTextContent(content);

  // If no structured data is found, just render the text content
  if (!structuredData) {
    return (
      <div className="ai-text-content">
        {textContent.split('\\n').map((line, i) => (
          <p key={i} className="mb-2">{line}</p>
        ))}
      </div>
    );
  }

  // Get the component for this type
  const Component = getComponentByType(structuredData.type);

  // If no component is found for this type, render a fallback
  if (!Component) {
    console.warn(`No component found for type: ${structuredData.type}`);
    return (
      <div className="ai-content">
        <div className="ai-text-content">
          {textContent.split('\\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
        </div>
        <div className="structured-data-raw">
          <pre>{JSON.stringify(structuredData, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // Handle actions from the structured output
  const handleAction = (action, payload) => {
    console.log('Action triggered:', action, payload);

    // Check if this is a menu-related action
    const menuResponse = menuIntegration.handleMenuAction(action, payload);
    if (menuResponse) {
      // If we got a response from the menu integration, render it
      // We need to pass this back to the parent to update the conversation
      // Send just the JSON without any wrapper text to ensure clean rendering
      if (onAction) {
        onAction('update_message', { content: JSON.stringify(menuResponse) });
      }
      return;
    }

    // Handle common actions
    switch (action) {
      case 'open_url':
        if (payload && payload.url) {
          window.open(payload.url, '_blank');
        }
        break;

      case 'call_phone':
        if (payload && payload.phone) {
          window.location.href = `tel:${payload.phone}`;
        }
        break;

      case 'open_maps':
        if (payload && payload.address) {
          const encodedAddress = encodeURIComponent(payload.address);
          window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
        }
        break;

      default:
        // Pass the action to the parent component
        if (onAction) {
          onAction(action, payload);
        }
        break;
    }
  };

  // Render the component with the structured data
  return (
    <div className="ai-content">
      {/* Only show text content if it's not empty and not just whitespace */}
      {textContent && textContent.trim() !== '' && (
        <div className="ai-text-content mb-4">
          {textContent.split('\\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
        </div>
      )}
      {structuredData && (
        <div className="structured-output">
          <Component data={structuredData} onAction={handleAction} />
        </div>
      )}
    </div>
  );
};

export default StructuredOutputRenderer;
