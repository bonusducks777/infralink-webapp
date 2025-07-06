
import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';
import { DeviceScanner } from '@/components/DeviceScanner';
import { DeviceDashboard } from '@/components/DeviceDashboard';
import { WalletConnection } from '@/components/WalletConnection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RecentDevices } from '@/components/RecentDevices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Wifi, Shield, Clock, Settings, User, Plus } from 'lucide-react';

const Index = () => {
  const { isConnected } = useWallet();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              InfraLink
            </h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <Link to="/profile" className="hidden md:block">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link to="/contract-deployer" className="hidden md:block">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Deploy
              </Button>
            </Link>
            <Link to="/device-owner" className="hidden md:block">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Device Owner
              </Button>
            </Link>
            {/* Mobile settings dropdown */}
            <div className="md:hidden">
              <Link to="/device-owner">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {!isConnected ? (
          <div className="text-center py-8 md:py-16">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2 text-lg md:text-xl">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  <span>Connect Your Wallet</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Connect your wallet to access hardware devices via smart contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletConnection />
              </CardContent>
            </Card>
          </div>
        ) : !selectedDevice ? (
          <div className="space-y-6 md:space-y-8">
            {/* Hero Section */}
            <div className="text-center py-4 md:py-8">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Access Hardware Devices
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 px-4">
                Scan a QR code or enter a device address to get started
              </p>
              
              <div className="flex flex-col gap-4 justify-center px-4">
                <Button 
                  onClick={() => setShowScanner(true)}
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 md:px-8 py-3 h-12 text-base md:text-lg w-full md:w-auto md:mx-auto"
                >
                  <Wifi className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>
              </div>
            </div>

            {/* Recent Devices Section */}
            <div className="max-w-4xl mx-auto">
              <RecentDevices 
                onDeviceSelect={(address) => setSelectedDevice(address)} 
              />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 px-4 md:px-0">
              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <Zap className="w-10 h-10 md:w-12 md:h-12 text-blue-500 mx-auto mb-3 md:mb-4" />
                  <CardTitle className="text-lg md:text-xl">Instant Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Pay with ERC20 tokens for immediate device activation
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <Clock className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-3 md:mb-4" />
                  <CardTitle className="text-lg md:text-xl">Time-Based Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Pay per second with transparent pricing and session tracking
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <Shield className="w-10 h-10 md:w-12 md:h-12 text-purple-500 mx-auto mb-3 md:mb-4" />
                  <CardTitle className="text-lg md:text-xl">Secure & Decentralized</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Smart contract-based access with whitelist support
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Navigation Pills */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex justify-around">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/contract-deployer">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/device-owner">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Scanner Modal */}
            {showScanner && (
              <DeviceScanner
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onDeviceFound={(address) => {
                  setSelectedDevice(address);
                  setShowScanner(false);
                }}
              />
            )}
          </div>
        ) : (
          <DeviceDashboard 
            deviceAddress={selectedDevice}
            onBack={() => setSelectedDevice(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
