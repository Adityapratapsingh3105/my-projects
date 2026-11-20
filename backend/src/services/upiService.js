import QRCode from 'qrcode';

/**
 * Generates an NPCI-compliant UPI payment URL.
 * Spec: upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}
 */
export function generateUpiLink({ upiId, payeeName, amount, note = 'SplitMate Hostel Settlement' }) {
  const cleanUpi = (upiId || '').trim();
  const cleanName = (payeeName || 'Hostel Friend').trim();
  const formattedAmount = Number(amount || 0).toFixed(2);
  const cleanNote = (note || 'SplitMate Settlement').trim().substring(0, 40);

  const params = new URLSearchParams({
    pa: cleanUpi,
    pn: cleanName,
    am: formattedAmount,
    cu: 'INR',
    tn: cleanNote
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates a high-quality Data URL (base64 PNG) QR code for a UPI link.
 */
export async function generateUpiQrCode(upiLink) {
  if (!upiLink) return '';
  try {
    const dataUrl = await QRCode.toDataURL(upiLink, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 280,
      color: {
        dark: '#031726',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('QR Code Generation Error:', err.message);
    return '';
  }
}
