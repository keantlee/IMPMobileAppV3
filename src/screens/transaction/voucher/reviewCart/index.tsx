import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    FlatList,
    BackHandler,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';

import { VoucherInfo } from '../../../../@types/voucher';
import ScreenNames from '../../../../navigation/screenNames';

// Import custom external styles
import { styles } from './styles';
import { saveTransactionMutation } from '../../../../api/transaction';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getSession } from '../../../../utils/session';
import { renderAlertPng } from '../../../../assets/icons';

interface ReviewCartRouteParams {
    // voucherInfo and cart arrive on entry from Cart, but the Edit Item
    // round-trip returns with only updatedCartFromEdit, so these are optional.
    // Review Cart holds voucherInfo/timer in state to survive that round-trip.
    voucherInfo?:           VoucherInfo;
    cart?:                  any[];  
    timer?:                 number;
    updatedCartFromEdit?:   any[]; // Intercepts array updates safely from Edit Item screen
}

const ReviewCart = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();

    const routeParams   = (route.params || {}) as ReviewCartRouteParams;
    const { 
        cart: initialCart = [], 
    } = routeParams;

    console.log('[REVIEW CART SCREEN] Incoming state params:', routeParams);

    const transactionMutation = saveTransactionMutation(navigation);

    console.log("[REVIEW CART SCREEN] check save transactino mutation: ", transactionMutation);

    console.log("[REVIEW CART SCREEN] check save transaction mutation with data: ", transactionMutation.data?.data);

    const transactionId = transactionMutation.data?.data;

    // 1. Core State Trackers
    const [cart, setCart]           = useState<any[]>(initialCart);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Hold voucherInfo + timer in state so they survive the Edit Item round-trip
    // (the returning navigation only carries updatedCartFromEdit and drops these
    // from route.params). Only update when a defined value arrives.
    const [voucherInfoState, setVoucherInfoState] = useState<VoucherInfo | undefined>(
        routeParams.voucherInfo,
    );
    const [timerState, setTimerState] = useState<number | undefined>(routeParams.timer);

    const voucherInfo = (route.params?.voucherInfo as VoucherInfo | undefined) || voucherInfoState;
    const timer = (route.params?.timer as number | undefined) ?? timerState;

    useEffect(() => {
        if (route.params?.voucherInfo) setVoucherInfoState(route.params.voucherInfo);
        if (route.params?.timer !== undefined) setTimerState(route.params.timer);
    }, [route.params?.voucherInfo, route.params?.timer]);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error' as 'error' | 'success'
    });

    // 2. Financial Accumulators & Memoized Balances
    const cartTotalAmount = useMemo(() => {
        return cart.reduce((prev, current) => prev + parseFloat(current.totalAmount || 0), 0);
    }, [cart]);

    const cashAddedByFarmer = useMemo(() => {
        const balance = parseFloat(voucherInfo?.voucherRemainingBalance || '0') - cartTotalAmount;
        return balance < 0 ? Math.abs(balance) : 0;
    }, [cartTotalAmount, voucherInfo?.voucherRemainingBalance]);

    const remainingBalance = useMemo(() => {
        const balance = parseFloat(voucherInfo?.voucherRemainingBalance || '0') - cartTotalAmount;
        return balance < 0 ? 0 : balance;
    }, [cartTotalAmount, voucherInfo?.voucherRemainingBalance]);

    // Keep a ref to the latest cart so the back handler always reads the freshest
    // items without needing `cart` in its dependency array. This keeps
    // handleSyncAndGoBack stable, so the hardware BackHandler doesn't re-subscribe
    // on every cart change.
    const cartRef = useRef(cart);
    useEffect(() => {
        cartRef.current = cart;
    }, [cart]);

    // 3. Sync Back to Cart Handler Vector
    const handleSyncAndGoBack = useCallback(() => {
        navigation.navigate({
            name: ScreenNames.TRANSACTION_STACK.CART,
            params: { 
                voucherInfo:             voucherInfo,              // Keeps voucher data updated
                updatedCartFromCheckout: cartRef.current,          // Always the freshest items list
                timer:                   timer                     // Keeps the running countdown alive
            },
            merge: true,
        });
    }, [navigation, voucherInfo, timer]);

    // 4. useEffect - Intercept updates from Edit Item screen
    useEffect(() => {
        // Intercept updates traveling backward from Edit Item form screen safely
        if (route.params?.updatedCartFromEdit) {
            const synchronizedEditArray = route.params.updatedCartFromEdit;
            console.log("[REVIEW CART SCREEN] Intercepted edited array package:", synchronizedEditArray);
            
            setCart(synchronizedEditArray);

            // Immediately flush parameter snapshot to clean execution cycle
            navigation.setParams({ updatedCartFromEdit: undefined });
        }
    }, [route.params?.updatedCartFromEdit]);

    // 5. useEffect - Sync on hardware back button press
    useEffect(() => {
        const hardwareBackAction = () => {
            handleSyncAndGoBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", hardwareBackAction);
        return () => backHandler.remove();
    }, [handleSyncAndGoBack]);

    // Watch for server verification exceptions
    useEffect(() => {
        if (transactionMutation.isError) {
            setAlertConfig({
                visible: true,
                title: 'Processing Failed',
                message: transactionMutation.error?.message || 'An unexpected error occurred during transaction processing. Please try again.', 
                type: 'error'
            });
        }
    }, [transactionMutation.isError, transactionMutation.error]);

    useEffect(() => {
        if (transactionMutation.isSuccess && transactionMutation.data) {
            setAlertConfig({
                visible: true,
                title: 'Success!',
                message: transactionMutation.data.message || 'Transaction has been saved successfully.',
                type: 'success'
            });
        }
    }, [transactionMutation.isSuccess, transactionMutation.data]);

    // 6. User Interaction Dispatch Methods
    const handleRemoveItem = useCallback((index: number) => {
        setCart((prevCart) => {
            const updatedCart = [...prevCart];
            updatedCart.splice(index, 1);
            
            // Auto-fallback redirect if basket is completely empty. Always pass
            // voucherInfo (and timer) so the Cart screen never loses its voucher
            // context on this navigation (avoids the "missing routing data" guard).
            if (updatedCart.length === 0) {
                navigation.navigate({
                    name: ScreenNames.TRANSACTION_STACK.CART,
                    params: {
                        voucherInfo:             voucherInfo,
                        updatedCartFromCheckout: [],
                        timer:                   timer,
                    },
                    merge: true,
                });
            }
            return updatedCart;
        });
    }, [navigation, voucherInfo, timer]);

    // Edit item navigation with pre-calculated total amount excluding the target item for accurate balance display in Edit screen
    const goToEditItem = (item: any, index: number) => {
        // Total amount calculation for edit screen (excluding current item)
        const otherItemsTotal = cart.reduce((prev, curr, idx) => 
            prev + (idx !== index ? parseFloat(curr.totalAmount || 0) : 0), 0);

        console.log("[REVIEW CART SCREEN] Transferring data to Edit context panel index: ", index);

        navigation.navigate(ScreenNames.TRANSACTION_STACK.EDIT_ITEM, {
            commodityInfo:      { ...item, index }, // Appends target item index pointer safely
            voucherInfo:        voucherInfo,
            cart:               cart,            
            cartTotalAmount:    otherItemsTotal,       
            timer:              timer,
        });
    };

    // Saving transaction handler - initiates the final checkout process and server mutation
    const handleCheckout = () => {
        if (!voucherInfo) {
            console.warn('[REVIEW CART SCREEN] Missing voucherInfo; cannot checkout.');
            return;
        }

        const checkoutParams = { voucherInfo, cart };

        console.log("[REVIEW CART SCREEN] Payload:", checkoutParams);
        
        transactionMutation.mutate({ 
            checkoutParams: checkoutParams 
        });
    };

    // 6. Fragment Sub-Layout Splitting Blocks
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

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items remaining inside basket.</Text>
        </View>
    );

    const renderCartItem = ({ item, index }: { item: any; index: number }) => {
        return (
            <View style={styles.itemCard}>
                <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name || "Commodity Item"}</Text>
                        <Text style={styles.itemSub}>{item.categoryName || "No Category"}</Text>
                        <Text style={styles.itemDetails}>
                            Qty: {item.quantity} {item.unitMeasurement}
                        </Text>
                        {item.itemCategoryRemarks && item.itemCategoryRemarks !== "None" && (
                            <Text style={styles.remarksText}>Notes: {item.itemCategoryRemarks}</Text>
                        )}
                    </View>
                    <View style={styles.itemPriceBlock}>
                        <Text style={styles.itemPrice}>
                            ₱{parseFloat(item.totalAmount || '0').toFixed(2)}
                        </Text>
                        
                        <View style={styles.actionRowContainer}>
                            <TouchableOpacity 
                                onPress={() => goToEditItem(item, index)}
                                style={styles.editButton}
                            >
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={() => handleRemoveItem(index)}
                                style={styles.removeButton}
                            >
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />
            
            {renderHeader()}

            <FlatList
                data={cart}
                renderItem={renderCartItem}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContainer}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
            />

            {/* --- ACCRUAL PANEL BOTTOM summary DOCK --- */}
            <View style={styles.bottomDock}>
                <Text style={styles.cartSummaryText}>Cart Summary</Text>
                
                <View style={styles.rowBetween}>
                    <Text style={styles.labelPrimary}>Voucher total balance</Text>
                    <Text style={styles.labelValue}>
                        ₱{parseFloat(voucherInfo?.voucherAmountBalance || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                </View>

                <View style={styles.rowBetween}>
                    <Text style={styles.labelPrimary}>Cart total amount</Text>
                    <Text style={styles.labelValue}>
                        ₱{cartTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                </View>

                <View style={styles.rowBetween}>
                    <Text style={styles.labelPrimary}>Total cash added by farmer</Text>
                    <Text style={[styles.labelValue, cashAddedByFarmer > 0 && { color: '#E67E22', fontWeight: '700' }]}>
                        ₱{cashAddedByFarmer.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                </View>

                <View style={styles.rowBetween}>
                    <Text style={styles.labelPrimary}>Voucher remaining balance</Text>
                    <Text style={[styles.labelValue, remainingBalance === 0 && { color: '#D9383A' }]}>
                        ₱{remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                </View>

                {/* Action Submit Button */}
                {/* We need to add activity indicator */}
                <TouchableOpacity
                    style={[
                        styles.checkoutButton, 
                        (cart.length === 0 || transactionMutation.isPending) && styles.disabledCheckout
                    ]}
                    onPress={handleCheckout}
                    disabled={cart.length === 0 || transactionMutation.isPending}
                    activeOpacity={0.8}
                >
                    {transactionMutation.isPending ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.checkoutButtonText}>PROCESSING...</Text>
                        </View>
                    ) : (
                        <Text style={styles.checkoutButtonText}>SAVE TRANSACTION</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Status Alert feedback Modal */}
            <Modal
                visible={alertConfig.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setAlertConfig(p => ({ ...p, visible: false }))}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: '#FFFFFF', width: '100%', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 10 }}>
                        <View style={{ marginBottom: 16 }}>
                            {renderAlertPng(alertConfig.type)}
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#2C3E50', marginTop: 12, marginBottom: 8 }}>
                            {alertConfig.title}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#7F8C8D', textAlign: 'center', marginBottom: 20, lineHeight: 20 }}>
                            {alertConfig.message}
                        </Text>
                        <TouchableOpacity
                            style={{ 
                                backgroundColor: alertConfig.type === 'success' ? '#009246' : '#2C3E50', 
                                paddingVertical: 12, 
                                width: '100%', 
                                borderRadius: 8, 
                                alignItems: 'center' 
                            }}
                            onPress={() => {
                                setAlertConfig(p => ({ ...p, visible: false }));
                                
                                if (alertConfig.type === 'success') {
                                    // Let mutationFn handle forwarding logic safely, close fallback handles cleanly here
                                    navigation.navigate(ScreenNames.TRANSACTION_STACK.UPLOAD_CONFIRMATION_SCREEN, {
                                        transactionId:      transactionId,
                                        referenceNo:        voucherInfo?.reference_no,
                                        voucherId:          voucherInfo?.voucher_id,
                                        rsbsaNo:            voucherInfo?.rsbsa_no,
                                        shortname:          voucherInfo?.shortname
                                    });
                                }
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                                {alertConfig.type === 'success' ? 'CONTINUE' : 'TRY AGAIN'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ReviewCart;