import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '@/components/UserProfile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WalletConnection } from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';

const UserProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                User Profile
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your profile and view device access
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <UserProfile />
      </main>
    </div>
  );
};

export default UserProfilePage;
