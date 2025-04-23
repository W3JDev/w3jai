/**
 * Direct Brave Search API call (for testing only)
 * This bypasses the proxy and calls the Brave Search API directly
 * Note: This will likely fail in the browser due to CORS issues
 */

/**
 * Test the Brave Search API directly
 * @param {string} apiKey - Brave Search API key
 * @param {string} query - Search query
 * @returns {Promise<Object>} - Search results
 */
async function testDirectBraveSearch(apiKey, query = "test") {
  try {
    console.log(`Testing direct Brave Search API with query: "${query}"`);
    
    const endpoint = 'https://api.search.brave.com/res/v1/web/search';
    const url = new URL(endpoint);
    url.searchParams.append('q', query);
    url.searchParams.append('count', 5);
    
    console.log('Fetching from URL:', url.toString());
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brave Search API error response:', errorText);
      throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Brave Search API raw response:', data);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Direct Brave Search API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default testDirectBraveSearch;
