/**
 * Menu Service
 * Handles menu-related queries and generates structured responses
 */

import menuDatabase from './menuDatabase';

/**
 * Process a menu query and generate a structured response
 * @param {string} query - The user's query
 * @returns {Object} - Structured response
 */
function processMenuQuery(query) {
  const queryLower = query.toLowerCase();

  // Check for specific menu item requests
  if (queryLower.includes('tell me about') ||
      queryLower.includes('what is') ||
      queryLower.includes('how is') ||
      queryLower.includes('describe')) {
    return handleMenuItemQuery(query);
  }

  // Check for category browsing requests
  if (queryLower.includes('show me') ||
      queryLower.includes('what are your') ||
      queryLower.includes('browse') ||
      queryLower.includes('see the')) {
    return handleCategoryQuery(query);
  }

  // Check for dietary preference requests
  if (queryLower.includes('vegetarian') ||
      queryLower.includes('vegan') ||
      queryLower.includes('gluten') ||
      queryLower.includes('dairy') ||
      queryLower.includes('nut') ||
      queryLower.includes('allergy')) {
    return handleDietaryQuery(query);
  }

  // Check for price-related queries
  if (queryLower.includes('price') ||
      queryLower.includes('cost') ||
      queryLower.includes('expensive') ||
      queryLower.includes('cheap') ||
      queryLower.includes('affordable')) {
    return handlePriceQuery(query);
  }

  // Check for recommendation requests
  if (queryLower.includes('recommend') ||
      queryLower.includes('suggestion') ||
      queryLower.includes('what should i') ||
      queryLower.includes('popular') ||
      queryLower.includes('best')) {
    return handleRecommendationQuery(query);
  }

  // Check for full menu request
  if (queryLower.includes('full menu') ||
      queryLower.includes('entire menu') ||
      queryLower.includes('all menu') ||
      queryLower.includes('complete menu')) {
    return handleFullMenuQuery();
  }

  // Check if the query is asking about main dishes
  if (queryLower.includes('main') || queryLower.includes('entree') || queryLower.includes('dish')) {
    // Directly return the LARGE / SHARING PLATE category
    const mainCategory = menuDatabase.getCategoryById(4); // ID 4 is LARGE / SHARING PLATE
    if (mainCategory) {
      return menuDatabase.formatCategoryForDisplay(mainCategory);
    }
  }

  // Default: search for menu items
  const searchResults = handleSearchQuery(query);

  // If search returned no results, provide a more helpful response
  if (searchResults.type === 'info_card' && searchResults.title === 'No Results Found') {
    // Return a more helpful response with menu categories
    const categories = menuDatabase.getAllCategories()
      .filter(category => category.is_active && category.type === 'food')
      .map(category => ({
        id: category.id,
        name: category.name,
        description: category.description
      }));

    return {
      type: 'info_card',
      title: 'Menu Categories',
      content: `I couldn't find an exact match for "${query}" on our menu. Here are our main menu categories:`,
      categories: categories,
      actions: [
        {
          label: 'See Full Menu',
          action: 'view_menu',
          payload: { category: 'all' },
          primary: true
        },
        {
          label: 'Get Recommendations',
          action: 'get_recommendations',
          payload: {},
          primary: false
        }
      ]
    };
  }

  return searchResults;
}

/**
 * Handle a query about a specific menu item
 * @param {string} query - The user's query
 * @returns {Object} - Structured response
 */
function handleMenuItemQuery(query) {
  const queryLower = query.toLowerCase();

  // Extract potential item name from the query
  let itemName = '';

  // Try to extract item name after common phrases
  const phrases = [
    'tell me about the ', 'tell me about ',
    'what is the ', 'what is ',
    'how is the ', 'how is ',
    'describe the ', 'describe '
  ];

  for (const phrase of phrases) {
    if (queryLower.includes(phrase)) {
      itemName = queryLower.split(phrase)[1].trim();
      break;
    }
  }

  // If no phrase matched, use the whole query
  if (!itemName) {
    itemName = queryLower;
  }

  // Remove question marks and other punctuation
  itemName = itemName.replace(/[?.,!]/g, '').trim();

  // Search for the item
  const searchResults = menuDatabase.getMenuItemsByName(itemName);

  if (searchResults.length === 0) {
    // No matching items found
    return {
      type: "info_card",
      title: "Item Not Found",
      content: `I couldn't find "${itemName}" on our current menu. Would you like to see our full menu or get a recommendation?`,
      actions: [
        {
          label: "See Full Menu",
          action: "view_menu",
          payload: { category: "all" },
          primary: true
        },
        {
          label: "Get Recommendations",
          action: "get_recommendations",
          payload: {},
          primary: false
        }
      ]
    };
  }

  // Return the first matching item
  return menuDatabase.formatMenuItemForDisplay(searchResults[0]);
}

/**
 * Handle a query about a menu category
 * @param {string} query - The user's query
 * @returns {Object} - Structured response
 */
function handleCategoryQuery(query) {
  const queryLower = query.toLowerCase();

  // Check for specific category mentions
  const categoryKeywords = [
    { keywords: ['bread', 'spread', 'starter'], id: 1 },
    { keywords: ['small', 'vegetable', 'appetizer', 'side', 'sides'], id: 2 },
    { keywords: ['pasta', 'rice', 'noodle'], id: 3 },
    { keywords: ['large', 'sharing', 'main', 'mains', 'entree', 'entrees', 'dish', 'dishes', 'plate'], id: 4 },
    { keywords: ['dessert', 'sweet', 'cake', 'desserts'], id: 5 },
    { keywords: ['weekend', 'special', 'specials'], id: 6 },
    { keywords: ['beer', 'craft beer', 'beers', 'ale', 'lager'], id: 7 },
    { keywords: ['wine', 'wines', 'red', 'white', 'rose', 'sparkling'], id: 8 },
    { keywords: ['drink', 'beverage', 'non-alcoholic', 'coffee', 'tea', 'drinks', 'beverages'], id: 9 }
  ];

  let categoryId = null;

  for (const category of categoryKeywords) {
    if (category.keywords.some(keyword => queryLower.includes(keyword))) {
      categoryId = category.id;
      break;
    }
  }

  if (categoryId) {
    // Return items in the specific category
    const category = menuDatabase.getCategoryById(categoryId);
    return menuDatabase.formatCategoryForDisplay(category);
  }

  // If no specific category mentioned, return all categories
  const categories = menuDatabase.getAllCategories()
    .filter(category => category.is_active)
    .map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type
    }));

  return {
    type: "menu_categories_card",
    title: "Our Menu Categories",
    categories: categories,
    actions: [
      {
        label: "View Full Menu",
        action: "view_menu",
        payload: { category: "all" },
        primary: true
      }
    ]
  };
}

/**
 * Handle a query about dietary preferences
 * @param {string} query - The user's query
 * @returns {Object} - Structured response
 */
function handleDietaryQuery(query) {
  const queryLower = query.toLowerCase();

  // Identify dietary preference
  let dietaryPreference = '';

  if (queryLower.includes('vegetarian')) {
    dietaryPreference = 'vegetarian';
  } else if (queryLower.includes('vegan')) {
    dietaryPreference = 'vegan';
  } else if (queryLower.includes('gluten')) {
    dietaryPreference = 'gluten-free';
  } else if (queryLower.includes('dairy')) {
    dietaryPreference = 'dairy-free';
  } else if (queryLower.includes('nut')) {
    dietaryPreference = 'nut-free';
  }

  if (dietaryPreference) {
    // Get items matching the dietary preference
    const items = menuDatabase.getMenuItemsByDietaryPreference(dietaryPreference);

    if (items.length === 0) {
      return {
        type: "info_card",
        title: `No ${dietaryPreference.charAt(0).toUpperCase() + dietaryPreference.slice(1)} Options Found`,
        content: `I couldn't find any ${dietaryPreference} options on our current menu. Please ask our staff for possible modifications to accommodate your dietary needs.`,
        actions: [
          {
            label: "Contact Restaurant",
            action: "contact_restaurant",
            payload: {},
            primary: true
          },
          {
            label: "See Full Menu",
            action: "view_menu",
            payload: { category: "all" },
            primary: false
          }
        ]
      };
    }

    // Format items for display
    const formattedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
      image: item.image_url,
      popular: item.is_featured
    }));

    return {
      type: "dietary_options_card",
      title: `${dietaryPreference.charAt(0).toUpperCase() + dietaryPreference.slice(1)} Options`,
      description: `Here are our ${dietaryPreference} friendly options:`,
      items: formattedItems,
      dietary: dietaryPreference,
      actions: [
        {
          label: "See Full Menu",
          action: "view_menu",
          payload: { category: "all" },
          primary: false
        }
      ]
    };
  }

  // Handle allergy queries
  if (queryLower.includes('allergy') || queryLower.includes('allergic')) {
    const allergens = ['gluten', 'dairy', 'nuts', 'fish', 'shellfish', 'soy', 'eggs'];
    let mentionedAllergens = [];

    for (const allergen of allergens) {
      if (queryLower.includes(allergen)) {
        mentionedAllergens.push(allergen);
      }
    }

    if (mentionedAllergens.length > 0) {
      // Get items without the mentioned allergens
      const items = menuDatabase.getMenuItemsByAllergenExclusion(mentionedAllergens);

      // Format items for display
      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
        image: item.image_url,
        popular: item.is_featured
      }));

      return {
        type: "dietary_options_card",
        title: `Options Without ${mentionedAllergens.join(', ')}`,
        description: `Here are options that don't contain ${mentionedAllergens.join(', ')}:`,
        items: formattedItems,
        allergens_excluded: mentionedAllergens,
        actions: [
          {
            label: "Contact About Allergies",
            action: "contact_restaurant",
            payload: { type: "allergies" },
            primary: true
          }
        ]
      };
    }
  }

  // Default response for dietary queries
  return {
    type: "info_card",
    title: "Dietary Information",
    content: "We offer various options for different dietary needs. Please specify if you're looking for vegetarian, vegan, gluten-free, dairy-free, or nut-free options. For severe allergies, please contact our staff directly.",
    actions: [
      {
        label: "Contact About Allergies",
        action: "contact_restaurant",
        payload: { type: "allergies" },
        primary: true
      },
      {
        label: "See Full Menu",
        action: "view_menu",
        payload: { category: "all" },
        primary: false
      }
    ]
  };
}

/**
 * Handle a query about prices
 * @param {string} query - The user's query
 * @returns {Object} - Structured response
 */
function handlePriceQuery(query) {
  const queryLower = query.toLowerCase();

  // Check for price range queries
  let minPrice = 0;
  let maxPrice = 1000;

  if (queryLower.includes('under')) {
    const matches = queryLower.match(/under\s+(?:rm|rm\s+)?(\d+)/i);
    if (matches && matches[1]) {
      maxPrice = parseInt(matches[1]);
    }
  } else if (queryLower.includes('less than')) {
    const matches = queryLower.match(/less than\s+(?:rm|rm\s+)?(\d+)/i);
    if (matches && matches[1]) {
      maxPrice = parseInt(matches[1]);
    }
  } else if (queryLower.includes('more than') || queryLower.includes('over')) {
    const matches = queryLower.match(/(?:more than|over)\s+(?:rm|rm\s+)?(\d+)/i);
    if (matches && matches[1]) {
      minPrice = parseInt(matches[1]);
    }
  } else if (queryLower.includes('between')) {
    const matches = queryLower.match(/between\s+(?:rm|rm\s+)?(\d+)\s+and\s+(?:rm|rm\s+)?(\d+)/i);
    if (matches && matches[1] && matches[2]) {
      minPrice = parseInt(matches[1]);
      maxPrice = parseInt(matches[2]);
    }
  } else if (queryLower.includes('cheap') || queryLower.includes('affordable')) {
    maxPrice = 30;
  } else if (queryLower.includes('expensive') || queryLower.includes('premium')) {
    minPrice = 50;
  } else if (queryLower.includes('mid') || queryLower.includes('moderate')) {
    minPrice = 30;
    maxPrice = 50;
  }

  // Get items in the price range
  const items = menuDatabase.getMenuItemsByPriceRange(minPrice, maxPrice);

  // Format items for display
  const formattedItems = items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
    image: item.image_url,
    popular: item.is_featured
  }));

  let title = 'Menu Items';
  let description = 'Here are some menu items:';

  if (minPrice > 0 && maxPrice < 1000) {
    title = `Items Between RM${minPrice} and RM${maxPrice}`;
    description = `Here are menu items priced between RM${minPrice} and RM${maxPrice}:`;
  } else if (minPrice > 0) {
    title = `Items Over RM${minPrice}`;
    description = `Here are menu items priced over RM${minPrice}:`;
  } else if (maxPrice < 1000) {
    title = `Items Under RM${maxPrice}`;
    description = `Here are menu items priced under RM${maxPrice}:`;
  }

  return {
    type: "price_range_card",
    title: title,
    description: description,
    items: formattedItems,
    price_range: { min: minPrice, max: maxPrice },
    actions: [
      {
        label: "See Full Menu",
        action: "view_menu",
        payload: { category: "all" },
        primary: false
      }
    ]
  };
}

/**
 * Handle a recommendation request
 * @param {string} query - The user's query
 * @returns {Object} - Structured response
 */
function handleRecommendationQuery(query) {
  const queryLower = query.toLowerCase();

  // Parse criteria from the query
  const criteria = {};

  // Check for dietary preferences
  if (queryLower.includes('vegetarian')) {
    criteria.dietary = 'vegetarian';
  } else if (queryLower.includes('vegan')) {
    criteria.dietary = 'vegan';
  } else if (queryLower.includes('gluten-free')) {
    criteria.dietary = 'gluten-free';
  }

  // Check for meal type
  if (queryLower.includes('breakfast')) {
    criteria.mealType = 'breakfast';
  } else if (queryLower.includes('lunch')) {
    criteria.mealType = 'lunch';
  } else if (queryLower.includes('dinner')) {
    criteria.mealType = 'dinner';
  }

  // Check for category mentions
  if (queryLower.includes('appetizer') || queryLower.includes('starter')) {
    criteria.categoryId = 2; // SMALL / VEGETABLE
  } else if (queryLower.includes('main') || queryLower.includes('entree')) {
    criteria.categoryId = 4; // LARGE / SHARING PLATE
  } else if (queryLower.includes('pasta') || queryLower.includes('rice')) {
    criteria.categoryId = 3; // PASTA / RICE
  } else if (queryLower.includes('dessert')) {
    criteria.categoryId = 5; // DESSERTS
  } else if (queryLower.includes('bread')) {
    criteria.categoryId = 1; // BREAD & SPREAD
  } else if (queryLower.includes('weekend')) {
    criteria.categoryId = 6; // WEEKEND SPECIALS
  } else if (queryLower.includes('beer')) {
    criteria.categoryId = 7; // CRAFT BEER
  } else if (queryLower.includes('wine')) {
    criteria.categoryId = 8; // WINE
  } else if (queryLower.includes('drink') || queryLower.includes('beverage')) {
    criteria.categoryId = 9; // Non-Alcoholic Beverages
  }

  // Generate recommendations
  const recommendations = menuDatabase.generateRecommendations(criteria);

  // Format recommendations for display
  const formattedRecommendations = recommendations.map(item => ({
    id: item.id,
    name: item.title,
    price: item.price,
    description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
    image: item.image,
    popular: item.popular
  }));

  let title = 'Recommended Items';
  let description = 'Here are some recommendations based on your preferences:';

  if (criteria.dietary) {
    title = `Recommended ${criteria.dietary.charAt(0).toUpperCase() + criteria.dietary.slice(1)} Options`;
    description = `Here are some ${criteria.dietary} recommendations:`;
  } else if (criteria.mealType) {
    title = `Recommended for ${criteria.mealType.charAt(0).toUpperCase() + criteria.mealType.slice(1)}`;
    description = `Here are some recommendations for ${criteria.mealType}:`;
  } else if (criteria.categoryId) {
    const category = menuDatabase.getCategoryById(criteria.categoryId);
    title = `Recommended ${category.name}`;
    description = `Here are some recommended items from our ${category.name.toLowerCase()} selection:`;
  }

  return {
    type: "recommendations_card",
    title: title,
    description: description,
    items: formattedRecommendations,
    criteria: criteria,
    actions: [
      {
        label: "See Full Menu",
        action: "view_menu",
        payload: { category: "all" },
        primary: false
      }
    ]
  };
}

/**
 * Handle a full menu request
 * @returns {Object} - Structured response
 */
function handleFullMenuQuery() {
  return menuDatabase.formatFullMenuForDisplay();
}

/**
 * Handle a general search query
 * @param {string} query - The user's query
 * @returns {Object} - Structured response
 */
function handleSearchQuery(query) {
  // Search for menu items
  const searchResults = menuDatabase.searchMenuItems(query);

  if (searchResults.length === 0) {
    return {
      type: "info_card",
      title: "No Results Found",
      content: `I couldn't find anything matching "${query}" on our current menu. Would you like to see our full menu or get a recommendation?`,
      actions: [
        {
          label: "See Full Menu",
          action: "view_menu",
          payload: { category: "all" },
          primary: true
        },
        {
          label: "Get Recommendations",
          action: "get_recommendations",
          payload: {},
          primary: false
        }
      ]
    };
  }

  // Format search results for display
  const formattedResults = searchResults.map(item => ({
    id: item.id,
    name: item.title,
    price: item.price,
    description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
    image: item.image,
    popular: item.popular
  }));

  return {
    type: "search_results_card",
    title: `Search Results for "${query}"`,
    description: `Here are the menu items matching your search:`,
    items: formattedResults,
    query: query,
    actions: [
      {
        label: "See Full Menu",
        action: "view_menu",
        payload: { category: "all" },
        primary: false
      }
    ]
  };
}

// Export functions
export default {
  processMenuQuery,
  handleMenuItemQuery,
  handleCategoryQuery,
  handleDietaryQuery,
  handlePriceQuery,
  handleRecommendationQuery,
  handleFullMenuQuery,
  handleSearchQuery
};
