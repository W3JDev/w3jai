/**
 * Component Registry
 * Maps structured output types to React components
 */

// Import all component types
import MenuItemCard from '../../components/structuredOutput/MenuItemCard';
import ProductCard from '../../components/structuredOutput/ProductCard';
import InfoCard from '../../components/structuredOutput/InfoCard';
import ComparisonTable from '../../components/structuredOutput/ComparisonTable';
import ActionButtons from '../../components/structuredOutput/ActionButtons';
import ImageGallery from '../../components/structuredOutput/ImageGallery';
import LocationCard from '../../components/structuredOutput/LocationCard';
import PersonProfile from '../../components/structuredOutput/PersonProfile';
import EventCard from '../../components/structuredOutput/EventCard';
import WeatherCard from '../../components/structuredOutput/WeatherCard';
import RecipeCard from '../../components/structuredOutput/RecipeCard';
import MenuCategoryCard from '../../components/structuredOutput/MenuCategoryCard';
import FullMenuCard from '../../components/structuredOutput/FullMenuCard';
import DietaryOptionsCard from '../../components/structuredOutput/DietaryOptionsCard';

/**
 * Registry of all available structured output components
 * Maps type names to component definitions
 */
const componentRegistry = {
  // Food and dining
  menu_item_card: MenuItemCard,
  recipe_card: RecipeCard,
  menu_category_card: MenuCategoryCard,
  full_menu_card: FullMenuCard,
  dietary_options_card: DietaryOptionsCard,
  menu_categories_card: MenuCategoryCard, // Reuse MenuCategoryCard for categories list
  search_results_card: MenuCategoryCard, // Reuse MenuCategoryCard for search results
  price_range_card: MenuCategoryCard, // Reuse MenuCategoryCard for price range results
  recommendations_card: MenuCategoryCard, // Reuse MenuCategoryCard for recommendations

  // E-commerce
  product_card: ProductCard,
  product_comparison: ComparisonTable,

  // General information
  info_card: InfoCard,
  comparison_table: ComparisonTable,
  action_buttons: ActionButtons,
  image_gallery: ImageGallery,

  // Location and events
  location_card: LocationCard,
  person_profile: PersonProfile,
  event_card: EventCard,
  weather_card: WeatherCard
};

/**
 * Get a component by type
 * @param {string} type - The type of component to get
 * @returns {React.Component|null} - The component or null if not found
 */
export function getComponentByType(type) {
  return componentRegistry[type] || null;
}

/**
 * Get all available component types
 * @returns {Array<string>} - Array of component type names
 */
export function getAllComponentTypes() {
  return Object.keys(componentRegistry);
}

/**
 * Check if a component type exists
 * @param {string} type - The type to check
 * @returns {boolean} - True if the component type exists
 */
export function hasComponentType(type) {
  return !!componentRegistry[type];
}

export default {
  getComponentByType,
  getAllComponentTypes,
  hasComponentType
};
