import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Edit3, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';

// InfraLink Info Contract ABI
const INFRALINK_INFO_ABI = [
  // User Profile Functions
  "function getUserProfile(address user) external view returns (string memory name, string memory bio, string memory email, string memory avatar, bool exists, uint256 createdAt, uint256 updatedAt)",
  "function setUserProfile(string memory name, string memory bio, string memory email, string memory avatar) external",
  "function getUserWhitelistEntries(address user) external view returns (tuple(address deviceContract, string deviceName, string whitelistName, uint256 feePerSecond, bool isFree, bool isActive, uint256 addedAt, address addedBy)[])",
  "function getAllUserDevices(address user) external view returns (tuple(address deviceContract, string deviceName, string whitelistName, uint256 feePerSecond, bool isFree, bool isActive, uint256 addedAt, address addedBy)[])",
  
  // Events
  "event UserProfileUpdated(address indexed user, string name, string bio)"
];

const INFRALINK_INFO_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual deployed address

interface UserProfileData {
  name: string;
  bio: string;
  email: string;
  avatar: string;
  exists: boolean;
  createdAt: number;
  updatedAt: number;
}

interface DeviceWhitelistEntry {
  deviceContract: string;
  deviceName: string;
  whitelistName: string;
  feePerSecond: bigint;
  isFree: boolean;
  isActive: boolean;
  addedAt: number;
  addedBy: string;
}

export const UserProfile = () => {
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [whitelistEntries, setWhitelistEntries] = useState<DeviceWhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: '',
    avatar: ''
  });

  // Load user profile and whitelist entries
  const loadUserData = async () => {
    if (!address || !isConnected) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Check if contract address is configured
      if (INFRALINK_INFO_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setError('InfraLink Info contract not configured. Please update INFRALINK_INFO_ADDRESS.');
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(INFRALINK_INFO_ADDRESS, INFRALINK_INFO_ABI, provider);
      
      // Get user profile
      const profileData = await contract.getUserProfile(address);
      const userProfile: UserProfileData = {
        name: profileData[0],
        bio: profileData[1],
        email: profileData[2],
        avatar: profileData[3],
        exists: profileData[4],
        createdAt: Number(profileData[5]),
        updatedAt: Number(profileData[6])
      };
      
      setProfile(userProfile);
      setFormData({
        name: userProfile.name,
        bio: userProfile.bio,
        email: userProfile.email,
        avatar: userProfile.avatar
      });
      
      // Get whitelist entries
      const whitelistData = await contract.getAllUserDevices(address);
      const entries: DeviceWhitelistEntry[] = whitelistData.map((entry: any) => ({
        deviceContract: entry.deviceContract,
        deviceName: entry.deviceName,
        whitelistName: entry.whitelistName,
        feePerSecond: entry.feePerSecond,
        isFree: entry.isFree,
        isActive: entry.isActive,
        addedAt: Number(entry.addedAt),
        addedBy: entry.addedBy
      }));
      
      setWhitelistEntries(entries);
      
    } catch (err: any) {
      console.error('Error loading user data:', err);
      if (err.message?.includes('network') || err.message?.includes('chain')) {
        setError('Unable to connect to InfraLink Info contract. Please check if you are connected to the correct blockchain network.');
      } else {
        setError('Failed to load user data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save user profile
  const saveProfile = async () => {
    if (!address || !isConnected) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(INFRALINK_INFO_ADDRESS, INFRALINK_INFO_ABI, signer);
      
      const tx = await contract.setUserProfile(
        formData.name,
        formData.bio,
        formData.email,
        formData.avatar
      );
      
      await tx.wait();
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Reload profile data
      setTimeout(() => {
        loadUserData();
        setSuccess('');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
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

  useEffect(() => {
    loadUserData();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>User Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to view your profile and device access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>User Profile</span>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
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

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading profile...</p>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={saveProfile} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profile?.name || '',
                      bio: profile?.bio || '',
                      email: profile?.email || '',
                      avatar: profile?.avatar || ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : profile?.exists ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {profile.avatar && (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{profile.name || 'No name set'}</h3>
                  <p className="text-sm text-gray-600">{profile.email || 'No email set'}</p>
                </div>
              </div>
              
              {profile.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                </div>
              )}
              
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>Created: {formatDate(profile.createdAt)}</span>
                <span>Updated: {formatDate(profile.updatedAt)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No profile found. Create your profile to get started!</p>
              <Button onClick={() => setIsEditing(true)}>
                Create Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Device Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {whitelistEntries.length > 0 ? (
            <div className="space-y-4">
              {whitelistEntries.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{entry.deviceName || 'Unnamed Device'}</h4>
                    <div className="flex items-center space-x-2">
                      {entry.isFree && <Badge variant="secondary">Free</Badge>}
                      {entry.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Whitelist Name:</span>
                      <span>{entry.whitelistName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee Rate:</span>
                      <span>{formatFee(entry.feePerSecond, entry.isFree)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device Contract:</span>
                      <span className="font-mono text-xs">{entry.deviceContract}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added:</span>
                      <span>{formatDate(entry.addedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No device access found</p>
              <p className="text-sm text-gray-500">Ask device owners to add you to their whitelist to gain access to devices.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
