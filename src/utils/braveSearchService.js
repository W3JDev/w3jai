/**
 * Brave Search Service for AI tool use
 */
class BraveSearchService {
  constructor(apiKey = null) {
    this.braveApiKey = apiKey;
    // Direct endpoint for server-side calls
    this.directEndpoint = 'https://api.search.brave.com/res/v1/web/search';
    // Use a proxy endpoint to avoid CORS issues in browser
    this.endpoint = '/api/brave-search';
    this.useProxy = typeof window !== 'undefined'; // Use proxy in browser, direct in Node.js
  }

  /**
   * Initialize the Brave search service
   * @param {Object} config - Configuration with API key
   */
  initialize(config) {
    if (config.braveApiKey) {
      this.braveApiKey = config.braveApiKey;
    }
    return this.isConfigured();
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - True if API key is set
   */
  isConfigured() {
    return !!this.braveApiKey;
  }

  /**
   * Search the web using Brave Search API
   * @param {string} query - The search query
   * @param {number} count - Number of results to return (default: 5)
   * @returns {Promise<Array>} - Array of search results
   */
  async search(query, count = 5) {
    if (!this.isConfigured()) {
      throw new Error('Brave Search API key is not configured');
    }

    try {
      console.log(`Searching Brave for: "${query}" with API key: ${this.braveApiKey.substring(0, 5)}...`);

      // Determine which endpoint to use
      const baseUrl = this.useProxy ? new URL(this.endpoint, window.location.origin) : new URL(this.directEndpoint);

      // Add required parameters
      baseUrl.searchParams.append('q', query);
      baseUrl.searchParams.append('count', count);
      // Add additional parameters required by the API
      baseUrl.searchParams.append('search_lang', 'en');
      baseUrl.searchParams.append('safesearch', 'moderate');

      console.log('Fetching from URL:', baseUrl.toString());

      const headers = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': this.braveApiKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      console.log('Request headers:', JSON.stringify(headers, null, 2));

      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Brave Search API error response:', errorText);
        throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Brave Search API raw response:', data);

      // Log the full response for debugging
      console.log('Brave Search API raw response:', JSON.stringify(data, null, 2));

      // Extract and format the results
      const results = data.web?.results || [];
      console.log(`Found ${results.length} results from Brave Search API`);

      if (results.length === 0) {
        console.warn('No results found from Brave Search API');
      }

      return results.map(item => ({
        title: item.title || 'No title',
        link: item.url || item.link || '#',
        snippet: item.description || 'No description available',
        source: 'Brave Search'
      }));
    } catch (error) {
      console.error('Brave Search API error:', error);
      throw error; // Don't fall back to simulated search, propagate the error
    }
  }

  /**
   * Simulate a web search when API keys are not available
   * @param {string} query - The search query
   * @param {number} count - Number of results to return
   * @returns {Array} - Array of simulated search results
   */
  simulateSearch(query, count = 5) {
    console.warn('Using simulated search results. For real results, configure Brave Search API key.');

    // Create a deterministic but varied set of results based on the query
    const results = [];
    const queryWords = query.toLowerCase().split(' ');

    // Generate some fake domains and titles based on the query
    const domains = [
      'wikipedia.org', 'example.com', 'informative-site.net',
      'knowledge-base.org', 'research-papers.edu'
    ];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const domainIndex = (queryWords.length + i) % domains.length;
      const domain = domains[domainIndex];

      // Create a result with some variation
      results.push({
        title: `Information about ${queryWords.join(' ')} - Result ${i + 1}`,
        link: `https://www.${domain}/search?q=${queryWords.join('+')}`,
        snippet: `This is a simulated search result about ${queryWords.join(' ')}. ` +
                `It contains information that might be relevant to your query. ` +
                `Note that this is not real web data but a placeholder.`,
        source: 'Simulated Search'
      });
    }

    return results;
  }

  /**
   * Format search results as markdown
   * @param {Array} results - Array of search results
   * @returns {string} - Markdown formatted results
   */
  formatResultsAsMarkdown(results) {
    if (!results || results.length === 0) {
      return "No search results found.";
    }

    let markdown = "### Search Results\n\n";

    results.forEach((result, index) => {
      // Clean up the title to remove any problematic characters
      const cleanTitle = result.title.replace(/\*/g, '').replace(/\[|\]/g, '').trim();

      // Format the link properly
      markdown += `${index + 1}. [${cleanTitle}](${result.link})\n`;
      markdown += `${result.snippet || 'No description available.'}\n\n`;
    });

    markdown += "*Results provided by Brave Search*";

    return markdown;
  }

  /**
   * Search the web and return formatted results
   * @param {string} query - The search query
   * @param {number} count - Number of results to return
   * @returns {Promise<string>} - Markdown formatted search results
   */
  async searchAndFormat(query, count = 5) {
    const results = await this.search(query, count);
    return this.formatResultsAsMarkdown(results);
  }
}

export default BraveSearchService;
