/**
 * Menu Integration
 * Connects the AI with the menu database
 */

import menuService from './menuService';
import textFormatter from './textFormatter';
import menuDatabase from './menuDatabase';

/**
 * Process a menu-related message from the user
 * @param {string} message - The user's message
 * @returns {Object|null} - Structured response or null if not menu-related
 */
function processMenuMessage(message) {
  // Check if the message is asking about opening hours
  if (isAskingAboutHours(message)) {
    console.log('Processing hours-related message:', message);
    const formattedHours = processHoursMessage(message);

    return {
      type: 'info_card',
      title: 'Opening Hours',
      content: formattedHours,
      actions: [
        {
          label: 'Make a Reservation',
          action: 'make_reservation',
          payload: { type: 'reservation' },
          primary: true
        },
        {
          label: 'See Menu',
          action: 'view_menu',
          payload: { category: 'all' },
          primary: false
        }
      ]
    };
  }

  // Check if the message is asking for recommendations with dietary requirements
  if (isAskingForDietaryRecommendations(message)) {
    console.log('Processing dietary recommendation message:', message);
    const requirements = extractDietaryRequirements(message);
    const mealPlan = generateMealPlan(requirements);
    const formattedRecommendation = textFormatter.formatMealRecommendation({
      partySize: requirements.partySize,
      dietaryRestrictions: requirements.dietaryRestrictions,
      mealPlan: mealPlan
    });

    return {
      type: 'info_card',
      title: `Personalized Menu Recommendations`,
      content: formattedRecommendation,
      actions: [
        {
          label: 'Make a Reservation',
          action: 'make_reservation',
          payload: { type: 'reservation' },
          primary: true
        },
        {
          label: 'See Full Menu',
          action: 'view_menu',
          payload: { category: 'all' },
          primary: false
        }
      ]
    };
  }

  // Check if the message is menu-related
  if (isMenuRelated(message)) {
    console.log('Processing menu-related message:', message);
    return menuService.processMenuQuery(message);
  }

  return null;
}

/**
 * Generate a meal plan based on dietary requirements
 * @param {Object} requirements - The dietary requirements
 * @returns {Object} - The generated meal plan
 */
function generateMealPlan(requirements) {
  const { partySize, dietaryRestrictions, preferredCategories, mealType } = requirements;
  const mealPlan = {
    starters: [],
    mains: [],
    sides: [],
    desserts: [],
    drinks: [],
    totalPrice: 0
  };

  // Get all menu items
  const allItems = menuDatabase.getAllMenuItems();

  // Filter items based on dietary restrictions
  let filteredItems = allItems.filter(item => item.is_available);

  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    for (const restriction of dietaryRestrictions) {
      filteredItems = menuDatabase.getMenuItemsByDietaryPreference(restriction);
    }
  }

  // Get items by category
  const breadAndSpreadItems = filteredItems.filter(item => item.category_id === 1);
  const smallVegetableItems = filteredItems.filter(item => item.category_id === 2);
  const pastaRiceItems = filteredItems.filter(item => item.category_id === 3);
  const largeSharingItems = filteredItems.filter(item => item.category_id === 4);
  const dessertItems = filteredItems.filter(item => item.category_id === 5);
  const weekendSpecialItems = filteredItems.filter(item => item.category_id === 6);
  const beerItems = filteredItems.filter(item => item.category_id === 7);
  const wineItems = filteredItems.filter(item => item.category_id === 8);
  const beverageItems = filteredItems.filter(item => item.category_id === 9);

  // Determine number of items based on party size
  const numStarters = Math.min(partySize, 2);
  const numMains = Math.ceil(partySize / 2);
  const numSides = partySize > 2 ? 2 : 1;
  const numDesserts = Math.ceil(partySize / 2);
  const numDrinks = partySize;

  // Add starters
  const starterOptions = [...breadAndSpreadItems, ...smallVegetableItems];
  for (let i = 0; i < numStarters && starterOptions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * starterOptions.length);
    mealPlan.starters.push(starterOptions[randomIndex]);
    mealPlan.totalPrice += starterOptions[randomIndex].price;
    starterOptions.splice(randomIndex, 1); // Remove the selected item
  }

  // Add mains
  const mainOptions = [...largeSharingItems, ...pastaRiceItems, ...weekendSpecialItems];
  for (let i = 0; i < numMains && mainOptions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * mainOptions.length);
    mealPlan.mains.push(mainOptions[randomIndex]);
    mealPlan.totalPrice += mainOptions[randomIndex].price;
    mainOptions.splice(randomIndex, 1); // Remove the selected item
  }

  // Add sides
  const sideOptions = [...smallVegetableItems];
  for (let i = 0; i < numSides && sideOptions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * sideOptions.length);
    mealPlan.sides.push(sideOptions[randomIndex]);
    mealPlan.totalPrice += sideOptions[randomIndex].price;
    sideOptions.splice(randomIndex, 1); // Remove the selected item
  }

  // Add desserts
  for (let i = 0; i < numDesserts && dessertItems.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * dessertItems.length);
    mealPlan.desserts.push(dessertItems[randomIndex]);
    mealPlan.totalPrice += dessertItems[randomIndex].price;
    dessertItems.splice(randomIndex, 1); // Remove the selected item
  }

  // Add drinks
  const drinkOptions = [...beverageItems, ...beerItems, ...wineItems];
  for (let i = 0; i < numDrinks && drinkOptions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * drinkOptions.length);
    mealPlan.drinks.push(drinkOptions[randomIndex]);
    mealPlan.totalPrice += drinkOptions[randomIndex].price;
    drinkOptions.splice(randomIndex, 1); // Remove the selected item
  }

  return mealPlan;
}

/**
 * Check if a message is menu-related
 * @param {string} message - The user's message
 * @returns {boolean} - True if the message is menu-related
 */
function isMenuRelated(message) {
  const messageLower = message.toLowerCase();

  // Check for menu-related keywords
  const menuKeywords = [
    'menu', 'food', 'dish', 'meal', 'eat', 'restaurant', 'table & apron', 'table and apron',
    'breakfast', 'lunch', 'dinner', 'appetizer', 'entree', 'dessert', 'drink', 'beverage',
    'vegetarian', 'vegan', 'gluten', 'dairy', 'allergen', 'price', 'cost',
    'recommend', 'special', 'popular', 'signature', 'chef', 'order', 'reservation',
    'pax', 'people', 'person', 'dietary', 'diet', 'restriction', 'allergy', 'allergic'
  ];

  // Check for specific menu items
  const menuItems = [
    'sourdough', 'truffle butter', 'mackerel', 'ciabatta', 'hummus', 'soup',
    'eggplant', 'cauliflower', 'ricotta', 'kale', 'salad', 'pasta', 'rice',
    'chicken', 'pork', 'ribs', 'fish', 'tilapia', 'snapper', 'steak', 'chop',
    'dessert', 'creme brulee', 'tiramisu', 'beer', 'wine', 'coffee', 'tea'
  ];

  // Check for menu-related phrases
  const menuPhrases = [
    'what do you have', 'what\'s on the menu', 'show me the menu',
    'what are your', 'do you have', 'is there', 'how much is',
    'tell me about', 'what is', 'can i see', 'i want to know about',
    'i\'m looking for', 'i want to eat', 'i\'m hungry', 'i\'m thirsty',
    'can you recommend', 'what would you suggest', 'what\'s good for',
    'best dishes', 'popular items', 'chef\'s recommendation', 'signature dish',
    'for two people', 'for 2 people', 'for two', 'for 2 pax', 'for a couple',
    'dietary restriction', 'food allergy', 'can\'t eat', 'don\'t eat'
  ];

  // Check if the message contains any menu keywords
  for (const keyword of menuKeywords) {
    if (messageLower.includes(keyword)) {
      return true;
    }
  }

  // Check if the message contains any menu items
  for (const item of menuItems) {
    if (messageLower.includes(item)) {
      return true;
    }
  }

  // Check if the message contains any menu phrases
  for (const phrase of menuPhrases) {
    if (messageLower.includes(phrase)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a message is asking about opening hours
 * @param {string} message - The user's message
 * @returns {boolean} - True if the message is asking about opening hours
 */
function isAskingAboutHours(message) {
  const messageLower = message.toLowerCase();

  const hoursPhrases = [
    'open', 'opening', 'hours', 'time', 'when', 'schedule', 'closed',
    'what time', 'when are you', 'operating hours', 'business hours',
    'opening time', 'closing time', 'weekend hours', 'weekday hours'
  ];

  for (const phrase of hoursPhrases) {
    if (messageLower.includes(phrase)) {
      return true;
    }
  }

  return false;
}

/**
 * Process a message about opening hours
 * @param {string} message - The user's message
 * @returns {string} - Formatted response about opening hours
 */
function processHoursMessage(message) {
  const restaurantInfo = {
    name: "Table & Apron",
    location: "23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor",
    phone: "03-7733 4000",
    hours: {
      monday: "Closed",
      tuesday: "Dinner 5:30-10:30PM",
      wednesday: "Dinner 5:30-10:00PM",
      thursday: "Dinner 5:30-10:30PM",
      friday: "Lunch 11:30AM-3PM, Dinner 5:30-10:30PM",
      saturday: "Lunch 11:30AM-3PM, Dinner 5:30-10:30PM",
      sunday: "Lunch 11:30AM-3PM, Dinner 5:30-10:30PM"
    }
  };

  return textFormatter.formatOpeningHours(restaurantInfo.hours);
}

/**
 * Check if a message is asking for recommendations with dietary requirements
 * @param {string} message - The user's message
 * @returns {boolean} - True if the message is asking for recommendations with dietary requirements
 */
function isAskingForDietaryRecommendations(message) {
  const messageLower = message.toLowerCase();

  // Check for recommendation keywords
  const recommendKeywords = [
    'recommend', 'suggestion', 'suggest', 'what should i', 'what would you',
    'what do you recommend', 'what\'s good', 'best', 'popular', 'signature'
  ];

  // Check for dietary keywords
  const dietaryKeywords = [
    'vegetarian', 'vegan', 'gluten', 'dairy', 'lactose', 'nut', 'peanut',
    'shellfish', 'seafood', 'egg', 'soy', 'wheat', 'fish', 'allergy', 'allergic',
    'intolerance', 'diet', 'dietary', 'restriction', 'can\'t eat', 'don\'t eat',
    'no meat', 'no dairy', 'no gluten', 'no nuts', 'no fish', 'no seafood'
  ];

  // Check for party size indicators
  const partySizeIndicators = [
    '2 people', 'two people', '2 pax', 'two pax', 'couple', 'for 2', 'for two',
    'for us', 'for me and', 'for my', 'party of 2', 'party of two'
  ];

  // Check if the message contains both recommendation and dietary keywords
  let hasRecommendKeyword = false;
  let hasDietaryKeyword = false;
  let hasPartySizeIndicator = false;

  for (const keyword of recommendKeywords) {
    if (messageLower.includes(keyword)) {
      hasRecommendKeyword = true;
      break;
    }
  }

  for (const keyword of dietaryKeywords) {
    if (messageLower.includes(keyword)) {
      hasDietaryKeyword = true;
      break;
    }
  }

  for (const indicator of partySizeIndicators) {
    if (messageLower.includes(indicator)) {
      hasPartySizeIndicator = true;
      break;
    }
  }

  // Return true if the message contains a recommendation keyword and either a dietary keyword or party size indicator
  return hasRecommendKeyword && (hasDietaryKeyword || hasPartySizeIndicator);
}

/**
 * Extract dietary requirements from a message
 * @param {string} message - The user's message
 * @returns {Object} - Extracted dietary requirements and party size
 */
function extractDietaryRequirements(message) {
  const messageLower = message.toLowerCase();
  const requirements = {
    partySize: 1,
    dietaryRestrictions: [],
    preferredCategories: [],
    mealType: null
  };

  // Extract party size
  const partySizeMatch = messageLower.match(/\b(\d+)\s*(?:people|pax|person|persons)\b/);
  if (partySizeMatch && partySizeMatch[1]) {
    requirements.partySize = parseInt(partySizeMatch[1]);
  } else if (messageLower.includes('couple') || messageLower.includes('two people') || messageLower.includes('for 2') || messageLower.includes('for two')) {
    requirements.partySize = 2;
  }

  // Extract dietary restrictions
  const dietaryRestrictions = [
    { keyword: 'vegetarian', restriction: 'vegetarian' },
    { keyword: 'vegan', restriction: 'vegan' },
    { keyword: 'gluten', restriction: 'gluten-free' },
    { keyword: 'dairy', restriction: 'dairy-free' },
    { keyword: 'lactose', restriction: 'dairy-free' },
    { keyword: 'nut', restriction: 'nut-free' },
    { keyword: 'peanut', restriction: 'nut-free' },
    { keyword: 'shellfish', restriction: 'shellfish-free' },
    { keyword: 'seafood', restriction: 'seafood-free' },
    { keyword: 'egg', restriction: 'egg-free' },
    { keyword: 'soy', restriction: 'soy-free' },
    { keyword: 'fish', restriction: 'fish-free' }
  ];

  for (const { keyword, restriction } of dietaryRestrictions) {
    if (messageLower.includes(keyword)) {
      // Check if it's a negative context (e.g., "no dairy" or "can't eat gluten")
      const negativeContext = [
        `no ${keyword}`, `not ${keyword}`, `don't eat ${keyword}`, `don't like ${keyword}`,
        `can't eat ${keyword}`, `cannot eat ${keyword}`, `allergic to ${keyword}`,
        `allergy to ${keyword}`, `intolerance to ${keyword}`, `intolerant to ${keyword}`,
        `free from ${keyword}`, `without ${keyword}`, `${keyword} free`, `${keyword}-free`
      ];

      const isNegative = negativeContext.some(context => messageLower.includes(context));

      // Only add the restriction if it's in a negative context
      if (isNegative || keyword === 'vegetarian' || keyword === 'vegan') {
        if (!requirements.dietaryRestrictions.includes(restriction)) {
          requirements.dietaryRestrictions.push(restriction);
        }
      }
    }
  }

  // Extract preferred categories
  const categoryPreferences = [
    { keywords: ['starter', 'appetizer', 'bread', 'spread'], category: 'BREAD & SPREAD' },
    { keywords: ['small', 'vegetable', 'side'], category: 'SMALL / VEGETABLE' },
    { keywords: ['pasta', 'rice', 'noodle'], category: 'PASTA / RICE' },
    { keywords: ['main', 'large', 'sharing', 'plate', 'entree'], category: 'LARGE / SHARING PLATE' },
    { keywords: ['dessert', 'sweet', 'cake'], category: 'DESSERTS' },
    { keywords: ['weekend', 'special'], category: 'WEEKEND SPECIALS' },
    { keywords: ['beer', 'craft beer', 'ale', 'lager'], category: 'CRAFT BEER' },
    { keywords: ['wine', 'red', 'white', 'rose'], category: 'WINE' },
    { keywords: ['drink', 'beverage', 'non-alcoholic', 'coffee', 'tea'], category: 'Non-Alcoholic Beverages' }
  ];

  for (const { keywords, category } of categoryPreferences) {
    for (const keyword of keywords) {
      if (messageLower.includes(keyword)) {
        if (!requirements.preferredCategories.includes(category)) {
          requirements.preferredCategories.push(category);
        }
        break;
      }
    }
  }

  // Extract meal type
  if (messageLower.includes('breakfast')) {
    requirements.mealType = 'breakfast';
  } else if (messageLower.includes('lunch')) {
    requirements.mealType = 'lunch';
  } else if (messageLower.includes('dinner')) {
    requirements.mealType = 'dinner';
  }

  return requirements;
}

/**
 * Handle an action from a menu component
 * @param {string} action - The action to perform
 * @param {Object} payload - The payload for the action
 * @returns {Object|null} - Response or null if the action is not handled
 */
function handleMenuAction(action, payload) {
  console.log('Handling menu action:', action, payload);

  switch (action) {
    case 'view_item':
      // Get the menu item by ID
      return menuService.handleMenuItemQuery(`Tell me about item ${payload.item_id}`);

    case 'view_category':
      // Get the menu category by ID
      return menuService.handleCategoryQuery(`Show me category ${payload.category_id}`);

    case 'view_menu':
      // Get the full menu
      return menuService.handleFullMenuQuery();

    case 'get_recommendations':
      // Get recommendations
      return menuService.handleRecommendationQuery('What do you recommend?');

    case 'add_to_cart':
      // Add an item to the cart
      // This would typically interact with a cart service
      return {
        type: "info_card",
        title: "Item Added to Cart",
        content: `The item has been added to your cart.`,
        actions: [
          {
            label: "View Cart",
            action: "view_cart",
            payload: {},
            primary: true
          },
          {
            label: "Continue Shopping",
            action: "view_menu",
            payload: { category: "all" },
            primary: false
          }
        ]
      };

    case 'view_nutrition':
      // View nutrition information
      return {
        type: "info_card",
        title: "Nutrition Information",
        content: `Nutrition information is not available at this time. Please ask our staff for detailed nutritional information.`,
        actions: [
          {
            label: "Contact Restaurant",
            action: "contact_restaurant",
            payload: {},
            primary: true
          }
        ]
      };

    case 'make_reservation':
      // Make a reservation
      return {
        type: "info_card",
        title: "Make a Reservation",
        content: `To make a reservation, please visit our website or call us at 03-7733 4000.`,
        actions: [
          {
            label: "Visit Website",
            action: "open_url",
            payload: { url: "https://tablecheck.com/en/shops/table-and-apron/reserve" },
            primary: true
          },
          {
            label: "Call Restaurant",
            action: "call_phone",
            payload: { phone: "03-7733 4000" },
            primary: false
          }
        ]
      };

    case 'contact_restaurant':
      // Contact the restaurant
      return {
        type: "info_card",
        title: "Contact Table & Apron",
        content: `You can reach us by phone at 03-7733 4000 or visit us at 23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor.`,
        actions: [
          {
            label: "Call Restaurant",
            action: "call_phone",
            payload: { phone: "03-7733 4000" },
            primary: true
          },
          {
            label: "Get Directions",
            action: "open_maps",
            payload: { address: "23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor" },
            primary: false
          }
        ]
      };

    default:
      return null;
  }
}

export default {
  processMenuMessage,
  isMenuRelated,
  isAskingAboutHours,
  processHoursMessage,
  isAskingForDietaryRecommendations,
  extractDietaryRequirements,
  generateMealPlan,
  handleMenuAction
};
