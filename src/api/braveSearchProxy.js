/**
 * Brave Search API Proxy
 * This proxy helps avoid CORS issues when calling the Brave Search API directly from the browser
 */

/**
 * Handle Brave Search API requests
 * @param {Request} req - The request object
 * @returns {Promise<Response>} - The response from the Brave Search API
 */
export async function handleBraveSearchRequest(req) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const count = url.searchParams.get('count') || 5;
    const apiKey = req.headers.get('X-Subscription-Token');

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Brave Search API key is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Proxying Brave Search request for query: "${query}"`);

    // Call the Brave Search API
    const braveUrl = new URL('https://api.search.brave.com/res/v1/web/search');
    braveUrl.searchParams.append('q', query);
    braveUrl.searchParams.append('count', count);

    const response = await fetch(braveUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    // Get the response data
    const data = await response.json();

    // Return the response
    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Brave Search proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch from Brave Search API',
        details: error.message
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
