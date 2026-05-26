/**
 * UPI Payment Utilities
 * Generates UPI payment strings and QR codes for seamless payments
 * UPI ID: pickurstay@ybl
 */

import QRCode from 'qrcode';

interface UPIPaymentParams {
  upiId: string;
  merchantName: string;
  amount: number;
  transactionRef: string;
}

/**
 * Generate UPI payment URL string
 * Format: upi://pay?pa=UPI_ID&pn=MERCHANT_NAME&am=AMOUNT&tr=TXN_REF&cu=INR
 */
export function generateUPIString(params: UPIPaymentParams): string {
  const { upiId, merchantName, amount, transactionRef } = params;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount.toFixed(2)}&tr=${encodeURIComponent(transactionRef)}&cu=INR`;
  return upiUrl;
}

/**
 * Generate QR code data URL from UPI payment string
 */
export async function generatePaymentQR(params: UPIPaymentParams): Promise<string> {
  const upiString = generateUPIString(params);
  try {
    const qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 256,
      margin: 2,
      color: {
        dark: '#6B1A1A', // Maroon brand color
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    throw new Error('QR code generation failed');
  }
}

/**
 * Validate UPI ID format
 */
export function isValidUPIId(upiId: string): boolean {
  return /^[\w.-]+@[\w]+$/.test(upiId);
}

/**
 * Default merchant UPI configuration
 */
export const MERCHANT_UPI = {
  upiId: import.meta.env.VITE_UPI_ID || 'pickurstay@ybl',
  merchantName: 'PickUrStay Hotels',
};

/**
 * Open UPI app via deep link
 */
export function openUPIApp(params: UPIPaymentParams): void {
  const upiString = generateUPIString(params);
  window.location.href = upiString;
}
