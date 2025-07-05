
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface DeviceScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceFound: (address: string) => void;
}

export const DeviceScanner = ({ isOpen, onClose, onDeviceFound }: DeviceScannerProps) => {
  const [manualAddress, setManualAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // QR code detection using basic pattern matching
  const detectQRCode = (imageData: ImageData) => {
    // This is a simplified QR code detection
    // In a real implementation, you'd use a proper QR code library
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Look for QR code patterns (simplified)
    // This is just a placeholder - real QR detection would be more complex
    return null;
  };

  const validateEthereumAddress = (address: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    setIsValidAddress(isValid);
    return isValid;
  };

  const handleManualSubmit = async () => {
    setError('');
    
    if (!manualAddress.trim()) {
      setError('Please enter a contract address');
      return;
    }

    if (!validateEthereumAddress(manualAddress)) {
      setError('Please enter a valid Ethereum address (0x followed by 40 hex characters)');
      return;
    }

    // Try to validate the contract by checking if it's a smart contract
    try {
      // Check if we have ethereum provider
      if (!(window as any).ethereum) {
        setError('MetaMask or another Web3 wallet is required to connect to devices.');
        return;
      }
      
      // Try to get network info
      const provider = (window as any).ethereum;
      const chainId = await provider.request({ method: 'eth_chainId' });
      
      // Try to get code at the address to verify it's a contract
      const code = await provider.request({
        method: 'eth_getCode',
        params: [manualAddress, 'latest']
      });
      
      if (code === '0x') {
        setError('The provided address does not appear to be a smart contract. Please verify the address and ensure you are on the correct network.');
        return;
      }
      
      onDeviceFound(manualAddress);
    } catch (err: any) {
      console.error('Contract validation error:', err);
      
      // Handle different types of errors
      if (err.code === 4001) {
        setError('Please connect your wallet to continue.');
      } else if (err.code === -32002) {
        setError('Please check your wallet - there may be a pending connection request.');
      } else if (err.message?.includes('network') || err.message?.includes('chain')) {
        setError('Unable to connect to the device contract. Please check if you are connected to the correct blockchain network (the same network where the device contract is deployed).');
      } else if (err.message?.includes('not found') || err.message?.includes('does not exist')) {
        setError('Contract not found at this address. Please verify the address and ensure you are on the correct network.');
      } else {
        setError('Unable to connect to device. Please verify the contract address is correct and you are on the right network.');
      }
    }
  };

  const startCamera = async () => {
    setError('');
    setIsScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play();
          startQRDetection();
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please ensure you have granted camera permissions or use manual entry.');
      setIsScanning(false);
    }
  };

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const scan = () => {
      if (!isScanning) return;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Attempt to detect QR code
      const qrResult = detectQRCode(imageData);
      
      if (qrResult && validateEthereumAddress(qrResult)) {
        onDeviceFound(qrResult);
        stopCamera();
        return;
      }

      // Continue scanning
      requestAnimationFrame(scan);
    };

    // Start scanning
    scan();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopCamera();
    setError('');
    setManualAddress('');
    setIsValidAddress(false);
    onClose();
  };

  useEffect(() => {
    if (manualAddress) {
      validateEthereumAddress(manualAddress);
    } else {
      setIsValidAddress(false);
    }
  }, [manualAddress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
              <Label htmlFor="address">Device Contract Address</Label>
              <div className="relative">
                <Input
                  id="address"
                  placeholder="0x..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className={`font-mono pr-10 ${isValidAddress ? 'border-green-500' : ''}`}
                />
                {manualAddress && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidAddress ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the Ethereum contract address of the device you want to connect to
              </p>
            </div>

            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleManualSubmit} 
              className="w-full"
              disabled={!manualAddress || !isValidAddress}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan a QR code containing the device contract address
                  </p>
                  <Button onClick={startCamera} className="w-full">
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-48 bg-black rounded-lg"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Point camera at device QR code
                  </p>
                  <Button onClick={stopCamera} variant="outline" className="w-full">
                    Stop Camera
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
