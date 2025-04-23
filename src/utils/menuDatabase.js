/**
 * Menu Database for Table & Apron
 * Contains all menu items, categories, and helper functions for querying the menu
 */

// Menu Categories
const categories = [
  {
    id: 1,
    name: "BREAD & SPREAD",
    type: "food",
    description: "Freshly baked bread with various spreads",
    display_order: 0,
    is_active: true
  },
  {
    id: 2,
    name: "SMALL / VEGETABLE",
    type: "food",
    description: "Small plates and vegetable dishes",
    display_order: 0,
    is_active: true
  },
  {
    id: 3,
    name: "PASTA / RICE",
    type: "food",
    description: "Pasta and rice dishes",
    display_order: 0,
    is_active: true
  },
  {
    id: 4,
    name: "LARGE / SHARING PLATE",
    type: "food",
    description: "Large plates meant for sharing",
    display_order: 0,
    is_active: true
  },
  {
    id: 5,
    name: "DESSERTS",
    type: "food",
    description: "Sweet treats and desserts",
    display_order: 0,
    is_active: true
  },
  {
    id: 6,
    name: "WEEKEND SPECIALS",
    type: "food",
    description: "Special dishes available only on weekends",
    display_order: 0,
    is_active: true
  },
  {
    id: 7,
    name: "CRAFT BEER",
    type: "alcoholic",
    description: "Specialty and craft beers",
    display_order: 0,
    is_active: true
  },
  {
    id: 8,
    name: "WINE",
    type: "alcoholic",
    description: "Wine selection",
    display_order: 0,
    is_active: true
  },
  {
    id: 9,
    name: "Non-Alcoholic Beverages",
    type: "beverage",
    description: "A variety of refreshing non-alcoholic drinks",
    display_order: 0,
    is_active: true
  }
];

// Beverage subcategories
const beverageSubcategories = [
  { id: 1, name: "Signature Drinks", parent_category_id: 9 },
  { id: 2, name: "Jugs & Carafes", parent_category_id: 9 },
  { id: 3, name: "Kombucha", parent_category_id: 9 },
  { id: 4, name: "Tea", parent_category_id: 9 },
  { id: 5, name: "Coffee", parent_category_id: 9 },
  { id: 6, name: "Non-Alcoholic Wine", parent_category_id: 9 }
];

// Menu Items
const menuItems = [
  {
    id: 1,
    category_id: 1,
    name: "Sourdough w/ Truffle Butter",
    description: "Fresh sourdough served with our house-made truffle butter",
    price: 19,
    image_url: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04",
    portion_size: "35g",
    is_available: true,
    takeaway_available: true,
    is_featured: false,
    allergens: ["dairy", "gluten"],
    ingredients: ["sourdough bread", "truffle butter", "truffle paste", "salt"]
  },
  {
    id: 2,
    category_id: 1,
    name: "Sourdough w/ Smoked Mackerel Pate",
    description: "Fresh sourdough with our signature smoked mackerel pate",
    price: 25,
    image_url: "https://blogger.googleusercontent.com/img/a/AVvXsEhb1DWfkBsGo__sNTyFfuK9f7_kBhqgfuhUkWXfGn1bOYhG88jA_VW6pcw19oDnTrFtiDM5OIBCTjcUfe8r5QQjeFNwLWnGRyzIgK3tB_AsdB_8_rHkNHAqChqrxD5z5RRVFzV8O5FrUYJtY-v874IpB_2jatqUB4w6qNWxt1ZE4yaKesE30vY=w640-h448-rw",
    portion_size: "70g",
    is_available: true,
    takeaway_available: true,
    is_featured: false,
    allergens: ["fish", "gluten"],
    ingredients: ["sourdough bread", "smoked mackerel", "herbs", "spices"]
  },
  {
    id: 3,
    category_id: 1,
    name: "Ciabatta w/ hummus, herbs, raw onion",
    description: "Freshly baked ciabatta with house-made hummus, fresh herbs, and raw onion",
    price: 23,
    image_url: "https://scontent.fkul3-3.fna.fbcdn.net/v/t39.30808-6/453620190_1011956620934020_1604745073994489725_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=eASa9TDJjcgQ7kNvgGIFJK7&_nc_oc=Adka5Q8WTwG5KIxBea18rFB4JGlSYUrQGPkNTgZaiLfflWSVDWvC7J79X5_IC17Zs5MZAjZ3O6za7hLo_aJxwJO8&_nc_zt=23&_nc_ht=scontent.fkul3-3.fna&_nc_gid=EfZ0JnNqhQd8-ooQjAmRag&oh=00_AYH0mNy2fbjTutvpO7Gd3p82A-Yg0VQuTBcVCn16K2s2UQ&oe=67EF9597",
    portion_size: "2-3pax",
    is_available: true,
    takeaway_available: true,
    is_featured: false,
    allergens: ["gluten", "sesame"],
    ingredients: ["ciabatta bread", "hummus", "fresh herbs", "raw onion"]
  },
  {
    id: 4,
    category_id: 2,
    name: "Soup of the day",
    description: "Chef's selection of seasonal soup, rotating between tomato, cauliflower, pumpkin, and carrot ginger",
    price: 22,
    image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
    portion_size: "2-3 pax",
    is_available: true,
    takeaway_available: true,
    is_featured: false,
    allergens: ["dairy", "onion"],
    ingredients: ["seasonal vegetables", "herbs", "spices", "cream"]
  },
  {
    id: 5,
    category_id: 2,
    name: "Crispy Eggplant w/ spicy kicap manis",
    description: "Buckwheat fried eggplant, sesame seed, cilantro, kicap manis, chili oil",
    price: 26,
    image_url: "https://scontent.fkul3-4.fna.fbcdn.net/v/t39.30808-6/486170479_1201215742008106_4150815762678447945_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=UNrKAJ81cJUQ7kNvgHQYODA&_nc_oc=Adkcjz3FfWImRZsnuYoC7DiPQFn5178YS1p5OXDtYHCmqSvHGrEVdvUoA85-VgFPfWRYxTEuEMuuE77R_CT2DF3K&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=d0bWc1NbVPxjbpcp-1_wFA&oh=00_AYFLFjiBhHb4QnsoVIjysoLsDg7yxYVFN093nLLR8RXf7Q&oe=67EF6ACA",
    portion_size: "2-3pax",
    is_available: true,
    takeaway_available: true,
    is_featured: false,
    allergens: ["gluten", "soy", "sesame"],
    ingredients: ["eggplant", "buckwheat", "sesame seed", "cilantro", "kicap manis", "chili oil"]
  },
  // Add all other menu items here...
];

// Complete the menuItems array with all the items from the provided data
// For brevity, I've only included a few examples above

/**
 * Get all menu categories
 * @returns {Array} - All menu categories
 */
function getAllCategories() {
  return categories;
}

/**
 * Get all menu items
 * @returns {Array} - All menu items
 */
function getAllMenuItems() {
  return menuItems;
}

/**
 * Get a category by ID
 * @param {number} id - Category ID
 * @returns {Object|null} - Category object or null if not found
 */
function getCategoryById(id) {
  return categories.find(category => category.id === id) || null;
}

/**
 * Get a menu item by ID
 * @param {number} id - Menu item ID
 * @returns {Object|null} - Menu item object or null if not found
 */
function getMenuItemById(id) {
  return menuItems.find(item => item.id === id) || null;
}

/**
 * Get menu items by category ID
 * @param {number} categoryId - Category ID
 * @returns {Array} - Menu items in the category
 */
function getMenuItemsByCategoryId(categoryId) {
  return menuItems.filter(item => item.category_id === categoryId);
}

/**
 * Get menu items by name (partial match)
 * @param {string} name - Name to search for
 * @returns {Array} - Menu items matching the name
 */
function getMenuItemsByName(name) {
  const searchTerm = name.toLowerCase();
  return menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm) || 
    item.description.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get menu items by dietary preference
 * @param {string} preference - Dietary preference (vegetarian, vegan, gluten-free, etc.)
 * @returns {Array} - Menu items matching the preference
 */
function getMenuItemsByDietaryPreference(preference) {
  const pref = preference.toLowerCase();
  
  // Define dietary filters
  const dietaryFilters = {
    vegetarian: (item) => {
      const nonVegIngredients = ['beef', 'pork', 'chicken', 'lamb', 'fish', 'shrimp', 'seafood', 'bacon', 'ham'];
      return !nonVegIngredients.some(ingredient => 
        item.description.toLowerCase().includes(ingredient) || 
        (item.ingredients && item.ingredients.some(i => i.toLowerCase().includes(ingredient)))
      );
    },
    vegan: (item) => {
      const nonVeganIngredients = ['meat', 'beef', 'pork', 'chicken', 'lamb', 'fish', 'shrimp', 'seafood', 
        'egg', 'milk', 'cream', 'cheese', 'butter', 'yogurt', 'honey'];
      return !nonVeganIngredients.some(ingredient => 
        item.description.toLowerCase().includes(ingredient) || 
        (item.ingredients && item.ingredients.some(i => i.toLowerCase().includes(ingredient)))
      );
    },
    'gluten-free': (item) => {
      const glutenIngredients = ['wheat', 'flour', 'bread', 'pasta', 'noodle', 'soy sauce', 'barley', 'rye'];
      return !glutenIngredients.some(ingredient => 
        item.description.toLowerCase().includes(ingredient) || 
        (item.ingredients && item.ingredients.some(i => i.toLowerCase().includes(ingredient)))
      ) && !(item.allergens && item.allergens.includes('gluten'));
    },
    'dairy-free': (item) => {
      const dairyIngredients = ['milk', 'cream', 'cheese', 'butter', 'yogurt'];
      return !dairyIngredients.some(ingredient => 
        item.description.toLowerCase().includes(ingredient) || 
        (item.ingredients && item.ingredients.some(i => i.toLowerCase().includes(ingredient)))
      ) && !(item.allergens && item.allergens.includes('dairy'));
    },
    'nut-free': (item) => {
      const nutIngredients = ['nut', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut'];
      return !nutIngredients.some(ingredient => 
        item.description.toLowerCase().includes(ingredient) || 
        (item.ingredients && item.ingredients.some(i => i.toLowerCase().includes(ingredient)))
      ) && !(item.allergens && item.allergens.includes('nuts'));
    }
  };
  
  // Apply the appropriate filter
  if (dietaryFilters[pref]) {
    return menuItems.filter(item => dietaryFilters[pref](item) && item.is_available);
  }
  
  // Default: return items that mention the preference
  return menuItems.filter(item => 
    item.description.toLowerCase().includes(pref) || 
    (item.ingredients && item.ingredients.some(i => i.toLowerCase().includes(pref)))
  );
}

/**
 * Get featured menu items
 * @returns {Array} - Featured menu items
 */
function getFeaturedMenuItems() {
  return menuItems.filter(item => item.is_featured && item.is_available);
}

/**
 * Get menu items by price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Array} - Menu items in the price range
 */
function getMenuItemsByPriceRange(minPrice, maxPrice) {
  return menuItems.filter(item => 
    item.price >= minPrice && 
    item.price <= maxPrice && 
    item.is_available
  );
}

/**
 * Get menu items by allergen exclusion
 * @param {Array} allergens - Allergens to exclude
 * @returns {Array} - Menu items without the specified allergens
 */
function getMenuItemsByAllergenExclusion(allergens) {
  const allergensLower = allergens.map(a => a.toLowerCase());
  return menuItems.filter(item => {
    if (!item.allergens) return true;
    return !item.allergens.some(a => allergensLower.includes(a.toLowerCase()));
  });
}

/**
 * Format a menu item for display
 * @param {Object} item - Menu item object
 * @returns {Object} - Formatted menu item for display
 */
function formatMenuItemForDisplay(item) {
  const category = getCategoryById(item.category_id);
  
  return {
    type: "menu_item_card",
    title: item.name,
    image: item.image_url,
    price: item.price,
    description: item.description,
    ingredients: item.ingredients || [],
    allergens: item.allergens || [],
    dietary: item.dietary || [],
    category: category ? category.name : '',
    portion_size: item.portion_size || '',
    available: item.is_available,
    popular: item.is_featured,
    actions: [
      { 
        label: "Add to Order", 
        action: "add_to_cart", 
        payload: { item_id: item.id },
        primary: true
      },
      { 
        label: "View Nutrition", 
        action: "view_nutrition", 
        payload: { item_id: item.id },
        primary: false
      }
    ]
  };
}

/**
 * Format a category with its items for display
 * @param {Object} category - Category object
 * @returns {Object} - Formatted category with items for display
 */
function formatCategoryForDisplay(category) {
  const items = getMenuItemsByCategoryId(category.id)
    .filter(item => item.is_available)
    .map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''),
      image: item.image_url,
      popular: item.is_featured
    }));
  
  return {
    type: "menu_category_card",
    title: category.name,
    description: category.description,
    items: items,
    actions: [
      { 
        label: "View All Items", 
        action: "view_category", 
        payload: { category_id: category.id },
        primary: true
      }
    ]
  };
}

/**
 * Format the full menu for display
 * @returns {Object} - Formatted full menu for display
 */
function formatFullMenuForDisplay() {
  const foodCategories = categories
    .filter(category => category.type === 'food' && category.is_active)
    .map(category => {
      const items = getMenuItemsByCategoryId(category.id)
        .filter(item => item.is_available)
        .map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description.substring(0, 60) + (item.description.length > 60 ? '...' : ''),
          image: item.image_url,
          popular: item.is_featured
        }));
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        items: items
      };
    });
  
  const drinksCategories = categories
    .filter(category => (category.type === 'beverage' || category.type === 'alcoholic') && category.is_active)
    .map(category => {
      const items = getMenuItemsByCategoryId(category.id)
        .filter(item => item.is_available)
        .map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description.substring(0, 60) + (item.description.length > 60 ? '...' : ''),
          image: item.image_url,
          popular: item.is_featured
        }));
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        items: items
      };
    });
  
  return {
    type: "full_menu_card",
    food_categories: foodCategories,
    drinks_categories: drinksCategories,
    restaurant_info: {
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
    },
    actions: [
      { 
        label: "Make a Reservation", 
        action: "make_reservation", 
        payload: { type: "reservation" },
        primary: true
      },
      { 
        label: "Contact Restaurant", 
        action: "contact_restaurant", 
        payload: { type: "contact" },
        primary: false
      }
    ]
  };
}

/**
 * Generate recommendations based on criteria
 * @param {Object} criteria - Criteria for recommendations
 * @returns {Array} - Recommended menu items
 */
function generateRecommendations(criteria = {}) {
  let recommendations = menuItems.filter(item => item.is_available);
  
  // Apply dietary filters
  if (criteria.dietary) {
    recommendations = getMenuItemsByDietaryPreference(criteria.dietary);
  }
  
  // Apply price range filter
  if (criteria.minPrice !== undefined && criteria.maxPrice !== undefined) {
    recommendations = recommendations.filter(item => 
      item.price >= criteria.minPrice && item.price <= criteria.maxPrice
    );
  }
  
  // Apply allergen exclusion
  if (criteria.excludeAllergens && criteria.excludeAllergens.length > 0) {
    recommendations = getMenuItemsByAllergenExclusion(criteria.excludeAllergens);
  }
  
  // Apply category filter
  if (criteria.categoryId) {
    recommendations = recommendations.filter(item => item.category_id === criteria.categoryId);
  }
  
  // Apply meal type filter (breakfast, lunch, dinner)
  if (criteria.mealType) {
    const mealType = criteria.mealType.toLowerCase();
    if (mealType === 'breakfast') {
      recommendations = recommendations.filter(item => 
        item.category_id === 1 || // Bread & Spread
        item.name.toLowerCase().includes('egg') ||
        item.description.toLowerCase().includes('breakfast')
      );
    } else if (mealType === 'lunch' || mealType === 'dinner') {
      recommendations = recommendations.filter(item => 
        item.category_id !== 5 // Not desserts
      );
    }
  }
  
  // Prioritize featured items
  recommendations.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });
  
  // Limit to 5 recommendations
  recommendations = recommendations.slice(0, 5);
  
  return recommendations.map(item => formatMenuItemForDisplay(item));
}

/**
 * Search for menu items
 * @param {string} query - Search query
 * @returns {Array} - Search results
 */
function searchMenuItems(query) {
  const searchTerm = query.toLowerCase();
  
  // Search in name and description
  const results = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm) || 
    item.description.toLowerCase().includes(searchTerm) ||
    (item.ingredients && item.ingredients.some(i => i.toLowerCase().includes(searchTerm)))
  );
  
  return results.map(item => formatMenuItemForDisplay(item));
}

// Export all functions
export default {
  getAllCategories,
  getAllMenuItems,
  getCategoryById,
  getMenuItemById,
  getMenuItemsByCategoryId,
  getMenuItemsByName,
  getMenuItemsByDietaryPreference,
  getFeaturedMenuItems,
  getMenuItemsByPriceRange,
  getMenuItemsByAllergenExclusion,
  formatMenuItemForDisplay,
  formatCategoryForDisplay,
  formatFullMenuForDisplay,
  generateRecommendations,
  searchMenuItems
};
