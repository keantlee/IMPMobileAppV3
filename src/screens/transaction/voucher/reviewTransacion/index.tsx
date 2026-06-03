import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    FlatList,
    BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';

import ScreenNames from '../../../../navigation/screenNames';

import { styles } from './styles';

import { VoucherInfo } from '../../../../@types/voucher';

interface TransactionRouteParams {
    voucherInfo:  VoucherInfo;
    cart:         any[];  
    timer?:       number;
}

const ReviewTransactionScreen = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();

    const routeParams   = (route.params || {}) as TransactionRouteParams;
    const { 
        voucherInfo, 
        cart, 
        timer, 
    } = routeParams;

    console.log('[REVIEW TRANSACTION SCREEN] Incoming route params:', routeParams);

    // 1. Local state management

    // 2. Memoized
        
    // 3. Callbacks
    const handleSyncAndGoBack = useCallback(() => {
        navigation.navigate({
            name: ScreenNames.TRANSACTION_STACK.CHECKOUT,
            params: { 
                voucherInfo: voucherInfo,              // Keeps voucher data updated
                FinalCart:   cart,                     // Syncs the active items list
                timer:       timer                     // Keeps the running countdown alive
            },
            merge: true,
        });
    }, [navigation, voucherInfo, cart, timer]);

    // 4. useEffects - Sync on hardware back button press
    useEffect(() => {
        const hardwareBackAction = () => {
            handleSyncAndGoBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", hardwareBackAction);
        return () => backHandler.remove();
    }, [handleSyncAndGoBack]);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleSyncAndGoBack}
                activeOpacity={0.7}
            >
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Cart</Text>
            <View style={styles.backPlaceholder} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />

            {renderHeader()}

        </SafeAreaView>
    );
};

export default ReviewTransactionScreen;