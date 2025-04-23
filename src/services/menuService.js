import supabase from './supabase';

/**
 * Service for accessing menu data
 */
class MenuService {
  /**
   * Get all menu categories
   * @returns {Promise<Object>} Menu categories and error if any
   */
  async getMenuCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get all menu items
   * @returns {Promise<Object>} Menu items and error if any
   */
  async getAllMenuItems() {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id(category_id, name, description)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all menu items:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get menu items by category
   * @param {string} categoryId - The category ID
   * @returns {Promise<Object>} Menu items and error if any
   */
  async getMenuItemsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id(category_id, name, description)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get a menu item by ID
   * @param {string} itemId - The menu item ID
   * @returns {Promise<Object>} Menu item and error if any
   */
  async getMenuItemById(itemId) {
    try {
      const { data: item, error: itemError } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id(category_id, name, description)
        `)
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      // Get dietary info for the item
      const { data: dietaryInfo, error: dietaryError } = await supabase
        .from('item_dietary_info')
        .select(`
          dietary_info:dietary_id(dietary_id, name, description, icon, is_allergen, emoji)
        `)
        .eq('item_id', itemId);

      if (dietaryError) throw dietaryError;

      // Add dietary info to the item
      const itemWithDietary = {
        ...item,
        dietary_info: dietaryInfo.map(d => d.dietary_info)
      };

      return { data: itemWithDietary, error: null };
    } catch (error) {
      console.error('Error fetching menu item by ID:', error);
      return { data: null, error: null };
    }
  }

  /**
   * Search menu items
   * @param {string} query - The search query
   * @returns {Promise<Object>} Search results and error if any
   */
  async searchMenuItems(query) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id(category_id, name, description)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,ingredients.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching menu items:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get menu items by dietary preference
   * @param {string[]} dietaryPreferences - Array of dietary preferences
   * @returns {Promise<Object>} Menu items and error if any
   */
  async getMenuItemsByDietaryInfo(dietaryIds) {
    try {
      // Get item IDs that match all dietary IDs
      const { data: itemIds, error: itemIdsError } = await supabase
        .from('item_dietary_info')
        .select('item_id')
        .in('dietary_id', dietaryIds);

      if (itemIdsError) throw itemIdsError;

      // Extract unique item IDs
      const uniqueItemIds = [...new Set(itemIds.map(item => item.item_id))];

      if (uniqueItemIds.length === 0) {
        return { data: [], error: null };
      }

      // Get menu items by IDs
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id(category_id, name, description)
        `)
        .in('id', uniqueItemIds)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching menu items by dietary preference:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get menu items with price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Promise<Object>} Menu items and error if any
   */
  async getMenuItemsByPriceRange(minPrice, maxPrice) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id(category_id, name, description)
        `)
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching menu items by price range:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get popular menu items
   * @param {number} limit - Number of items to return
   * @returns {Promise<Object>} Popular menu items and error if any
   */
  async getPopularMenuItems(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories:category_id(category_id, name, description)
        `)
        .eq('is_popular', true)
        .eq('is_active', true)
        .limit(limit)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching popular menu items:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get restaurant information
   * @returns {Promise<Object>} Restaurant information and error if any
   */
  async getRestaurantInfo() {
    try {
      const { data, error } = await supabase
        .from('restaurant_info')
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching restaurant information:', error);
      return { data: null, error: null };
    }
  }

  /**
   * Get all dietary information
   * @returns {Promise<Object>} Dietary information and error if any
   */
  async getAllDietaryInfo() {
    try {
      const { data, error } = await supabase
        .from('dietary_info')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching dietary information:', error);
      return { data: [], error: null };
    }
  }

  /**
   * Get all menu data for AI context
   * @returns {Promise<Object>} Complete menu data and error if any
   */
  async getMenuDataForAI() {
    try {
      // Get restaurant info
      const { data: restaurantInfo, error: restaurantError } = await this.getRestaurantInfo();
      if (restaurantError) throw restaurantError;

      // Get all categories
      const { data: categories, error: categoriesError } = await this.getMenuCategories();
      if (categoriesError) throw categoriesError;

      // Get all menu items
      const { data: menuItems, error: menuItemsError } = await this.getAllMenuItems();
      if (menuItemsError) throw menuItemsError;

      // Get all dietary info
      const { data: dietaryInfo, error: dietaryError } = await this.getAllDietaryInfo();
      if (dietaryError) throw dietaryError;

      // Get item dietary info
      const { data: itemDietaryInfo, error: itemDietaryError } = await supabase
        .from('item_dietary_info')
        .select('*');
      if (itemDietaryError) throw itemDietaryError;

      // Organize menu items by category
      const menuByCategory = categories.map(category => {
        const items = menuItems.filter(item => item.category_id === category.category_id);

        // Add dietary info to each item
        const itemsWithDietary = items.map(item => {
          const itemDietary = itemDietaryInfo
            .filter(di => di.item_id === item.id)
            .map(di => {
              return dietaryInfo.find(d => d.dietary_id === di.dietary_id);
            })
            .filter(Boolean);

          return {
            ...item,
            dietary_info: itemDietary
          };
        });

        return {
          ...category,
          items: itemsWithDietary
        };
      });

      // Compile complete menu data
      const menuData = {
        restaurant: restaurantInfo || {
          name: 'Table & Apron',
          description: 'A neighborhood restaurant serving honest food and warm hospitality.',
          address: '23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor, Malaysia',
          phone: '+603-7733 4000',
          email: 'info@tableandapron.com',
          website: 'https://www.tableandapron.com',
          opening_hours: {
            monday: 'Closed',
            tuesday: '11:30 AM - 10:00 PM',
            wednesday: '11:30 AM - 10:00 PM',
            thursday: '11:30 AM - 10:00 PM',
            friday: '11:30 AM - 10:00 PM',
            saturday: '9:30 AM - 10:00 PM',
            sunday: '9:30 AM - 10:00 PM'
          }
        },
        categories: menuByCategory,
        dietary_info: dietaryInfo
      };

      return { data: menuData, error: null };
    } catch (error) {
      console.error('Error fetching menu data for AI:', error);
      // Return default data instead of null to prevent UI errors
      return {
        data: {
          restaurant: {
            name: 'Table & Apron',
            description: 'A neighborhood restaurant serving honest food and warm hospitality.',
            address: '23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor, Malaysia',
            phone: '+603-7733 4000',
            email: 'info@tableandapron.com',
            website: 'https://www.tableandapron.com',
            opening_hours: {
              monday: 'Closed',
              tuesday: '11:30 AM - 10:00 PM',
              wednesday: '11:30 AM - 10:00 PM',
              thursday: '11:30 AM - 10:00 PM',
              friday: '11:30 AM - 10:00 PM',
              saturday: '9:30 AM - 10:00 PM',
              sunday: '9:30 AM - 10:00 PM'
            }
          },
          categories: [],
          dietary_info: []
        },
        error: null
      };
    }
  }
}

export default new MenuService();
