import { InjectedConnector } from '@web3-react/injected-connector';
import { BscConnector } from '@binance-chain/bsc-connector';

// Binance Smart Chain Mainnet and Testnet
export const injected = new InjectedConnector({
  supportedChainIds: [56, 97], // 56 is BSC Mainnet, 97 is BSC Testnet
});

export const bscConnector = new BscConnector({
  supportedChainIds: [56, 97],
});

// Network parameters for adding BSC to MetaMask
export const BSC_MAINNET_PARAMS = {
  chainId: '0x38', // 56 in hexadecimal
  chainName: 'Binance Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'bnb',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

export const BSC_TESTNET_PARAMS = {
  chainId: '0x61', // 97 in hexadecimal
  chainName: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'bnb',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};
