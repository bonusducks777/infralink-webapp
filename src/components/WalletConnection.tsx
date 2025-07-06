
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnection = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <Button disabled>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        <span className="ml-2">Loading...</span>
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button onClick={login} className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          Connected
        </span>
        {user?.wallet?.address && (
          <span className="text-xs font-mono text-green-600 dark:text-green-400">
            {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
          </span>
        )}
      </div>
      <Button onClick={logout} className="h-8 px-2 border border-gray-300 hover:bg-gray-50">
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};
