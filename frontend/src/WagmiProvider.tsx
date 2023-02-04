import { goerli, hardhat } from '@wagmi/chains';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

export default function WagmiProvider({ children }: { children: JSX.Element }) {
  const { chains, provider, webSocketProvider } = configureChains(
    [hardhat, goerli],
    [
      alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_KEY_GOERLI }),
      publicProvider(),
    ]
  );

  const client = createClient({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    provider,
    webSocketProvider,
  });

  return <WagmiConfig client={client}>{children}</WagmiConfig>;
}
