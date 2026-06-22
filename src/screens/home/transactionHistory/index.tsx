import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, BackHandler, ActivityIndicator, SectionList, TextInput, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../store/useAuthStore';
import { styles } from './styles';
import ScreenNames from '../../../navigation/screenNames';
import { getTransactionHistoryMutation, getTransactionDetailsMutation } from '../../../api/transaction';

interface TransactionItem {
    voucher_id:         string;
    rsbsa_no:           string;
    reference_no:       string;
    transaction_id:     string;
    supplier_id:        string;
    total_amount:       string | number;
    transact_date:      string;
    transaction_status: 'Completed' | 'Pending' | 'Re-Transact' | 'Re-Upload';
}

interface SectionData {
    title:  string;            // The Month Header text (e.g., "June 2026")
    data:   TransactionItem[];
}

type FilterStatus = 'All' | 'Completed' | 'Pending' | 'Re-Transact' | 'Re-Upload';

const TransactionHistory = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();
    
    const userInfo      = useAuthStore.getState().user;
    const supplierId    = userInfo?.userId; 

    // Cache & UI rendering states
    const [rawTransactions, setRawTransactions]         = useState<TransactionItem[]>([]);
    const [displayedSections, setDisplayedSections]     = useState<SectionData[]>([]);
    
    // Filter & search controls
    const [searchQuery, setSearchQuery]                 = useState<string>('');
    const [activeFilter, setActiveFilter]               = useState<FilterStatus>('All');

    // Query mutation
    const transactionMutation   = getTransactionHistoryMutation();
    const detailsMutation       = getTransactionDetailsMutation();

    useEffect(() => {
        const handleBackPress = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [navigation]);

    // Fire API call immediately when the component mounts
    useEffect(() => {
        if (supplierId) {
            loadHistoryData();
        }
    }, [supplierId]);

    // Live monitoring hook triggers UI compute changes whenever user typing or tab status updates
    useEffect(() => {
        applyFiltersAndGrouping();
    }, [searchQuery, activeFilter, rawTransactions]);

    const loadHistoryData = () => {
        transactionMutation.mutate(
            { supplier_id: supplierId },
            {
                onSuccess: (response) => {
                    if (response && response.data) {
                        // Store the original backup array
                        setRawTransactions(response.data as TransactionItem[]);
                    }
                },
            }
        );
    };

    // Client-side execution loop: handles searches, maps state tags, and buckets rows
    const applyFiltersAndGrouping = () => {
        let filtered = [...rawTransactions];

        // 1. Process Status Filter Tab Selection
        if (activeFilter !== 'All') {
            filtered = filtered.filter(item => item.transaction_status === activeFilter);
        }

        // 2. Process Search Field Value Input
        if (searchQuery.trim().length > 0) {
            const cleanQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.reference_no?.toLowerCase().includes(cleanQuery)
            );
        }

        // 3. Re-bucket match records into visual Section groups
        const sectionsData = processGroupedData(filtered);
        setDisplayedSections(sectionsData);
    };

    // Helper utility parsing arrays into chronological Month Year buckets
    const processGroupedData = (rawData: TransactionItem[]): SectionData[] => {
        const groups: { [key: string]: TransactionItem[] } = {};

        rawData.forEach((item) => {
            if (!item.transact_date) return;
            
            const dateObj = new Date(item.transact_date);
            const monthYearHeader = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

            if (!groups[monthYearHeader]) {
                groups[monthYearHeader] = [];
            }
            groups[monthYearHeader].push(item);
        });

        return Object.keys(groups).map((monthKey) => ({
            title: monthKey,
            data: groups[monthKey],
        }));
    };

    const handleTransactionDetail = (item: TransactionItem) => {
        if (item.transaction_status === 'Re-Transact') {
            // Navigate to Review Voucher Info Screen then proceed to a new transaction
            navigation.navigate(ScreenNames.TRANSACTION_STACK.REVIEW_VOUCHER_INFO, {
                referenceNo:    item.reference_no,
                supplierId:     item.supplier_id,
                isReTransact:   true,
            });
        } else if (item.transaction_status === 'Re-Upload') {
            // Navigate directly to the Upload Attachments Screen stack
            navigation.navigate(ScreenNames.TRANSACTION_STACK.UPLOAD_ATTACHMENTS, {
                transactionId:  item.transaction_id,
                referenceNo:    item.reference_no,
                supplierId:     item.supplier_id,
            });
        } 
        else {
            console.log("[TRANSACTION HISTORY SCREEN] Payload: ", item.reference_no);

            detailsMutation.mutate({
                transaction_id: item.transaction_id,
                reference_no:   item.reference_no,
                supplier_id:    item.supplier_id,
                status:         item.transaction_status,
                navigation:     navigation // Pass the navigation instance here!
            });
        }
    };

    // Helper function 
    const formatCurrency = (amount: string | number) => {
        const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(numericValue || 0);
    };

    // Helper function 
    const formatDateString = (rawDate: string) => {
        return new Date(rawDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Helper function 
    const getStatusStyles = (status: TransactionItem['transaction_status']) => {
        switch (status) {
            case 'Completed':
                return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'Pending':
                return { bg: '#FFF3E0', text: '#E65100' };
            case 'Re-Transact':
                return { bg: '#FFEBEE', text: '#C62828' }; 
            case 'Re-Upload':
                return { bg: '#E3F2FD', text: '#1565C0' }; 
            default:
                return { bg: '#EEEEEE', text: '#424242' };
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />

            {/* Navbar container */}
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

            {/* Search Input Container */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E3E3E3',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    height: 46,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}>
                    <MaterialIcons name="search" size={22} color="#95A5A6" />
                    <TextInput
                        placeholder="Search Reference No..."
                        placeholderTextColor="#95A5A6"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{
                            flex: 1,
                            fontSize: 14,
                            color: '#2C3E50',
                            marginLeft: 8,
                            paddingVertical: 0,
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialIcons name="cancel" size={20} color="#BDC3C7" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Tabs Layout - Transformed into Horizontal Scroll Container */}
            <View style={{ marginVertical: 12, height: 38 }}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
                >
                    {(['All', 'Completed', 'Pending', 'Re-Transact', 'Re-Upload'] as FilterStatus[]).map((filter) => {
                        const isActive = activeFilter === filter;
                        return (
                            <TouchableOpacity
                                key={filter}
                                activeOpacity={0.8}
                                onPress={() => setActiveFilter(filter)}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    marginRight: 8,
                                    backgroundColor: isActive ? '#009246' : '#FFFFFF',
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: isActive ? '#009246' : '#EAEAEA',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isActive ? 0.1 : 0,
                                    shadowRadius: 1,
                                    elevation: isActive ? 2 : 0
                                }}
                            >
                                <Text style={{ 
                                    fontSize: 13, 
                                    fontWeight: '600', 
                                    color: isActive ? '#FFFFFF' : '#7F8C8D' 
                                }}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* List UI Logic */}
            {transactionMutation.isPending ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#009246" />
                </View>
            ) : (
                <SectionList
                    sections={displayedSections}
                    keyExtractor={(item, index) => item.transaction_id || index.toString()}
                    stickySectionHeadersEnabled={false}             
                    contentContainerStyle={[styles.scrollContent, { paddingTop: 4 }]}
                    onRefresh={loadHistoryData}                     
                    refreshing={transactionMutation.isPending}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#2C3E50', marginBottom: 12, marginTop: 10 }}>
                            {title}
                        </Text>
                    )}
                    renderItem={({ item }: { item: TransactionItem }) => {
                        const statusUI = getStatusStyles(item.transaction_status);
                        
                        return (
                            <TouchableOpacity 
                                activeOpacity={0.7}
                                onPress={() => handleTransactionDetail(item)}
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
                                <View style={{ flex: 0.60 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#2C3E50', marginBottom: 4 }} numberOfLines={1}>
                                        {item.reference_no}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#95A5A6' }}>
                                        {formatDateString(item.transact_date)}
                                    </Text>
                                </View>
                                <View style={{ flex: 0.40, alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#2C3E50', marginBottom: 4 }} numberOfLines={1}>
                                        {formatCurrency(item.total_amount)}
                                    </Text>
                                    <View style={{
                                        backgroundColor: statusUI.bg,
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 4
                                    }}>
                                        <Text style={{ fontSize: 10, color: statusUI.text, fontWeight: '600' }}>
                                            {item.transaction_status}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
                            <Text style={{ color: '#95A5A6', fontSize: 14, textAlign: 'center' }}>
                                {rawTransactions.length === 0 
                                    ? "No transaction records found for this period."
                                    : "No transactions match your search filter criteria."
                                }
                            </Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default TransactionHistory;