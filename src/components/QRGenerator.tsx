import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { generateDeviceQR, generateDeviceQRSVG } from '@/lib/qr-utils';

interface QRGeneratorProps {
  contractAddress?: string;
}

export const QRGenerator = ({ contractAddress = '' }: QRGeneratorProps) => {
  const [address, setAddress] = useState(contractAddress);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [qrCodeSVG, setQrCodeSVG] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const validateAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const generateQRCode = async () => {
    if (!address || !validateAddress(address)) {
      setError('Please enter a valid Ethereum contract address');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const [dataURL, svgString] = await Promise.all([
        generateDeviceQR(address),
        generateDeviceQRSVG(address)
      ]);

      setQrCodeDataURL(dataURL);
      setQrCodeSVG(svgString);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `infralink-device-${address.slice(0, 8)}.png`;
    link.href = qrCodeDataURL;
    link.click();
  };

  const downloadQRCodeSVG = () => {
    if (!qrCodeSVG) return;

    const blob = new Blob([qrCodeSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `infralink-device-${address.slice(0, 8)}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  useEffect(() => {
    if (contractAddress) {
      setAddress(contractAddress);
    }
  }, [contractAddress]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>QR Code Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contract-address">Device Contract Address</Label>
          <div className="flex space-x-2">
            <Input
              id="contract-address"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyAddress}
              disabled={!address}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={generateQRCode} 
          disabled={!address || isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </Button>

        {qrCodeDataURL && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCodeDataURL}
                alt="Device QR Code"
                className="border rounded-lg"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={downloadQRCode}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button
                variant="outline"
                onClick={downloadQRCodeSVG}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                SVG
              </Button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              <p>Print this QR code and place it on your device.</p>
              <p>Users can scan it to connect to your device.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
