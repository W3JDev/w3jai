import BraveSearchService from './braveSearchService';

/**
 * Test the Brave Search integration
 * @param {string} apiKey - Brave Search API key
 * @param {string} query - Search query
 * @returns {Promise<Object>} - Test results
 */
const testBraveSearchIntegration = async (apiKey, query = "latest news about MCP") => {
  console.log(`Testing Brave Search integration with query: "${query}"`);
  
  try {
    // Initialize the search service
    const searchService = new BraveSearchService();
    searchService.initialize({ braveApiKey: apiKey });
    
    if (!searchService.isConfigured()) {
      throw new Error('Brave Search service is not properly configured');
    }
    
    console.log('Brave Search service initialized successfully');
    
    // Perform the search
    console.log('Performing search...');
    const results = await searchService.search(query);
    console.log(`Found ${results.length} results`);
    
    // Format the results as markdown
    console.log('Formatting results as markdown...');
    const markdown = searchService.formatResultsAsMarkdown(results);
    console.log('Markdown formatted results:');
    console.log(markdown);
    
    return {
      success: true,
      results,
      markdown
    };
  } catch (error) {
    console.error('Brave Search integration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default testBraveSearchIntegration;
