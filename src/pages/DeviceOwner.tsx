import { useState } from 'react';
import { QRGenerator } from '@/components/QRGenerator';
import { WhitelistManager } from '@/components/WhitelistManager';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WalletConnection } from '@/components/WalletConnection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Settings, HelpCircle, Users, QrCode, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

const DeviceOwner = () => {
  const { address, isConnected } = useAccount();
  const [showHelp, setShowHelp] = useState(false);
  const [manageDeviceAddress, setManageDeviceAddress] = useState('');
  const [deviceAddressInput, setDeviceAddressInput] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  const validateEthereumAddress = (address: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    setIsValidAddress(isValid);
    return isValid;
  };

  const handleManageWhitelist = () => {
    if (!deviceAddressInput.trim()) {
      return;
    }
    
    if (!validateEthereumAddress(deviceAddressInput)) {
      return;
    }
    
    setManageDeviceAddress(deviceAddressInput);
  };

  const handleDeviceAddressChange = (value: string) => {
    setDeviceAddressInput(value);
    validateEthereumAddress(value);
  };

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
                Device Owner Tools
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate QR codes for your devices
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Help Section */}
          {showHelp && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>How to Set Up Your Device</span>
                </CardTitle>
                <CardDescription>
                  Follow these steps to make your device accessible via InfraLink
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Deploy the Device Contract</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Deploy the DeviceAccess.sol contract to your chosen blockchain with your payment settings (ERC20 token or native ETH), fees, and whitelist configuration.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">2. Register with InfraLink Info</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Register your device with the InfraLink Info contract to enable user profile integration and centralized whitelist management.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">3. Generate QR Code</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the QR Generator tab to create a QR code containing your contract address. Print and place it on your device.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">4. Manage Whitelist</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the Whitelist Manager tab to add users to your device whitelist, set custom fees, and manage access permissions.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">5. Run Device Monitor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Run the Python script (devicelocal.py) on your device hardware to monitor the contract and control device access.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your wallet to manage your devices and whitelist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your wallet to access device owner tools.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <WalletConnection />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr" className="flex items-center space-x-2">
                  <QrCode className="w-4 h-4" />
                  <span>QR Generator</span>
                </TabsTrigger>
                <TabsTrigger value="whitelist" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Whitelist Manager</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Device QR Code Generator</CardTitle>
                        <CardDescription>
                          Generate a QR code for your device contract to allow easy user access
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <QRGenerator />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Setup Instructions</CardTitle>
                        <CardDescription>
                          Quick setup guide for device owners
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Device Contract Address</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter your deployed DeviceAccess contract address in the form to generate a QR code.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Native Token Support</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your device can now accept both ERC20 tokens and native ETH payments. Configure this in your contract deployment.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">QR Code Placement</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Print the generated QR code and place it visibly on your device. Users will scan this to connect.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Testing</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Test the system by scanning the QR code with the main app or manually entering the contract address.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="whitelist" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Whitelist Management</CardTitle>
                    <CardDescription>
                      Enter your device contract address to manage whitelist users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceAddress">Device Contract Address</Label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Input
                            id="deviceAddress"
                            placeholder="0x..."
                            value={deviceAddressInput}
                            onChange={(e) => handleDeviceAddressChange(e.target.value)}
                            className={`font-mono pr-10 ${isValidAddress ? 'border-green-500' : ''}`}
                          />
                          {deviceAddressInput && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isValidAddress ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={handleManageWhitelist}
                          disabled={!isValidAddress}
                        >
                          Manage Whitelist
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter the contract address of the device you want to manage
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {manageDeviceAddress && (
                  <WhitelistManager
                    deviceContract={manageDeviceAddress}
                    isOwner={true}
                    onWhitelistUpdate={() => {
                      // Callback for when whitelist is updated
                      console.log('Whitelist updated for device:', manageDeviceAddress);
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeviceOwner;
