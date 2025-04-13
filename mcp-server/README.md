# PIN AI MCP Server

An MCP server implementation that integrates multiple cryptocurrency and web search APIs to provide Claude with powerful crypto research and web search capabilities.


## Tools

- **perplexity_ask**
  - Engage in a conversation with the Sonar API for live web searches.
  - **Inputs:**
    - `messages` (array): An array of conversation messages.
      - Each message must include:
        - `role` (string): The role of the message (e.g., `system`, `user`, `assistant`).
        - `content` (string): The content of the message.

- **cmc_get_token_info_tool**
  - Retrieve detailed information about cryptocurrencies from CoinMarketCap.
  - **Inputs:**
    - `symbol` (string, optional): The ticker symbol of the cryptocurrency (e.g., 'BTC').
    - `slug` (string, optional): The slug name of the cryptocurrency (e.g., 'bitcoin').
    - At least one of `symbol` or `slug` must be provided.

- **debank_token_balances**
  - Get token balances for a specific wallet address.
  - **Inputs:**
    - `wallet_address` (string, required): The blockchain wallet address.
    - `chain_id` (string, optional): Specific blockchain network ID.

- **debank_transaction_history**
  - Retrieve transaction history for a wallet address.
  - **Inputs:**
    - `wallet_address` (string, required): The blockchain wallet address.
    - `chain_id` (string, optional): Specific blockchain network ID.
    - `page_count` (number, optional): Number of transactions to return.
    - `start_time` (number, optional): Starting timestamp for transactions.
    - `token_id` (string, optional): Filter by specific token ID.

- **debank_nft_list**
  - Get a list of NFTs owned by a wallet address.
  - **Inputs:**
    - `wallet_address` (string, required): The blockchain wallet address.
    - `chain_id` (string, optional): Specific blockchain network ID.

## Configuration

### Step 1: 

Clone this repository:

```bash
git clone git@github.com:PIN-AI/modelcontextprotocol-hackathon.git
```

Navigate to the `pin_ai` directory and install the necessary dependencies:

```bash
cd modelcontextprotocol-hackathon/pin_ai && npm install
```

### Step 2: Get Required API Keys

1. **Perplexity API Key**:
   - Sign up for a [Sonar API account](https://docs.perplexity.ai/guides/getting-started).
   - Follow the account setup instructions and generate your API key from the developer dashboard.
   - Set the API key in your environment as `PERPLEXITY_API_KEY`.

2. **DeBank API Key** (Optional, for crypto wallet tools):
   - Sign up for a [DeBank API account](https://cloud.debank.com/).
   - Generate your API key from the dashboard.
   - Set the API key in your environment as `DEBANK_API_KEY`.

### Step 3: Configure Claude Desktop

1. Download Claude desktop [here](https://claude.ai/download). 

2. Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pin-ai": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "PERPLEXITY_API_KEY",
        "-e",
        "DEBANK_API_KEY",
        "mcp/pin-ai"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
        "DEBANK_API_KEY": "YOUR_DEBANK_API_KEY_HERE"
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "pin-ai": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-pin-ai"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
        "DEBANK_API_KEY": "YOUR_DEBANK_API_KEY_HERE"
      }
    }
  }
}
```

You can access the file using:

```bash
vim ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Step 4: Build the Docker Image

Docker build:

```bash
docker build -t mcp/pin-ai:latest -f pin_ai/Dockerfile .
```

### Step 5: Testing

Let's make sure Claude for Desktop is picking up the tools we've exposed in our `pin-ai` server. You can do this by looking for the hammer icon in the Claude desktop app.

After clicking on the hammer icon, you should see the tools that come with the PIN AI MCP Server. If the tools appear in the list, the integration is active. 

Congratulations! This means Claude can now:
- Search the web using Perplexity's Sonar API
- Get cryptocurrency information from CoinMarketCap
- Retrieve wallet balances, transaction history, and NFT information using DeBank API

### Step 6: Advanced parameters

You can modify API parameters in the respective tool implementation files:

- For Perplexity search parameters: `tools/perplexity_ask.ts` - [Perplexity API documentation](https://docs.perplexity.ai/api-reference/chat-completions)
- For DeBank API parameters: `tools/debank_api.ts` - [DeBank API documentation](https://cloud.debank.com/docs/api/)
- For CoinMarketCap parameters: `tools/cmc_token_info.ts` - [CoinMarketCap API documentation](https://coinmarketcap.com/api/documentation/v1/)

### Troubleshooting 

The Claude documentation provides an excellent [troubleshooting guide](https://modelcontextprotocol.io/docs/tools/debugging) you can refer to. For specific API issues, consult the respective API documentation.


## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

## Disclaimer

This tool provides access to third-party APIs (Perplexity, DeBank, CoinMarketCap). Usage of these APIs is subject to their respective terms of service. This tool is not affiliated with or endorsed by these services. Cryptocurrency information provided should not be considered financial advice.

