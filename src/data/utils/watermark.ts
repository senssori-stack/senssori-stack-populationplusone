import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface WatermarkOptions {
  includeQRCode?: boolean;
  includeWebsite?: boolean;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  opacity?: number;
}

export const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
  includeQRCode: false, // QR codes can be intrusive for social sharing
  includeWebsite: true,
  position: 'bottom-right',
  opacity: 0.7
};

/**
 * Adds a subtle watermark to birth announcements for viral marketing
 * when shared on social media. The watermark includes our website URL
 * and optionally a QR code.
 */
export function generateWatermarkHTML(options: WatermarkOptions = DEFAULT_WATERMARK_OPTIONS): string {
  const { includeQRCode, includeWebsite, position, opacity } = { ...DEFAULT_WATERMARK_OPTIONS, ...options };
  
  const positionStyles = {
    'bottom-right': 'bottom: 10px; right: 10px; text-align: right;',
    'bottom-center': 'bottom: 10px; left: 50%; transform: translateX(-50%); text-align: center;',
    'bottom-left': 'bottom: 10px; left: 10px; text-align: left;'
  };

  let watermarkContent = '';
  
  if (includeWebsite) {
    watermarkContent += `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        color: rgba(100, 100, 100, ${opacity});
        font-weight: 500;
        letter-spacing: 0.3px;
      ">
        Made with BirthStudio.app
      </div>
    `;
  }

  if (includeQRCode) {
    // Generate QR code URL pointing to app download page
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('https://birthstudio.app')}`;
    watermarkContent += `
      <img src="${qrCodeURL}" style="
        width: 24px;
        height: 24px;
        opacity: ${opacity};
        margin-top: 4px;
      " alt="Download App" />
    `;
  }

  return `
    <div style="
      position: absolute;
      ${positionStyles[position || 'bottom-right']}
      z-index: 1000;
      pointer-events: none;
    ">
      ${watermarkContent}
    </div>
  `;
}

/**
 * Export announcement with watermark for social media sharing
 */
export async function exportWithWatermark(
  componentHTML: string,
  options: WatermarkOptions = DEFAULT_WATERMARK_OPTIONS,
  filename: string = 'birth-announcement'
): Promise<void> {
  try {
    const watermark = generateWatermarkHTML(options);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            position: relative;
          }
          .announcement-container {
            position: relative;
            width: 100%;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <div class="announcement-container">
          ${componentHTML}
          ${watermark}
        </div>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: 2550, // 8.5" at 300 DPI
      height: 3300 // 11" at 300 DPI
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Birth Announcement',
        UTI: 'com.adobe.pdf'
      });
    } else {
      console.log('Sharing not available on this platform');
    }
  } catch (error) {
    console.error('Error exporting with watermark:', error);
    throw error;
  }
}

/**
 * Store email for marketing purposes (integrate with your backend)
 */
export async function captureEmailForMarketing(email: string, babyName: string, birthDate: string): Promise<void> {
  if (!email || !email.includes('@')) {
    return; // Skip invalid emails
  }

  try {
    // TODO: Replace with your actual backend endpoint
    const response = await fetch('https://your-backend.com/api/capture-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        babyName: babyName.trim(),
        birthDate,
        source: 'birth-announcement-app',
        timestamp: new Date().toISOString(),
        platform: Platform.OS
      })
    });

    if (!response.ok) {
      console.warn('Failed to capture email for marketing');
    }
  } catch (error) {
    // Fail silently - don't break the user experience
    console.warn('Email capture failed:', error);
  }
}