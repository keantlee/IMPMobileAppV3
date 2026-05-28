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

// Global Typings & Navigation Strings
import { VoucherInfo } from '../../../../@types/voucher';
import ScreenNames from '../../../../navigation/screenNames';

// Import custom external styles
import { styles } from './styles';

interface CheckoutRouteParams {
    voucherInfo:            VoucherInfo;
    cart:                   any[];  
    timer?:                 number;
    updatedCartFromEdit?:   any[]; // Intercepts array updates safely from Edit Item screen
}

const Checkout = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();

    const routeParams   = (route.params || {}) as CheckoutRouteParams;
    const { 
        voucherInfo, 
        cart: initialCart = [], 
        timer, 
    } = routeParams;

    console.log('[CHECKOUT SCREEN] Incoming state snapshot params:', routeParams);

    // 1. Core State Trackers
    const [cart, setCart]           = useState<any[]>(initialCart);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    // 3. Sync Back to Cart Handler Vector
    const handleSyncAndGoBack = useCallback(() => {
        navigation.navigate({
            name: ScreenNames.TRANSACTION_STACK.CART,
            params: { 
                voucherInfo:             voucherInfo,              // Keeps voucher data updated
                updatedCartFromCheckout: cart,                     // Syncs the active items list
                timer:                   timer                     // Keeps the running countdown alive
            },
            merge: true,
        });
    }, [navigation, voucherInfo, cart, timer]);

    // 4. Parameter Stream Event Listeners & Hardware Back Interceptors
    useEffect(() => {
        // Intercept updates traveling backward from Edit Item form screen safely
        if (route.params?.updatedCartFromEdit) {
            const synchronizedEditArray = route.params.updatedCartFromEdit;
            console.log("[CHECKOUT SCREEN] Intercepted edited array package:", synchronizedEditArray);
            
            setCart(synchronizedEditArray);

            // Immediately flush parameter snapshot to clean execution cycle
            navigation.setParams({ updatedCartFromEdit: undefined });
        }
    }, [route.params?.updatedCartFromEdit]);

    useEffect(() => {
        const hardwareBackAction = () => {
            handleSyncAndGoBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", hardwareBackAction);
        return () => backHandler.remove();
    }, [handleSyncAndGoBack]);

    // 5. User Interaction Dispatch Methods
    const handleRemoveItem = useCallback((index: number) => {
        setCart((prevCart) => {
            const updatedCart = [...prevCart];
            updatedCart.splice(index, 1);
            
            // Auto-fallback redirect if basket is completely empty
            if (updatedCart.length === 0) {
                navigation.navigate({
                    name: ScreenNames.TRANSACTION_STACK.CART,
                    params: { updatedCartFromCheckout: [] },
                    merge: true,
                });
            }
            return updatedCart;
        });
    }, [navigation]);

    const goToEditItem = (item: any, index: number) => {
        // Total amount calculation for edit screen (excluding current item)
        const otherItemsTotal = cart.reduce((prev, curr, idx) => 
            prev + (idx !== index ? parseFloat(curr.totalAmount || 0) : 0), 0);

        console.log("[CHECKOUT SCREEN] Transferring data to Edit context panel index: ", index);

        navigation.navigate(ScreenNames.TRANSACTION_STACK.EDIT_ITEM, {
            commodityInfo:      { ...item, index }, // Appends target item index pointer safely
            voucherInfo:        voucherInfo,
            cart:               cart,            
            cartTotalAmount:    otherItemsTotal,       
            timer:              timer,
        });
    };

    const handleCheckout = () => {
        setIsLoading(true);
        const checkoutParams = { voucherInfo, cart, timer };
        console.log("[CHECKOUT SCREEN] Initiating pipeline processing package:", checkoutParams);
        
        // TODO: Import your functional checkout mutation logic hook directly here:
        // checkout(checkoutParams, (val) => setIsLoading(val.isLoading), { navigation });
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
                        <Text style={styles.itemSub}>{item.subCategory || "No Sub-Category"}</Text>
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

                <TouchableOpacity
                    style={[styles.checkoutButton, cart.length === 0 && styles.disabledCheckout]}
                    onPress={handleCheckout}
                    disabled={cart.length === 0 || isLoading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.checkoutButtonText}>
                        {isLoading ? "Processing..." : "CONFIRM CHECKOUT"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Checkout;