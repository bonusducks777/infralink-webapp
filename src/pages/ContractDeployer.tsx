
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnection } from '@/components/WalletConnection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Settings, User, Rocket, Code2, Coins, Shield, Clock, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ContractDeployer = () => {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [deploymentStep, setDeploymentStep] = useState<'config' | 'deploying' | 'deployed'>('config');
  const [contractConfig, setContractConfig] = useState({
    deviceName: '',
    tokenAddress: '',
    feePerSecond: '',
    whitelistFeePerSecond: '',
    network: '',
  });
  const [deployedAddress, setDeployedAddress] = useState('0x1234567890abcdef1234567890abcdef12345678');

  const handleDeploy = () => {
    setDeploymentStep('deploying');
    // Simulate deployment
    setTimeout(() => {
      setDeploymentStep('deployed');
      toast({
        title: "Contract Deployed!",
        description: "Your InfraLink device contract is now live on the blockchain.",
      });
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Contract Deployer
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {!isConnected ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Shield className="w-6 h-6 text-blue-500" />
                  <span>Connect Your Wallet</span>
                </CardTitle>
                <CardDescription>
                  Connect your wallet to deploy InfraLink contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletConnection />
              </CardContent>
            </Card>
          </div>
        ) : deploymentStep === 'config' ? (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Deploy InfraLink Contract</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Configure and deploy a smart contract for your hardware device
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Configuration Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Device Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Set up your device parameters and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deviceName">Device Name</Label>
                    <Input
                      id="deviceName"
                      placeholder="EV Charger Station #1"
                      value={contractConfig.deviceName}
                      onChange={(e) => setContractConfig({...contractConfig, deviceName: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="network">Network</Label>
                    <Select value={contractConfig.network} onValueChange={(value) => setContractConfig({...contractConfig, network: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                        <SelectItem value="mainnet">Ethereum Mainnet</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                        <SelectItem value="hedera">Hedera Testnet</SelectItem>
                        <SelectItem value="flow">Flow EVM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tokenAddress">ERC20 Token Address</Label>
                    <Input
                      id="tokenAddress"
                      placeholder="0x..."
                      value={contractConfig.tokenAddress}
                      onChange={(e) => setContractConfig({...contractConfig, tokenAddress: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">The token users will pay with</p>
                  </div>

                  <div>
                    <Label htmlFor="feePerSecond">Fee Per Second</Label>
                    <Input
                      id="feePerSecond"
                      placeholder="0.001"
                      value={contractConfig.feePerSecond}
                      onChange={(e) => setContractConfig({...contractConfig, feePerSecond: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Cost in tokens per second of usage</p>
                  </div>

                  <div>
                    <Label htmlFor="whitelistFeePerSecond">Whitelist Fee Per Second</Label>
                    <Input
                      id="whitelistFeePerSecond"
                      placeholder="0"
                      value={contractConfig.whitelistFeePerSecond}
                      onChange={(e) => setContractConfig({...contractConfig, whitelistFeePerSecond: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Special rate for whitelisted users (0 for free)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code2 className="w-5 h-5" />
                    <span>Contract Preview</span>
                  </CardTitle>
                  <CardDescription>
                    Review your contract configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Device:</span>
                        <span>{contractConfig.deviceName || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Network:</span>
                        <Badge variant="outline">{contractConfig.network || 'Not selected'}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Token:</span>
                        <span className="truncate max-w-32">{contractConfig.tokenAddress || '0x...'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fee/sec:</span>
                        <span>{contractConfig.feePerSecond || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Whitelist Fee/sec:</span>
                        <span>{contractConfig.whitelistFeePerSecond || '0'}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <Coins className="w-4 h-4" />
                      <span>Estimated Costs</span>
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Deployment Gas:</span>
                        <span>~0.02 ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Fee:</span>
                        <span>~$15-50</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deploy Button */}
            <div className="text-center">
              <Button 
                onClick={handleDeploy}
                disabled={!contractConfig.deviceName || !contractConfig.network || !contractConfig.tokenAddress}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3 h-12 text-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Deploy Contract
              </Button>
            </div>
          </div>
        ) : deploymentStep === 'deploying' ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <CardTitle>Deploying Contract...</CardTitle>
                <CardDescription>
                  Your contract is being deployed to the blockchain. This may take a few minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Contract compiled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Transaction submitted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Waiting for confirmation...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Contract Deployed Successfully!</CardTitle>
                <CardDescription>
                  Your InfraLink device contract is now live on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Contract Address:</span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(deployedAddress)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <code className="text-sm font-mono break-all bg-white dark:bg-gray-900 p-2 rounded border">
                    {deployedAddress}
                  </code>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Next Steps:</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Generate QR code for device</li>
                      <li>• Configure device hardware</li>
                      <li>• Test device activation</li>
                      <li>• Set up monitoring</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Contract Features:</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• ERC20 token payments</li>
                      <li>• Per-second billing</li>
                      <li>• Whitelist support</li>
                      <li>• Session management</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 justify-center">
                  <Link to="/device-owner">
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Device
                    </Button>
                  </Link>
                  <Button onClick={() => setDeploymentStep('config')}>
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy Another
                  </Button>
                  <Link to="/">
                    <Button>
                      <Zap className="w-4 h-4 mr-2" />
                      Test Device
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ContractDeployer;
