import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, FlatList, ScrollView, TouchableOpacity, StatusBar, BackHandler } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TextInput } from 'react-native-gesture-handler';

import { useAuthStore } from '../../../store/useAuthStore';
import { styles } from './styles';
import ScreenNames from '../../../navigation/screenNames';

interface TransactionHistoryRouteParams {
    
}

interface IListItem {
    id: string;
    refNo: string;
    transactDate: string;
    amount: string;
    status: string;
}

const mockTransactions: IListItem[] = [
    { id: '1', refNo: 'REF-SVZ-8831', transactDate: 'May 22, 2026', amount: '₱15,000.00', status: 'Complete' },
    { id: '2', refNo: 'REF-RFDV-9912', transactDate: 'May 20, 2026', amount: '₱5,000.00', status: 'Complete' },
    { id: '3', refNo: 'REF-RFDV-4412', transactDate: 'May 19, 2026', amount: '₱7,500.00', status: 'Complete' },
    { id: '4', refNo: 'REF-CFDV-1029', transactDate: 'May 15, 2026', amount: '₱3,000.00', status: 'Complete' },
    { id: '5', refNo: 'REF-SVZ-3321', transactDate: 'May 12, 2026', amount: '₱15,000.00', status: 'Complete' },
];

const TransactionHistory = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();
    const userInfo      = useAuthStore.getState().user;
    const userId        = userInfo?.userId;
    
    const routeParams = (route.params || {}) as TransactionHistoryRouteParams;

    console.log("[TRANSACTION HISTORY SCREEN] route: ", route);

    console.log("[TRANSACTION HISTORY SCREEN] route: params", routeParams);

    // State management
    const [isLoading, setIsLoading]                         = useState<boolean>(false);
    const [search, setSearch]                               = useState<string>('');
    const [transactions, setTransactions]                   = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions]   = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing]                   = useState<boolean>(false);
    const searchRef                                         = useRef<TextInput>(null);

    // 
    useEffect(() => {
        const handleBackPress = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [navigation]);

    const handleTransactionDetail = () => {
        console.warn('Proceed to Transaction Details Screen');

        navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_DETAIL)
    };
    

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
                <Text style={styles.headerTitle}>Transaction History</Text>
                <View style={styles.backButtonPlaceholder} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

            {/* Transaction lists (at least 3 months of transaction history)*/}
            {/* Example: Month of June */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#2C3E50', marginBottom: 12 }}>
                June 
            </Text>
            {mockTransactions.map((item) => (
                <TouchableOpacity 
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={handleTransactionDetail}
                    style={{
                        backgroundColor: '#FAFAFA',
                        padding: 14,
                        borderRadius: 10,
                        marginBottom: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#EAEAEA'
                    }}
                >
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2C3E50', marginBottom: 4 }}>
                            {item.refNo}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#95A5A6' }}>
                            {item.transactDate}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#2E7D32', marginBottom: 4 }}>
                            {item.amount}
                        </Text>
                        <View style={{
                            backgroundColor: '#E8F5E9',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4
                        }}>
                            <Text style={{ fontSize: 10, color: '#2E7D32', fontWeight: '600' }}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            <Text style={{ fontSize: 18, fontWeight: '700', color: '#2C3E50', marginBottom: 12 }}>
                May
            </Text>
            {mockTransactions.map((item) => (
                <TouchableOpacity 
                    key={item.id}
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: '#FAFAFA',
                        padding: 14,
                        borderRadius: 10,
                        marginBottom: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#EAEAEA'
                    }}
                >
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2C3E50', marginBottom: 4 }}>
                            {item.refNo}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#95A5A6' }}>
                            {item.transactDate}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#2E7D32', marginBottom: 4 }}>
                            {item.amount}
                        </Text>
                        <View style={{
                            backgroundColor: '#E8F5E9',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4
                        }}>
                            <Text style={{ fontSize: 10, color: '#2E7D32', fontWeight: '600' }}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            <Text style={{ fontSize: 18, fontWeight: '700', color: '#2C3E50', marginBottom: 12 }}>
                April
            </Text>
            {mockTransactions.map((item) => (
                <TouchableOpacity 
                    key={item.id}
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: '#FAFAFA',
                        padding: 14,
                        borderRadius: 10,
                        marginBottom: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#EAEAEA'
                    }}
                >
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2C3E50', marginBottom: 4 }}>
                            {item.refNo}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#95A5A6' }}>
                            {item.transactDate}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#2E7D32', marginBottom: 4 }}>
                            {item.amount}
                        </Text>
                        <View style={{
                            backgroundColor: '#E8F5E9',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4
                        }}>
                            <Text style={{ fontSize: 10, color: '#2E7D32', fontWeight: '600' }}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
                
            </ScrollView>
        </SafeAreaView>
    );
};

export default TransactionHistory;


