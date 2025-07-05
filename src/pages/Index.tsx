
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { DeviceScanner } from '@/components/DeviceScanner';
import { DeviceDashboard } from '@/components/DeviceDashboard';
import { WalletConnection } from '@/components/WalletConnection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Wifi, Shield, Clock, Settings } from 'lucide-react';

const Index = () => {
  const { isConnected } = useAccount();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              InfraLink
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/device-owner">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Device Owner
              </Button>
            </Link>
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Shield className="w-6 h-6 text-blue-500" />
                  <span>Connect Your Wallet</span>
                </CardTitle>
                <CardDescription>
                  Connect your wallet to access hardware devices via smart contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletConnection />
              </CardContent>
            </Card>
          </div>
        ) : !selectedDevice ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Access Hardware Devices
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Scan a QR code or enter a device address to get started
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowScanner(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3"
                >
                  <Wifi className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <CardTitle>Instant Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Pay with ERC20 tokens for immediate device activation
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Clock className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Time-Based Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Pay per second with transparent pricing and session tracking
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <CardTitle>Secure & Decentralized</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Smart contract-based access with whitelist support
                  </CardDescription>
                </CardContent>
              </Card>
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
