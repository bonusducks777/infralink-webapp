
import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance, useChainId, useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Zap, Wallet, Bell, Shield, AlertCircle, CheckCircle, Users, Star } from 'lucide-react';
import { formatEther, parseEther } from 'viem';
import { useRecentDevices } from '@/hooks/useRecentDevices';
import { useWallet } from '@/hooks/useWallet';
import { INFRALINK_INFO_ADDRESS, INFRALINK_INFO_ABI } from '@/lib/contracts';

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
      { name: '_tokenDecimals', type: 'uint8' }
    ]
  },
  {
    name: 'getDeviceDetails',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: '_deviceName', type: 'string' },
      { name: '_deviceDescription', type: 'string' },
      { name: '_useNativeToken', type: 'bool' },
      { name: '_lastUserWasWhitelisted', type: 'bool' },
      { name: '_whitelistFeePerSecond', type: 'uint256' }
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
  const { address, isConnected, isAuthenticated } = useWallet();
  const chainId = useChainId();
  const { chain } = useAccount();
  const [paymentDuration, setPaymentDuration] = useState('10'); // minutes
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [txError, setTxError] = useState<string>('');
  const [txSuccess, setTxSuccess] = useState<string>('');
  const [isTransacting, setIsTransacting] = useState(false);

  // Recent devices hook
  const { addRecentDevice } = useRecentDevices();

  // Get device info
  const { data: deviceInfo, isLoading: deviceInfoLoading, error: deviceInfoError, refetch: refetchDeviceInfo } = useReadContract({
    address: deviceAddress as `0x${string}`,
    abi: DEVICE_CONTRACT_ABI,
    functionName: 'getDeviceInfo',
    args: [address || '0x0000000000000000000000000000000000000000'],
    query: { 
      refetchInterval: 30000, // Reduced to 30 seconds
      enabled: !!deviceAddress
    }
  });

  // Get device details (static info, refetch less frequently)
  const { data: deviceDetails, isLoading: deviceDetailsLoading } = useReadContract({
    address: deviceAddress as `0x${string}`,
    abi: DEVICE_CONTRACT_ABI,
    functionName: 'getDeviceDetails',
    query: { 
      refetchInterval: 60000, // Reduced to 60 seconds for static info
      enabled: !!deviceAddress
    }
  });

  // Get all registered users from Info contract (only source of user data)
  const { data: allRegisteredUsers, isLoading: allUsersLoading } = useReadContract({
    address: INFRALINK_INFO_ADDRESS as `0x${string}`,
    abi: INFRALINK_INFO_ABI,
    functionName: 'getAllRegisteredUsers',
    args: [],
    query: { 
      refetchInterval: 45000, // Reduced to 45 seconds
      enabled: !!INFRALINK_INFO_ADDRESS
    }
  });

  // Get user whitelist info from Info contract
  const { data: userWhitelistInfo, isLoading: userWhitelistLoading } = useReadContract({
    address: INFRALINK_INFO_ADDRESS as `0x${string}`,
    abi: INFRALINK_INFO_ABI,
    functionName: 'getUserWhitelistInfo',
    args: [address || '0x0000000000000000000000000000000000000000', deviceAddress as `0x${string}`],
    query: { 
      refetchInterval: 45000, // Reduced to 45 seconds
      enabled: !!address && !!deviceAddress
    }
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
  const rawTokenSymbol = deviceInfo?.[8] || 'TOKEN';
  const tokenDecimals = Number(deviceInfo?.[9] || 18);

  // Parse device details
  const deviceName = deviceDetails?.[0] || 'Unknown Device';
  const deviceDescription = deviceDetails?.[1] || 'No description available';
  const useNativeToken = deviceDetails?.[2] || false;

  // Detect network and adjust token symbol for native tokens
  const tokenSymbol = useNativeToken && rawTokenSymbol === 'ETH' 
    ? (chainId === 296 ? 'HBAR' : 'ETH') // 296 = Hedera testnet
    : rawTokenSymbol;
  const lastUserWasWhitelisted = deviceDetails?.[3] || false;
  const whitelistFeePerSecond = deviceDetails?.[4] || 0n;

  // Parse user whitelist info from Info contract
  const whitelistName = userWhitelistInfo?.[0] || '';
  const userIsWhitelisted = userWhitelistInfo?.[1] || false;
  const whitelistFeeFromInfo = userWhitelistInfo?.[2] || 0n;
  const isFreeFromInfo = userWhitelistInfo?.[3] || false;
  const addedAt = userWhitelistInfo?.[4] || 0n;
  const addedBy = userWhitelistInfo?.[5] || '';

  // Calculate applicable fee: use whitelist fee if whitelisted and not free, otherwise regular fee
  const applicableFee = userIsWhitelisted ? (isFreeFromInfo ? 0n : whitelistFeeFromInfo) : feePerSecond;

  // Check if critical data is loading (only check essential loading states)
  const isLoadingEssential = deviceInfoLoading || deviceDetailsLoading;

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
  const { isLoading: isActivating, isSuccess: activateSuccess, isError: activateError } = useWaitForTransactionReceipt({ hash: activateHash });
  const { isLoading: isDeactivating, isSuccess: deactivateSuccess, isError: deactivateError } = useWaitForTransactionReceipt({ hash: deactivateHash });

  // Clear errors when user changes input
  useEffect(() => {
    setTxError('');
    setTxSuccess('');
  }, [paymentDuration]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Add device to recent devices when successfully loaded (stable dependencies)
  useEffect(() => {
    if (deviceDetails && deviceName && deviceDescription && !deviceDetailsLoading && address) {
      addRecentDevice({
        address: deviceAddress,
        name: deviceName,
        description: deviceDescription,
        isWhitelisted: userIsWhitelisted,
        whitelistName: whitelistName
      });
    }
  }, [deviceAddress, deviceName, deviceDescription, userIsWhitelisted, whitelistName, address, deviceDetailsLoading]);

  // Handle activation transaction results
  useEffect(() => {
    if (activateSuccess) {
      setTxSuccess(`Device activated successfully for ${paymentDuration} minutes!`);
      setIsTransacting(false);
      // Refresh device info after successful activation
      setTimeout(() => {
        refetchDeviceInfo();
        setTxSuccess('');
      }, 3000);
    }
  }, [activateSuccess, paymentDuration, refetchDeviceInfo]);

  useEffect(() => {
    if (activateError) {
      setTxError('Transaction failed. Please check your balance and try again.');
      setIsTransacting(false);
    }
  }, [activateError]);

  // Handle deactivation transaction results
  useEffect(() => {
    if (deactivateSuccess) {
      setTxSuccess('Device deactivated successfully!');
      setIsTransacting(false);
      // Refresh device info after successful deactivation
      setTimeout(() => {
        refetchDeviceInfo();
        setTxSuccess('');
      }, 3000);
    }
  }, [deactivateSuccess, refetchDeviceInfo]);

  useEffect(() => {
    if (deactivateError) {
      setTxError('Deactivation failed. Please try again.');
      setIsTransacting(false);
    }
  }, [deactivateError]);

  const isActiveSession = isActive && sessionEndsAt > currentTime;
  const isMySession = currentUser.toLowerCase() === address?.toLowerCase();
  const timeLeft = Math.max(0, sessionEndsAt - currentTime);

  const calculatePayment = () => {
    const durationSeconds = parseInt(paymentDuration) * 60;
    // Use the applicable fee returned from the contract (already accounts for whitelist status)
    const totalCost = applicableFee * BigInt(durationSeconds);
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
    if (!tokenAddress || !address || !chain) return;
    
    const amount = calculatePayment();
    try {
      await approveToken({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [deviceAddress as `0x${string}`, amount],
        chain,
        account: address
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleActivate = async () => {
    if (!address || !chain) return;
    
    setTxError('');
    setTxSuccess('');
    setIsTransacting(true);
    
    const durationSeconds = parseInt(paymentDuration) * 60;
    const payment = calculatePayment();
    
    try {
      if (useNativeToken) {
        // For native token, send ETH/HBAR value with the transaction
        // CRITICAL FIX: wagmi assumes 18 decimals for native tokens, but HBAR uses 8 decimals
        // We need to convert our 8-decimal value to 18-decimal format for wagmi
        let paymentValue = payment;
        
        if (chainId === 296) { // Hedera testnet
          // Convert from 8-decimal HBAR format to 18-decimal format for wagmi
          // Multiply by 10^10 to go from 8 decimals to 18 decimals
          const conversionFactor = 10n ** 10n;
          paymentValue = payment * conversionFactor;
        }
        
        await activateDevice({
          address: deviceAddress as `0x${string}`,
          abi: DEVICE_CONTRACT_ABI,
          functionName: 'activate',
          args: [BigInt(durationSeconds)],
          value: paymentValue, // Send native token value
          chain,
          account: address
        });
      } else {
        // For ERC20 tokens, no value needed (approval already done)
        await activateDevice({
          address: deviceAddress as `0x${string}`,
          abi: DEVICE_CONTRACT_ABI,
          functionName: 'activate',
          args: [BigInt(durationSeconds)],
          chain,
          account: address
        });
      }
      
      // Don't show success message immediately - wait for transaction confirmation
      // The useWaitForTransactionReceipt hook will handle the success/failure
      
    } catch (error: any) {
      console.error('Activation failed:', error);
      let errorMessage = 'Transaction failed. Please try again.';
      
      if (error.message?.includes('insufficient funds')) {
        errorMessage = `Insufficient ${tokenSymbol} balance. You need ${formatTokenAmount(payment)} ${tokenSymbol}.`;
      } else if (error.message?.includes('execution reverted')) {
        if (error.message?.includes('Insufficient ETH sent') || error.message?.includes('Insufficient balance')) {
          errorMessage = `Insufficient payment. The contract requires exactly ${formatTokenAmount(payment)} ${tokenSymbol}.`;
        } else if (error.message?.includes('Device is busy')) {
          errorMessage = 'Device is currently busy. Please wait for the current session to end.';
        } else {
          errorMessage = 'Transaction was rejected by the contract. Please check your inputs.';
        }
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      }
      
      setTxError(errorMessage);
    } finally {
      setIsTransacting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!address || !chain) return;
    
    setTxError('');
    setTxSuccess('');
    setIsTransacting(true);
    
    try {
      await deactivateDevice({
        address: deviceAddress as `0x${string}`,
        abi: DEVICE_CONTRACT_ABI,
        functionName: 'deactivate',
        chain,
        account: address
      });
      
      // Don't show success message immediately - wait for transaction confirmation
      
    } catch (error: any) {
      console.error('Deactivation failed:', error);
      let errorMessage = 'Deactivation failed. Please try again.';
      
      if (error.message?.includes('Not authorized')) {
        errorMessage = 'Only the user who activated the device can deactivate it.';
      } else if (error.message?.includes('Device not active')) {
        errorMessage = 'Device is not currently active.';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      }
      
      setTxError(errorMessage);
    } finally {
      setIsTransacting(false);
    }
  };

  const needsApproval = () => {
    if (useNativeToken) return false; // No approval needed for native token
    
    const payment = calculatePayment();
    if (payment === 0n) return false; // No approval needed for free access
    return !allowance || (allowance as bigint) < payment;
  };

  const hasEnoughBalance = () => {
    const payment = calculatePayment();
    if (payment === 0n) return true; // Always have enough for free access
    
    if (useNativeToken) {
      return ethBalanceData?.value && ethBalanceData.value >= payment;
    } else {
      return tokenBalance && (tokenBalance as bigint) >= payment;
    }
  };

  if (isLoadingEssential) {
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

      {/* Transaction Success Alert */}
      {txSuccess && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {txSuccess}
          </AlertDescription>
        </Alert>
      )}

      {/* Transaction Error Alert */}
      {txError && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {txError}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="device" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="device">Device Control</TabsTrigger>
          <TabsTrigger value="info">Device Info</TabsTrigger>
          <TabsTrigger value="whitelist">Users ({allRegisteredUsers?.length || 0})</TabsTrigger>
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
                      {applicableFee === 0n ? 'FREE' : `${formatTokenAmount(applicableFee)} ${tokenSymbol}/sec`}
                    </span>
                  </div>
                  
                  {isWhitelisted && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <Star className="w-4 h-4" />
                      <span>Whitelisted - {applicableFee === 0n ? 'Free Access' : 'Reduced Rate'}</span>
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
                      {applicableFee === 0n ? 'FREE' : `${formatTokenAmount(applicableFee)} ${tokenSymbol}/sec`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>
                      {applicableFee === 0n ? 'FREE' : `${formatTokenAmount(calculatePayment())} ${tokenSymbol}`}
                    </span>
                  </div>
                </div>

                {/* Balance check */}
                {tokenBalance !== undefined && applicableFee > 0n && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Your balance: {formatTokenAmount(tokenBalance as bigint)} {tokenSymbol}
                  </div>
                )}

                {/* Insufficient balance warning */}
                {!hasEnoughBalance() && applicableFee > 0n && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient {tokenSymbol} balance. You need {formatTokenAmount(calculatePayment())} {tokenSymbol} but only have {formatTokenAmount((tokenBalance as bigint) || 0n)} {tokenSymbol}.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  {applicableFee > 0n && needsApproval() && hasEnoughBalance() && (
                    <Button 
                      onClick={handleApprove}
                      className="w-full"
                      disabled={isApproving || !paymentDuration || parseInt(paymentDuration) <= 0}
                    >
                      {isApproving ? "Approving..." : `Approve ${tokenSymbol}`}
                    </Button>
                  )}
                  
                  {(applicableFee === 0n || (!needsApproval() && hasEnoughBalance())) && (
                    <Button 
                      onClick={handleActivate}
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                      disabled={isActivating || isTransacting || !paymentDuration || parseInt(paymentDuration) <= 0}
                    >
                      {isActivating || isTransacting ? "Processing..." : (isActiveSession ? "Extend Session" : "Activate Device")}
                    </Button>
                  )}

                  {isMySession && (
                    <Button 
                      onClick={handleDeactivate}
                      className="w-full bg-red-500 hover:bg-red-600"
                      disabled={isDeactivating || isTransacting}
                    >
                      {isDeactivating || isTransacting ? "Processing..." : "Deactivate Device"}
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
                <span>Registered Users ({allRegisteredUsers?.length || 0})</span>
              </CardTitle>
              <CardDescription>
                All users registered in the InfraLink system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allUsersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : !allRegisteredUsers || allRegisteredUsers.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No registered users yet
                </p>
              ) : (
                <div className="space-y-3">
                  {allRegisteredUsers.map((addr: string, index: number) => (
                    <div key={addr} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Registered User</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{addr}</p>
                          <p className="text-xs text-gray-500">
                            {addr.toLowerCase() === address?.toLowerCase() && userIsWhitelisted && isFreeFromInfo 
                              ? 'Free Access' 
                              : addr.toLowerCase() === address?.toLowerCase() && userIsWhitelisted
                                ? `${formatTokenAmount(whitelistFeeFromInfo || 0n)} ${tokenSymbol}/sec`
                                : 'Registered'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {addr.toLowerCase() === address?.toLowerCase() && userIsWhitelisted && isFreeFromInfo && (
                          <Badge className="bg-green-100 text-green-800 text-xs">FREE</Badge>
                        )}
                        {addr.toLowerCase() === address?.toLowerCase() && (
                          <Badge className="bg-blue-100 text-blue-800">You</Badge>
                        )}
                      </div>
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
