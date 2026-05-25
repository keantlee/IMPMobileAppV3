import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useBarcodeScannerOutput, Barcode } from 'react-native-vision-camera-barcode-scanner';
// tracks when this screen becomes active/focused
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { scanVoucherMutation } from '../../../api/transaction';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_BOX_SIZE = 250; 

const VoucherQR = () => {
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const [isScanning, setIsScanning] = useState(true);

    const navigation = useNavigation<any>();
    
    // returns true if the user is looking at this screen/tab
    const isFocused = useIsFocused();

    // 1. Initialize the mutation at the top root level of the component!
    const { mutate: verifyVoucher, isPending } = scanVoucherMutation();

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    // reset scanning state when returning to the tab
    useEffect(() => {
        if (isFocused) {
            console.log('Tab Focused: Resetting scanner to active mode.');
            setIsScanning(true);
        } else {
            console.log('Tab Blurred: Pausing scanner tracking.');
            setIsScanning(false);
        }
    }, [isFocused]);

    const barcodeOutput = useBarcodeScannerOutput({
        barcodeFormats: ['qr-code'],
        onBarcodeScanned(barcodes: Barcode[]) {
            // Block processing if camera is paused, blurred, OR currently handling an API transaction request
            if (barcodes.length === 0 || !isScanning || !isFocused || isPending) return;

            const rawBarcode = barcodes[0] as any;
            const scannedValue = rawBarcode.displayValue || rawBarcode.rawValue || rawBarcode.value || rawBarcode.text;
            
            if (!scannedValue) return;

            // Immediately turn off the scanning state flag to avoid double scans
            setIsScanning(false);
            console.log('[VOUCHER QR] Reference # found:', scannedValue);

            // Fire the mutation safely on-demand using .mutate() 
            verifyVoucher({
                voucherCode: scannedValue,
                navigation: navigation
            });
        },
        onError(error) {
            console.error('QR Scanner Output Runtime Error:', error);
        }
    });

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text style={styles.darkText}>Waiting for camera permissions...</Text>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.center}>
                <Text style={styles.darkText}>No camera device detected.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera Preview - only active when tab is explicitly focused */}
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isScanning && isFocused}
                outputs={[barcodeOutput]} 
            />
            
            {/* VIEW FINDER MASK OVERLAY LAYOUT */}
            <View style={styles.overlayContainer}>
                <View style={[styles.mask, styles.topMask]} />

                <View style={styles.middleRow}>
                    <View style={styles.mask} />
                    
                    <View style={styles.viewfinder}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    
                    <View style={styles.mask} />
                </View>

                <View style={[styles.mask, styles.bottomMask]}>
                    <View style={styles.textWrapper}>
                        <Text style={styles.statusText}>
                            {isScanning ? "ALIGN VOUCHER QR CODE" : "VALIDATING THE VOUCHER..."}
                        </Text>
                        <Text style={styles.subText}>
                            Position the code directly inside the frame boxes
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const CORNER_RADIUS = 24;
const CORNER_THICKNESS = 4;
const MASK_COLOR = 'rgba(0, 0, 0, 0.65)'; 

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    darkText: { color: '#333', fontSize: 16 },
    overlayContainer: { ...StyleSheet.absoluteFill, justifyContent: 'space-between' },
    mask: { flex: 1, backgroundColor: MASK_COLOR },
    topMask: { justifyContent: 'flex-end' },
    middleRow: { flexDirection: 'row', height: SCAN_BOX_SIZE },
    viewfinder: { width: SCAN_BOX_SIZE, height: SCAN_BOX_SIZE, backgroundColor: 'transparent', position: 'relative' },
    bottomMask: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 40 },
    corner: { position: 'absolute', width: CORNER_RADIUS, height: CORNER_RADIUS, borderColor: '#00FFCC', borderWidth: CORNER_THICKNESS },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
    textWrapper: { alignItems: 'center', paddingHorizontal: 30 },
    statusText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center', marginBottom: 8 },
    subText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: '500', textAlign: 'center' }
});

export default VoucherQR;