import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Shield, Trash2, History } from 'lucide-react';
import { useRecentDevices } from '@/hooks/useRecentDevices';
import { RecentDevice } from '@/lib/contracts';

interface RecentDevicesProps {
  onDeviceSelect: (address: string) => void;
}

export const RecentDevices = ({ onDeviceSelect }: RecentDevicesProps) => {
  const { recentDevices, removeRecentDevice, clearRecentDevices } = useRecentDevices();

  const formatLastConnected = (timestamp: number) => {
    const now = Date.now();
    const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (recentDevices.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-500" />
            <CardTitle>Recent Devices</CardTitle>
          </div>
          <Button
            onClick={clearRecentDevices}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Quickly access your recently connected devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentDevices.map((device: RecentDevice) => (
            <div
              key={device.address}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-sm truncate">{device.name}</h3>
                    {device.isWhitelisted && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        {device.whitelistName || 'Whitelisted'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {device.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatLastConnected(device.lastConnected)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onDeviceSelect(device.address)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                >
                  Connect
                </Button>
                <Button
                  onClick={() => removeRecentDevice(device.address)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
