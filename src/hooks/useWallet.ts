import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export const useWallet = () => {
  const { authenticated, user, ready } = usePrivy();
  const { address: wagmiAddress, isConnected } = useAccount();

  // Use Privy's wallet address if available, otherwise fall back to wagmi
  const address = authenticated && user?.wallet?.address ? user.wallet.address : wagmiAddress;

  return {
    address: address as `0x${string}` | undefined,
    isConnected: authenticated || isConnected,
    isAuthenticated: authenticated,
    isReady: ready,
    user,
  };
};
