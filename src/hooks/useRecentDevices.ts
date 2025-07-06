import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { RecentDevice } from '@/lib/contracts';

const RECENT_DEVICES_STORAGE_KEY = 'infralink-recent-devices';
const MAX_RECENT_DEVICES = 5;

export const useRecentDevices = () => {
  const { address } = useWallet();
  const [recentDevices, setRecentDevices] = useState<RecentDevice[]>([]);

  // Load recent devices from localStorage
  useEffect(() => {
    if (!address) {
      setRecentDevices([]);
      return;
    }

    const stored = localStorage.getItem(`${RECENT_DEVICES_STORAGE_KEY}-${address}`);
    if (stored) {
      try {
        const devices = JSON.parse(stored);
        setRecentDevices(devices);
      } catch (error) {
        console.error('Failed to parse recent devices:', error);
        setRecentDevices([]);
      }
    }
  }, [address]);

  // Add a device to recent devices
  const addRecentDevice = (device: Omit<RecentDevice, 'lastConnected'>) => {
    if (!address) return;

    const newDevice: RecentDevice = {
      ...device,
      lastConnected: Date.now()
    };

    setRecentDevices(prev => {
      // Remove existing device with same address
      const filtered = prev.filter(d => d.address !== device.address);
      
      // Add new device to the beginning and limit to MAX_RECENT_DEVICES
      const updated = [newDevice, ...filtered].slice(0, MAX_RECENT_DEVICES);
      
      // Save to localStorage
      localStorage.setItem(`${RECENT_DEVICES_STORAGE_KEY}-${address}`, JSON.stringify(updated));
      
      return updated;
    });
  };

  // Remove a device from recent devices
  const removeRecentDevice = (deviceAddress: string) => {
    if (!address) return;

    setRecentDevices(prev => {
      const filtered = prev.filter(d => d.address !== deviceAddress);
      localStorage.setItem(`${RECENT_DEVICES_STORAGE_KEY}-${address}`, JSON.stringify(filtered));
      return filtered;
    });
  };

  // Clear all recent devices
  const clearRecentDevices = () => {
    if (!address) return;

    setRecentDevices([]);
    localStorage.removeItem(`${RECENT_DEVICES_STORAGE_KEY}-${address}`);
  };

  return {
    recentDevices,
    addRecentDevice,
    removeRecentDevice,
    clearRecentDevices
  };
};
