// Test script for Brave Search API
const testBraveSearch = async (apiKey, query = "latest news") => {
  try {
    const endpoint = 'https://api.search.brave.com/res/v1/web/search';
    const url = new URL(endpoint);
    url.searchParams.append('q', query);
    url.searchParams.append('count', 5);
    
    console.log(`Testing Brave Search API with query: "${query}"`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Brave Search API response:', JSON.stringify(data, null, 2));
    
    // Extract and format the results
    const results = data.web?.results || [];
    console.log(`Found ${results.length} results`);
    
    results.forEach((item, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`Title: ${item.title}`);
      console.log(`URL: ${item.url}`);
      console.log(`Description: ${item.description}`);
    });
    
    return {
      success: true,
      results: results
    };
  } catch (error) {
    console.error('Brave Search API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export the function
module.exports = testBraveSearch;

// If running directly
if (require.main === module) {
  const apiKey = process.argv[2];
  const query = process.argv[3] || "latest news";
  
  if (!apiKey) {
    console.error('Please provide a Brave Search API key as the first argument');
    process.exit(1);
  }
  
  testBraveSearch(apiKey, query)
    .then(result => {
      if (result.success) {
        console.log('\nBrave Search API test completed successfully!');
      } else {
        console.error('\nBrave Search API test failed:', result.error);
        process.exit(1);
      }
    });
}
