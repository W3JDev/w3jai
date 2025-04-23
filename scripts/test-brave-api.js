/**
 * Test script for Brave Search API
 * Run with: node scripts/test-brave-api.js YOUR_API_KEY "your search query"
 */

import https from 'https';
import { URL } from 'url';

// Get API key and query from command line arguments
const apiKey = process.argv[2];
const query = process.argv[3] || 'test query';

if (!apiKey) {
  console.error('Please provide a Brave Search API key as the first argument');
  process.exit(1);
}

console.log(`Testing Brave Search API with query: "${query}"`);

// Create the URL with query parameters
const url = new URL('https://api.search.brave.com/res/v1/web/search');
url.searchParams.append('q', query);
url.searchParams.append('count', 5);

// Set up the request options
const options = {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'X-Subscription-Token': apiKey,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

console.log('Request URL:', url.toString());
console.log('Request headers:', options.headers);

// Make the request
const req = https.request(url, options, (res) => {
  let data = '';

  // Log the status code
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  // Collect the response data
  res.on('data', (chunk) => {
    data += chunk;
  });

  // Process the complete response
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const jsonData = JSON.parse(data);
        console.log('Response data:');
        console.log(JSON.stringify(jsonData, null, 2));

        // Check if we have search results
        const results = jsonData.web?.results || [];
        console.log(`\nFound ${results.length} results`);

        results.forEach((item, index) => {
          console.log(`\nResult ${index + 1}:`);
          console.log(`Title: ${item.title}`);
          console.log(`URL: ${item.url}`);
          console.log(`Description: ${item.description}`);
        });

        console.log('\nBrave Search API test completed successfully!');
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.log('Raw response:', data);
      }
    } else {
      console.error('Error response:', data);
    }
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('Request error:', error);
});

// End the request
req.end();
