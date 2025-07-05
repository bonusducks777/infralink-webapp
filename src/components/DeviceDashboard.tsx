
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, Zap, Wallet, Bell, Shield, AlertCircle } from 'lucide-react';
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
      { name: '_timeRemaining', type: 'uint256' }
    ]
  },
  {
    name: 'activate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'secondsToActivate', type: 'uint256' }]
  },
  {
    name: 'deactivate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: []
  },
  {
    name: 'isActive',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'lastActivatedBy',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'sessionEndsAt',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'feePerSecond',
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
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('TOKEN');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);

  // Get device info
  const { data: deviceInfo, isLoading: deviceInfoLoading, error: deviceInfoError, refetch: refetchDeviceInfo } = useReadContract({
    address: deviceAddress as `0x${string}`,
    abi: DEVICE_CONTRACT_ABI,
    functionName: 'getDeviceInfo',
    args: [address || '0x0000000000000000000000000000000000000000'],
    query: { refetchInterval: 5000 } // Refetch every 5 seconds
  });

  // Get token address
  const { data: tokenAddr } = useReadContract({
    address: deviceAddress as `0x${string}`,
    abi: DEVICE_CONTRACT_ABI,
    functionName: 'token'
  });

  // Get token symbol
  const { data: symbol } = useReadContract({
    address: tokenAddr as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: { enabled: !!tokenAddr }
  });

  // Get token decimals
  const { data: decimals } = useReadContract({
    address: tokenAddr as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: !!tokenAddr }
  });

  // Get user's token balance
  const { data: tokenBalance } = useReadContract({
    address: tokenAddr as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!tokenAddr && !!address }
  });

  // Get current allowance
  const { data: allowance } = useReadContract({
    address: tokenAddr as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address || '0x0000000000000000000000000000000000000000', deviceAddress as `0x${string}`],
    query: { enabled: !!tokenAddr && !!address }
  });

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

  // Update token info when data changes
  useEffect(() => {
    if (tokenAddr) setTokenAddress(tokenAddr);
    if (symbol) setTokenSymbol(symbol);
    if (decimals) setTokenDecimals(decimals);
  }, [tokenAddr, symbol, decimals]);

  // Parse device info
  const feePerSecond = deviceInfo?.[0] || 0n;
  const isActive = deviceInfo?.[1] || false;
  const currentUser = deviceInfo?.[2] || '0x0000000000000000000000000000000000000000';
  const sessionEndsAt = Number(deviceInfo?.[3] || 0);
  const isWhitelisted = deviceInfo?.[5] || false;
  const timeRemaining = Number(deviceInfo?.[6] || 0);

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
    if (!tokenAddr || !address) return;
    
    const amount = calculatePayment();
    try {
      await approveToken({
        address: tokenAddr as `0x${string}`,
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
    try {
      await activateDevice({
        address: deviceAddress as `0x${string}`,
        abi: DEVICE_CONTRACT_ABI,
        functionName: 'activate',
        args: [BigInt(durationSeconds)]
      });
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
    const payment = calculatePayment();
    return !allowance || allowance < payment;
  };

  const hasEnoughBalance = () => {
    const payment = calculatePayment();
    return tokenBalance && tokenBalance >= payment;
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
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">Device Dashboard</h2>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load device information. Please check the contract address and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Device Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {deviceAddress}
          </p>
        </div>
      </div>

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
              <Badge variant={isActiveSession ? "default" : "secondary"}>
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
                    <Badge variant={isMySession ? "default" : "outline"}>
                      {isMySession ? "You" : "Other User"}
                    </Badge>
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
                <span>Fee per Second</span>
                <span className="font-mono">
                  {formatTokenAmount(feePerSecond)} {tokenSymbol}
                </span>
              </div>
              
              {isWhitelisted && (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Whitelisted Access
                  </span>
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
                <span>{formatTokenAmount(feePerSecond)} {tokenSymbol}/sec</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Cost:</span>
                <span>{formatTokenAmount(calculatePayment())} {tokenSymbol}</span>
              </div>
            </div>

            {/* Balance check */}
            {tokenBalance !== undefined && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Your balance: {formatTokenAmount(tokenBalance)} {tokenSymbol}
              </div>
            )}

            {/* Insufficient balance warning */}
            {!hasEnoughBalance() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient {tokenSymbol} balance. You need {formatTokenAmount(calculatePayment())} {tokenSymbol} but only have {formatTokenAmount(tokenBalance || 0n)} {tokenSymbol}.
                </AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {needsApproval() && hasEnoughBalance() && (
                <Button 
                  onClick={handleApprove}
                  className="w-full"
                  disabled={isApproving || !paymentDuration || parseInt(paymentDuration) <= 0}
                >
                  {isApproving ? "Approving..." : `Approve ${tokenSymbol}`}
                </Button>
              )}
              
              {!needsApproval() && hasEnoughBalance() && (
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
                  variant="outline" 
                  className="w-full"
                  disabled={isDeactivating}
                >
                  {isDeactivating ? "Deactivating..." : "End Session Early"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  variant={showNotifications ? "default" : "outline"}
                  size="sm"
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
