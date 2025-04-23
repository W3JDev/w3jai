/**
 * Web Search Service for AI tool use
 */
class WebSearchService {
  constructor(apiKey = null) {
    this.googleApiKey = apiKey;
    this.googleCseId = null; // Custom Search Engine ID
  }

  /**
   * Initialize the web search service
   * @param {Object} config - Configuration with API keys
   */
  initialize(config) {
    if (config.googleApiKey) {
      this.googleApiKey = config.googleApiKey;
    }
    if (config.googleCseId) {
      this.googleCseId = config.googleCseId;
    }
    return this.isConfigured();
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - True if API keys are set
   */
  isConfigured() {
    return !!this.googleApiKey && !!this.googleCseId;
  }

  /**
   * Search the web using Google Custom Search API
   * @param {string} query - The search query
   * @param {number} numResults - Number of results to return (default: 5)
   * @returns {Promise<Array>} - Array of search results
   */
  async searchGoogle(query, numResults = 5) {
    if (!this.isConfigured()) {
      // Fallback to a simulated search if not configured
      return this.simulateSearch(query, numResults);
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleCseId}&q=${encodeURIComponent(query)}&num=${numResults}`
      );

      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: 'Google'
      }));
    } catch (error) {
      console.error('Google Search API error:', error);
      // Fallback to simulated search
      return this.simulateSearch(query, numResults);
    }
  }

  /**
   * Simulate a web search when API keys are not available
   * @param {string} query - The search query
   * @param {number} numResults - Number of results to return
   * @returns {Array} - Array of simulated search results
   */
  simulateSearch(query, numResults = 5) {
    console.warn('Using simulated search results. For real results, configure Google API keys.');
    
    // Create a deterministic but varied set of results based on the query
    const results = [];
    const queryWords = query.toLowerCase().split(' ');
    
    // Generate some fake domains and titles based on the query
    const domains = [
      'wikipedia.org', 'example.com', 'informative-site.net', 
      'knowledge-base.org', 'research-papers.edu'
    ];
    
    for (let i = 0; i < Math.min(numResults, 10); i++) {
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
      markdown += `**${index + 1}. [${result.title}](${result.link})**\n`;
      markdown += `${result.snippet}\n\n`;
    });
    
    markdown += "*Note: Search results may not be completely accurate or up-to-date.*";
    
    return markdown;
  }

  /**
   * Search the web and return formatted results
   * @param {string} query - The search query
   * @param {number} numResults - Number of results to return
   * @returns {Promise<string>} - Markdown formatted search results
   */
  async search(query, numResults = 5) {
    const results = await this.searchGoogle(query, numResults);
    return this.formatResultsAsMarkdown(results);
  }
}

export default WebSearchService;
