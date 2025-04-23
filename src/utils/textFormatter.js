/**
 * Text Formatter Utility
 * Provides functions to format text in a structured way
 */

/**
 * Format opening hours in a structured way
 * @param {Object} hours - The opening hours object
 * @returns {string} - Formatted opening hours text
 */
export function formatOpeningHours(hours) {
  if (!hours) return 'Opening hours information is not available.';

  let formattedText = 'Table & Apron is open during the following hours:\n\n';

  // Check if Monday is closed
  if (hours.monday && hours.monday.toLowerCase() === 'closed') {
    formattedText += 'Monday: Closed\n';
  }

  // Group similar days
  const daysWithSameHours = {};

  for (const [day, time] of Object.entries(hours)) {
    if (day === 'monday' && time.toLowerCase() === 'closed') continue;

    if (!daysWithSameHours[time]) {
      daysWithSameHours[time] = [day];
    } else {
      daysWithSameHours[time].push(day);
    }
  }

  // Format grouped days
  for (const [time, days] of Object.entries(daysWithSameHours)) {
    const formattedDays = formatDayGroup(days);
    formattedText += `${formattedDays}: ${time}\n`;
  }

  return formattedText;
}

/**
 * Format a group of days
 * @param {Array} days - Array of days
 * @returns {string} - Formatted days
 */
function formatDayGroup(days) {
  // Sort days in week order
  const dayOrder = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 7
  };

  days.sort((a, b) => dayOrder[a] - dayOrder[b]);

  // Check if days are consecutive
  let isConsecutive = true;
  for (let i = 0; i < days.length - 1; i++) {
    if (dayOrder[days[i+1]] - dayOrder[days[i]] !== 1) {
      isConsecutive = false;
      break;
    }
  }

  // Format days
  if (isConsecutive && days.length > 2) {
    return `${capitalizeFirstLetter(days[0])} to ${capitalizeFirstLetter(days[days.length - 1])}`;
  } else {
    return days.map(day => capitalizeFirstLetter(day)).join(', ');
  }
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Format a list of items in a structured way
 * @param {Array} items - The items to format
 * @param {string} title - The title for the list
 * @returns {string} - Formatted list text
 */
export function formatList(items, title) {
  if (!items || items.length === 0) return '';

  let formattedText = `${title}:\n\n`;

  for (const item of items) {
    formattedText += `• ${item}\n`;
  }

  return formattedText;
}

/**
 * Format contact information in a structured way
 * @param {Object} contact - The contact information
 * @returns {string} - Formatted contact text
 */
export function formatContactInfo(contact) {
  if (!contact) return '';

  let formattedText = 'Contact Information:\n\n';

  if (contact.name) {
    formattedText += `Name: ${contact.name}\n`;
  }

  if (contact.location) {
    formattedText += `Address: ${contact.location}\n`;
  }

  if (contact.phone) {
    formattedText += `Phone: ${contact.phone}\n`;
  }

  if (contact.email) {
    formattedText += `Email: ${contact.email}\n`;
  }

  if (contact.website) {
    formattedText += `Website: ${contact.website}\n`;
  }

  return formattedText;
}

/**
 * Format a menu category in a structured way
 * @param {Object} category - The category object
 * @param {Array} items - The items in the category
 * @returns {string} - Formatted category text
 */
export function formatMenuCategory(category, items) {
  if (!category) return '';

  let formattedText = `${category.name}\n`;
  formattedText += ''.padEnd(category.name.length, '=') + '\n\n';

  if (category.description) {
    formattedText += `${category.description}\n\n`;
  }

  if (items && items.length > 0) {
    for (const item of items) {
      formattedText += `${item.name} - RM ${item.price.toFixed(2)}\n`;
      if (item.description) {
        formattedText += `  ${item.description}\n`;
      }
      formattedText += '\n';
    }
  } else {
    formattedText += 'No items available in this category.\n';
  }

  return formattedText;
}

/**
 * Format a meal recommendation in a structured way
 * @param {Object} recommendation - The recommendation object
 * @returns {string} - Formatted recommendation text
 */
export function formatMealRecommendation(recommendation) {
  if (!recommendation) return '';

  const { partySize, dietaryRestrictions, mealPlan } = recommendation;

  let formattedText = `Recommended Meal for ${partySize} ${partySize === 1 ? 'Person' : 'People'}\n`;
  formattedText += ''.padEnd(formattedText.length - 1, '=') + '\n\n';

  // Add dietary restrictions if any
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    formattedText += 'Dietary Considerations: ' + dietaryRestrictions.join(', ') + '\n\n';
  }

  // Format the meal plan
  if (mealPlan) {
    // Starters/Appetizers
    if (mealPlan.starters && mealPlan.starters.length > 0) {
      formattedText += 'STARTERS\n--------\n';
      for (const item of mealPlan.starters) {
        formattedText += `• ${item.name} - RM ${item.price.toFixed(2)}\n`;
        formattedText += `  ${item.description}\n\n`;
      }
    }

    // Main Courses
    if (mealPlan.mains && mealPlan.mains.length > 0) {
      formattedText += 'MAIN COURSES\n------------\n';
      for (const item of mealPlan.mains) {
        formattedText += `• ${item.name} - RM ${item.price.toFixed(2)}\n`;
        formattedText += `  ${item.description}\n\n`;
      }
    }

    // Sides
    if (mealPlan.sides && mealPlan.sides.length > 0) {
      formattedText += 'SIDES\n-----\n';
      for (const item of mealPlan.sides) {
        formattedText += `• ${item.name} - RM ${item.price.toFixed(2)}\n`;
        formattedText += `  ${item.description}\n\n`;
      }
    }

    // Desserts
    if (mealPlan.desserts && mealPlan.desserts.length > 0) {
      formattedText += 'DESSERTS\n--------\n';
      for (const item of mealPlan.desserts) {
        formattedText += `• ${item.name} - RM ${item.price.toFixed(2)}\n`;
        formattedText += `  ${item.description}\n\n`;
      }
    }

    // Drinks
    if (mealPlan.drinks && mealPlan.drinks.length > 0) {
      formattedText += 'DRINKS\n------\n';
      for (const item of mealPlan.drinks) {
        formattedText += `• ${item.name} - RM ${item.price.toFixed(2)}\n`;
        formattedText += `  ${item.description}\n\n`;
      }
    }

    // Total price
    if (mealPlan.totalPrice) {
      formattedText += `TOTAL: RM ${mealPlan.totalPrice.toFixed(2)}\n\n`;
    }
  }

  // Add a note about customization
  formattedText += 'Note: Our staff can further customize dishes to accommodate specific dietary needs. Please inform your server about any allergies or dietary restrictions when ordering.\n';

  return formattedText;
}

export default {
  formatOpeningHours,
  formatList,
  formatContactInfo,
  formatMenuCategory,
  formatMealRecommendation
};
