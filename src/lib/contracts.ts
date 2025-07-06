// Contract addresses
export const DEVICE_CONTRACT_ADDRESS = "0xaff84326fc701dfb3c5881b2749dba27e9a98978";
export const INFRALINK_INFO_ADDRESS = "0x7aee0cbbcd0e5257931f7dc87f0345c1bb2aab39";

// Device Contract ABI
export const DEVICE_CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "secondsToActivate", "type": "uint256"}],
    "name": "activate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeviceDetails",
    "outputs": [
      {"internalType": "string", "name": "_deviceName", "type": "string"},
      {"internalType": "string", "name": "_deviceDescription", "type": "string"},
      {"internalType": "bool", "name": "_useNativeToken", "type": "bool"},
      {"internalType": "bool", "name": "_lastUserWasWhitelisted", "type": "bool"},
      {"internalType": "uint256", "name": "_whitelistFeePerSecond", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getDeviceInfo",
    "outputs": [
      {"internalType": "uint256", "name": "_feePerSecond", "type": "uint256"},
      {"internalType": "bool", "name": "_isActive", "type": "bool"},
      {"internalType": "address", "name": "_lastActivatedBy", "type": "address"},
      {"internalType": "uint256", "name": "_sessionEndsAt", "type": "uint256"},
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "bool", "name": "_isWhitelisted", "type": "bool"},
      {"internalType": "uint256", "name": "_timeRemaining", "type": "uint256"},
      {"internalType": "string", "name": "_tokenName", "type": "string"},
      {"internalType": "string", "name": "_tokenSymbol", "type": "string"},
      {"internalType": "uint8", "name": "_tokenDecimals", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feePerSecond",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// InfraLink Info Contract ABI
export const INFRALINK_INFO_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "userAddress", "type": "address"},
      {"internalType": "address", "name": "deviceContract", "type": "address"}
    ],
    "name": "getUserWhitelistInfo",
    "outputs": [
      {"internalType": "string", "name": "_whitelistName", "type": "string"},
      {"internalType": "bool", "name": "_isWhitelisted", "type": "bool"},
      {"internalType": "uint256", "name": "_feePerSecond", "type": "uint256"},
      {"internalType": "bool", "name": "_isFree", "type": "bool"},
      {"internalType": "uint256", "name": "_addedAt", "type": "uint256"},
      {"internalType": "address", "name": "_addedBy", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "deviceContract", "type": "address"}],
    "name": "getDeviceWhitelistInfo", 
    "outputs": [
      {"internalType": "address[]", "name": "addresses", "type": "address[]"},
      {"internalType": "string[]", "name": "names", "type": "string[]"},
      {"internalType": "uint256[]", "name": "fees", "type": "uint256[]"},
      {"internalType": "bool[]", "name": "isFree", "type": "bool[]"},
      {"internalType": "uint256", "name": "count", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "deviceContract", "type": "address"}
    ],
    "name": "isUserWhitelisted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "userAddress", "type": "address"}],
    "name": "getUserWhitelistEntries",
    "outputs": [
      {"internalType": "address[]", "name": "deviceContracts", "type": "address[]"},
      {"internalType": "string[]", "name": "deviceNames", "type": "string[]"},
      {"internalType": "string[]", "name": "whitelistNames", "type": "string[]"},
      {"internalType": "uint256[]", "name": "feesPerSecond", "type": "uint256[]"},
      {"internalType": "bool[]", "name": "isFree", "type": "bool[]"},
      {"internalType": "bool[]", "name": "isActive", "type": "bool[]"},
      {"internalType": "uint256[]", "name": "addedAt", "type": "uint256[]"},
      {"internalType": "address[]", "name": "addedBy", "type": "address[]"},
      {"internalType": "uint256", "name": "count", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserProfile",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "bio", "type": "string"},
      {"internalType": "string", "name": "email", "type": "string"},
      {"internalType": "string", "name": "avatar", "type": "string"},
      {"internalType": "bool", "name": "exists", "type": "bool"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "updatedAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllRegisteredUsers",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_bio", "type": "string"},
      {"internalType": "string", "name": "_email", "type": "string"},
      {"internalType": "string", "name": "_avatar", "type": "string"}
    ],
    "name": "updateUserProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// ERC20 Token ABI (for allowance and balance checks)
export const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Type definitions
export interface DeviceInfo {
  feePerSecond: bigint;
  isActive: boolean;
  lastActivatedBy: string;
  sessionEndsAt: bigint;
  token: string;
  isWhitelisted: boolean;
  timeRemaining: bigint;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
}

export interface DeviceDetails {
  deviceName: string;
  deviceDescription: string;
  useNativeToken: boolean;
  lastUserWasWhitelisted: boolean;
  whitelistFeePerSecond: bigint;
}

export interface WhitelistInfo {
  whitelistName: string;
  feePerSecond: bigint;
  isFree: boolean;
  addedAt: bigint;
  addedBy: string;
}

export interface UserProfile {
  name: string;
  bio: string;
  email: string;
  avatar: string;
  exists: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface RecentDevice {
  address: string;
  name: string;
  description: string;
  lastConnected: number;
  isWhitelisted?: boolean;
  whitelistName?: string;
}

export interface DeviceWhitelistEntry {
  deviceContract: string;
  deviceName: string;
  whitelistName: string;
  feePerSecond: bigint;
  isFree: boolean;
  isActive: boolean;
  addedAt: bigint;
  addedBy: string;
}
