import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { styles } from './styles';

dayjs.extend(customParseFormat);

// Import the actual, true VoucherInfo interface from your file
import { VoucherInfo } from '../../../../@types/voucher';
import ScreenNames from '../../../../navigation/screenNames';

const FarmerProfile = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    
    // Type the structure matching exactly what Laravel sends and what we route
    const params = route.params as { 
        status:         boolean; 
        voucherInfo?:   VoucherInfo; 
        timer?:         number; 
    };
    
    // Safely pull the verified voucher object block
    const voucherInfo = params?.voucherInfo;

    // Handle Native Android Hardware Back Button Tap Actions Safely
    useEffect(() => {
        const handleBackPress = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [navigation]);

    const handleTransaction = () => {
        console.log('[REVIEW FARMER PROFILE] start transaction for:', voucherInfo?.reference_no);

        // Pass the serverData structure (which contains status and voucherInfo) straight to the cart stack;

        navigation.navigate(ScreenNames.TRANSACTION_STACK.CART, { 
            status:         params.status,
            voucherInfo:    voucherInfo,
            timer:          params.timer
        });
    };

    if (!voucherInfo) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>No voucher profiles data detected.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />

            {/* HEADER COMPONENT LAYER */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Farmer Profile</Text>
                <View style={styles.backButtonPlaceholder} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* REFERENCE IDENTIFIER CARD */}
                <View style={styles.referenceContainer}>
                    <Text style={styles.referenceLabel}>REFERENCE NUMBER</Text>
                    <Text style={styles.referenceValue}>{voucherInfo.reference_no}</Text>
                </View>

                {/* SECTION: PROGRAM SCHEME */}
                <View style={styles.card}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>Program</Text>
                    </View>
                    <Text style={styles.cardValueText}>{voucherInfo.title || "No Program Assigned"}</Text>
                </View>

                {/* SECTION: BENEFICIARY IDENTITY */}
                <View style={styles.card}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>Fullname</Text>
                    </View>
                    <Text style={styles.nameValueText}>
                        {`${voucherInfo.first_name} ${voucherInfo.middle_name} ${voucherInfo.last_name}${voucherInfo.ext_name ? `, ${voucherInfo.ext_name}` : ''}`}
                    </Text>
                </View>

                {/* SECTION: REGIONAL MATRICES */}
                <View style={styles.card}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>Location</Text>
                    </View>
                    <View style={styles.locationGrid}>
                        <View style={styles.locationRow}><Text style={styles.nestedLabel}>Region:</Text><Text style={styles.nestedValue}>{voucherInfo.reg_desc}</Text></View>
                        <View style={styles.locationRow}><Text style={styles.nestedLabel}>Province:</Text><Text style={styles.nestedValue}>{voucherInfo.prv_desc}</Text></View>
                        <View style={styles.locationRow}><Text style={styles.nestedLabel}>Municipality:</Text><Text style={styles.nestedValue}>{voucherInfo.mun_desc}</Text></View>
                        <View style={styles.locationRow}><Text style={styles.nestedLabel}>Barangay:</Text><Text style={styles.nestedValue}>{voucherInfo.brgy_desc}</Text></View>
                    </View>
                </View>

                {/* SECTION: DOUBLE COLUMN PROFILE DATA SPLITS */}
                <View style={styles.splitRow}>
                    <View style={[styles.card, { flex: 1, marginRight: 8 }]}>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>Birthday</Text>
                        </View>
                        <Text style={styles.cardValueText}>{dayjs(voucherInfo.birthday, 'MM/DD/YYYY').format('MMMM DD, YYYY')}</Text>
                    </View>

                    <View style={[styles.card, { flex: 1, marginLeft: 8 }]}>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>Sex</Text>
                        </View>
                        <Text style={styles.cardValueText}>{voucherInfo.sex}</Text>
                    </View>
                </View>

                {/* SECTION: FARM FIELD COVERAGE */}
                <View style={styles.card}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>Crop Area</Text>
                    </View>
                    <Text style={styles.cardValueText}>{parseFloat(voucherInfo.crop_area).toFixed(4)} ha</Text>
                </View>

                {/* SECTION: FINANCIAL ACCRUAL DATA CARDS */}
                <View style={styles.financialCard}>
                    <View style={[styles.badgeContainer, { backgroundColor: '#D9383A' }]}>
                        <Text style={styles.badgeText}>Voucher Total Balance</Text>
                    </View>
                    <Text style={styles.moneyValueText}>₱{parseFloat(voucherInfo.voucherAmountBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>

                <View style={styles.financialCard}>
                    <View style={[styles.badgeContainer, { backgroundColor: '#D9383A' }]}>
                        <Text style={styles.badgeText}>Voucher Remaining Balance</Text>
                    </View>
                    <Text style={[styles.moneyValueText, { color: '#D9383A' }]}>₱{parseFloat(voucherInfo.voucherRemainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                </View>
            </ScrollView>

            {/* STICKY DISPATCH CONTROLLER ROW FOOTER */}
            <SafeAreaView style={styles.footerContainer} edges={['bottom']}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleTransaction}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionButtonText}>Start Transaction</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </SafeAreaView>
    );
};

export default FarmerProfile;