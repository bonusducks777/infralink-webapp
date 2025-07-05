
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Zap, Wallet, Bell, Shield, AlertCircle, Users, Star } from 'lucide-react';
import { formatEther, parseEther } from 'viem';

interface DeviceDashboardProps {
  deviceAddress: string;
  onBack: () => void;
}

// DeviceAccess contract ABI
const DEVICE_CONTRACT_ABI = [
  {
    name: 'getDeviceInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: '_feePerSecond', type: 'uint256' },
      { name: '_isActive', type: 'bool' },
      { name: '_lastActivatedBy', type: 'address' },
      { name: '_sessionEndsAt', type: 'uint256' },
      { name: '_token', type: 'address' },
      { name: '_isWhitelisted', type: 'bool' },
      { name: '_timeRemaining', type: 'uint256' },
      { name: '_tokenName', type: 'string' },
      { name: '_tokenSymbol', type: 'string' },
      { name: '_tokenDecimals', type: 'uint8' },
      { name: '_deviceName', type: 'string' },
      { name: '_deviceDescription', type: 'string' },
      { name: '_lastUserWasWhitelisted', type: 'bool' },
      { name: '_whitelistName', type: 'string' },
      { name: '_useNativeToken', type: 'bool' }
    ]
  },
  {
    name: 'getWhitelistInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'addresses', type: 'address[]' },
      { name: 'names', type: 'string[]' },
      { name: 'count', type: 'uint256' }
    ]
  },
  {
    name: 'activate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'secondsToActivate', type: 'uint256' }]
  },
  {
    name: 'deactivate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: []
  },
  {
    name: 'feePerSecond',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'whitelistFeePerSecond',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'token',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  }
] as const;

// ERC20 ABI for token operations
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
] as const;

export const DeviceDashboard = ({ deviceAddress, onBack }: DeviceDashboardProps) => {
  const { address } = useAccount();
  const [paymentDuration, setPaymentDuration] = useState('10'); // minutes
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Get device info
  const { data: deviceInfo, isLoading: deviceInfoLoading, error: deviceInfoError, refetch: refetchDeviceInfo } = useReadContract({
    address: deviceAddress as `0x${string}`,
    abi: DEVICE_CONTRACT_ABI,
    functionName: 'getDeviceInfo',
    args: [address || '0x0000000000000000000000000000000000000000'],
    query: { refetchInterval: 5000 } // Refetch every 5 seconds
  });

  // Get whitelist info
  const { data: whitelistInfo, isLoading: whitelistLoading } = useReadContract({
    address: deviceAddress as `0x${string}`,
    abi: DEVICE_CONTRACT_ABI,
    functionName: 'getWhitelistInfo',
    query: { refetchInterval: 10000 } // Refetch every 10 seconds
  });

  // Parse device info from the updated contract
  const feePerSecond = deviceInfo?.[0] || 0n;
  const isActive = deviceInfo?.[1] || false;
  const currentUser = deviceInfo?.[2] || '0x0000000000000000000000000000000000000000';
  const sessionEndsAt = Number(deviceInfo?.[3] || 0);
  const tokenAddress = deviceInfo?.[4] || '';
  const isWhitelisted = deviceInfo?.[5] || false;
  const timeRemaining = Number(deviceInfo?.[6] || 0);
  const tokenName = deviceInfo?.[7] || 'Unknown Token';
  const tokenSymbol = deviceInfo?.[8] || 'TOKEN';
  const tokenDecimals = Number(deviceInfo?.[9] || 18);
  const deviceName = deviceInfo?.[10] || 'Unknown Device';
  const deviceDescription = deviceInfo?.[11] || 'No description available';
  const lastUserWasWhitelisted = deviceInfo?.[12] || false;
  const whitelistName = deviceInfo?.[13] || '';
  const useNativeToken = deviceInfo?.[14] || false;

  // Parse whitelist info
  const whitelistAddresses = whitelistInfo?.[0] || [];
  const whitelistNames = whitelistInfo?.[1] || [];
  const whitelistCount = Number(whitelistInfo?.[2] || 0);

  // Get user's token balance (ERC20 or native ETH)
  const { data: tokenBalance } = useReadContract({
    address: !useNativeToken ? tokenAddress as `0x${string}` : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0000000000000000000000000000000000000000'],
    query: { enabled: !useNativeToken && !!tokenAddress && !!address }
  });

  // Get user's ETH balance if using native token
  const { data: ethBalanceData } = useBalance({
    address: address,
    query: { enabled: useNativeToken && !!address }
  });

  // Get current allowance (only for ERC20)
  const { data: allowance } = useReadContract({
    address: !useNativeToken ? tokenAddress as `0x${string}` : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address || '0x0000000000000000000000000000000000000000', deviceAddress as `0x${string}`],
    query: { enabled: !useNativeToken && !!tokenAddress && !!address }
  });

  // Get the appropriate balance
  const currentBalance = useNativeToken ? ethBalanceData?.value : tokenBalance;

  // Contract write functions
  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: activateDevice, data: activateHash } = useWriteContract();
  const { writeContract: deactivateDevice, data: deactivateHash } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isActivating } = useWaitForTransactionReceipt({ hash: activateHash });
  const { isLoading: isDeactivating } = useWaitForTransactionReceipt({ hash: deactivateHash });

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActiveSession = isActive && sessionEndsAt > currentTime;
  const isMySession = currentUser.toLowerCase() === address?.toLowerCase();
  const timeLeft = Math.max(0, sessionEndsAt - currentTime);

  const calculatePayment = () => {
    const durationSeconds = parseInt(paymentDuration) * 60;
    const totalCost = feePerSecond * BigInt(durationSeconds);
    return totalCost;
  };

  const formatTokenAmount = (amount: bigint) => {
    const divisor = 10n ** BigInt(tokenDecimals);
    const formatted = Number(amount) / Number(divisor);
    return formatted.toFixed(6);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleApprove = async () => {
    if (!tokenAddress || !address) return;
    
    const amount = calculatePayment();
    try {
      await approveToken({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [deviceAddress as `0x${string}`, amount]
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleActivate = async () => {
    if (!address) return;
    
    const durationSeconds = parseInt(paymentDuration) * 60;
    const payment = calculatePayment();
    
    try {
      if (useNativeToken) {
        // For native token, send ETH value with the transaction
        await activateDevice({
          address: deviceAddress as `0x${string}`,
          abi: DEVICE_CONTRACT_ABI,
          functionName: 'activate',
          args: [BigInt(durationSeconds)],
          value: payment // Send ETH value
        });
      } else {
        // For ERC20 tokens, no value needed (approval already done)
        await activateDevice({
          address: deviceAddress as `0x${string}`,
          abi: DEVICE_CONTRACT_ABI,
          functionName: 'activate',
          args: [BigInt(durationSeconds)]
        });
      }
    } catch (error) {
      console.error('Activation failed:', error);
    }
  };

  const handleDeactivate = async () => {
    if (!address) return;
    
    try {
      await deactivateDevice({
        address: deviceAddress as `0x${string}`,
        abi: DEVICE_CONTRACT_ABI,
        functionName: 'deactivate'
      });
    } catch (error) {
      console.error('Deactivation failed:', error);
    }
  };

  const needsApproval = () => {
    if (useNativeToken) return false; // No approval needed for native token
    
    const payment = calculatePayment();
    if (payment === 0n) return false; // No approval needed for free access
    return !allowance || allowance < payment;
  };

  const hasEnoughBalance = () => {
    const payment = calculatePayment();
    if (payment === 0n) return true; // Always have enough for free access
    
    if (useNativeToken) {
      return ethBalanceData?.value && ethBalanceData.value >= payment;
    } else {
      return tokenBalance && tokenBalance >= payment;
    }
  };

  if (deviceInfoLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading device information...</p>
        </div>
      </div>
    );
  }

  if (deviceInfoError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">Device Dashboard</h2>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load device information. Please check the contract address and try again.
            <br />
            <span className="text-xs text-gray-500 mt-1 block">
              Error: {deviceInfoError.message}
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{deviceName}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{deviceDescription}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
            {deviceAddress}
          </p>
        </div>
      </div>

      {/* User Status Alert */}
      {isWhitelisted && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Whitelisted Access:</strong> {whitelistName || 'You have special access to this device'} 
            {feePerSecond === 0n ? ' - Free access!' : ' - Reduced fees apply'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="device" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="device">Device Control</TabsTrigger>
          <TabsTrigger value="info">Device Info</TabsTrigger>
          <TabsTrigger value="whitelist">Whitelist ({whitelistCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="device" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Device Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Device Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge className={isActiveSession ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {isActiveSession ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {isActiveSession && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Session Progress</span>
                        <span>{formatTime(timeLeft)} remaining</span>
                      </div>
                      <Progress value={timeRemaining > 0 ? ((timeRemaining - timeLeft) / timeRemaining) * 100 : 0} className="h-2" />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Current User</span>
                        <div className="flex items-center space-x-2">
                          <Badge className={isMySession ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                            {isMySession ? "You" : "Other User"}
                          </Badge>
                          {lastUserWasWhitelisted && (
                            <Shield className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {currentUser}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Your Fee Rate</span>
                    <span className="font-mono">
                      {feePerSecond === 0n ? 'FREE' : `${formatTokenAmount(feePerSecond)} ${tokenSymbol}/sec`}
                    </span>
                  </div>
                  
                  {isWhitelisted && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <Star className="w-4 h-4" />
                      <span>Whitelisted - {feePerSecond === 0n ? 'Free Access' : 'Reduced Rate'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Activate Device</span>
                </CardTitle>
                <CardDescription>
                  {isActiveSession 
                    ? "Device is currently active. You can extend the session."
                    : "Pay to activate the device for your desired duration."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={paymentDuration}
                    onChange={(e) => setPaymentDuration(e.target.value)}
                    min="1"
                    max="1440"
                    disabled={isActivating || isApproving || isDeactivating}
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{paymentDuration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>
                      {feePerSecond === 0n ? 'FREE' : `${formatTokenAmount(feePerSecond)} ${tokenSymbol}/sec`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>
                      {feePerSecond === 0n ? 'FREE' : `${formatTokenAmount(calculatePayment())} ${tokenSymbol}`}
                    </span>
                  </div>
                </div>

                {/* Balance check */}
                {tokenBalance !== undefined && feePerSecond > 0n && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Your balance: {formatTokenAmount(tokenBalance)} {tokenSymbol}
                  </div>
                )}

                {/* Insufficient balance warning */}
                {!hasEnoughBalance() && feePerSecond > 0n && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient {tokenSymbol} balance. You need {formatTokenAmount(calculatePayment())} {tokenSymbol} but only have {formatTokenAmount(tokenBalance || 0n)} {tokenSymbol}.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  {feePerSecond > 0n && needsApproval() && hasEnoughBalance() && (
                    <Button 
                      onClick={handleApprove}
                      className="w-full"
                      disabled={isApproving || !paymentDuration || parseInt(paymentDuration) <= 0}
                    >
                      {isApproving ? "Approving..." : `Approve ${tokenSymbol}`}
                    </Button>
                  )}
                  
                  {(feePerSecond === 0n || (!needsApproval() && hasEnoughBalance())) && (
                    <Button 
                      onClick={handleActivate}
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                      disabled={isActivating || !paymentDuration || parseInt(paymentDuration) <= 0}
                    >
                      {isActivating ? "Activating..." : (isActiveSession ? "Extend Session" : "Activate Device")}
                    </Button>
                  )}

                  {isMySession && (
                    <Button 
                      onClick={handleDeactivate}
                      className="w-full border border-gray-300 hover:bg-gray-50"
                      disabled={isDeactivating}
                    >
                      {isDeactivating ? "Deactivating..." : "End Session Early"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-600 dark:text-gray-400">Name</p>
                    <p>{deviceName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600 dark:text-gray-400">Description</p>
                    <p>{deviceDescription}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600 dark:text-gray-400">Contract Address</p>
                    <p className="font-mono text-xs break-all">{deviceAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-600 dark:text-gray-400">Payment Type</p>
                    <p>{useNativeToken ? "Native Token (ETH)" : "ERC20 Token"}</p>
                  </div>
                  {!useNativeToken && (
                    <>
                      <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Token Name</p>
                        <p>{tokenName}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Symbol</p>
                        <p>{tokenSymbol}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Decimals</p>
                        <p>{tokenDecimals}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Address</p>
                        <p className="font-mono text-xs break-all">{tokenAddress}</p>
                      </div>
                    </>
                  )}
                  {useNativeToken && (
                    <>
                      <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Symbol</p>
                        <p>ETH</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Network</p>
                        <p>Ethereum</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whitelist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Whitelisted Users ({whitelistCount})</span>
              </CardTitle>
              <CardDescription>
                Users with special access to this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              {whitelistLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : whitelistCount === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No whitelisted users yet
                </p>
              ) : (
                <div className="space-y-3">
                  {whitelistAddresses.map((addr: string, index: number) => (
                    <div key={addr} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{whitelistNames[index] || 'Unnamed User'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{addr}</p>
                        </div>
                      </div>
                      {addr.toLowerCase() === address?.toLowerCase() && (
                        <Badge className="bg-green-100 text-green-800">You</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Get notified when the device becomes available (placeholder functionality)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isActiveSession ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Device is currently available for use.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Notify when available</span>
                <Button
                  className={showNotifications ? "bg-blue-500 text-white" : "border border-gray-300 hover:bg-gray-50"}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  {showNotifications ? "Subscribed" : "Subscribe"}
                </Button>
              </div>
              {showNotifications && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ You'll be notified when this device becomes available in {formatTime(timeLeft)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
