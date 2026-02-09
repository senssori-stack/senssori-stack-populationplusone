/**
 * PDF Helper - Opens educational astrology PDF documents
 * Uses expo-sharing to share/download PDF files
 * Uses Linking to view PDFs in device's native viewer
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Alert, Linking, Platform } from 'react-native';

// PDF asset definitions
export const PDF_RESOURCES = {
    decans: {
        name: 'Learning the Thirty-Six Decans',
        description: 'Complete guide to the 36 decans in astrology',
        filename: 'learning-the-thirty-six-decans-2016-09-16.pdf',
        asset: require('../../../assets/pdfs/learning-the-thirty-six-decans-2016-09-16.pdf'),
    },
    quickReference: {
        name: 'Astrology Quick Reference Sheets',
        description: 'Quick reference cards for astrological symbols',
        filename: 'benebell-wen-astrology-quick-reference-sheets.pdf',
        asset: require('../../../assets/pdfs/benebell-wen-astrology-quick-reference-sheets.pdf'),
    },
    twelveSignas: {
        name: 'Learning the Twelve Astrological Signs',
        description: 'Complete guide to the 12 zodiac signs',
        filename: 'learning-the-twelve-astrological-signs-2016-09-16.pdf',
        asset: require('../../../assets/pdfs/learning-the-twelve-astrological-signs-2016-09-16.pdf'),
    },
};

export type PDFResourceKey = keyof typeof PDF_RESOURCES;

/**
 * Prepares a PDF and returns the local file URI
 */
async function preparePDF(pdfKey: PDFResourceKey): Promise<{ uri: string; info: typeof PDF_RESOURCES.decans } | null> {
    try {
        const pdfInfo = PDF_RESOURCES[pdfKey];
        if (!pdfInfo) {
            Alert.alert('Error', 'PDF not found');
            return null;
        }

        // Load the asset
        const asset = Asset.fromModule(pdfInfo.asset);
        await asset.downloadAsync();

        if (!asset.localUri) {
            Alert.alert('Error', 'Could not load PDF');
            return null;
        }

        // Copy to cache with proper filename
        const destFile = new File(Paths.cache, pdfInfo.filename);
        const sourceFile = new File(asset.localUri);
        await sourceFile.copy(destFile);

        return { uri: destFile.uri, info: pdfInfo };
    } catch (error) {
        console.error('Error preparing PDF:', error);
        Alert.alert('Error', 'Could not load PDF document');
        return null;
    }
}

/**
 * Views a PDF document in the device's native PDF viewer
 */
export async function viewPDF(pdfKey: PDFResourceKey): Promise<void> {
    const prepared = await preparePDF(pdfKey);
    if (!prepared) return;

    try {
        if (Platform.OS === 'android') {
            // On Android, use IntentLauncher to open with PDF viewer
            const contentUri = await FileSystem.getContentUriAsync(prepared.uri);
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                type: 'application/pdf',
            });
        } else if (Platform.OS === 'ios') {
            // On iOS, use Linking to open the file
            const canOpen = await Linking.canOpenURL(prepared.uri);
            if (canOpen) {
                await Linking.openURL(prepared.uri);
            } else {
                // Fallback: use share sheet which shows Quick Look on iOS
                await Sharing.shareAsync(prepared.uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: prepared.info.name,
                });
            }
        } else if (Platform.OS === 'web') {
            window.open(prepared.uri, '_blank');
        }
    } catch (error) {
        console.error('Error viewing PDF:', error);
        // Fallback to share sheet
        await savePDF(pdfKey);
    }
}

/**
 * Saves/shares a PDF document (opens share sheet for user to save)
 */
export async function savePDF(pdfKey: PDFResourceKey): Promise<void> {
    const prepared = await preparePDF(pdfKey);
    if (!prepared) return;

    try {
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
            await Sharing.shareAsync(prepared.uri, {
                mimeType: 'application/pdf',
                dialogTitle: `Save ${prepared.info.name}`,
            });
        } else if (Platform.OS === 'web') {
            // For web, create a download link
            const link = document.createElement('a');
            link.href = prepared.uri;
            link.download = prepared.info.filename;
            link.click();
        } else {
            Alert.alert(
                'PDF Ready',
                `"${prepared.info.name}" is ready but saving is not available on this device.`
            );
        }
    } catch (error) {
        console.error('Error saving PDF:', error);
        Alert.alert('Error', 'Could not save PDF document');
    }
}

/**
 * Opens or shares a PDF document (legacy - now calls savePDF)
 */
export async function openPDF(pdfKey: PDFResourceKey): Promise<void> {
    return savePDF(pdfKey);
}

/**
 * Opens all PDFs for download
 */
export function getAllPDFResources() {
    return Object.entries(PDF_RESOURCES).map(([key, value]) => ({
        key: key as PDFResourceKey,
        ...value,
    }));
}
