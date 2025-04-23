/**
 * Tool definitions for AI models
 * These definitions are used to instruct AI models on available tools
 */

// Import the tool registry from MCP
import { getAllTools as getMCPTools, getToolByName as getMCPToolByName } from './mcp/toolRegistry';

// Web search tool definition
const webSearchTool = {
  type: "function",
  function: {
    name: "web_search",
    description: "Search the web for current information",
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
    }
  }
};

// Image analysis tool definition
const imageAnalysisTool = {
  type: "function",
  function: {
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
    }
  }
};

// Get all available tools
const getAllTools = () => {
  // Use the MCP tool registry
  return getMCPTools().map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
};

// Get tool by name
const getToolByName = (name) => {
  // Use the MCP tool registry
  const tool = getMCPToolByName(name);
  if (tool) {
    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    };
  }
  return null;
};

export {
  getAllTools,
  getToolByName,
  webSearchTool,
  imageAnalysisTool
};
