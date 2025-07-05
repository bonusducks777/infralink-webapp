
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Zap, Wallet, Bell, Shield } from 'lucide-react';
import { formatEther, parseEther } from 'viem';

interface DeviceDashboardProps {
  deviceAddress: string;
  onBack: () => void;
}

export const DeviceDashboard = ({ deviceAddress, onBack }: DeviceDashboardProps) => {
  const { address } = useAccount();
  const [paymentDuration, setPaymentDuration] = useState('60'); // minutes
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Mock contract ABI - in real implementation, this would be the actual DeviceAccess ABI
  const mockDeviceABI = [
    {
      name: 'getDeviceInfo',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'caller', type: 'address' }],
      outputs: [
        { name: 'feePerSecond', type: 'uint256' },
        { name: 'isActive', type: 'bool' },
        { name: 'currentUser', type: 'address' },
        { name: 'sessionEndsAt', type: 'uint256' },
        { name: 'tokenAddress', type: 'address' },
        { name: 'isWhitelisted', type: 'bool' },
        { name: 'timeRemaining', type: 'uint256' }
      ]
    }
  ] as const;

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for demonstration
  const mockDeviceInfo = {
    feePerSecond: parseEther('0.001'), // 0.001 ETH per second
    isActive: true,
    currentUser: '0x742d35Cc6539C2a0E9BE85A2C1E6C5e4a0f70A20',
    sessionEndsAt: BigInt(currentTime + 1800), // 30 minutes from now
    tokenAddress: '0xA0b86a33E6E5FC1b63c4B6e3b3a5B6C9F1d2E3f4',
    isWhitelisted: false,
    timeRemaining: BigInt(1800) // 30 minutes
  };

  const isActiveSession = mockDeviceInfo.isActive && Number(mockDeviceInfo.sessionEndsAt) > currentTime;
  const isMySession = mockDeviceInfo.currentUser?.toLowerCase() === address?.toLowerCase();
  const timeLeft = Math.max(0, Number(mockDeviceInfo.sessionEndsAt) - currentTime);
  const sessionProgress = isActiveSession ? ((1800 - timeLeft) / 1800) * 100 : 0;

  const calculatePayment = () => {
    const durationSeconds = parseInt(paymentDuration) * 60;
    return Number(formatEther(mockDeviceInfo.feePerSecond * BigInt(durationSeconds)));
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
                  <Progress value={sessionProgress} className="h-2" />
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
                    {mockDeviceInfo.currentUser}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Fee per Second</span>
                <span className="font-mono">
                  {formatEther(mockDeviceInfo.feePerSecond)} ETH
                </span>
              </div>
              
              {mockDeviceInfo.isWhitelisted && (
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
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{paymentDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Rate:</span>
                <span>{formatEther(mockDeviceInfo.feePerSecond)} ETH/sec</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Cost:</span>
                <span>{calculatePayment().toFixed(6)} ETH</span>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              disabled={!paymentDuration || parseInt(paymentDuration) <= 0}
            >
              {isActiveSession ? "Extend Session" : "Activate Device"}
            </Button>

            {isMySession && (
              <Button variant="outline" className="w-full">
                End Session Early
              </Button>
            )}
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
            Get notified when the device becomes available
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
