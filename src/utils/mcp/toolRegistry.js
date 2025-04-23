/**
 * Tool Registry for MCP
 * Defines all available tools in a standardized format
 */
import BraveSearchService from '../braveSearchService';

// Initialize services
const braveSearchService = new BraveSearchService();

/**
 * Tool registry containing all available tools
 * Each tool has:
 * - description: A description of what the tool does
 * - parameters: The parameters the tool accepts
 * - handler: The function that executes the tool
 */
export const toolRegistry = {
  web_search: {
    name: "web_search",
    description: "Search the web for up-to-date information",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        },
        num_results: {
          type: "integer",
          description: "Number of results to return (default: 5)"
        }
      },
      required: ["query"]
    },
    handler: async ({ query, num_results = 5 }) => {
      try {
        console.log(`Executing web_search tool with query: "${query}"`);
        const results = await braveSearchService.searchAndFormat(query, num_results);
        return results;
      } catch (error) {
        console.error('Web search tool error:', error);
        throw error;
      }
    }
  },
  
  analyze_image: {
    name: "analyze_image",
    description: "Analyze an image and describe its contents",
    parameters: {
      type: "object",
      properties: {
        image_url: {
          type: "string",
          description: "URL or data URI of the image to analyze"
        },
        analysis_type: {
          type: "string",
          enum: ["general", "objects", "text", "faces"],
          description: "Type of analysis to perform"
        }
      },
      required: ["image_url"]
    },
    handler: async ({ image_url, analysis_type = "general" }) => {
      // This is a placeholder for actual image analysis
      console.log(`Analyzing image: ${image_url} with type: ${analysis_type}`);
      return `Image analysis is not yet implemented. Would analyze ${image_url} with type ${analysis_type}.`;
    }
  }
};

/**
 * Get all available tools
 * @returns {Array} - Array of tool definitions
 */
export const getAllTools = () => {
  return Object.values(toolRegistry);
};

/**
 * Get a tool by name
 * @param {string} name - The name of the tool
 * @returns {Object|null} - The tool definition or null if not found
 */
export const getToolByName = (name) => {
  return toolRegistry[name] || null;
};

/**
 * Execute a tool
 * @param {string} toolName - The name of the tool to execute
 * @param {Object} args - The arguments to pass to the tool
 * @returns {Promise<any>} - The result of the tool execution
 */
export const executeTool = async (toolName, args) => {
  const tool = getToolByName(toolName);
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  return await tool.handler(args);
};

export default {
  toolRegistry,
  getAllTools,
  getToolByName,
  executeTool
};
