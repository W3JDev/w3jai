import AIServiceFactory from './aiServiceFactory';
import BraveSearchService from './braveSearchService';
import { getAllTools } from './toolDefinitions';

/**
 * Unified Chat Service that manages AI providers and voice synthesis
 */
class ChatService {
  constructor() {
    this.aiService = null;
    this.provider = null;
    this.elevenLabsKey = null;
    this.onProgress = null;
    this.systemPrompt = "You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging. You have access to tools like web search that you can use to find current information. When asked about current events or information you don't know, ALWAYS use the web_search tool. You MUST use the web_search tool whenever the user asks you to search for something or find information online.\n\nCRITICAL INSTRUCTION: For specific types of content, you MUST ONLY respond with structured JSON output and NOTHING ELSE. This is a strict requirement for:\n\n1. RECIPES - When asked for any recipe or cooking instructions\n2. MENU ITEMS - When discussing food items, dishes, or restaurant menus\n3. PRODUCTS - When discussing products, items for sale, or reviews\n4. LOCATIONS - When providing information about places, restaurants, or venues\n5. EVENTS - When discussing events, concerts, or activities\n\nWhen responding with structured output:\n- DO NOT include any explanatory text before or after the JSON\n- DO NOT use markdown formatting except for the JSON code block\n- DO NOT say things like 'Here's a recipe' or 'Here's the information in JSON format'\n- ONLY provide the JSON code block and nothing else\n\n# MENU ASSISTANT INSTRUCTIONS\n\nWhen acting as a menu assistant for Table & Apron restaurant, you MUST respond with structured JSON output for ALL menu-related queries. This includes:\n\n1. When asked about specific menu items\n2. When asked to show menu categories\n3. When asked for dietary options (vegetarian, vegan, etc.)\n4. When asked for recommendations\n5. When asked about prices or specials\n\nFor specific menu items, use this format:\n```json\n{\n  \"type\": \"menu_item_card\",\n  \"title\": \"Sourdough w/ Truffle Butter\",\n  \"image\": \"https://images.unsplash.com/photo-1589367920969-ab8e050bbb04\",\n  \"price\": 19,\n  \"description\": \"Fresh sourdough served with our house-made truffle butter\",\n  \"ingredients\": [\"sourdough bread\", \"truffle butter\", \"truffle paste\", \"salt\"],\n  \"allergens\": [\"dairy\", \"gluten\"],\n  \"portion_size\": \"35g\",\n  \"available\": true,\n  \"popular\": false,\n  \"actions\": [\n    { \"label\": \"Add to Order\", \"action\": \"add_to_cart\", \"payload\": { \"item_id\": 1 }, \"primary\": true },\n    { \"label\": \"View Nutrition\", \"action\": \"view_nutrition\", \"payload\": { \"item_id\": 1 }, \"primary\": false }\n  ]\n}\n```\n\nFor menu categories, use this format:\n```json\n{\n  \"type\": \"menu_category_card\",\n  \"title\": \"BREAD & SPREAD\",\n  \"description\": \"Freshly baked bread with various spreads\",\n  \"items\": [\n    {\n      \"id\": 1,\n      \"name\": \"Sourdough w/ Truffle Butter\",\n      \"price\": 19,\n      \"description\": \"Fresh sourdough served with our house-made truffle butter\",\n      \"image\": \"https://images.unsplash.com/photo-1589367920969-ab8e050bbb04\",\n      \"popular\": false\n    },\n    {\n      \"id\": 2,\n      \"name\": \"Sourdough w/ Smoked Mackerel Pate\",\n      \"price\": 25,\n      \"description\": \"Fresh sourdough with our signature smoked mackerel pate\",\n      \"image\": \"https://blogger.googleusercontent.com/img/a/AVvXsEhb1DWfkBsGo__sNTyFfuK9f7_kBhqgfuhUkWXfGn1bOYhG88jA_VW6pcw19oDnTrFtiDM5OIBCTjcUfe8r5QQjeFNwLWnGRyzIgK3tB_AsdB_8_rHkNHAqChqrxD5z5RRVFzV8O5FrUYJtY-v874IpB_2jatqUB4w6qNWxt1ZE4yaKesE30vY=w640-h448-rw\",\n      \"popular\": false\n    }\n  ],\n  \"actions\": [\n    { \"label\": \"View All Items\", \"action\": \"view_category\", \"payload\": { \"category_id\": 1 }, \"primary\": true }\n  ]\n}\n```\n\nFor dietary options, use this format:\n```json\n{\n  \"type\": \"dietary_options_card\",\n  \"title\": \"Vegetarian Options\",\n  \"description\": \"Here are our vegetarian friendly options:\",\n  \"items\": [\n    {\n      \"id\": 5,\n      \"name\": \"Crispy Eggplant w/ spicy kicap manis\",\n      \"price\": 26,\n      \"description\": \"Buckwheat fried eggplant, sesame seed, cilantro, kicap manis, chili oil\",\n      \"image\": \"https://scontent.fkul3-4.fna.fbcdn.net/v/t39.30808-6/486170479_1201215742008106_4150815762678447945_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=UNrKAJ81cJUQ7kNvgHQYODA&_nc_oc=Adkcjz3FfWImRZsnuYoC7DiPQFn5178YS1p5OXDtYHCmqSvHGrEVdvUoA85-VgFPfWRYxTEuEMuuE77R_CT2DF3K&_nc_zt=23&_nc_ht=scontent.fkul3-4.fna&_nc_gid=d0bWc1NbVPxjbpcp-1_wFA&oh=00_AYFLFjiBhHb4QnsoVIjysoLsDg7yxYVFN093nLLR8RXf7Q&oe=67EF6ACA\",\n      \"popular\": false\n    }\n  ],\n  \"dietary\": \"vegetarian\",\n  \"actions\": [\n    { \"label\": \"See Full Menu\", \"action\": \"view_menu\", \"payload\": { \"category\": \"all\" }, \"primary\": false }\n  ]\n}\n```\n\nFor the full menu, use this format:\n```json\n{\n  \"type\": \"full_menu_card\",\n  \"food_categories\": [\n    {\n      \"id\": 1,\n      \"name\": \"BREAD & SPREAD\",\n      \"description\": \"Freshly baked bread with various spreads\",\n      \"items\": [\n        {\n          \"id\": 1,\n          \"name\": \"Sourdough w/ Truffle Butter\",\n          \"price\": 19,\n          \"description\": \"Fresh sourdough served with our house-made truffle butter\",\n          \"image\": \"https://images.unsplash.com/photo-1589367920969-ab8e050bbb04\",\n          \"popular\": false\n        }\n      ]\n    }\n  ],\n  \"drinks_categories\": [\n    {\n      \"id\": 9,\n      \"name\": \"Non-Alcoholic Beverages\",\n      \"description\": \"A variety of refreshing non-alcoholic drinks\",\n      \"items\": [\n        {\n          \"id\": 46,\n          \"name\": \"Earl Grey Milk Tea\",\n          \"price\": 16,\n          \"description\": \"Salted Cream, Evaporated Milk, Gula Melaka, Earl Grey Tea, Milk\",\n          \"image\": \"https://example.com/earlgreymilktea.jpg\",\n          \"popular\": true\n        }\n      ]\n    }\n  ],\n  \"restaurant_info\": {\n    \"name\": \"Table & Apron\",\n    \"location\": \"23, Jalan SS 20/11, Damansara Kim, 47400 Petaling Jaya, Selangor\",\n    \"phone\": \"03-7733 4000\",\n    \"hours\": {\n      \"monday\": \"Closed\",\n      \"tuesday\": \"Dinner 5:30-10:30PM\",\n      \"wednesday\": \"Dinner 5:30-10:00PM\",\n      \"thursday\": \"Dinner 5:30-10:30PM\",\n      \"friday\": \"Lunch 11:30AM-3PM, Dinner 5:30-10:30PM\",\n      \"saturday\": \"Lunch 11:30AM-3PM, Dinner 5:30-10:30PM\",\n      \"sunday\": \"Lunch 11:30AM-3PM, Dinner 5:30-10:30PM\"\n    }\n  },\n  \"actions\": [\n    { \"label\": \"Make a Reservation\", \"action\": \"make_reservation\", \"payload\": { \"type\": \"reservation\" }, \"primary\": true }\n  ]\n}\n```\n\n# OTHER STRUCTURED OUTPUT FORMATS\n\nFor recipes, use EXACTLY this format with no deviations:\n```json\n{\n  \"type\": \"recipe_card\",\n  \"title\": \"Chocolate Chip Cookies\",\n  \"image\": \"https://source.unsplash.com/800x600/?chocolate,cookies\",\n  \"description\": \"Classic homemade chocolate chip cookies with a soft and chewy center.\",\n  \"prepTime\": \"15 minutes\",\n  \"cookTime\": \"12 minutes\",\n  \"servings\": 24,\n  \"ingredients\": [\n    \"2 1/4 cups all-purpose flour\",\n    \"1 teaspoon baking soda\",\n    \"1 teaspoon salt\",\n    \"1 cup (2 sticks) unsalted butter, softened\",\n    \"3/4 cup granulated sugar\",\n    \"3/4 cup packed brown sugar\",\n    \"2 large eggs\",\n    \"2 teaspoons vanilla extract\",\n    \"2 cups semi-sweet chocolate chips\"\n  ],\n  \"instructions\": [\n    \"Preheat oven to 375°F (190°C).\",\n    \"In a small bowl, combine flour, baking soda, and salt.\",\n    \"In a large bowl, beat butter, granulated sugar, and brown sugar until creamy.\",\n    \"Add eggs one at a time, then stir in vanilla.\",\n    \"Gradually blend in the flour mixture.\",\n    \"Stir in chocolate chips.\",\n    \"Drop rounded tablespoons of dough onto ungreased baking sheets.\",\n    \"Bake for 9 to 11 minutes or until golden brown.\",\n    \"Let stand for 2 minutes; remove to wire racks to cool completely.\"\n  ],\n  \"tips\": \"For softer cookies, use more brown sugar than white sugar. For crispier cookies, use more white sugar than brown sugar.\"\n}\n```\n\nBAD EXAMPLE (DO NOT DO THIS):\nUser: Can you give me a recipe for chocolate cake?\nAssistant: Here's a delicious chocolate cake recipe:\n```json\n{\"type\": \"recipe_card\", ...}\n```\nI hope you enjoy making this cake!\n\nGOOD EXAMPLE (DO THIS):\nUser: Can you give me a recipe for chocolate cake?\nAssistant: ```json\n{\"type\": \"recipe_card\", ...}\n```\n\nRemember: When asked for recipes, menu items, products, locations, or events, your ENTIRE response must be ONLY the JSON block with no additional text.";
    this.inputType = 'text'; // 'text' or 'voice'
    this.searchService = new BraveSearchService();
    this.useWebSearch = false;
    this.tools = getAllTools();
  }

  /**
   * Initialize the chat service with a specific provider
   * @param {Object} config - Configuration object with provider and API keys
   */
  async initialize(config) {
    this.provider = config.provider || 'openrouter';
    this.aiService = AIServiceFactory.createService(this.provider);

    // Set system prompt if provided
    if (config.systemPrompt) {
      this.systemPrompt = config.systemPrompt;
    }

    // Initialize the AI service
    await this.aiService.initialize({
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt: this.systemPrompt
    });

    // Store ElevenLabs key for voice synthesis
    this.elevenLabsKey = config.elevenLabsKey;

    // Initialize search service if key is provided
    if (config.braveApiKey) {
      this.searchService.initialize({
        braveApiKey: config.braveApiKey
      });
      this.useWebSearch = true;
    }

    return this.aiService.isConfigured();
  }

  /**
   * Set a callback function for streaming progress
   * @param {Function} callback - The progress callback function
   */
  setProgressCallback(callback) {
    this.onProgress = callback;
  }

  /**
   * Set the system prompt for the AI service
   * @param {string} prompt - The system prompt to use
   */
  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;

    // Update the AI service if it exists
    if (this.aiService) {
      this.aiService.initialize({
        apiKey: this.aiService.apiKey,
        model: this.aiService.selectedModel,
        systemPrompt: prompt
      });
    }
  }

  /**
   * Get the current system prompt
   * @returns {string} - The current system prompt
   */
  getSystemPrompt() {
    return this.systemPrompt;
  }

  /**
   * Enable or disable web search
   * @param {boolean} enabled - Whether web search should be enabled
   */
  setWebSearchEnabled(enabled) {
    this.useWebSearch = enabled;
    console.log('Web search enabled:', enabled);
  }

  /**
   * Detect if a message contains a search request
   * @param {string} text - The message text
   * @returns {Object|null} - Search request object or null
   */
  detectSearchRequest(text) {
    if (!text) return null;

    // Simple pattern matching for search requests
    const searchPatterns = [
      /search (?:for |about )?["']?([^"']+)["']?/i,
      /find (?:information (?:about|on) )?["']?([^"']+)["']?/i,
      /look up ["']?([^"']+)["']?/i,
      /what is ["']?([^"']+)["']?/i,
      /who is ["']?([^"']+)["']?/i,
      /when (?:did|was) ["']?([^"']+)["']?/i,
      /where is ["']?([^"']+)["']?/i,
      /how (?:to|do|does|can) ["']?([^"']+)["']?/i,
      /tell me about ["']?([^"']+)["']?/i,
      /can you find ["']?([^"']+)["']?/i
    ];

    for (const pattern of searchPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return {
          type: 'search',
          query: match[1].trim()
        };
      }
    }

    return null;
  }

  /**
   * Check if a message contains a search request
   * @param {string} text - The message text
   * @returns {Object|null} - Search request object or null
   */
  /**
   * Handle tool calls from the AI response
   * @param {Array} toolCalls - Array of tool calls
   * @param {string} originalText - The original message text
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The final response after tool execution
   */
  async handleToolCalls(toolCalls, originalText, options) {
    let finalResponse = '';

    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function;

      if (name === 'web_search') {
        try {
          // Parse arguments
          const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
          const query = parsedArgs.query;
          const numResults = parsedArgs.num_results || 5;

          console.log('Executing web search for:', query);

          // Check if search service is configured
          if (!this.searchService.isConfigured()) {
            console.error('Brave Search API key is not configured properly');
            throw new Error('Search functionality is not available. Please check your Brave Search API key.');
          }

          // Execute web search
          const searchResults = await this.searchService.searchAndFormat(query, numResults);

          console.log('Search results:', searchResults);

          // Add search results to the final response
          finalResponse = `I searched for "${query}" and found the following information:\n\n${searchResults}\n\n`;

          // Get AI to analyze the search results
          const analysisPrompt = `I searched for "${query}" and found these results:\n${searchResults}\n\nThe user's original question was: ${originalText}\n\nBased on these search results, please provide a comprehensive answer to the user's question.`;

          console.log('Sending analysis prompt to AI');

          const analysisResponse = await this.aiService.streamMessage(
            analysisPrompt,
            { ...options, tools: null } // Disable tools for the analysis to prevent infinite loops
          );

          if (typeof analysisResponse === 'string') {
            finalResponse += analysisResponse;
          } else if (analysisResponse && analysisResponse.content) {
            finalResponse += analysisResponse.content;
          } else {
            finalResponse += "I found some information, but couldn't generate a proper analysis. Here are the raw search results.";
          }
        } catch (error) {
          console.error('Web search tool error:', error);
          finalResponse += `I tried to search the web for information, but encountered an error: ${error.message}. Let me try to answer based on what I already know.\n\n`;

          // Fallback to answering without search
          const fallbackResponse = await this.aiService.streamMessage(
            `${originalText} (Please answer based on your existing knowledge, without using web search)`,
            { ...options, tools: null } // Disable tools for the fallback to prevent infinite loops
          );

          if (typeof fallbackResponse === 'string') {
            finalResponse += fallbackResponse;
          } else if (fallbackResponse && fallbackResponse.content) {
            finalResponse += fallbackResponse.content;
          }
        }
      } else if (name === 'analyze_image') {
        // Image analysis tool implementation would go here
        finalResponse += `I attempted to analyze the image, but this functionality is still in development.\n\n`;
      }
    }

    return finalResponse || 'I processed your request but couldn\'t generate a proper response. Please try again.';
  }

  /**
   * Get available models for the current provider
   * @returns {Promise<Array>} - List of available models
   */
  async getAvailableModels() {
    if (!this.aiService) {
      throw new Error('Chat service not initialized');
    }
    return this.aiService.getAvailableModels();
  }

  /**
   * Get a list of all supported providers
   * @returns {Array} - List of supported providers
   */
  getSupportedProviders() {
    return AIServiceFactory.getSupportedProviders();
  }

  /**
   * Send a message to the AI service
   * @param {string} text - The message text
   * @param {Object} options - Additional options like files, images
   * @returns {Promise<Object>} - Object containing the AI response and audio URL
   */
  async sendMessage(text, options = {}) {
    if (!this.aiService) {
      throw new Error('Chat service not initialized');
    }

    try {
      // Store the input type for this message
      this.inputType = options.inputType || 'text';

      // Check if the message contains a search request
      const searchRequest = this.detectSearchRequest(text);
      let searchResults = null;

      // If web search is enabled and a search request is detected, perform the search directly
      if (this.useWebSearch && searchRequest) {
        try {
          console.log('Detected search request:', searchRequest.query);

          if (!this.searchService.isConfigured()) {
            console.error('Brave Search API key is not configured properly');
            throw new Error('Search functionality is not available. Please check your Brave Search API key.');
          }

          searchResults = await this.searchService.searchAndFormat(searchRequest.query);
          console.log('Search results:', searchResults);
        } catch (searchError) {
          console.error('Web search error:', searchError);
          throw searchError; // Propagate the error to show it to the user
        }
      }

      // Prepare tool configuration if web search is enabled
      let toolConfig = null;
      if (this.useWebSearch) {
        toolConfig = {
          tools: this.tools,
          tool_choice: searchRequest ? "forced" : "auto"
        };
      }

      // If we already have search results, add them to the message
      if (searchResults) {
        // Add search results to the message for the AI to use
        const enhancedText = `${text}\n\nHere are some search results that might help:\n${searchResults}`;
        const enhancedResponse = await this.aiService.streamMessage(enhancedText, options, this.onProgress);

        // Format the response to include the search results section
        if (typeof enhancedResponse === 'string') {
          return {
            text: `I searched for "${searchRequest.query}" and found the following information:\n\n${searchResults}\n\n${enhancedResponse}`,
            audio: null
          };
        }
        return {
          text: enhancedResponse,
          audio: null
        };
      }

      // Add tool configuration to options if available
      if (toolConfig) {
        options.tools = toolConfig;
      }

      // Send the message to the AI service
      console.log('Sending message to AI service with options:', options);
      const response = await this.aiService.streamMessage(text, options, this.onProgress);

      // Handle tool calls if present in the response
      let finalResponse = response;
      if (response && response.tool_calls && response.tool_calls.length > 0) {
        console.log('Tool calls detected:', response.tool_calls);
        finalResponse = await this.handleToolCalls(response.tool_calls, text, options);
      } else if (typeof response === 'object' && response.content) {
        finalResponse = response.content;
      }

      // Generate audio only if input was voice
      let audioUrl = null;
      if (this.elevenLabsKey && response && this.inputType === 'voice') {
        audioUrl = await this.textToSpeech(response);
      }

      return {
        text: finalResponse,
        audio: audioUrl
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  /**
   * Process voice input and get AI response
   * @param {string} transcribedText - The transcribed text from voice input
   * @returns {Promise<Object>} - Object with transcribed text, AI response, and audio URL
   */
  async processVoiceInput(transcribedText) {
    try {
      const result = await this.sendMessage(transcribedText, { inputType: 'voice' });

      return {
        text: transcribedText,
        response: result.text,
        audio: result.audio
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   * @param {string} text - The text to convert to speech
   * @returns {Promise<string>} - URL to the audio blob
   */
  async textToSpeech(text) {
    if (!this.elevenLabsKey) return null;

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenLabsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs API error:', error);
      return null;
    }
  }
}

export default ChatService;
