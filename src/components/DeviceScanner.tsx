
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, FileText } from 'lucide-react';

interface DeviceScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceFound: (address: string) => void;
}

export const DeviceScanner = ({ isOpen, onClose, onDeviceFound }: DeviceScannerProps) => {
  const [manualAddress, setManualAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleManualSubmit = () => {
    if (manualAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      onDeviceFound(manualAddress);
    } else {
      alert('Please enter a valid Ethereum address');
    }
  };

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please use manual entry.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find Device</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Manual Entry</span>
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>QR Scan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Device Address</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button 
              onClick={handleManualSubmit} 
              className="w-full"
              disabled={!manualAddress}
            >
              Connect to Device
            </Button>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="text-center">
              {!isScanning ? (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                  <Button onClick={startCamera} className="w-full">
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 bg-black rounded-lg"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Point camera at device QR code
                  </p>
                  <Button onClick={stopCamera} variant="outline" className="w-full">
                    Stop Camera
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
