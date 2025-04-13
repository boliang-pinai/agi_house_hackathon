import { Tool } from '@modelcontextprotocol/sdk/types';
import axios from 'axios';

// Tool JSON schema definition
export const CMC_GET_TOKEN_INFO_TOOL: Tool = {
  name: "cmc_get_token_info_tool",
  description: "Retrieves basic information and real-time market data for a cryptocurrency",
  inputSchema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description: "The symbol of the cryptocurrency (e.g., 'BTC'). Takes priority over slug if both are provided."
      },
      slug: {
        type: "string",
        description: "The slug of the cryptocurrency (e.g., 'bitcoin'). Used if symbol is not provided."
      }
    },
    required: []
  }
};

// Main function to fetch cryptocurrency information
export async function fetchCryptoInfo(params: { symbol?: string; slug?: string }) {
  try {
    // Determine which parameter to use (prioritize symbol over slug)
    const queryParams: { symbol?: string; slug?: string } = {};
    if (params.symbol) {
      queryParams.symbol = params.symbol;
    } else if (params.slug) {
      queryParams.slug = params.slug;
    } else {
      throw new Error('Either symbol or slug must be provided');
    }
    
    // Fetch basic information
    const basicInfoResponse = await axios.get('https://cmc-api-five.vercel.app/api/crypto/info', {
      params: queryParams
    });
    
    // Fetch real-time market data
    const marketDataResponse = await axios.get('https://cmc-api-five.vercel.app/api/crypto/quotes', {
      params: queryParams
    });

    // Process and combine the data
    const processedData = processApiResponses(basicInfoResponse.data, marketDataResponse.data);
    return processedData;
  } catch (error: unknown) {
    console.error('Error fetching cryptocurrency data:', error);
    return {
      error: true,
      message: 'Failed to fetch cryptocurrency data',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Define interfaces for API response structures
interface ApiResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: Record<string, any[]>;
}

interface CryptoInfo {
  id?: number;
  name?: string;
  symbol?: string;
  slug?: string;
  description?: string;
  logo?: string;
  category?: string;
  date_added?: string;
  website?: string | null;
  explorer?: string | null;
  price_usd?: number | null;
  market_cap?: number | null;
  volume_24h?: number | null;
  percent_change_24h?: number | null;
  percent_change_7d?: number | null;
  circulating_supply?: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  cmc_rank?: number | null;
  last_updated?: string | null;
  error?: boolean;
  message?: string;
}

// Process API responses to extract the most important information
function processApiResponses(basicInfoData: ApiResponse, marketDataData: ApiResponse): CryptoInfo {
  // Check if data exists and has the expected structure
  if (!basicInfoData?.data || !marketDataData?.data) {
    return { error: true, message: 'Invalid data structure in API response' } as CryptoInfo;
  }

  // Get the first entry from the data (assuming the identifier maps to one or more cryptocurrencies)
  const cryptoSymbol = Object.keys(basicInfoData.data)[0];
  if (!cryptoSymbol || !basicInfoData.data[cryptoSymbol] || !basicInfoData.data[cryptoSymbol][0]) {
    return { error: true, message: 'No cryptocurrency found with the given identifier' } as CryptoInfo;
  }

  // Extract basic information (first entry)
  const basicInfo = basicInfoData.data[cryptoSymbol][0];
  
  // Find corresponding market data
  const marketDataEntries = marketDataData.data[cryptoSymbol];
  const marketData = marketDataEntries?.find((entry: { id: number }) => entry.id === basicInfo.id);

  if (!marketData) {
    return {
      error: true,
      message: 'Market data not found for the cryptocurrency'
    } as CryptoInfo;
  }

  // Extract and return the top 10 important elements
  return {
    // Basic information
    id: basicInfo.id,
    name: basicInfo.name,
    symbol: basicInfo.symbol,
    slug: basicInfo.slug,
    description: basicInfo.description,
    logo: basicInfo.logo,
    category: basicInfo.category,
    date_added: basicInfo.date_added,
    website: basicInfo.urls?.website?.[0] || null,
    explorer: basicInfo.urls?.explorer?.[0] || null,
    
    // Market data
    price_usd: marketData.quote?.USD?.price || null,
    market_cap: marketData.quote?.USD?.market_cap || null,
    volume_24h: marketData.quote?.USD?.volume_24h || null,
    percent_change_24h: marketData.quote?.USD?.percent_change_24h || null,
    percent_change_7d: marketData.quote?.USD?.percent_change_7d || null,
    circulating_supply: marketData.circulating_supply || null,
    total_supply: marketData.total_supply || null,
    max_supply: marketData.max_supply || null,
    cmc_rank: marketData.cmc_rank || null,
    last_updated: marketData.last_updated || null
  };
}

// Function to execute the tool
export async function executeCmcGetTokenInfoTool(params: { identifier?: string; symbol?: string; slug?: string }) {
  // For backward compatibility, support the identifier parameter
  // and treat it as a symbol (priority) or slug
  if (params.identifier) {
    return await fetchCryptoInfo({ 
      symbol: params.identifier,
      slug: params.identifier
    });
  }
  
  return await fetchCryptoInfo({
    symbol: params.symbol,
    slug: params.slug
  });
}
