
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WalletConnection } from '@/components/WalletConnection';
import { 
  Zap, 
  ArrowLeft, 
  Rocket, 
  Code, 
  Network, 
  DollarSign, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Clock,
  Copy
} from 'lucide-react';

const ContractDeployer = () => {
  const [contractName, setContractName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');

  const networks = [
    { id: 'hedera-testnet', name: 'Hedera Testnet', fee: '0.1 HBAR' },
    { id: 'flow-testnet', name: 'Flow EVM Testnet', fee: '0.001 FLOW' },
    { id: 'zircuit-mainnet', name: 'Zircuit Mainnet', fee: '0.005 ETH' },
    { id: 'sepolia', name: 'Sepolia Testnet', fee: '0.01 ETH' },
  ];

  const contractTemplates = [
    {
      name: 'InfraLink Device Contract',
      description: 'Standard device access contract with payment and time tracking',
      category: 'Device Access',
      complexity: 'Intermediate'
    },
    {
      name: 'Token Payment Gateway',
      description: 'ERC20 token payment processing for device access',
      category: 'Payment',
      complexity: 'Advanced'
    },
    {
      name: 'Access Control Manager',
      description: 'Whitelist and permission management contract',
      category: 'Security',
      complexity: 'Beginner'
    },
    {
      name: 'Multi-Device Controller',
      description: 'Manage multiple devices from a single contract',
      category: 'Infrastructure',
      complexity: 'Advanced'
    }
  ];

  const handleDeploy = () => {
    setDeploymentStatus('deploying');
    // Mock deployment process
    setTimeout(() => {
      setDeploymentStatus('success');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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

      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract Templates */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Contract Templates</span>
                </CardTitle>
                <CardDescription>
                  Choose from pre-built InfraLink contract templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contractTemplates.map((template, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <Badge variant={template.complexity === 'Beginner' ? 'secondary' : template.complexity === 'Intermediate' ? 'default' : 'destructive'}>
                        {template.complexity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {template.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Deployment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5" />
                  <span>Deploy New Contract</span>
                </CardTitle>
                <CardDescription>
                  Configure and deploy your InfraLink smart contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Configuration */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contract-name">Contract Name</Label>
                    <Input
                      id="contract-name"
                      placeholder="e.g., MyDeviceController"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this contract will manage..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Network Selection */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Network className="w-4 h-4" />
                    <span>Deployment Network</span>
                  </Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a network" />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{network.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {network.fee}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Contract Parameters */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Contract Parameters</span>
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rate">Hourly Rate (tokens)</Label>
                      <Input
                        id="rate"
                        type="number"
                        placeholder="100"
                        defaultValue="100"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="token">Payment Token Address</Label>
                      <Input
                        id="token"
                        placeholder="0x..."
                        defaultValue="0xA0b86991c431C9C7Cc5A8b8E7A63aCb"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Deployment Status */}
                {deploymentStatus !== 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {deploymentStatus === 'deploying' && (
                        <>
                          <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                          <span className="text-blue-600 dark:text-blue-400">Deploying contract...</span>
                        </>
                      )}
                      {deploymentStatus === 'success' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">Contract deployed successfully!</span>
                        </>
                      )}
                      {deploymentStatus === 'error' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 dark:text-red-400">Deployment failed</span>
                        </>
                      )}
                    </div>
                    
                    {deploymentStatus === 'success' && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Contract Address:</p>
                            <p className="font-mono text-sm text-green-600 dark:text-green-400">
                              0x742d35Cc6634C0532925a3b8d7C1d4E3e45B8f2A
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Deploy Button */}
                <Button
                  onClick={handleDeploy}
                  disabled={!contractName || !selectedNetwork || deploymentStatus === 'deploying'}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {deploymentStatus === 'deploying' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy Contract
                    </>
                  )}
                </Button>

                {/* Gas Estimation */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2">
                  <span>Estimated deployment cost:</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>~$15.30</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractDeployer;
