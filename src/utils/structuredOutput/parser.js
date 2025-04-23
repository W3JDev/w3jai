/**
 * Structured Output Parser
 * Detects and parses structured JSON output from AI responses
 */

/**
 * Parse a response to extract structured JSON content
 * @param {string} text - The AI response text
 * @returns {Object|null} - Parsed JSON object or null if no valid JSON found
 */
export function parseStructuredOutput(text) {
  if (!text) return null;

  try {
    // First, try to parse the entire text as JSON
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.type) {
        console.log('Successfully parsed complete JSON response:', parsed.type);
        return parsed;
      }
    } catch (e) {
      // Not a complete JSON object, continue with other methods
    }

    // Look for JSON blocks in markdown code blocks (most common format)
    const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
    const jsonMatches = [...text.matchAll(jsonBlockRegex)];

    if (jsonMatches.length > 0) {
      // Use the first JSON block found
      try {
        const parsed = JSON.parse(jsonMatches[0][1]);
        if (parsed && typeof parsed === 'object' && parsed.type) {
          console.log('Successfully parsed JSON from code block:', parsed.type);
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing JSON from code block:', e);
      }
    }

    // Look for JSON objects in the text (without code blocks)
    const jsonObjectRegex = /(\{[\s\S]*?\})/g;
    const objectMatches = [...text.matchAll(jsonObjectRegex)];

    if (objectMatches.length > 0) {
      // Try each match until we find valid JSON
      for (const match of objectMatches) {
        try {
          const parsed = JSON.parse(match[1]);
          // Verify it's an object with a type property
          if (parsed && typeof parsed === 'object' && parsed.type) {
            console.log('Successfully parsed JSON from text:', parsed.type);
            return parsed;
          }
        } catch (e) {
          // Continue to the next match
        }
      }
    }

    // Special case for recipes - if we detect a recipe request but no JSON, create a structured output
    if (detectRecipeContent(text)) {
      console.log('Detected recipe content, creating structured output');
      return createRecipeStructure(text);
    }

    // Special case for menu items - if we detect a menu item but no JSON, create a structured output
    if (detectMenuItemContent(text)) {
      console.log('Detected menu item content, creating structured output');
      return createMenuItemStructure(text);
    }

    return null;
  } catch (error) {
    console.error('Error parsing structured output:', error);
    return null;
  }
}

/**
 * Check if a response contains structured output
 * @param {string} text - The AI response text
 * @returns {boolean} - True if the response contains structured output
 */
export function hasStructuredOutput(text) {
  return parseStructuredOutput(text) !== null;
}

/**
 * Extract text content from a response, removing structured output
 * @param {string} text - The AI response text
 * @returns {string} - The text content without structured output
 */
export function extractTextContent(text) {
  if (!text) return '';

  // Check if the entire text is valid JSON
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && parsed.type) {
      // If the entire text is valid JSON with a type property, return empty string
      return '';
    }
  } catch (e) {
    // Not a complete JSON object, continue with other methods
  }

  // Remove JSON code blocks
  let cleanedText = text.replace(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/g, '');

  // Remove standalone JSON objects that match our format
  const jsonObjectRegex = /(\{[\s\S]*?\})/g;
  const objectMatches = [...text.matchAll(jsonObjectRegex)];

  if (objectMatches.length > 0) {
    // Try each match to see if it's valid JSON
    for (const match of objectMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        // If it's a valid JSON object with a type property, remove it from the text
        if (parsed && typeof parsed === 'object' && parsed.type) {
          cleanedText = cleanedText.replace(match[1], '');
        }
      } catch (e) {
        // Not valid JSON, skip
      }
    }
  }

  // Clean up any leftover markdown or whitespace
  cleanedText = cleanedText.trim();

  // Remove any remaining code block markers
  cleanedText = cleanedText.replace(/```(?:json)?/g, '');

  // Remove any lines that are just whitespace or empty
  cleanedText = cleanedText.split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');

  return cleanedText;
}

/**
 * Detect if the text contains recipe content
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if the text appears to be a recipe
 */
function detectRecipeContent(text) {
  // Check if the user explicitly asked for a recipe
  const recipeRequestPatterns = [
    /(?:show|give|share|provide)\s+(?:me|us)\s+(?:a|the|your)\s+(?:recipe|instructions)\s+for/i,
    /how\s+(?:do|can|would)\s+(?:i|you|we|one)\s+(?:make|prepare|cook|bake)/i,
    /(?:recipe|instructions)\s+for\s+[\w\s]+/i,
    /(?:i|we)\s+(?:want|need|would like)\s+(?:to|a)\s+(?:make|cook|bake|prepare)/i
  ];

  for (const pattern of recipeRequestPatterns) {
    if (pattern.test(text)) {
      console.log('Recipe request detected from user query pattern');
      return true;
    }
  }

  // Check for common recipe patterns
  const recipePatterns = [
    /ingredients:/i,
    /instructions:/i,
    /directions:/i,
    /preparation:/i,
    /prep time:/i,
    /cook time:/i,
    /servings:/i,
    /\d+ cups/i,
    /\d+ tablespoons/i,
    /\d+ teaspoons/i,
    /preheat (?:the )?oven/i,
    /bake (?:for|at) \d+/i,
    /mix (?:the|all|together)/i,
    /stir (?:until|the|in)/i,
    /add (?:the|to|and)/i,
    /combine (?:the|all|with)/i
  ];

  // Check if at least 3 patterns match to confirm it's likely a recipe
  let matchCount = 0;
  for (const pattern of recipePatterns) {
    if (pattern.test(text)) {
      matchCount++;
    }
    if (matchCount >= 3) {
      console.log('Recipe content detected from content patterns, match count:', matchCount);
      return true;
    }
  }

  // Check for recipe-specific food terms
  const foodTerms = ['flour', 'sugar', 'butter', 'egg', 'bake', 'cookie', 'cake', 'chocolate', 'vanilla', 'cream', 'dough', 'batter'];
  let foodTermCount = 0;

  for (const term of foodTerms) {
    const regex = new RegExp(`\\b${term}\\w*\\b`, 'i');
    if (regex.test(text)) {
      foodTermCount++;
    }
  }

  if (foodTermCount >= 5) {
    console.log('Recipe content detected from food terms, term count:', foodTermCount);
    return true;
  }

  // Check for measurement patterns
  const measurementPatterns = [
    /\d+\s*(?:cup|tablespoon|teaspoon|tsp|tbsp|oz|ounce|pound|lb|gram|g|kg|ml|liter|l)s?/gi,
    /(?:cup|tablespoon|teaspoon|tsp|tbsp)\s+(?:of|\w+)/gi
  ];

  let measurementCount = 0;
  for (const pattern of measurementPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      measurementCount += matches.length;
    }
  }

  if (measurementCount >= 3) {
    console.log('Recipe content detected from measurement patterns, count:', measurementCount);
    return true;
  }

  return false;
}

/**
 * Create a structured recipe object from unstructured text
 * @param {string} text - The recipe text
 * @returns {Object} - Structured recipe object
 */
function createRecipeStructure(text) {
  console.log('Creating structured recipe from text');

  // Extract title (using multiple patterns to increase chances of finding it)
  let title = '';
  const titlePatterns = [
    /(?:recipe for|classic|homemade|easy)\s+([^\n.]+?)(?:\s+that|\s+with|\.|$)/i,
    /^\s*([^\n.]+?)(?:\s+recipe|\s+cookies|\s+cake|\.|$)/i,
    /^\s*([^\n.]{3,50})(?:\n|$)/i
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 3) {
      title = match[1].trim();
      // Capitalize first letter of each word
      title = title.replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }

  if (!title) {
    // Fallback title based on content
    if (text.includes('chocolate') && text.includes('cookie')) {
      title = 'Chocolate Cookies';
    } else if (text.includes('cake')) {
      title = 'Cake Recipe';
    } else {
      title = 'Recipe';
    }
  }

  console.log('Extracted title:', title);

  // Extract description
  let description = '';
  const descriptionPatterns = [
    /^[^\n.]+\.[^\n.]+\./,  // First two sentences
    /(?:This|These|A|An)\s+[^\n.]+\s+(?:that|which|recipe|dish)[^\n.]+\./i,
    /(?:delicious|tasty|flavorful|perfect|classic|easy|simple|homemade)[^\n.]+\./i
  ];

  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      description = match[0].trim();
      break;
    }
  }

  // Extract ingredients with improved pattern matching
  const ingredients = [];
  let ingredientsSection = '';

  // Look for ingredients section with multiple patterns
  const ingredientsSectionPatterns = [
    /ingredients[:\s]([\s\S]*?)(?:instructions|directions|preparation|method|steps|$)/i,
    /you(?:'ll| will) need[:\s]([\s\S]*?)(?:instructions|directions|preparation|method|steps|$)/i,
    /what you(?:'ll| will) need[:\s]([\s\S]*?)(?:instructions|directions|preparation|method|steps|$)/i
  ];

  for (const pattern of ingredientsSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      ingredientsSection = match[1];
      break;
    }
  }

  if (ingredientsSection) {
    // Split by lines, bullets, or asterisks
    const lines = ingredientsSection.split(/\n|•|\*/g);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.match(/^(?:ingredients|for the|:\s*$)/i)) {
        // Fix common formatting issues with fractions and measurements
        let cleanLine = trimmedLine.replace(/^[\s\-\*\d\.]+\s*/, '');

        // Fix missing numbers at the beginning of ingredients
        if (cleanLine.match(/^(?:cup|tablespoon|teaspoon|tsp|tbsp)s?\b/i)) {
          cleanLine = '1 ' + cleanLine;
        }

        // Fix fraction formatting
        cleanLine = cleanLine
          .replace(/\b(\d+)\s*\/\s*(\d+)\b/g, '$1/$2') // Fix spaced fractions like "1 / 2" to "1/2"
          .replace(/\b(\d+)\s+(\d+)\s*\/\s*(\d+)\b/g, '$1 $2/$3'); // Fix mixed numbers like "2 1 / 2" to "2 1/2"

        if (cleanLine && cleanLine.length > 2) {
          ingredients.push(cleanLine);
        }
      }
    }
  }

  // If ingredients section wasn't found or is empty, try to extract ingredients from the whole text
  if (ingredients.length === 0) {
    const commonIngredients = [
      /\b\d+\s*(?:cup|tablespoon|teaspoon|tsp|tbsp|oz|ounce|pound|lb|gram|g|kg|ml|liter|l)s?\b[^\n.]*?\b(?:flour|sugar|butter|egg|milk|oil|salt|pepper|chocolate|vanilla|baking\s+\w+)\b/gi,
      /\b(?:flour|sugar|butter|egg|milk|oil|salt|pepper|chocolate|vanilla|baking\s+\w+)\b[^\n.]*?\b\d+\s*(?:cup|tablespoon|teaspoon|tsp|tbsp|oz|ounce|pound|lb|gram|g|kg|ml|liter|l)s?\b/gi
    ];

    for (const pattern of commonIngredients) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (!ingredients.includes(match.trim())) {
            ingredients.push(match.trim());
          }
        }
      }
    }
  }

  console.log('Extracted ingredients count:', ingredients.length);

  // Extract instructions with improved pattern matching
  const instructions = [];
  let instructionsSection = '';

  // Look for instructions section with multiple patterns
  const instructionsSectionPatterns = [
    /(?:instructions|directions|preparation|method|steps)[:\s]([\s\S]*?)(?:notes|tips|$)/i,
    /(?:to make|to prepare|how to)[^\n.]+?:[\s\n]([\s\S]*?)(?:notes|tips|$)/i,
    /(?:here's how|here is how)[^\n.]*?:[\s\n]([\s\S]*?)(?:notes|tips|$)/i
  ];

  for (const pattern of instructionsSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      instructionsSection = match[1];
      break;
    }
  }

  if (instructionsSection) {
    // First try to find numbered steps
    const numberedSteps = instructionsSection.match(/\d+\.?\s+[^\n]+/g);

    if (numberedSteps && numberedSteps.length > 0) {
      for (const step of numberedSteps) {
        const cleanStep = step.replace(/^\d+\.?\s+/, '').trim();
        if (cleanStep) {
          instructions.push(cleanStep);
        }
      }
    } else {
      // If no numbered steps, split by lines
      const lines = instructionsSection.split(/\n/);
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.match(/^(?:instructions|directions|steps|:\s*$)/i)) {
          // Remove numbers and bullet points
          const cleanLine = trimmedLine.replace(/^[\s\-\*\d\.]+\s*/, '');
          if (cleanLine && cleanLine.length > 10) { // Only include substantial instructions
            instructions.push(cleanLine);
          }
        }
      }
    }
  }

  // If instructions section wasn't found or is empty, try to extract instructions from the whole text
  if (instructions.length === 0) {
    // Look for sentences that start with cooking verbs
    const cookingVerbPattern = /(?:^|\n|\. )((?:Preheat|Mix|Stir|Combine|Add|Pour|Bake|Cook|Heat|Whisk|Beat|Fold|Knead|Spread|Place)[^\n.]+\.)(?:\s|$)/gi;
    const matches = text.matchAll(cookingVerbPattern);

    for (const match of matches) {
      if (match[1] && !instructions.includes(match[1].trim())) {
        instructions.push(match[1].trim());
      }
    }
  }

  console.log('Extracted instructions count:', instructions.length);

  // Extract prep time and cook time with improved patterns
  let prepTime = '';
  let cookTime = '';

  const timePatterns = {
    prep: [
      /prep(?:aration)? time:?\s*([^\n.]+)/i,
      /prep(?:aration)?:?\s*(\d+[^\n.]*?(?:minute|hour|min|hr)[^\n.]*?)(?:\.|\n|$)/i,
      /takes\s*(\d+[^\n.]*?(?:minute|hour|min|hr)[^\n.]*?)\s*to prep(?:are)?/i
    ],
    cook: [
      /cook(?:ing)? time:?\s*([^\n.]+)/i,
      /cook(?:ing)?:?\s*(\d+[^\n.]*?(?:minute|hour|min|hr)[^\n.]*?)(?:\.|\n|$)/i,
      /bake(?:ing)? time:?\s*([^\n.]+)/i,
      /bake for\s*(\d+[^\n.]*?(?:minute|hour|min|hr)[^\n.]*?)(?:\.|\n|$)/i
    ]
  };

  for (const pattern of timePatterns.prep) {
    const match = text.match(pattern);
    if (match && match[1]) {
      prepTime = match[1].trim();
      // Ensure it has 'minutes' or 'hours' suffix
      if (prepTime.match(/^\d+$/) || prepTime.match(/^\d+-\d+$/)) {
        prepTime += ' minutes';
      }
      break;
    }
  }

  for (const pattern of timePatterns.cook) {
    const match = text.match(pattern);
    if (match && match[1]) {
      cookTime = match[1].trim();
      // Ensure it has 'minutes' or 'hours' suffix
      if (cookTime.match(/^\d+$/) || cookTime.match(/^\d+-\d+$/)) {
        cookTime += ' minutes';
      }
      break;
    }
  }

  // Extract servings with improved patterns
  let servings = 0;
  const servingsPatterns = [
    /(?:servings|serves|yield):?\s*(\d+)/i,
    /(?:makes|yields)\s*(\d+)\s*(?:servings|cookies|portions)/i,
    /(?:recipe serves|serves)\s*(\d+)(?:\s|\.|$)/i,
    /for\s*(\d+)\s*(?:servings|people|portions)/i
  ];

  for (const pattern of servingsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      servings = parseInt(match[1]);
      break;
    }
  }

  // Extract tips with improved patterns
  let tips = '';
  const tipsPatterns = [
    /(?:tips|notes|tip|note):?\s*([^\n]+(?:\n[^\n]+)*)/i,
    /(?:for best results|pro tip)[^\n.]*?:[^\n.]*?([^\n]+(?:\n[^\n]+)*)/i
  ];

  for (const pattern of tipsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      tips = match[1].trim();
      break;
    }
  }

  // If no tips found, look for sentences with tip-like content
  if (!tips) {
    const tipPhrases = [
      /(?:for\s+(?:a|an)\s+\w+er\s+\w+)[^\n.]+\./i,
      /(?:if\s+you\s+(?:want|prefer|like))[^\n.]+\./i,
      /(?:you\s+can\s+(?:also|alternatively))[^\n.]+\./i
    ];

    for (const pattern of tipPhrases) {
      const match = text.match(pattern);
      if (match && match[0]) {
        tips = match[0].trim();
        break;
      }
    }
  }

  // Create a more specific placeholder image URL based on the recipe title
  const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(title.toLowerCase())},food,recipe,cooking`;

  // Create the structured recipe object with validation
  const recipe = {
    type: 'recipe_card',
    title: title || 'Recipe',
    image: imageUrl,
    description: description || `A delicious ${title.toLowerCase()} recipe.`,
    prepTime: prepTime || '15 minutes',
    cookTime: cookTime || '20 minutes',
    servings: servings || 4,
    ingredients: ingredients.length > 0 ? ingredients : ['Ingredients not specified'],
    instructions: instructions.length > 0 ? instructions : ['Instructions not specified'],
    tips: tips || 'No specific tips provided for this recipe.'
  };

  console.log('Created recipe structure with title:', recipe.title);
  return recipe;
}

/**
 * Detect if the text contains menu item content
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if the text appears to be a menu item
 */
function detectMenuItemContent(text) {
  // Check if the user explicitly asked for menu information
  const menuRequestPatterns = [
    /(?:show|tell|give|describe)\s+(?:me|us)\s+(?:about|the)\s+(?:menu|dish|food)/i,
    /what(?:'s|\s+is)\s+(?:on|in)\s+(?:the|your)\s+menu/i,
    /(?:do\s+you\s+have|is\s+there)\s+(?:a|any)\s+(?:special|dish|menu\s+item)/i,
    /(?:recommend|suggest)\s+(?:a|some|any)\s+(?:dish|food|menu\s+item)/i
  ];

  for (const pattern of menuRequestPatterns) {
    if (pattern.test(text)) {
      console.log('Menu item request detected from user query pattern');
      return true;
    }
  }

  // Check for common menu item patterns
  const menuItemPatterns = [
    /price:\s*\$?\d+(\.\d{2})?/i,
    /\$\d+(\.\d{2})?\s+(?:per|for|each)/i,
    /(?:served with|comes with|includes)/i,
    /(?:appetizer|entree|main course|dessert|beverage|drink|cocktail)/i,
    /(?:gluten[- ]free|vegetarian|vegan|dairy[- ]free|nut[- ]free)/i,
    /(?:calories|nutritional|allergens):/i
  ];

  // Check if at least 2 patterns match to confirm it's likely a menu item
  let matchCount = 0;
  for (const pattern of menuItemPatterns) {
    if (pattern.test(text)) {
      matchCount++;
    }
    if (matchCount >= 2) {
      console.log('Menu item content detected from content patterns, match count:', matchCount);
      return true;
    }
  }

  // Check for food-related terms that are common in menu descriptions
  const foodTerms = ['served', 'fresh', 'house-made', 'signature', 'special', 'chef', 'seasonal', 'local', 'organic', 'sauce', 'topped with', 'garnished', 'marinated'];
  let foodTermCount = 0;

  for (const term of foodTerms) {
    const regex = new RegExp(`\\b${term}\\w*\\b`, 'i');
    if (regex.test(text)) {
      foodTermCount++;
    }
  }

  if (foodTermCount >= 3) {
    console.log('Menu item content detected from food terms, term count:', foodTermCount);
    return true;
  }

  return false;
}

/**
 * Create a structured menu item object from unstructured text
 * @param {string} text - The menu item text
 * @returns {Object} - Structured menu item object
 */
function createMenuItemStructure(text) {
  console.log('Creating structured menu item from text');

  // Extract title (using multiple patterns to increase chances of finding it)
  let title = '';
  const titlePatterns = [
    /^\s*([^\n.]+?)(?:\s+-\s+|:\s+|\s+\$|\.|$)/i,
    /(?:our|the|signature|famous|house)\s+([^\n.]+?)(?:\s+-\s+|:\s+|\s+\$|\.|$)/i,
    /(?:try|enjoy|savor)\s+(?:our|the)\s+([^\n.]+?)(?:\s+-\s+|:\s+|\s+\$|\.|$)/i
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      title = match[1].trim();
      // Capitalize first letter of each word
      title = title.replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }

  if (!title) {
    // Fallback title based on content
    if (text.includes('salad')) {
      title = 'Fresh Salad';
    } else if (text.includes('burger')) {
      title = 'Gourmet Burger';
    } else if (text.includes('pasta')) {
      title = 'Pasta Dish';
    } else if (text.includes('steak')) {
      title = 'Premium Steak';
    } else if (text.includes('seafood') || text.includes('fish')) {
      title = 'Seafood Special';
    } else if (text.includes('dessert') || text.includes('cake') || text.includes('ice cream')) {
      title = 'Dessert Selection';
    } else {
      title = 'Featured Dish';
    }
  }

  console.log('Extracted title:', title);

  // Extract description
  let description = '';
  const descriptionPatterns = [
    /(?:^|\n|\. )([^\n.]+(?:\. [^\n.]+){0,2})(?=\n|\. |$)/,  // First 1-3 sentences
    /(?:featuring|made with|prepared with|consisting of)[^\n.]+(?:\.[^\n.]+)?/i,
    /(?:a|our)\s+(?:delicious|savory|sweet|tangy|spicy|flavorful|creamy)[^\n.]+(?:\.[^\n.]+)?/i
  ];

  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      description = match[0].trim();
      break;
    }
  }

  // If no description found, create one based on the title
  if (!description) {
    description = `Our delicious ${title.toLowerCase()} prepared with the finest ingredients.`;
  }

  // Extract price
  let price = 0;
  const pricePatterns = [
    /\$\s*(\d+\.?\d*)/,
    /price:\s*\$?\s*(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*dollars/i,
    /costs?\s*\$?\s*(\d+\.?\d*)/i
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      price = parseFloat(match[1]);
      break;
    }
  }

  // If no price found, set a default based on the type of dish
  if (!price) {
    if (title.toLowerCase().includes('appetizer') || title.toLowerCase().includes('salad')) {
      price = 9.99;
    } else if (title.toLowerCase().includes('dessert')) {
      price = 7.99;
    } else if (title.toLowerCase().includes('steak') || title.toLowerCase().includes('seafood')) {
      price = 24.99;
    } else {
      price = 14.99;
    }
  }

  // Extract ingredients
  const ingredients = [];
  const ingredientsPatterns = [
    /(?:ingredients|contains|made with|featuring):\s*([^\n.]+)/i,
    /(?:ingredients|contains|made with|featuring)\s+([^\n.]+?)(?:\.|$)/i,
    /(?:with|includes)\s+([^\n.]+?)(?:\.|$)/i
  ];

  for (const pattern of ingredientsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const ingredientsList = match[1].split(/,|and/);
      for (const ingredient of ingredientsList) {
        const trimmed = ingredient.trim();
        if (trimmed && !ingredients.includes(trimmed)) {
          ingredients.push(trimmed);
        }
      }
      break;
    }
  }

  // If no ingredients found, extract potential ingredients from the text
  if (ingredients.length === 0) {
    const commonIngredients = [
      /(?:chicken|beef|pork|lamb|fish|shrimp|tofu|cheese|tomato|potato|rice|pasta|bread|lettuce|spinach|kale|onion|garlic|mushroom|carrot|pepper)/gi
    ];

    for (const pattern of commonIngredients) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const trimmed = match.trim();
          if (trimmed && !ingredients.includes(trimmed)) {
            ingredients.push(trimmed);
          }
        }
      }
    }
  }

  // Extract allergens
  const allergens = [];
  const allergensPatterns = [
    /(?:allergens|contains):\s*([^\n.]+)/i,
    /(?:allergens|contains)\s+([^\n.]+?)(?:\.|$)/i,
    /(?:contains|may contain)\s+(?:allergens?:)?\s*([^\n.]+?)(?:\.|$)/i
  ];

  for (const pattern of allergensPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const allergensList = match[1].split(/,|and/);
      for (const allergen of allergensList) {
        const trimmed = allergen.trim();
        if (trimmed && !allergens.includes(trimmed)) {
          allergens.push(trimmed);
        }
      }
      break;
    }
  }

  // If no allergens found, check for common allergens in the text
  if (allergens.length === 0) {
    const commonAllergens = ['dairy', 'milk', 'eggs', 'nuts', 'peanuts', 'tree nuts', 'fish', 'shellfish', 'wheat', 'gluten', 'soy'];
    for (const allergen of commonAllergens) {
      if (text.toLowerCase().includes(allergen)) {
        allergens.push(allergen.charAt(0).toUpperCase() + allergen.slice(1));
      }
    }
  }

  // Extract dietary information
  const dietary = [];
  const dietaryTerms = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Keto', 'Paleo', 'Organic', 'Low-Fat', 'Sugar-Free'];

  for (const term of dietaryTerms) {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      dietary.push(term);
    }
  }

  // Extract calories
  let calories = 0;
  const caloriesPatterns = [
    /(?:calories|cal):\s*(\d+)/i,
    /(\d+)\s*(?:calories|cal)/i,
    /(?:nutritional information|nutrition):[^\n.]*?(\d+)\s*(?:calories|cal)/i
  ];

  for (const pattern of caloriesPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      calories = parseInt(match[1]);
      break;
    }
  }

  // Extract spice level
  let spiceLevel = '';
  const spiceLevelPatterns = [
    /(?:spice|heat) level:\s*([^\n.]+)/i,
    /(?:spice|heat) level[^\n.]*?(?:is|:)\s*([^\n.]+?)(?:\.|$)/i,
    /(?:mild|medium|hot|spicy|very spicy|extra spicy)/i
  ];

  for (const pattern of spiceLevelPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      spiceLevel = match[1].trim();
      break;
    } else if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match && match[0]) {
        spiceLevel = match[0].trim();
        break;
      }
    }
  }

  // Create a placeholder image URL based on the dish title
  const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(title.toLowerCase())},food,dish,restaurant`;

  // Create default actions
  const actions = [
    {
      label: "Add to Order",
      action: "add_to_cart",
      payload: { item_id: title.toLowerCase().replace(/\s+/g, '_') },
      primary: true
    },
    {
      label: "View Nutrition",
      action: "view_nutrition",
      payload: { item_id: title.toLowerCase().replace(/\s+/g, '_') },
      primary: false
    }
  ];

  // Create the structured menu item object with validation
  const menuItem = {
    type: 'menu_item_card',
    title: title || 'Featured Dish',
    image: imageUrl,
    price: price || 14.99,
    description: description || `A delicious dish from our kitchen.`,
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    allergens: allergens.length > 0 ? allergens : undefined,
    dietary: dietary.length > 0 ? dietary : undefined,
    calories: calories || undefined,
    spiceLevel: spiceLevel || undefined,
    popular: text.toLowerCase().includes('popular') || text.toLowerCase().includes('best seller') || text.toLowerCase().includes('signature'),
    available: !text.toLowerCase().includes('unavailable') && !text.toLowerCase().includes('out of stock'),
    actions: actions
  };

  console.log('Created menu item structure with title:', menuItem.title);
  return menuItem;
}

export default {
  parseStructuredOutput,
  hasStructuredOutput,
  extractTextContent
};
