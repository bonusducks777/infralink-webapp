import { useState } from 'react';
import { QRGenerator } from '@/components/QRGenerator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DeviceOwner = () => {
  const [showHelp, setShowHelp] = useState(false);

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
        <div className="max-w-4xl mx-auto space-y-8">
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
                    Deploy the DeviceAccess.sol contract to your chosen blockchain with your ERC20 token address, fee per second, and whitelist fee.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">2. Generate QR Code</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the tool below to generate a QR code containing your contract address. Print and place it on your device.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">3. Run the Device Monitor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Run the Python script (devicelocal.py) on your device hardware to monitor the contract and control device access.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">4. Configure Device Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set fees, manage whitelist, and configure other device parameters through the contract owner functions.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Generator */}
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
                    <h4 className="font-medium">QR Code Placement</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Print the generated QR code and place it visibly on your device. Users will scan this to connect.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Device Monitoring</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Run the provided Python script on your device to monitor contract state and control access.
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

              <Card>
                <CardHeader>
                  <CardTitle>Contract Management</CardTitle>
                  <CardDescription>
                    Manage your device contract settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Fee Management</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use setFee() and setWhitelistFee() functions to adjust pricing.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Whitelist Control</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add/remove users from whitelist using setWhitelist() function.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Fee Withdrawal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Withdraw collected fees using withdrawFees() function.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeviceOwner;
