
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnection = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <Button disabled size="sm" className="h-9">
        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-current"></div>
        <span className="ml-2 hidden md:inline">Loading...</span>
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button 
        onClick={login} 
        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 h-9 px-3 md:px-4"
        size="sm"
      >
        <Wallet className="w-4 h-4 md:mr-2" />
        <span className="hidden md:inline">Connect Wallet</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-1 md:space-x-2">
      <div className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs md:text-sm font-medium text-green-800 dark:text-green-200 hidden md:inline">
          Connected
        </span>
        {user?.wallet?.address && (
          <span className="text-xs font-mono text-green-600 dark:text-green-400">
            {user.wallet.address.slice(0, 4)}...{user.wallet.address.slice(-2)}
          </span>
        )}
      </div>
      <Button onClick={logout} className="h-8 px-2 border border-gray-300 hover:bg-gray-50" size="sm">
        <LogOut className="w-3 h-3 md:w-4 md:h-4" />
      </Button>
    </div>
  );
};
