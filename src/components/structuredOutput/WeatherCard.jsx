import React from 'react';
import './styles/WeatherCard.css';

/**
 * WeatherCard Component
 * Displays weather information
 * 
 * Expected data structure:
 * {
 *   type: "weather_card",
 *   location: "New York, NY",
 *   current: {
 *     temperature: 72,
 *     temperatureUnit: "F", // "F" or "C"
 *     condition: "Sunny",
 *     icon: "☀️", // Emoji or icon class
 *     humidity: 65, // Percentage
 *     windSpeed: 5,
 *     windUnit: "mph" // "mph" or "km/h"
 *   },
 *   forecast: [ // Optional
 *     {
 *       day: "Monday",
 *       high: 75,
 *       low: 65,
 *       condition: "Partly Cloudy",
 *       icon: "⛅"
 *     }
 *   ],
 *   lastUpdated: "2023-04-15T14:30:00", // Optional ISO date string
 *   actions: [ // Optional
 *     { label: "View Detailed Forecast", action: "view_forecast", payload: { location: "New York" } }
 *   ]
 * }
 */
const WeatherCard = ({ data, onAction }) => {
  // Handle missing data
  if (!data || !data.current) return null;
  
  const {
    location,
    current,
    forecast = [],
    lastUpdated,
    actions = []
  } = data;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  return (
    <div className="weather-card">
      <div className="weather-header">
        <div className="weather-location">{location}</div>
        {lastUpdated && (
          <div className="weather-updated">Updated: {formatDate(lastUpdated)}</div>
        )}
      </div>
      
      <div className="current-weather">
        <div className="weather-icon">{current.icon}</div>
        <div className="weather-info">
          <div className="temperature">
            {current.temperature}°{current.temperatureUnit}
          </div>
          <div className="condition">{current.condition}</div>
        </div>
        <div className="weather-details">
          <div className="weather-detail">
            <span className="detail-label">Humidity:</span>
            <span className="detail-value">{current.humidity}%</span>
          </div>
          <div className="weather-detail">
            <span className="detail-label">Wind:</span>
            <span className="detail-value">{current.windSpeed} {current.windUnit}</span>
          </div>
        </div>
      </div>
      
      {forecast.length > 0 && (
        <div className="weather-forecast">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="forecast-day-name">{day.day}</div>
              <div className="forecast-icon">{day.icon}</div>
              <div className="forecast-temps">
                <span className="forecast-high">{day.high}°</span>
                <span className="forecast-low">{day.low}°</span>
              </div>
              <div className="forecast-condition">{day.condition}</div>
            </div>
          ))}
        </div>
      )}
      
      {actions.length > 0 && (
        <div className="weather-actions">
          {actions.map((actionItem, index) => (
            <button
              key={index}
              className={`weather-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
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

export default WeatherCard;
