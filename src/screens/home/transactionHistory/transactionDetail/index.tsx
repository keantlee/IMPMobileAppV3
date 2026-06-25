import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, BackHandler, Modal, Dimensions, Image, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../../store/useAuthStore';
import { styles } from './styles';
import ScreenNames from '../../../../navigation/screenNames';

interface TransactionDetailRouteParams {
    transactionId?:   string;
    referenceNo?:     string;
    supplierId?:      string;
    status?:          'Completed' | 'Pending' | 'Re-Transact' | 'Re-Upload';
    transactionInfo?: any[]; 
    attachments?:     any[]; 
    uploadInfo?:      any[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TransactionDetail = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();
    const userInfo      = useAuthStore.getState().user;
    
    const { 
        transactionId, 
        referenceNo, 
        supplierId, 
        status, 
        transactionInfo = [], 
        attachments     = [],
        uploadInfo      = []  
    } = (route.params || {}) as TransactionDetailRouteParams;

    // State management
    const [isHelpModalVisible, setIsHelpModalVisible] = useState<boolean>(false);
    const [viewerModalVisible, setViewerModalVisible] = useState<boolean>(false);
    const [viewerTitle, setViewerTitle] = useState<string>('');
    const [viewerImages, setViewerImages] = useState<string[]>([]);

    const isComplete = status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'complete';
    const isPending  = status?.toLowerCase() === 'pending';

    useEffect(() => {
        const handleBackPress = () => {
            if (viewerModalVisible) {
                setViewerModalVisible(false);
                return true;
            }
            if (isHelpModalVisible) {
                setIsHelpModalVisible(false);
                return true;
            }
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [navigation, isHelpModalVisible, viewerModalVisible]);

    const getStatusTheme = () => {
        if (isComplete) return { bg: '#E8F5E9', color: '#009246', icon: 'check-circle' };
        if (isPending)  return { bg: '#FFF3E0', color: '#E65100', icon: 'pending' };
        return { bg: '#ECEFF1', color: '#2C3E50', icon: 'info' }; 
    };

    const theme = getStatusTheme();

    const formatDateTime = (rawDateTimeString?: string) => {
        if (!rawDateTimeString) return { date: 'N/A', time: 'N/A' };
        try {
            const normalizedString = rawDateTimeString.replace(/-/g, '/');
            const parsedDate = new Date(normalizedString);
            if (isNaN(parsedDate.getTime())) {
                return { date: rawDateTimeString, time: 'N/A' };
            }
            return {
                date: parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            };
        } catch {
            return { date: rawDateTimeString, time: 'N/A' };
        }
    };

    const getImageUri = (imageProp: string | null) => {
        if (!imageProp) return null;
        
        const cleanStr = imageProp.trim();

        // 1. If it's already an active web link from S3, return it directly!
        if (cleanStr.startsWith('http://') || cleanStr.startsWith('https://')) {
            return cleanStr;
        }
        
        // 2. Fallback: If it's a raw base64 string, keep your old data-URI formatting
        return `data:image/jpeg;base64,${cleanStr}`;
    };

    const getIconNameForCategory = (labelKey: string) => {
        if (labelKey.includes('Beneficiary')) return 'camera-alt';
        if (labelKey.includes('ID')) return 'assignment-ind';
        if (labelKey.includes('Receipt')) return 'receipt';
        return 'description';
    };

    /**
     * FIX: Use .filter() instead of .find() to catch multiple files fetched from S3
     */
    const structuredCategories = [
        {
            label: 'Beneficiary with Commodity',
            allData: attachments.filter((a: any) => a.name === 'Beneficiary with Commodity')
        },
        {
            label: 'Front Valid ID',
            allData: attachments.filter((a: any) => a.name === 'Front Valid ID')
        },
        {
            label: 'Back Valid ID',
            allData: attachments.filter((a: any) => a.name === 'Back Valid ID')
        },
        {
            label: 'Receipt',
            allData: attachments.filter((a: any) => a.name === 'Receipt')
        },
        {
            label: 'Other Docs',
            allData: attachments.filter((a: any) => a.name && a.name.toLowerCase().includes('other'))
        }
    ];

    // Method triggered when user hits click target
    const handleOpenViewer = (label: string, dataItems: any[]) => {
        console.log("[Click handle open viewer] dataItems: ", dataItems);
        // 1. Extract the raw base64 images from the object array and wrap them with the correct MIME type
        const extractedUris = dataItems
            .map(item => getImageUri(item?.image)) // Uses the dynamic JPEG checker
            .filter(uri => uri !== null) as string[];

        // 2. If no valid images were extracted, do nothing
        if (extractedUris.length === 0) return;

        // 3. Update your state matching your viewer logic
        setViewerTitle(label);
        setViewerImages(extractedUris); // Pass the array of proper data URIs here
        setViewerModalVisible(true);
    };
     const handleSyncAndGoBack = useCallback(() => {
        navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_HISTORY, {
            supplier_id: supplierId
        });
     }, [navigation, supplierId]);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleSyncAndGoBack} activeOpacity={0.7}>
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <View style={styles.backPlaceholder} />
        </View>
    );

    const cumulativeTotalAmount = transactionInfo.reduce((sum, item) => sum + parseFloat(item?.amount || '0'), 0);
    const { date: displayDate } = formatDateTime(transactionInfo[0]?.transac_date);

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="light-content" backgroundColor="#009246" />
                
                {/* Header */}
                {renderHeader()}
                {/* <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Transaction Details</Text>
                    <View style={styles.backButtonPlaceholder} />
                </View> */}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    {/* Card 1: Overview Status Card */}
                    <View style={styles.overviewCard}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
                            <MaterialIcons name={theme.icon} size={50} color={theme.color} />
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={styles.pesoSign}>₱</Text>
                            <Text style={styles.amountValue}>
                                {new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(cumulativeTotalAmount)}
                            </Text>
                        </View>
                        
                        <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
                            <Text style={[styles.statusText, { color: theme.color }]}>{status}</Text>
                        </View>
                        <Text style={styles.dateTimeText}>{displayDate}</Text>
                    </View>

                    {/* Card 2: Transaction Items array loop */}
                    {transactionInfo.map((item: any, idx: number) => (
                        <View key={item?.voucher_details_id || idx} style={[styles.detailsCard, { marginTop: idx > 0 ? 12 : 16 }]}>
                            <Text style={styles.cardSectionTitle}>Transaction Item #{idx + 1}</Text>
                            
                            {[
                                { label: 'Reference No.', value: referenceNo, isBold: true },
                                { label: 'Category', value: item?.category || 'N/A' },
                                { label: 'Sub Category', value: item?.subCategory || 'N/A', hasLongText: true },
                                { label: 'Quantity', value: item?.quantity || '0.00' },
                                { label: 'Unit Type', value: item?.unitType || 'N/A' },
                                { 
                                    label: 'Transaction Amount', 
                                    value: item?.amount 
                                        ? `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(parseFloat(item.amount))}`
                                        : '₱0.00' 
                                },
                                { label: 'Remarks', value: item?.remarks || 'No descriptive comments left.', isMultiline: true },
                            ].map((row, rowIdx) => (
                                <View 
                                    key={rowIdx} 
                                    style={[
                                        styles.detailRow, 
                                        row.isMultiline && { flexDirection: 'column', alignItems: 'flex-start' }
                                    ]}
                                >
                                    <Text style={styles.rowLabel}>{row.label}</Text>
                                    <Text 
                                        style={[
                                            styles.rowValue, 
                                            row.isBold && { fontWeight: '700', color: '#2C3E50' }, 
                                            row.isMultiline && { marginTop: 4, textAlign: 'left' },
                                            row.hasLongText && { flexShrink: 1, textAlign: 'right', paddingLeft: 16 }
                                        ]}
                                        numberOfLines={row.hasLongText ? 2 : undefined}
                                    >
                                        {row.value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}

                    {/* Card 3: Standardized 5-Category Attachments List */}
                    {!isPending && (
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardSectionTitle}>Uploaded Attachments</Text>
                            
                            {structuredCategories.map((category, idx) => {
                                const hasData = category.allData.length > 0;
                                const defaultIcon = getIconNameForCategory(category.label);
                                const fileCount = category.allData.length;

                                return (
                                        <TouchableOpacity 
                                            key={idx} 
                                            activeOpacity={hasData ? 0.7 : 1} 
                                            onPress={() => hasData && handleOpenViewer(category.label, category.allData)}
                                            style={[styles.attachmentRow, !hasData && { opacity: 0.5 }]}
                                        >
                                            <View style={styles.attachmentLeft}>
                                                <View style={{ width: 36, height: 36, borderRadius: 6, marginRight: 10, backgroundColor: '#EAEDED', justifyContent: 'center', alignItems: 'center' }}>
                                                    <MaterialIcons 
                                                        name={defaultIcon} 
                                                        size={20} 
                                                        color="#95A5A6" 
                                                    />
                                                </View>
                                            
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={styles.attachmentName} numberOfLines={1}>
                                                        {category.label}
                                                    </Text>
                                                    {fileCount > 1 && (
                                                        <View style={localStyles.countBadge}>
                                                            <Text style={localStyles.countText}>x{fileCount}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        
                                        {hasData ? (
                                            <View style={styles.attachmentRight}>
                                                <Text style={styles.viewText}>View</Text>
                                                <MaterialIcons name="chevron-right" size={18} color="#009246" />
                                            </View>
                                        ) : (
                                            <View style={styles.attachmentRight}>
                                                <MaterialIcons name="block" size={16} color="#BDC3C7" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Pending Status fallback */}
                    {isPending && (
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={() => {
                                const uploadParams = uploadInfo[0] || {};

                                console.log("[TRANSACTION DETAILS - PENDING] Redirecting directly to Upload Attachments");

                                navigation.navigate(ScreenNames.TRANSACTION_STACK.UPLOAD_ATTACHMENTS, {
                                    voucherId:      uploadParams?.voucher_id || route.params?.voucher_id,
                                    rsbsaNo:        uploadParams?.rsbsa_no || route.params?.rsbsa_no,
                                    referenceNo:    referenceNo,
                                    transactionId:  transactionId,
                                    supplierId:     supplierId,
                                    shortname:      uploadParams?.shortname || route.params?.shortname,
                                    prevRouteName:  "TransactionDetailScreen"
                                }); 
                            }}
                            style={[
                                styles.detailsCard, 
                                { 
                                    alignItems: 'center', 
                                    paddingVertical: 24, 
                                    borderStyle: 'dashed', 
                                    borderColor: '#E65100', 
                                    borderWidth: 1.5,
                                    backgroundColor: '#FFF8F2' // Added a slight warm tint so users know it's a clickable button
                                }
                            ]}
                        >
                            <MaterialIcons name="cloud-upload" size={32} color="#E65100" style={{ marginBottom: 8 }} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#E65100', textAlign: 'center', paddingHorizontal: 10, lineHeight: 20 }}>
                                Please upload the required attachments to complete the transaction.
                            </Text>
                            <Text style={{ fontSize: 11, color: '#E65100', opacity: 0.8, marginTop: 4, textDecorationLine: 'underline' }}>
                                Tap here to upload docs
                            </Text>
                        </TouchableOpacity>
                    )}

                </ScrollView>
            </SafeAreaView>

            {/* LIGHTBOX GALERY MODAL COMPONENT */}
            <Modal
                visible={viewerModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewerModalVisible(false)}
            >
                <View style={localStyles.modalBackground}>
                    {/* Header View controls */}
                    <View style={localStyles.modalHeader}>
                        <Text style={localStyles.modalHeaderTitle} numberOfLines={1}>
                            {viewerTitle}
                        </Text>
                        <TouchableOpacity 
                            style={localStyles.closeButton} 
                            onPress={() => setViewerModalVisible(false)}
                        >
                            <MaterialIcons name="close" size={26} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Dynamic Multi-Image Gallery Stream Content Area */}
                    <View style={localStyles.galleryWrapper}>
                        <ScrollView 
                            horizontal 
                            pagingEnabled 
                            showsHorizontalScrollIndicator={viewerImages.length > 1}
                            contentContainerStyle={{ alignItems: 'center' }}
                        >
                            {viewerImages.map((uri, index) => (
                                <View key={index} style={localStyles.imageFrame}>
                                    <Image 
                                        source={{ uri }} 
                                        style={localStyles.lightboxImage} 
                                        resizeMode="contain"
                                    />
                                    {viewerImages.length > 1 && (
                                        <Text style={localStyles.paginationText}>
                                            {index + 1} of {viewerImages.length}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Internal localized presentation sheets styling parameters
const localStyles = StyleSheet.create({
    countBadge: {
        backgroundColor: '#009246',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 1,
        marginLeft: 8,
    },
    countText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    modalHeaderTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginRight: 16,
    },
    closeButton: {
        padding: 4,
    },
    galleryWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageFrame: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8, // Explicitly constrain the swipeable sliding box frame
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightboxImage: {
        width: SCREEN_WIDTH,          // Pulls device viewport width constraints
        height: '100%',               // Fills the safe image scroll box frame
    },
    paginationText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        position: 'absolute',
        bottom: -30,
        textAlign: 'center',
    },
});

export default TransactionDetail;