# InfraLink Web Application

React-based web interface for InfraLink - enabling decentralized hardware access through smart contracts.

## 🚀 Features

- **QR Code Scanner**: Scan device QR codes to connect instantly
- **Device Dashboard**: Real-time device status and payment interface
- **User Profile Management**: Create and manage your profile with the InfraLink Info contract
- **Whitelist Management**: Device owners can manage user whitelist through the web interface
- **Native Token Support**: Supports both ERC20 tokens and native ETH payments
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets via RainbowKit
- **Mobile-First Design**: Responsive design optimized for mobile devices

## 🛠️ Tech Stack

- **React 18** + **Vite** - Modern web framework with fast builds
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **RainbowKit** - Wallet connection with multiple wallet support
- **Wagmi** - Ethereum React hooks
- **Ethers.js** - Ethereum blockchain interaction
- **Lucide Icons** - Beautiful icon library

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── DeviceScanner.tsx   # QR scanning and manual device entry
│   ├── DeviceDashboard.tsx # Device control and payment interface
│   ├── UserProfile.tsx     # User profile management
│   ├── WhitelistManager.tsx # Device whitelist management
│   ├── WalletConnection.tsx # Wallet connection component
│   └── ThemeToggle.tsx     # Dark/light theme switcher
├── pages/
│   ├── Index.tsx           # Main application page
│   ├── DeviceOwner.tsx     # Device owner tools
│   ├── UserProfilePage.tsx # User profile page
│   └── NotFound.tsx        # 404 page
├── hooks/
│   ├── useTheme.tsx        # Theme management
│   └── useToast.ts         # Toast notifications
├── lib/
│   └── utils.ts            # Utility functions
└── main.tsx               # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask recommended)
- Access to an Ethereum network (mainnet, testnet, or local)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd infralink-webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

Update the contract addresses in the components:

```typescript
// In src/components/UserProfile.tsx and WhitelistManager.tsx
const INFRALINK_INFO_ADDRESS = "0xYOUR_INFRALINK_INFO_CONTRACT_ADDRESS";
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🔧 Configuration

### Wallet Connection

The app uses RainbowKit for wallet connections. Supported networks are configured in `src/App.tsx`:

```typescript
const config = getDefaultConfig({
  appName: 'InfraLink',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [mainnet, polygon, optimism, arbitrum, base],
});
```

### Contract Integration

Smart contract interactions are handled through Wagmi hooks:

- **Device Contracts**: Individual device access contracts
- **InfraLink Info Contract**: Central registry for profiles and whitelist
- **ERC20 Tokens**: For token-based payments
- **Native ETH**: For direct ETH payments

## 📱 Usage

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Create Profile**: Visit the Profile page to create your user profile
3. **Scan Device**: Use the QR scanner or enter a device contract address
4. **Check Access**: View your whitelist status and applicable fees
5. **Pay & Use**: Pay with tokens or ETH to activate the device

### For Device Owners

1. **QR Generation**: Use the Device Owner tools to generate QR codes
2. **Whitelist Management**: Add/remove users from device whitelist
3. **Profile Integration**: View user profiles when managing whitelist
4. **Monitor Usage**: Track device usage and payments

## 🎨 Theming

The app supports light and dark themes using Tailwind CSS:

- Toggle available in the header
- Automatic system preference detection
- Persistent theme selection

## 🔗 Smart Contract Integration

### Device Dashboard Features

- Real-time device status monitoring
- Payment processing (ERC20 and native tokens)
- Session management (extend, terminate)
- Whitelist status display
- Fee calculation and display

### User Profile Features

- Profile creation and editing
- Device access overview
- Whitelist entry viewing
- Cross-device access tracking

### Whitelist Management Features

- Add/remove users from device whitelist
- Set custom fees and access levels
- View user profiles
- Manage device registration

## 🛡️ Error Handling

The application includes comprehensive error handling:

- **Network Detection**: Validates correct blockchain network
- **Contract Validation**: Ensures addresses are valid smart contracts
- **Transaction Errors**: Clear error messages for failed transactions
- **Wallet Issues**: Helpful guidance for wallet connection problems

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env.local` file:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_INFRALINK_INFO_ADDRESS=0x...
```

## 📦 Dependencies

### Core Dependencies

- `react` - UI library
- `wagmi` - Ethereum React hooks
- `@rainbow-me/rainbowkit` - Wallet connection
- `ethers` - Ethereum interaction
- `viem` - Ethereum utilities

### UI Dependencies

- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - CSS framework
- `lucide-react` - Icons
- `class-variance-authority` - Component variants

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

Part of the **InfraLink** ecosystem - democratizing hardware access through blockchain technology.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b8eb9962-8f5a-430d-adf4-6eed7b72d1e5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
