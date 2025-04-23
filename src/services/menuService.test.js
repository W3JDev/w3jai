import { describe, it, expect, vi, beforeEach } from 'vitest';
import menuService from './menuService';
import supabase from './supabase';

// Mock the Supabase client
vi.mock('./supabase', () => ({
  default: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis()
  }
}));

describe('menuService', () => {
  const mockCategories = [
    { id: '1', name: 'Appetizers', display_order: 1 },
    { id: '2', name: 'Main Courses', display_order: 2 },
    { id: '3', name: 'Desserts', display_order: 3 }
  ];
  
  const mockMenuItems = [
    { 
      id: '101', 
      category_id: '1', 
      name: 'Spring Rolls', 
      price: 5.99, 
      description: 'Crispy spring rolls',
      dietary_info: ['vegetarian']
    },
    { 
      id: '201', 
      category_id: '2', 
      name: 'Grilled Salmon', 
      price: 18.99, 
      description: 'Fresh salmon fillet',
      dietary_info: ['gluten-free']
    },
    { 
      id: '301', 
      category_id: '3', 
      name: 'Chocolate Cake', 
      price: 6.99, 
      description: 'Rich chocolate cake',
      dietary_info: ['vegetarian']
    }
  ];
  
  const mockRestaurantInfo = {
    name: 'Test Restaurant',
    description: 'A test restaurant',
    address: '123 Test St',
    opening_hours: { 
      monday: '9:00 AM - 10:00 PM',
      tuesday: '9:00 AM - 10:00 PM'
    }
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('getMenuCategories', () => {
    it('fetches all menu categories', async () => {
      // Mock the Supabase response
      supabase.select.mockImplementation(() => ({
        order: () => Promise.resolve({ data: mockCategories, error: null })
      }));
      
      const result = await menuService.getMenuCategories();
      
      expect(supabase.from).toHaveBeenCalledWith('menu_categories');
      expect(supabase.select).toHaveBeenCalled();
      expect(result.data).toEqual(mockCategories);
      expect(result.error).toBeNull();
    });
    
    it('handles errors when fetching categories', async () => {
      // Mock an error response
      supabase.select.mockImplementation(() => ({
        order: () => Promise.resolve({ data: null, error: { message: 'Database error' } })
      }));
      
      const result = await menuService.getMenuCategories();
      
      expect(result.data).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });
  
  describe('getAllMenuItems', () => {
    it('fetches all menu items with category information', async () => {
      // Mock the Supabase response
      supabase.select.mockImplementation(() => ({
        order: () => Promise.resolve({ data: mockMenuItems, error: null })
      }));
      
      const result = await menuService.getAllMenuItems();
      
      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(supabase.select).toHaveBeenCalled();
      expect(result.data).toEqual(mockMenuItems);
      expect(result.error).toBeNull();
    });
  });
  
  describe('getMenuItemsByCategory', () => {
    it('fetches menu items by category ID', async () => {
      const categoryId = '1';
      const categoryItems = mockMenuItems.filter(item => item.category_id === categoryId);
      
      // Mock the Supabase response
      supabase.eq.mockImplementation(() => ({
        order: () => Promise.resolve({ data: categoryItems, error: null })
      }));
      
      const result = await menuService.getMenuItemsByCategory(categoryId);
      
      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('category_id', categoryId);
      expect(result.data).toEqual(categoryItems);
      expect(result.error).toBeNull();
    });
  });
  
  describe('getMenuItemById', () => {
    it('fetches a menu item by ID', async () => {
      const itemId = '101';
      const item = mockMenuItems.find(item => item.id === itemId);
      
      // Mock the Supabase response
      supabase.eq.mockImplementation(() => ({
        single: () => Promise.resolve({ data: item, error: null })
      }));
      
      const result = await menuService.getMenuItemById(itemId);
      
      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', itemId);
      expect(result.data).toEqual(item);
      expect(result.error).toBeNull();
    });
  });
  
  describe('searchMenuItems', () => {
    it('searches menu items by query', async () => {
      const query = 'salmon';
      const searchResults = mockMenuItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
      
      // Mock the Supabase response
      supabase.or.mockImplementation(() => ({
        order: () => Promise.resolve({ data: searchResults, error: null })
      }));
      
      const result = await menuService.searchMenuItems(query);
      
      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.or).toHaveBeenCalled();
      expect(result.data).toEqual(searchResults);
      expect(result.error).toBeNull();
    });
  });
  
  describe('getMenuItemsByDietaryPreference', () => {
    it('fetches menu items by dietary preference', async () => {
      const dietaryPreferences = ['vegetarian'];
      const filteredItems = mockMenuItems.filter(item => 
        item.dietary_info.includes(dietaryPreferences[0])
      );
      
      // Mock the Supabase response
      supabase.contains.mockImplementation(() => ({
        order: () => Promise.resolve({ data: filteredItems, error: null })
      }));
      
      const result = await menuService.getMenuItemsByDietaryPreference(dietaryPreferences);
      
      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(supabase.select).toHaveBeenCalled();
      expect(supabase.contains).toHaveBeenCalled();
      expect(result.data).toEqual(filteredItems);
      expect(result.error).toBeNull();
    });
  });
  
  describe('getRestaurantInfo', () => {
    it('fetches restaurant information', async () => {
      // Mock the Supabase response
      supabase.select.mockImplementation(() => ({
        single: () => Promise.resolve({ data: mockRestaurantInfo, error: null })
      }));
      
      const result = await menuService.getRestaurantInfo();
      
      expect(supabase.from).toHaveBeenCalledWith('restaurant_info');
      expect(supabase.select).toHaveBeenCalled();
      expect(result.data).toEqual(mockRestaurantInfo);
      expect(result.error).toBeNull();
    });
  });
  
  describe('getMenuDataForAI', () => {
    it('compiles complete menu data for AI', async () => {
      // Mock the individual service methods
      const getRestaurantInfoSpy = vi.spyOn(menuService, 'getRestaurantInfo')
        .mockResolvedValue({ data: mockRestaurantInfo, error: null });
      
      const getMenuCategoriesSpy = vi.spyOn(menuService, 'getMenuCategories')
        .mockResolvedValue({ data: mockCategories, error: null });
      
      const getAllMenuItemsSpy = vi.spyOn(menuService, 'getAllMenuItems')
        .mockResolvedValue({ data: mockMenuItems, error: null });
      
      const result = await menuService.getMenuDataForAI();
      
      expect(getRestaurantInfoSpy).toHaveBeenCalled();
      expect(getMenuCategoriesSpy).toHaveBeenCalled();
      expect(getAllMenuItemsSpy).toHaveBeenCalled();
      
      expect(result.data).toEqual({
        restaurant: mockRestaurantInfo,
        categories: expect.any(Array)
      });
      
      expect(result.error).toBeNull();
    });
    
    it('handles errors when fetching menu data', async () => {
      // Mock an error in one of the service methods
      vi.spyOn(menuService, 'getRestaurantInfo')
        .mockResolvedValue({ data: null, error: { message: 'Database error' } });
      
      const result = await menuService.getMenuDataForAI();
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
