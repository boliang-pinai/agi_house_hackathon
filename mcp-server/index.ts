#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CMC_GET_TOKEN_INFO_TOOL, executeCmcGetTokenInfoTool } from "./tools/cmc_token_info.js";
import { PERPLEXITY_ASK_TOOL, executePerplexityAskTool } from "./tools/perplexity_ask.js";
import { 
  DEBANK_TOKEN_BALANCES_TOOL, 
  DEBANK_TRANSACTION_HISTORY_TOOL, 
  DEBANK_NFT_LIST_TOOL,
  executeDeBankTokenBalancesTool,
  executeDeBankTransactionHistoryTool,
  executeDeBankNFTListTool
} from "./tools/debank_api.js";


// Initialize the server with tool metadata and capabilities
const server = new Server(
  {
    name: "example-servers/perplexity-ask",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Registers a handler for listing available tools.
 * When the client requests a list of tools, this handler returns all available Perplexity tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    PERPLEXITY_ASK_TOOL, 
    CMC_GET_TOKEN_INFO_TOOL,
    DEBANK_TOKEN_BALANCES_TOOL,
    DEBANK_TRANSACTION_HISTORY_TOOL,
    DEBANK_NFT_LIST_TOOL
  ],
}));

/**
 * Registers a handler for calling a specific tool.
 * Processes requests by validating input and invoking the appropriate tool.
 *
 * @param {object} request - The incoming tool call request.
 * @returns {Promise<object>} The response containing the tool's result or an error.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error("No arguments provided");
    }
    switch (name) {
      case "debank_token_balances": {
        // Check that wallet_address is provided and is a string
        if (!args.wallet_address || typeof args.wallet_address !== 'string') {
          throw new Error("Invalid arguments for debank_token_balances: 'wallet_address' must be provided as a string");
        }
        
        // Invoke the DeBank token balances function with the provided parameters
        const result = await executeDeBankTokenBalancesTool({
          wallet_address: args.wallet_address,
          chain_id: typeof args.chain_id === 'string' ? args.chain_id : undefined
        });
        
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }
      case "debank_transaction_history": {
        // Check that wallet_address is provided and is a string
        if (!args.wallet_address || typeof args.wallet_address !== 'string') {
          throw new Error("Invalid arguments for debank_transaction_history: 'wallet_address' must be provided as a string");
        }
        
        // Invoke the DeBank transaction history function with the provided parameters
        const result = await executeDeBankTransactionHistoryTool({
          wallet_address: args.wallet_address,
          chain_id: typeof args.chain_id === 'string' ? args.chain_id : undefined,
          page_count: typeof args.page_count === 'number' ? args.page_count : undefined,
          start_time: typeof args.start_time === 'number' ? args.start_time : undefined,
          token_id: typeof args.token_id === 'string' ? args.token_id : undefined
        });
        
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }
      case "debank_nft_list": {
        // Check that wallet_address is provided and is a string
        if (!args.wallet_address || typeof args.wallet_address !== 'string') {
          throw new Error("Invalid arguments for debank_nft_list: 'wallet_address' must be provided as a string");
        }
        
        // Invoke the DeBank NFT list function with the provided parameters
        const result = await executeDeBankNFTListTool({
          wallet_address: args.wallet_address,
          chain_id: typeof args.chain_id === 'string' ? args.chain_id : undefined
        });
        
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }
      case "perplexity_ask": {
        if (!Array.isArray(args.messages)) {
          throw new Error("Invalid arguments for perplexity_ask: 'messages' must be an array");
        }
        // Invoke the chat completion function with the provided messages
        const messages = args.messages;
        const result = await executePerplexityAskTool(messages, "sonar-pro");
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "cmc_get_token_info_tool": {
        // Check that at least one of symbol or slug is provided
        if ((!args.symbol && !args.slug && !args.identifier) || 
            (args.symbol && typeof args.symbol !== 'string') ||
            (args.slug && typeof args.slug !== 'string')) {
          throw new Error("Invalid arguments for cmc_get_token_info_tool: Either 'symbol' or 'slug' must be provided as a string");
        }
        
        // Invoke the cryptocurrency info function with the provided parameters
        const result = await executeCmcGetTokenInfoTool({
          symbol: typeof args.symbol === 'string' ? args.symbol : undefined,
          slug: typeof args.slug === 'string' ? args.slug : undefined
        });
        
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        };
      }
      default:
        // Respond with an error if an unknown tool is requested
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    // Return error details in the response
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Initializes and runs the server using standard I/O for communication.
 * Logs an error and exits if the server fails to start.
 */
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio with Perplexity Ask, Cryptocurrency Info, and DeBank API tools");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

// Start the server and catch any startup errors
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});