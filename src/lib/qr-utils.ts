import QRCode from 'qrcode';

/**
 * Generate a QR code for a device contract address
 * This can be used by device owners to create QR codes for their devices
 */
export const generateDeviceQR = async (contractAddress: string): Promise<string> => {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(contractAddress, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate a QR code as SVG string
 */
export const generateDeviceQRSVG = async (contractAddress: string): Promise<string> => {
  try {
    const qrCodeSVG = await QRCode.toString(contractAddress, {
      type: 'svg',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
};

/**
 * Extract contract address from QR code data
 */
export const extractAddressFromQR = (qrData: string): string | null => {
  // Remove any whitespace and convert to lowercase for validation
  const cleanData = qrData.trim();
  
  // Check if it's a valid Ethereum address
  if (/^0x[a-fA-F0-9]{40}$/.test(cleanData)) {
    return cleanData;
  }
  
  // Try to extract address from various formats
  // e.g., "ethereum:0x..." or "https://etherscan.io/address/0x..."
  const addressMatch = cleanData.match(/0x[a-fA-F0-9]{40}/);
  if (addressMatch) {
    return addressMatch[0];
  }
  
  return null;
};
