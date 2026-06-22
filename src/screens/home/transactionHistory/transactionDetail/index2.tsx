import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, BackHandler, Modal, TextInput, Dimensions, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../../store/useAuthStore';
import { styles } from './styles';
import { getTransactionDetailsMutation } from '../../../../api/transaction';

interface TransactionDetailRouteParams {
    transactionId?:   string;
    referenceNo?:     string;
    supplierId?:      string;
    status?:          'Completed' | 'Pending' | 'Re-Transact' | 'Re-Upload';
    transactionInfo?: any[]; // Array of structured database items mapped from backend trans_info
    attachments?:     any[]; // Array of file attachments mapped from backend structure
}

type HelpOption = 'retransact' | 'update_attachments' | null;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TransactionDetail2 = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();
    const userInfo      = useAuthStore.getState().user;
    
    const { 
        transactionId, 
        referenceNo, 
        supplierId, 
        status, 
        transactionInfo = [], 
        attachments = [] 
    } = (route.params || {}) as TransactionDetailRouteParams;

    // State management
    const [isHelpModalVisible, setIsHelpModalVisible] = useState<boolean>(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<HelpOption>(null);
    const [remarksText, setRemarksText] = useState<string>('');

    const isComplete = status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'complete';
    const isPending  = status?.toLowerCase() === 'pending';

    // Target index data row metadata arrays cleanly without breaking if undefined
    const primaryItem = transactionInfo.length > 0 ? transactionInfo[0] : null;

    // Query mutation to fetch dynamic trasaction details from the laravel backend
    const transactionMutation = getTransactionDetailsMutation();

    // const mockDetails = {
    //     amount:         3000.00,
    //     status:         'Complete', // Expected values: 'Complete' | 'Pending'
    //     date:           'Jun 16, 2026',
    //     time:           '10:14 AM',
    //     category:       'Inorganic Fertilizer',
    //     subCategory:    'Four-Wheel Tractor',
    //     quantity:       '25.00',
    //     unitType:       'KG',
    //     remarks:        'Distributed successfully to agrarian reform beneficiaries.',
    // };

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

    // // Derived Status Helpers
    // const isComplete  = mockDetails.status === 'Complete';
    // const isPending   = mockDetails.status === 'Pending';
    // const isCancelled = mockDetails.status === 'Cancelled';

    // Helper method to resolve Card 1 Theme Context variables dynamically
    const getStatusTheme = () => {
        if (isComplete) return { bg: '#E8F5E9', color: '#009246', icon: 'check-circle' };
        if (isPending)  return { bg: '#FFF3E0', color: '#E65100', icon: 'pending' };
        return { bg: '#ECEFF1', color: '#2C3E50', icon: 'info' }; 
    };

    const theme = getStatusTheme();

    // Custom helper parser to isolate date and time structures from transac_date (e.g. "2026-06-12 03:00:08")
    const formatDateTime = (rawDateTimeString?: string) => {
        if (!rawDateTimeString) return { date: 'N/A', time: 'N/A' };
        try {
            const parsedDate = new Date(rawDateTimeString.replace(/-/g, '/'));
            return {
                date: parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            };
        } catch {
            return { date: rawDateTimeString, time: 'N/A' };
        }
    };

    const { date: displayDate, time: displayTime } = formatDateTime(primaryItem?.transac_date);

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
                                {primaryItem?.amount 
                                    ? new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(parseFloat(primaryItem.amount))
                                    : '0.00'
                                }
                            </Text>
                        </View>
                        
                        <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
                            <Text style={[styles.statusText, { color: theme.color }]}>
                                {status || 'Unknown'}
                            </Text>
                        </View>
                        <Text style={styles.dateTimeText}>{displayDate} • {displayTime}</Text>
                    </View>

                    {/* Card 2: Technical Breakdown Details */}
                    <View style={styles.detailsCard}>
                        <Text style={styles.cardSectionTitle}>Transaction Information</Text>
                        
                        {[
                            { label: 'Reference No.', value: referenceNo, isBold: true },
                            { label: 'Category', value: primaryItem?.category || 'N/A' },
                            { label: 'Sub Category', value: primaryItem?.subCategory || 'N/A' },
                            { label: 'Quantity', value: primaryItem?.quantity || '0.00' },
                            { label: 'Unit Type', value: primaryItem?.unitType || 'N/A' },
                            { 
                                label: 'Transaction Amount', 
                                value: primaryItem?.amount 
                                    ? `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(parseFloat(primaryItem.amount))}`
                                    : '₱0.00' 
                            },
                            { label: 'Remarks', value: primaryItem?.remarks || 'No descriptive comments left.', isMultiline: true },
                        ].map((row, idx) => (
                            <View key={idx} style={[styles.detailRow, row.isMultiline && { flexDirection: 'column', alignItems: 'flex-start' }]}>
                                <Text style={styles.rowLabel}>{row.label}</Text>
                                <Text style={[styles.rowValue, row.isBold && { fontWeight: '700', color: '#2C3E50' }, row.isMultiline && { marginTop: 4, textAlign: 'left' }]}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Card 3: Attachments Visual Grid (Hidden entirely if status is Pending or array is empty) */}
                    {!isPending && attachments.length > 0 && (
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardSectionTitle}>Uploaded Attachments</Text>
                            
                            {attachments.map((doc: any, idx: number) => {
                                // Cleanly normalize name strings to prevent case-sensitive mismatches
                                const docName = doc?.name || '';
                                const isReceipt = docName.toLowerCase().includes('receipt');
                                
                                // Construct base64 Image data source string layout safely from server payload
                                const imageUri = doc?.image ? `data:image/jpeg;base64,${doc.image}` : null;

                                return (
                                    <TouchableOpacity key={doc?.attachment_id || idx} activeOpacity={0.7} style={styles.attachmentRow}>
                                        <View style={styles.attachmentLeft}>
                                            {/* Render live image thumbnail preview if image payload exists */}
                                            {imageUri ? (
                                                <Image 
                                                    source={{ uri: imageUri }} 
                                                    style={{ width: 36, height: 36, borderRadius: 6, marginRight: 10, backgroundColor: '#EAECEE' }} 
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <MaterialIcons 
                                                    name={isReceipt ? 'receipt' : 'insert-drive-file'} 
                                                    size={22} 
                                                    color="#7F8C8D" 
                                                    style={{ marginRight: 10 }}
                                                />
                                            )}
                                            
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.attachmentName} numberOfLines={1}>
                                                    {doc?.name || 'Attachment File'}
                                                </Text>
                                                {doc?.file_name && (
                                                    <Text style={{ fontSize: 11, color: '#95A5A6', marginTop: 2 }} numberOfLines={1}>
                                                        {doc.file_name}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        
                                        <View style={styles.attachmentRight}>
                                            <Text style={styles.viewText}>View</Text>
                                            <MaterialIcons name="chevron-right" size={18} color="#009246" />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
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

                    {/* Help Action Sheet Trigger Button Layout */}
                    {/* <TouchableOpacity 
                        activeOpacity={0.7} 
                        onPress={() => setIsHelpModalVisible(true)}
                        style={[styles.helpButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 }]}
                    >
                        <MaterialIcons name="help-outline" size={20} color="#009246" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#009246', fontWeight: '600', fontSize: 15 }}>Need help with this transaction?</Text>
                    </TouchableOpacity> */}

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
                            { key: 'retransact', label: 'Request to re-transact this transaction' },
                            { key: 'update_attachments', label: 'Request to update attachments' },
                        ].filter(opt => !(isPending && opt.key === 'update_attachments')) // Dynamically strips update elements out if pending
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

export default TransactionDetail2;