import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, FlatList, ScrollView, TouchableOpacity, StatusBar, BackHandler } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TextInput } from 'react-native-gesture-handler';

import { useAuthStore } from '../../../../store/useAuthStore';
import { styles } from './styles';

interface TransactionDetailRouteParams {
    
} 

const TransactionDetail = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();
    const userInfo      = useAuthStore.getState().user;
    const userId        = userInfo?.userId;
    
    const routeParams = (route.params || {}) as TransactionDetailRouteParams;

    // get transactionId, and referenceNo

    console.log("[TRANSACTION DETAIL SCREEN] route: ", route);

    console.log("[TRANSACTION DETAIL SCREEN] route: params", routeParams);

    useEffect(() => {
        const handleBackPress = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Transaction Details</Text>
                    <View style={styles.backButtonPlaceholder} />
                </View>
        </SafeAreaView>
    );
};

export default TransactionDetail;