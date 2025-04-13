import { connectorsForWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { bsc, mainnet } from 'wagmi/chains';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import binanceWallet from '@binance/w3w-rainbow-connector';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [bsc, mainnet],
  [publicProvider()]
);

const walletList = [
  {
    appName: 'PinBN',
    projectId: '2493460c5cb6e773939939f081379148',
    groupName: 'Binance Wallet',
    wallets: [
      injectedWallet({ chains }),
      binanceWallet({ chains }),
    ],
  },
];

const connectors = connectorsForWallets(walletList);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export default function RainbowProvider({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains} 
        theme={darkTheme({
          accentColor: '#F0B90B', 
          accentColorForeground: 'black',
          borderRadius: 'medium',
        })}
        coolMode
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 