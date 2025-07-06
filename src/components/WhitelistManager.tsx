import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Trash2, Edit3, Shield, AlertCircle, CheckCircle, Search } from 'lucide-react';

// InfraLink Info Contract ABI (extended for device management)
const INFRALINK_INFO_ABI = [
  // Device Management Functions
  "function registerDevice(address deviceContract, string memory _name, string memory _description) external",
  "function updateDeviceInfo(address deviceContract, string memory _name, string memory _description) external",
  "function deviceRegistry(address deviceContract) external view returns (string memory name, string memory description, address owner, bool isRegistered, uint256 registeredAt)",
  "function addUserToWhitelist(address user, address deviceContract, string memory whitelistName, uint256 feePerSecond, bool isFree) external",
  "function removeUserFromWhitelist(address user, address deviceContract) external",
  "function updateWhitelistEntry(address user, address deviceContract, string memory whitelistName, uint256 feePerSecond, bool isFree) external",
  "function getUserWhitelists(address user) external view returns (tuple(address deviceContract, string deviceName, string whitelistName, uint256 feePerSecond, bool isFree, bool isActive, uint256 addedAt, address addedBy)[])",
  "function getUserProfile(address user) external view returns (string memory name, string memory bio, string memory email, string memory avatar, bool exists, uint256 createdAt, uint256 updatedAt)",
  
  // Admin Functions
  "function addDeviceAdmin(address deviceContract, address admin) external",
  "function removeDeviceAdmin(address deviceContract, address admin) external",
  "function deviceAdmins(address deviceContract, address admin) external view returns (bool)",
  
  // Events
  "event DeviceRegistered(address indexed deviceContract, string name, address indexed owner)",
  "event WhitelistAdded(address indexed user, address indexed deviceContract, string whitelistName, uint256 feePerSecond, bool isFree)",
  "event WhitelistRemoved(address indexed user, address indexed deviceContract, address indexed removedBy)"
];

const INFRALINK_INFO_ADDRESS = "0x7aee0cbbcd0e5257931f7dc87f0345c1bb2aab39"; // Replace with actual deployed address

interface DeviceWhitelistEntry {
  user: string;
  whitelistName: string;
  feePerSecond: bigint;
  isFree: boolean;
  isActive: boolean;
  addedAt: number;
  addedBy: string;
  userProfile?: {
    name: string;
    bio: string;
    email: string;
    avatar: string;
    exists: boolean;
  };
}

interface DeviceInfo {
  name: string;
  description: string;
  owner: string;
  isRegistered: boolean;
  registeredAt: number;
}

interface WhitelistManagerProps {
  deviceContract: string;
  isOwner: boolean;
  onWhitelistUpdate?: () => void;
}

export const WhitelistManager = ({ deviceContract, isOwner, onWhitelistUpdate }: WhitelistManagerProps) => {
  const { address, isConnected } = useWallet();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [whitelistEntries, setWhitelistEntries] = useState<DeviceWhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state for adding/editing users
  const [formData, setFormData] = useState({
    userAddress: '',
    whitelistName: '',
    feePerSecond: '',
    isFree: false
  });

  // Load device info and whitelist
  const loadDeviceData = async () => {
    if (!deviceContract || !isConnected) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(INFRALINK_INFO_ADDRESS, INFRALINK_INFO_ABI, provider);
      
      // Get device info
      const deviceData = await contract.deviceRegistry(deviceContract);
      const info: DeviceInfo = {
        name: deviceData[0],
        description: deviceData[1],
        owner: deviceData[2],
        isRegistered: deviceData[3],
        registeredAt: Number(deviceData[4])
      };
      
      setDeviceInfo(info);
      
      // Note: The current contract doesn't support getting all whitelist entries for a device
      // This would require iterating through all users, which is not efficient
      // For now, we'll just provide functionality to add/remove users
      setWhitelistEntries([]);
      
    } catch (err: any) {
      console.error('Error loading device data:', err);
      if (err.message?.includes('network') || err.message?.includes('chain')) {
        setError('Unable to connect to InfraLink Info contract. Please check if you are connected to the correct blockchain network.');
      } else {
        setError('Failed to load device data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add user to whitelist
  const addUserToWhitelist = async () => {
    if (!address || !isConnected || !deviceContract) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate form data
      if (!formData.userAddress || !ethers.isAddress(formData.userAddress)) {
        setError('Please enter a valid user address');
        return;
      }
      
      if (!formData.whitelistName.trim()) {
        setError('Please enter a whitelist name');
        return;
      }
      
      if (!formData.isFree && !formData.feePerSecond) {
        setError('Please enter a fee per second or mark as free');
        return;
      }
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(INFRALINK_INFO_ADDRESS, INFRALINK_INFO_ABI, signer);
      
      const feePerSecond = formData.isFree ? 0n : ethers.parseEther(formData.feePerSecond);
      
      const tx = await contract.addUserToWhitelist(
        formData.userAddress,
        deviceContract,
        formData.whitelistName,
        feePerSecond,
        formData.isFree
      );
      
      await tx.wait();
      
      setSuccess('User added to whitelist successfully!');
      setIsAddingUser(false);
      setFormData({
        userAddress: '',
        whitelistName: '',
        feePerSecond: '',
        isFree: false
      });
      
      // Reload data
      setTimeout(() => {
        loadDeviceData();
        onWhitelistUpdate?.();
        setSuccess('');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error adding user to whitelist:', err);
      setError('Failed to add user to whitelist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove user from whitelist
  const removeUserFromWhitelist = async (userAddress: string) => {
    if (!address || !isConnected || !deviceContract) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(INFRALINK_INFO_ADDRESS, INFRALINK_INFO_ABI, signer);
      
      const tx = await contract.removeUserFromWhitelist(userAddress, deviceContract);
      await tx.wait();
      
      setSuccess('User removed from whitelist successfully!');
      
      // Reload data
      setTimeout(() => {
        loadDeviceData();
        onWhitelistUpdate?.();
        setSuccess('');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error removing user from whitelist:', err);
      setError('Failed to remove user from whitelist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register device if not already registered
  const registerDevice = async () => {
    if (!address || !isConnected || !deviceContract) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(INFRALINK_INFO_ADDRESS, INFRALINK_INFO_ABI, signer);
      
      const tx = await contract.registerDevice(
        deviceContract,
        "My Device", // Default name
        "Device managed via InfraLink" // Default description
      );
      
      await tx.wait();
      
      setSuccess('Device registered successfully!');
      
      // Reload data
      setTimeout(() => {
        loadDeviceData();
        setSuccess('');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error registering device:', err);
      setError('Failed to register device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format fee display
  const formatFee = (feePerSecond: bigint, isFree: boolean) => {
    if (isFree) return "Free";
    return `${ethers.formatEther(feePerSecond)} ETH/sec`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "Never";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Filter whitelist entries by search term
  const filteredEntries = whitelistEntries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.user.toLowerCase().includes(searchLower) ||
      entry.whitelistName.toLowerCase().includes(searchLower) ||
      entry.userProfile?.name.toLowerCase().includes(searchLower) ||
      entry.userProfile?.email.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    loadDeviceData();
  }, [deviceContract, isConnected, address]);

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Whitelist Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to manage device whitelist.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Device Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Device Name</h4>
                  <p className="text-gray-600">{deviceInfo.name || 'Unnamed Device'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Owner</h4>
                  <p className="text-gray-600 font-mono text-sm">{deviceInfo.owner}</p>
                </div>
              </div>
              
              {deviceInfo.description && (
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="text-gray-600">{deviceInfo.description}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Contract: {deviceContract}</span>
                <Badge variant={deviceInfo.isRegistered ? "default" : "secondary"}>
                  {deviceInfo.isRegistered ? "Registered" : "Not Registered"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading device information...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Whitelist Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Whitelist Management</span>
            </div>
            {isOwner && (
              <Button onClick={() => setIsAddingUser(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Add User Form */}
          {isAddingUser && (
            <div className="border rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-4">Add User to Whitelist</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userAddress">User Address</Label>
                    <Input
                      id="userAddress"
                      placeholder="0x..."
                      value={formData.userAddress}
                      onChange={(e) => setFormData({...formData, userAddress: e.target.value})}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whitelistName">Whitelist Name</Label>
                    <Input
                      id="whitelistName"
                      placeholder="VIP, Premium, etc."
                      value={formData.whitelistName}
                      onChange={(e) => setFormData({...formData, whitelistName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={formData.isFree}
                      onChange={(e) => setFormData({...formData, isFree: e.target.checked})}
                    />
                    <Label htmlFor="isFree">Free access</Label>
                  </div>
                  
                  {!formData.isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="feePerSecond">Fee per Second (ETH)</Label>
                      <Input
                        id="feePerSecond"
                        type="number"
                        step="0.000001"
                        placeholder="0.001"
                        value={formData.feePerSecond}
                        onChange={(e) => setFormData({...formData, feePerSecond: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={addUserToWhitelist} disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add User'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingUser(false);
                      setFormData({
                        userAddress: '',
                        whitelistName: '',
                        feePerSecond: '',
                        isFree: false
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Whitelist Entries */}
          {filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {entry.userProfile?.avatar && (
                        <img 
                          src={entry.userProfile.avatar} 
                          alt={entry.userProfile.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">
                          {entry.userProfile?.name || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-gray-600 font-mono">
                          {entry.user}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={entry.isFree ? "secondary" : "default"}>
                        {entry.whitelistName}
                      </Badge>
                      {entry.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeUserFromWhitelist(entry.user)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee Rate:</span>
                      <span>{formatFee(entry.feePerSecond, entry.isFree)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added:</span>
                      <span>{formatDate(entry.addedAt)}</span>
                    </div>
                    {entry.userProfile?.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{entry.userProfile.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No users in whitelist</p>
              {isOwner && (
                <p className="text-sm text-gray-500">Click "Add User" to start building your whitelist.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
