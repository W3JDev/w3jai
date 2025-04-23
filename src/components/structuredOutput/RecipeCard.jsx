import React, { useState } from 'react';
import './styles/RecipeCard.css';

/**
 * RecipeCard Component
 * Displays a recipe with ingredients, instructions, and other details
 * 
 * Expected data structure:
 * {
 *   type: "recipe_card",
 *   title: "Recipe Name",
 *   image: "https://example.com/image.jpg", // Optional
 *   description: "Brief description of the recipe", // Optional
 *   prepTime: "15 minutes", // Optional
 *   cookTime: "25 minutes", // Optional
 *   totalTime: "40 minutes", // Optional, calculated if not provided
 *   servings: 4, // Optional
 *   ingredients: [
 *     "2 cups flour",
 *     "1 cup sugar"
 *   ],
 *   instructions: [
 *     "Preheat oven to 350°F",
 *     "Mix dry ingredients"
 *   ],
 *   tips: "For softer cookies, add an extra egg yolk.", // Optional
 *   nutrition: { // Optional
 *     calories: "250 kcal",
 *     protein: "3g",
 *     carbs: "30g",
 *     fat: "12g"
 *   },
 *   tags: ["Dessert", "Baking"], // Optional
 *   actions: [ // Optional
 *     { label: "Print Recipe", action: "print_recipe", payload: { id: "123" } }
 *   ]
 * }
 */
const RecipeCard = ({ data, onAction }) => {
  const [servingsCount, setServingsCount] = useState(data.servings || 4);
  
  // Handle missing data
  if (!data) return null;
  
  const {
    title,
    image,
    description,
    prepTime,
    cookTime,
    totalTime,
    ingredients = [],
    instructions = [],
    tips,
    nutrition,
    tags = [],
    actions = []
  } = data;
  
  // Calculate total time if not provided
  const calculatedTotalTime = totalTime || (prepTime && cookTime ? 
    `${parseInt(prepTime) + parseInt(cookTime)} minutes` : null);
  
  // Handle action button clicks
  const handleActionClick = (action, payload) => {
    if (onAction) {
      onAction(action, payload);
    }
  };
  
  // Handle servings adjustment
  const adjustServings = (amount) => {
    const newServings = Math.max(1, servingsCount + amount);
    setServingsCount(newServings);
  };
  
  // Use a placeholder image if none provided
  const imageUrl = image || 'https://via.placeholder.com/800x600?text=No+Recipe+Image';
  
  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <h2 className="recipe-title">{title}</h2>
        
        {tags.length > 0 && (
          <div className="recipe-tags">
            {tags.map((tag, index) => (
              <span key={index} className="recipe-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      {description && (
        <p className="recipe-description">{description}</p>
      )}
      
      <div className="recipe-image-container">
        <img src={imageUrl} alt={title} className="recipe-image" />
      </div>
      
      <div className="recipe-meta">
        {prepTime && (
          <div className="meta-item">
            <span className="meta-icon">⏱️</span>
            <div className="meta-content">
              <div className="meta-label">Prep Time</div>
              <div className="meta-value">{prepTime}</div>
            </div>
          </div>
        )}
        
        {cookTime && (
          <div className="meta-item">
            <span className="meta-icon">🍳</span>
            <div className="meta-content">
              <div className="meta-label">Cook Time</div>
              <div className="meta-value">{cookTime}</div>
            </div>
          </div>
        )}
        
        {(totalTime || calculatedTotalTime) && (
          <div className="meta-item">
            <span className="meta-icon">⏰</span>
            <div className="meta-content">
              <div className="meta-label">Total Time</div>
              <div className="meta-value">{totalTime || calculatedTotalTime}</div>
            </div>
          </div>
        )}
        
        {data.servings && (
          <div className="meta-item servings-control">
            <span className="meta-icon">👥</span>
            <div className="meta-content">
              <div className="meta-label">Servings</div>
              <div className="servings-adjuster">
                <button 
                  className="servings-button" 
                  onClick={() => adjustServings(-1)}
                  disabled={servingsCount <= 1}
                >
                  -
                </button>
                <span className="servings-count">{servingsCount}</span>
                <button 
                  className="servings-button" 
                  onClick={() => adjustServings(1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="recipe-content">
        <div className="recipe-ingredients">
          <h3 className="section-title">Ingredients</h3>
          <ul className="ingredients-list">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="recipe-instructions">
          <h3 className="section-title">Instructions</h3>
          <ol className="instructions-list">
            {instructions.map((instruction, index) => (
              <li key={index} className="instruction-item">
                {instruction}
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {tips && (
        <div className="recipe-tips">
          <h3 className="section-title">Tips</h3>
          <p>{tips}</p>
        </div>
      )}
      
      {nutrition && (
        <div className="recipe-nutrition">
          <h3 className="section-title">Nutrition Information</h3>
          <div className="nutrition-items">
            {Object.entries(nutrition).map(([key, value]) => (
              <div key={key} className="nutrition-item">
                <span className="nutrition-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className="nutrition-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {actions.length > 0 && (
        <div className="recipe-actions">
          {actions.map((actionItem, index) => (
            <button
              key={index}
              className={`recipe-action-button ${actionItem.primary ? 'primary' : 'secondary'}`}
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

export default RecipeCard;
