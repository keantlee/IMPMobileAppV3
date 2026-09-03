import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import ScreenNames from '../../../navigation/screenNames';
import { styles } from './styles';
import { renderAlertPng } from '../../../assets/icons';
import { useAuthStore } from '../../../store/useAuthStore';

interface UploadRouteParams {
    serverMessage?:     string;
    transactionId?:     string;
    referenceNo?:       string;
    voucherId?:         string;
    rsbsaNo?:           string;
    shortname?:         string;
}

const UploadConfirmationScreen = () => {
    const navigation     = useNavigation<any>();
    const route          = useRoute<any>();
    const userProfile    = useAuthStore.getState().user;
    const supplierId     = userProfile?.userId;

    console.log("[UPLOAD CONFIRMATION SCREEN] route: ", route);

    const { 
        serverMessage, 
        transactionId, 
        referenceNo, 
        voucherId, 
        rsbsaNo, 
        shortname 
    } = (route.params || {}) as UploadRouteParams;

    console.log("[UPLOAD CONFIRMATION SCREEN] UploadRouteParams:", { transactionId, referenceNo, rsbsaNo, supplierId, shortname });

    // Anti-Back-Loop Safety Net: Block hardware back button completely on success screen
    useEffect(() => {
        const blockBackAction = () => {
            // Returning true tells Android we handled the press and explicitly blocks the default back action
            return true; 
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", blockBackAction);
        return () => backHandler.remove();
    }, []);

    const handleContinueUploading = () => {
        console.warn("[UPLOAD CONFIRMATION SCREEN] Navigating to Upload Attachments Screen...");
        
        navigation.navigate(ScreenNames.TRANSACTION_STACK.UPLOAD_ATTACHMENTS, {
            voucherId,
            rsbsaNo,
            referenceNo,
            transactionId,
            supplierId,
            shortname,
            // Required: the backend only persists attachments (voucher_transaction,
            // voucher_attachments, voucher_path) when prevRouteName is one of the
            // allowed screens. Without it, S3 upload succeeds but nothing is saved.
            prevRouteName: 'UploadConfirmationScreen',
        }); 
    };

    // const handleUploadLater = () => {
    //     console.warn("[UPLOAD CONFIRMATION SCREEN] Postponing submission. Returning to Home Screen.");
    //     navigation.navigate(ScreenNames.BOTTOM_TABS.HOME);
    // };

    return (        
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle='dark-content' backgroundColor={'#F8F9FA'} />
            
            <View style={styles.contentWrapper}>
                {/* Visual Success Accent Indicator */}
                <View style={styles.iconContainer}>
                    {/* Use PNG as fallback if MaterialIcons font is not yet linked natively */}
                    {/* {renderAlertPng('success')} */}
                    <MaterialIcons name="cloud-done" size={64} color="#009246" />
                </View>

                <Text style={styles.successTitle}>Transaction Saved!</Text>
                
                {serverMessage && (
                    <Text style={styles.serverNotificationText}>{serverMessage}</Text>
                )}

                <Text style={styles.infoDescription}>
                    To complete the transaction process fully, please upload the required verification attachments. 
                </Text> 

                <Text style={styles.warningDescription}>
                    If you did not complete the uploading of attachment process. This transaction will be marked as <Text style={{fontWeight: '700', color: '#E67E22'}}>Pending</Text> until your attachments are submitted.
                </Text>  

                {/* <Text style={styles.warningDescription}>
                    If you want to upload them later, this record will be marked as <Text style={{fontWeight: '700', color: '#E67E22'}}>Pending</Text> until your attachments are submitted.
                </Text>   */}

                {/* ACTION TRIGGER BUTTONS */}
                <TouchableOpacity
                    style={styles.primaryUploadButton}
                    onPress={handleContinueUploading}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="file-upload" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryButtonText}>Continue Uploading Now</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    style={styles.secondaryLaterButton}
                    onPress={handleUploadLater}
                    activeOpacity={0.7}
                >
                    <Text style={styles.secondaryButtonText}>Upload Later / Back to Home</Text>
                </TouchableOpacity> */}
            </View>
        </SafeAreaView>
    );
};

export default UploadConfirmationScreen;