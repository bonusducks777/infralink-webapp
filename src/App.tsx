import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { ThemeProvider } from '@/hooks/useTheme';
import { createConfig, http } from 'wagmi';

// Hedera Testnet configuration
const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
} as const;

// Flow EVM Mainnet configuration
const flowMainnet = {
  id: 747,
  name: 'Flow EVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Flow EVM Block Explorer', url: 'https://evm.flowscan.io' },
  },
  testnet: false,
} as const;

// Flow EVM Testnet configuration
const flowTestnet = {
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Flow EVM Testnet Block Explorer', url: 'https://evm-testnet.flowscan.io' },
  },
  testnet: true,
} as const;

// Zircuit Mainnet configuration
const zircuitMainnet = {
  id: 48900,
  name: 'Zircuit Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://zircuit1-mainnet.p2pify.com'],
    },
    public: {
      http: ['https://zircuit1-mainnet.p2pify.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Zircuit Explorer', url: 'https://explorer.zircuit.com' },
  },
  testnet: false,
} as const;

import Index from "./pages/Index";
import DeviceOwner from "./pages/DeviceOwner";
import UserProfilePage from "./pages/UserProfilePage";
import ContractDeployer from "./pages/ContractDeployer";
import NotFound from "./pages/NotFound";

const config = createConfig({
  chains: [hederaTestnet, flowMainnet, flowTestnet, zircuitMainnet, sepolia, mainnet, polygon, optimism, arbitrum, base],
  transports: {
    [hederaTestnet.id]: http('https://testnet.hashio.io/api'),
    [flowMainnet.id]: http('https://mainnet.evm.nodes.onflow.org'),
    [flowTestnet.id]: http('https://testnet.evm.nodes.onflow.org'),
    [zircuitMainnet.id]: http('https://zircuit1-mainnet.p2pify.com'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#069478',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
          noPromptOnSignature: true,
        },
        loginMethods: ['email', 'sms', 'wallet', 'google', 'apple'],
        defaultChain: hederaTestnet,
        supportedChains: [hederaTestnet, flowMainnet, flowTestnet, zircuitMainnet, sepolia, mainnet, polygon, optimism, arbitrum, base],
      }}
    >
      <WagmiProvider config={config}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/device-owner" element={<DeviceOwner />} />
                <Route path="/contract-deployer" element={<ContractDeployer />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </WagmiProvider>
    </PrivyProvider>
  </QueryClientProvider>
);

export default App;
