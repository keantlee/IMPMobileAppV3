import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StatusBar,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';

// Import Global Types and Path Constants
import { VoucherInfo } from '../../../../@types/voucher';
import ScreenNames from '../../../../navigation/screenNames';


import { styles } from './styles';

interface CartRouteParams {
    status:         boolean;
    voucherInfo:    VoucherInfo;
    timer?:         number;
}

const Cart = () => {
    const navigation =  useNavigation<any>();
    const route      =  useRoute<any>();
    
    // Cast your route params using our defined structure
    const routeParams            = (route.params || {}) as CartRouteParams;
    const { voucherInfo, timer } = routeParams;

    // 1. Local Shopping Cart State Allocation
    const [cart, setCart]        = useState<any[]>([]);

    // 2. Memoized Financial Metrics Calculations
    const cartTotal = useMemo(() => {
        return cart.reduce((prev, current) => prev + parseFloat(current.totalAmount || 0), 0);
    }, [cart]);

    const remainingBalance = useMemo(() => {
        const balance = parseFloat(voucherInfo?.voucherRemainingBalance || '0') - cartTotal;
        return balance < 0 ? 0 : balance;
    }, [voucherInfo?.voucherRemainingBalance, cartTotal]);

    // 3. Callback Actions
    const addToCart = useCallback((item: any) => {
        console.log("[CART SCREEN] Item appended to basket state:", item);
        setCart((prevCart) => [...prevCart, item]);
    }, []);

    const handleRemoveItem = useCallback((index: number) => {
        setCart((prevCart) => {
            const updatedCart = [...prevCart];
            updatedCart.splice(index, 1);
            return updatedCart;
        });
    }, []);

    const handleGoToCheckout = () => {
        if (cart.length === 0) return;

        navigation.navigate(ScreenNames.TRANSACTION_STACK.CHECKOUT, {
            voucherInfo,
            cart,
            timer,
            // Pass state modifier reference down over navigation bridge channel safely
            handleUpdateCart: (updatedCart: any[]) => setCart(updatedCart), 
        });
    };

    const goToSetCommodityDetails = (item?: any) => {
        // Fallback resolution pathing if default array indices are called
        const selectedItem = item || (voucherInfo?.sub_categories && voucherInfo.sub_categories[0]);

        if (!selectedItem) {
            console.warn("[CART SCREEN] Missing items reference array inside object target.");
            return;
        }

        // Business Logic: Special Program Constraints enforcement (is_special === '1')
        if (voucherInfo?.is_special === '1' && cart.length >= 1 && !item) {
            console.log("[CART SCREEN] Validation Notice: Special program rules enforce maximum checkout count of 1.");
            return;
        }

        navigation.navigate(ScreenNames.TRANSACTION_STACK.ADD_ITEM, {
            commodityInfo:      selectedItem,
            voucherInfo:        voucherInfo,
            cart:               cart,
            cartTotalAmount:    cartTotal,
            addToCart:          addToCart,
            timer:              timer
        });
    };

    // 4. Fragment Render Splitting Modules
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cart / Commodities</Text>
            <View style={styles.backPlaceholder} />
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items added to cart yet.</Text>
        </View>
    );

    const renderDashedButton = () => {
        // Hide control interface row layout if constraint limit threshold has been filled out
        if (voucherInfo?.is_special === '1' && cart.length >= 1) return null;

        const isFullyConsumed = remainingBalance <= 0;

        return (
            <View style={styles.footerActionsContainer}>
                <TouchableOpacity
                    style={[styles.dashedButton, isFullyConsumed && styles.disabledButton]}
                    onPress={() => !isFullyConsumed && goToSetCommodityDetails()}
                    disabled={isFullyConsumed}
                    activeOpacity={0.6}
                >
                    <Text style={[styles.dashedButtonText, isFullyConsumed && { color: '#999' }]}>
                        {isFullyConsumed ? "Voucher Balance Consumed" : "+ Add Items"}
                    </Text>
                </TouchableOpacity>

                {isFullyConsumed && (
                    <Text style={styles.alertText}>
                        The voucher amount is already fully consumed.
                    </Text>
                )}
            </View>
        );
    };

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
                    </View>
                    <View style={styles.itemPriceBlock}>
                        <Text style={styles.itemPrice}>
                            ₱{parseFloat(item.totalAmount || '0').toFixed(2)}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => handleRemoveItem(index)}
                            style={styles.removeButton}
                        >
                            <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (!voucherInfo) {
        return (
            <View style={styles.center}>
                <Text>Missing routing data payload parameters configuration mapping.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />
            
            {renderHeader()}

            <FlatList
                data={cart}
                renderItem={renderCartItem}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderDashedButton}
                contentContainerStyle={styles.listContainer}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
            />

            {/* --- BOTTOM FLOATING ACCRUAL PANEL DOCK --- */}
            <View style={styles.bottomDock}>
                <View style={styles.dockRow}>
                    <Text style={styles.dockLabelSecondary}>Voucher Total Balance</Text>
                    <Text style={styles.dockValueSecondary}>
                        ₱{parseFloat(voucherInfo.voucherAmountBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                </View>

                <View style={styles.dockRow}>
                    <Text style={styles.dockLabelPrimary}>Remaining Balance</Text>
                    <Text style={[styles.dockValuePrimary, remainingBalance === 0 && { color: '#D9383A' }]}>
                        ₱{remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.checkoutButton, cart.length === 0 && styles.disabledCheckout]}
                    onPress={handleGoToCheckout}
                    disabled={cart.length === 0}
                    activeOpacity={0.8}
                >
                    <Text style={styles.checkoutButtonText}>
                        {`Proceed to Checkout (${cart.length} ${cart.length === 1 ? 'item' : 'items'} • ₱${cartTotal.toFixed(2)})`}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Cart;