import axios from 'axios';
import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Check for API key at module import time
const DEBANK_API_KEY = process.env.DEBANK_API_KEY;
if (!DEBANK_API_KEY) {
  console.error("Error: DEBANK_API_KEY environment variable is required");
  process.exit(1);
}

// Base API URL
const BASE_URL = 'https://pro-openapi.debank.com/v1';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function to implement retry logic with exponential backoff
async function fetchWithRetry(url: string, config: any, retries = 0): Promise<any> {
  try {
    return await axios.get(url, config);
  } catch (error: any) {
    // If maximum retries reached or not a connection issue, throw the error
    if (retries >= MAX_RETRIES || 
        (error.response && error.response.status !== 429 && error.response.status < 500)) {
      throw error;
    }
    
    // Calculate delay with exponential backoff
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
    console.log(`Retrying request after ${delay}ms (attempt ${retries + 1}/${MAX_RETRIES})...`);
    
    // Wait for the calculated delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry the request
    return fetchWithRetry(url, config, retries + 1);
  }
}

// Tool 1: Token Balances Tool
export const DEBANK_TOKEN_BALANCES_TOOL: Tool = {
  name: "debank_token_balances",
  description: "Retrieves a list of tokens owned by a wallet address with their balances",
  inputSchema: {
    type: "object",
    properties: {
      wallet_address: {
        type: "string",
        description: "The wallet address to fetch token balances for"
      },
      chain_id: {
        type: "string",
        description: "The blockchain ID (e.g., 'eth' for Ethereum)",
        default: "eth"
      }
    },
    required: ["wallet_address"]
  }
};

/**
 * Fetches token balances for a specified wallet address
 * 
 * @param {string} wallet_address - The wallet address to fetch token balances for
 * @param {string} chain_id - The blockchain ID (default: "eth")
 * @returns {Promise<object>} The token balances data
 */
export async function fetchTokenBalances(
  wallet_address: string,
  chain_id: string = "eth"
): Promise<any> {
  try {
    const url = `${BASE_URL}/user/token_list`;
    const config = {
      headers: {
        'AccessKey': DEBANK_API_KEY
      },
      params: {
        id: wallet_address,
        chain_id: chain_id,
        is_all: true
      }
    };

    const response = await fetchWithRetry(url, config);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching token balances:', error);
    return {
      error: true,
      message: 'Failed to fetch token balances',
      details: error.response?.data || error.message || String(error)
    };
  }
}

/**
 * Function to execute the DeBank Token Balances tool
 * 
 * @param {object} params - Parameters for the tool
 * @returns {Promise<object>} The token balances data
 */
export async function executeDeBankTokenBalancesTool(
  params: { wallet_address: string; chain_id?: string }
): Promise<any> {
  return await fetchTokenBalances(
    params.wallet_address,
    params.chain_id || "eth"
  );
}

// Tool 2: Transaction History Tool
export const DEBANK_TRANSACTION_HISTORY_TOOL: Tool = {
  name: "debank_transaction_history",
  description: "Retrieves transaction history for a wallet address with metadata including categories, exchanges, projects, and token details",
  inputSchema: {
    type: "object",
    properties: {
      wallet_address: {
        type: "string",
        description: "The wallet address to fetch transaction history for"
      },
      chain_id: {
        type: "string",
        description: "The blockchain ID (e.g., 'eth' for Ethereum)",
        default: "eth"
      },
      page_count: {
        type: "integer",
        description: "Number of transactions per page (max 20)",
        default: 20
      },
      start_time: {
        type: "integer",
        description: "Optional timestamp for pagination"
      },
      token_id: {
        type: "string",
        description: "Optional specific token to filter by"
      }
    },
    required: ["wallet_address"]
  }
};

/**
 * Fetches transaction history for a specified wallet address
 * 
 * @param {string} wallet_address - The wallet address to fetch transaction history for
 * @param {string} chain_id - The blockchain ID (default: "eth")
 * @param {number} page_count - Number of transactions per page (default: 20, max: 20)
 * @param {number} start_time - Optional timestamp for pagination
 * @param {string} token_id - Optional specific token to filter by
 * @returns {Promise<object>} The transaction history data
 */
export async function fetchTransactionHistory(
  wallet_address: string,
  chain_id: string = "eth",
  page_count: number = 20,
  start_time?: number,
  token_id?: string
): Promise<any> {
  try {
    // Ensure page_count is within limits
    if (page_count > 20) {
      page_count = 20;
    }

    const url = `${BASE_URL}/user/history_list`;
    const params: any = {
      id: wallet_address,
      chain_id: chain_id,
      page_count: page_count
    };

    // Add optional parameters if provided
    if (start_time) {
      params.start_time = start_time;
    }
    if (token_id) {
      params.token_id = token_id;
    }

    const config = {
      headers: {
        'AccessKey': DEBANK_API_KEY
      },
      params: params
    };

    const response = await fetchWithRetry(url, config);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching transaction history:', error);
    return {
      error: true,
      message: 'Failed to fetch transaction history',
      details: error.response?.data || error.message || String(error)
    };
  }
}

/**
 * Function to execute the DeBank Transaction History tool
 * 
 * @param {object} params - Parameters for the tool
 * @returns {Promise<object>} The transaction history data
 */
export async function executeDeBankTransactionHistoryTool(
  params: { 
    wallet_address: string; 
    chain_id?: string;
    page_count?: number;
    start_time?: number;
    token_id?: string;
  }
): Promise<any> {
  return await fetchTransactionHistory(
    params.wallet_address,
    params.chain_id || "eth",
    params.page_count || 20,
    params.start_time,
    params.token_id
  );
}

// Tool 3: NFT List Tool
export const DEBANK_NFT_LIST_TOOL: Tool = {
  name: "debank_nft_list",
  description: "Retrieves a list of NFTs owned by a wallet address",
  inputSchema: {
    type: "object",
    properties: {
      wallet_address: {
        type: "string",
        description: "The wallet address to fetch NFTs for"
      },
      chain_id: {
        type: "string",
        description: "The blockchain ID (e.g., 'eth' for Ethereum)",
        default: "eth"
      }
    },
    required: ["wallet_address"]
  }
};

/**
 * Fetches NFT list for a specified wallet address
 * 
 * @param {string} wallet_address - The wallet address to fetch NFTs for
 * @param {string} chain_id - The blockchain ID (default: "eth")
 * @returns {Promise<object>} The NFT list data
 */
export async function fetchNFTList(
  wallet_address: string,
  chain_id: string = "eth"
): Promise<any> {
  try {
    const url = `${BASE_URL}/user/nft_list`;
    const config = {
      headers: {
        'AccessKey': DEBANK_API_KEY
      },
      params: {
        id: wallet_address,
        chain_id: chain_id,
        is_all: true
      }
    };

    const response = await fetchWithRetry(url, config);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching NFT list:', error);
    return {
      error: true,
      message: 'Failed to fetch NFT list',
      details: error.response?.data || error.message || String(error)
    };
  }
}

/**
 * Function to execute the DeBank NFT List tool
 * 
 * @param {object} params - Parameters for the tool
 * @returns {Promise<object>} The NFT list data
 */
export async function executeDeBankNFTListTool(
  params: { wallet_address: string; chain_id?: string }
): Promise<any> {
  return await fetchNFTList(
    params.wallet_address,
    params.chain_id || "eth"
  );
}

// Export all tools in a single object for easier importing
export const DEBANK_TOOLS = {
  DEBANK_TOKEN_BALANCES_TOOL,
  DEBANK_TRANSACTION_HISTORY_TOOL,
  DEBANK_NFT_LIST_TOOL
};
