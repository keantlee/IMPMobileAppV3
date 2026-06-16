import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, BackHandler, Modal, TextInput, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../../store/useAuthStore';
import { styles } from './styles';
import { getTransactionDetailsMutation } from '../../../../api/transaction';

interface TransactionDetailRouteParams {
    transactionId?: string;
    referenceNo?:   string;
    category?:      string;
    subCategory?:   string;
    quantity?:      string;
    unitType?:      string;
    remarks?:       string;
    attachments?:   any[];
    status?:        string;
    date?:          string;
    time?:          string;
    amount?:        number;
} 

type HelpOption = 'retransact' | 'update_attachments' | null;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TransactionDetail = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();
    const userInfo      = useAuthStore.getState().user;
    
    const { transactionId, referenceNo } = (route.params || {}) as TransactionDetailRouteParams;

    // State management
    const [isHelpModalVisible, setIsHelpModalVisible] = useState<boolean>(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<HelpOption>(null);
    const [remarksText, setRemarksText] = useState<string>('');

    // Query mutation to fetch dynamic trasaction details from the laravel backend
    const transactionMutation = getTransactionDetailsMutation();
    const mockDetails = {
        amount:         3000.00,
        status:         'Complete', // Expected values: 'Complete' | 'Pending'
        date:           'Jun 16, 2026',
        time:           '10:14 AM',
        category:       'Inorganic Fertilizer',
        subCategory:    'Four-Wheel Tractor',
        quantity:       '25.00',
        unitType:       'KG',
        remarks:        'Distributed successfully to agrarian reform beneficiaries.',
    };

    useEffect(() => {
        const handleBackPress = () => {
            if (isHelpModalVisible) {
                setIsHelpModalVisible(false);
                return true;
            }
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [navigation, isHelpModalVisible]);

    const handleSendRequest = () => {
        if (!selectedOption) return;
        
        setIsHelpModalVisible(false);
        setTimeout(() => {
            setIsSuccessModalVisible(true);
        }, 400);
    };

    const handleCloseHelp = () => {
        setSelectedOption(null);
        setRemarksText('');
        setIsHelpModalVisible(false);
    };

    // Derived Status Helpers
    const isComplete  = mockDetails.status === 'Complete';
    const isPending   = mockDetails.status === 'Pending';
    const isCancelled = mockDetails.status === 'Cancelled';

    // Helper method to resolve Card 1 Theme Context variables dynamically
    const getStatusTheme = () => {
        if (isComplete) return { bg: '#E8F5E9', color: '#29d92f', icon: 'check-circle' };
        if (isCancelled) return { bg: '#FFEBEE', color: '#C62828', icon: 'cancel' };
        return { bg: '#FFF3E0', color: '#E65100', icon: 'pending' }; // Pending Default fallbacks
    };

    const theme = getStatusTheme();

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="light-content" backgroundColor="#009246" />
                
                {/* Header */}
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

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    {/* Card 1: Overview Status Card */}
                    <View style={styles.overviewCard}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
                            <MaterialIcons name={theme.icon} size={50} color={theme.color} />
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={styles.pesoSign}>₱</Text>
                            <Text style={styles.amountValue}>
                                {new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(mockDetails.amount)}
                            </Text>
                        </View>
                        
                        <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
                            <Text style={[styles.statusText, { color: theme.color }]}>
                                {mockDetails.status}
                            </Text>
                        </View>
                        <Text style={styles.dateTimeText}>{mockDetails.date} • {mockDetails.time}</Text>
                    </View>

                    {/* Card 2: Technical Breakdown Details */}
                    <View style={styles.detailsCard}>
                        <Text style={styles.cardSectionTitle}>Transaction Information</Text>
                        
                        {[
                            { label: 'Reference No.', value: referenceNo, isBold: true },
                            { label: 'Category', value: mockDetails.category },
                            { label: 'Sub Category', value: mockDetails.subCategory },
                            { label: 'Quantity', value: mockDetails.quantity },
                            { label: 'Unit Type', value: mockDetails.unitType },
                            { label: 'Transaction Amount', value: `₱${new Intl.NumberFormat('en-PH').format(mockDetails.amount)}` },
                            { label: 'Remarks', value: mockDetails.remarks, isMultiline: true },
                        ].map((row, idx) => (
                            <View key={idx} style={[styles.detailRow, row.isMultiline && { flexDirection: 'column', alignItems: 'flex-start' }]}>
                                <Text style={styles.rowLabel}>{row.label}</Text>
                                <Text style={[styles.rowValue, row.isBold && { fontWeight: '700', color: '#2C3E50' }, row.isMultiline && { marginTop: 4, textAlign: 'left' }]}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Card 3: Attachments Visual Grid (Hidden entirely if status is Pending) */}
                    {!isPending && (
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardSectionTitle}>Uploaded Attachments</Text>
                            
                            {[
                                { name: 'Beneficiary with commodities', icon: 'camera-alt' },
                                { name: 'Front Valid ID', icon: 'assignment-ind' },
                                { name: 'Back Valid ID', icon: 'assignment-ind' },
                                { name: 'Receipt', icon: 'receipt' },
                                { name: 'Other documents', icon: 'folder' },
                            ].map((doc, idx) => (
                                <TouchableOpacity key={idx} activeOpacity={0.7} style={styles.attachmentRow}>
                                    <View style={styles.attachmentLeft}>
                                        <MaterialIcons name={doc.icon} size={20} color="#7F8C8D" />
                                        <Text style={styles.attachmentName} numberOfLines={1}>{doc.name}</Text>
                                    </View>
                                    <View style={styles.attachmentRight}>
                                        <Text style={styles.viewText}>View</Text>
                                        <MaterialIcons name="chevron-right" size={18} color="#009246" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Replacement Card 3 Placeholder for Pending Status variants */}
                    {isPending && (
                        <View style={[styles.detailsCard, { alignItems: 'center', paddingVertical: 24, borderStyle: 'dashed', borderColor: '#E65100', borderWidth: 1.5 }]}>
                            <MaterialIcons name="cloud-upload" size={32} color="#E65100" style={{ marginBottom: 8 }} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#E65100', textAlign: 'center', paddingHorizontal: 10, lineHeight: 20 }}>
                                Please upload the required attachments to complete the transaction.
                            </Text>
                        </View>
                    )}

                    {/* 4.) Action Help Trigger (Hidden completely if status is Cancelled) */}
                    {!isCancelled && (
                        <TouchableOpacity 
                            activeOpacity={0.7} 
                            onPress={() => setIsHelpModalVisible(true)}
                            style={styles.helpButton}
                        >
                            <MaterialIcons name="help-outline" size={20} color="#009246" style={{ marginRight: 6 }} />
                            <Text style={styles.helpButtonText}>Need help with this transaction?</Text>
                        </TouchableOpacity>
                    )}

                </ScrollView>
            </SafeAreaView>

            {/* Bottom Sheet Modal Container for Help Operations */}
            <Modal
                visible={isHelpModalVisible}
                animationType="slide"
                transparent={true}
                statusBarTranslucent={true}
                onRequestClose={handleCloseHelp}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={handleCloseHelp}
                >
                    <View style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
                        <View style={styles.notchIndicator} />
                        <Text style={styles.sheetTitle}>What do you need help with?</Text>

                        {/* Radio Option Rows */}
                        {[
                            // { key: 'cancel', label: 'Request to cancel this transaction' },
                            { key: 'retransact', label: 'Request to re-transact this transaction' },
                            { key: 'update_attachments', label: 'Request to update attachments' },
                        ].filter(opt => !(isPending && opt.key === 'update_attachments')) // Dynamically strips update element out if pending
                        .map((opt) => {
                            const isSelected = selectedOption === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedOption(opt.key as HelpOption)}
                                    style={styles.radioRow}
                                >
                                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                        {isSelected && <View style={styles.radioInnerDot} />}
                                    </View>
                                    <Text style={styles.radioLabelText}>{opt.label}</Text>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Narrative Input Field */}
                        <Text style={styles.inputLabel}>Reason / Remarks</Text>
                        <TextInput
                            placeholder="Please provide explicit context regarding this request..."
                            placeholderTextColor="#95A5A6"
                            multiline={true}
                            numberOfLines={3}
                            value={remarksText}
                            onChangeText={setRemarksText}
                            style={styles.textArea}
                        />

                        {/* Form Control Button Footers */}
                        <View style={styles.sheetButtonContainer}>
                            <TouchableOpacity 
                                activeOpacity={0.7} 
                                onPress={handleCloseHelp}
                                style={[styles.sheetButton, styles.sheetButtonCancel]}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                activeOpacity={0.7} 
                                onPress={handleSendRequest}
                                disabled={!selectedOption}
                                style={[styles.sheetButton, styles.sheetButtonSend, !selectedOption && { backgroundColor: '#BDC3C7' }]}
                            >
                                <Text style={styles.sendBtnText}>Send Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Success Feedback Central Dialog Window */}
            <Modal
                visible={isSuccessModalVisible}
                animationType="fade"
                transparent={true}
                statusBarTranslucent={true}
                onRequestClose={() => setIsSuccessModalVisible(false)}
            >
                <View style={styles.successModalOverlay}>
                    <View style={styles.successBox}>
                        <MaterialIcons name="check-circle" size={54} color="#009246" />
                        <Text style={styles.successTitle}>Request Submitted</Text>
                        <Text style={styles.successDescription}>
                            Your request has been filed. We will inform the Regional Field Office regarding this transaction change.
                        </Text>
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={() => setIsSuccessModalVisible(false)}
                            style={styles.successCloseBtn}
                        >
                            <Text style={styles.successCloseText}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TransactionDetail;