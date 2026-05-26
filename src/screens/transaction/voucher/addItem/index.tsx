import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Pressable,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Global Typing Contracts
import { VoucherInfo } from '../../../../@types/voucher';

// Import local custom styles configuration
import { styles } from './styes';
import { AmountInput, Category } from '../../../../components/inputs';

// Placeholder standard elements wrapper. Swap back your actual project UI variants if required.
// e.g., import Components from '../../../components';

interface AddItemRouteParams {
    commodityInfo?: any;
    voucherInfo: VoucherInfo;
    cart: any[];
    cartTotalAmount: number;
    addToCart: (item: any) => void;
    timer?: number;
}

const AddItem = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Cast route parameters cleanly
    const routeParams = (route.params || {}) as AddItemRouteParams;
    const { 
        voucherInfo, 
        cart, 
        cartTotalAmount, 
        addToCart 
    } = routeParams;

    console.log('[ADD ITEM SCREEN] route params payload: ', routeParams);

    // 1. Core Structural State Trackers
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [clicked, setClicked] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const searchRef = useRef<TextInput>(null);

    // Form Object Parameters Trackers
    const [category, setCategory] = useState({ value: '', focus: false, error: false, errorMessage: '' });
    const [subCategory, setSubCategory] = useState({ value: '', focus: false, error: false, errorMessage: '' });
    const [quantity, setQuantity] = useState({ value: 0.00, focus: false, error: false, errorMessage: '' });
    const [unitMeasurement, setUnitMeasurement] = useState({ value: '', focus: false, error: false, errorMessage: '' });
    const [totalAmount, setTotalAmount] = useState({ value: 0.00, focus: false, error: false, errorMessage: '' });
    const [remarks, setRemarks] = useState({ value: '', focus: false, error: false, errorMessage: '' });

    // 2. Performance Memoized Framework Arrays & Balances
    const checkCategoryHasSubCategory = useMemo(() => 
        voucherInfo?.getCheckCategoryHasSubCategory?.map(c => c.fertilizer_category_id) || [], 
    [voucherInfo]);

    const availableSubCategories = useMemo(() => {
        if (!voucherInfo?.sub_categories || !category.value) return [];
        
        const filteredByCategory = voucherInfo.sub_categories
            .filter(item => item.fertilizer_category_id === category.value)
            .map(item => ({ label: item.sub_category, value: item.sub_category }));
        
        if (search.trim() !== '') {
            return filteredByCategory.filter(item => 
                item.value.toLowerCase().includes(search.toLowerCase())
            );
        }
        return filteredByCategory;
    }, [category.value, voucherInfo, search]);

    const cashAdded = useMemo(() => {
        const remainingBalance = parseFloat(voucherInfo?.voucherRemainingBalance || '0');
        const totalCartAmount = parseFloat((cartTotalAmount || 0).toString());
        const inputAmount = parseFloat(totalAmount.value.toString() || '0');
        
        const currentWallet = remainingBalance - totalCartAmount;
        const diff = currentWallet - inputAmount;
        
        return diff < 0 ? Math.abs(diff) : 0;
    }, [voucherInfo?.voucherRemainingBalance, cartTotalAmount, totalAmount.value]);

    const remainingBalanceDisplay = useMemo(() => {
        const remainingBalance = parseFloat(voucherInfo?.voucherRemainingBalance || '0');
        const totalCartAmount = parseFloat((cartTotalAmount || 0).toString());
        const inputAmount = parseFloat(totalAmount.value.toString() || '0');
        
        const balance = (remainingBalance - totalCartAmount) - inputAmount;
        return balance < 0 ? 0 : balance;
    }, [voucherInfo, cartTotalAmount, totalAmount.value]);

    // 3. Optimized Change Handlers
    const handleChangeQuantity = useCallback((value: number | null) => {
        // Treat null/empty as 0 safely
        const newValue = value === null ? 0 : Math.abs(value);

        let error = false;
        let errorMessage = '';

        if (voucherInfo?.is_special === '1') {
            if (newValue < 0.1) {
                error = true;
                errorMessage = "Minimum quantity is 0.1";
            } else if (newValue > 25.00) {
                error = true;
                errorMessage = "Maximum quantity is 25.0";
            }
        } else {
            if (newValue <= 0) {
                error = true;
                errorMessage = "Quantity must be greater than 0";
            }
        }

        setQuantity(prev => ({ ...prev, value: newValue, error, errorMessage }));
    }, [voucherInfo]);

    const handleChangeUnitMeasurement = useCallback((value: string) => {
        let error = false;
        let errorMessage = '';

        if (voucherInfo?.is_special === '1' && parseInt(value) !== 2) {
            error = true;
            errorMessage = "Special program requires Kilo (KG)";
        }

        setUnitMeasurement(prev => ({ ...prev, value, error, errorMessage }));
    }, [voucherInfo]);

    const handleChangeTotalAmount = useCallback((value: number | null) => {
        const newValue = value === null ? 0 : Math.abs(value);
        const availableBalance = parseFloat(voucherInfo?.voucherRemainingBalance || '0') - parseFloat((cartTotalAmount || 0).toString());

        let error = false;
        let errorMessage = '';

        if (voucherInfo?.is_special === '1') {
            if (availableBalance >= 1500) {
                if (newValue > 1500) {
                    error = true;
                    errorMessage = "Amount should not exceed ₱1,500.00";
                } else if (newValue < 1500) {
                    error = true;
                    errorMessage = "Amount should not be lower than ₱1,500.00";
                }
            } else {
                if (newValue !== availableBalance) {
                    error = true;
                    errorMessage = `Amount must match the precise balance: ₱${availableBalance.toFixed(2)}`;
                }
            }
        } else {
            if (newValue > availableBalance) {
                error = true;
                errorMessage = "Amount exceeds remaining balance";
            }
        }

        setTotalAmount(prev => ({ ...prev, value: newValue, error, errorMessage }));
    }, [voucherInfo, cartTotalAmount]);

    // 4. Cart Serialization Dispatcher
    const handleAddToCart = () => {
        let countError = 0;

        if (!category.value) {
            setCategory(p => ({ ...p, error: true, errorMessage: "Category is required!" }));
            countError++;
        }
        if (checkCategoryHasSubCategory.includes(category.value) && !subCategory.value) {
            setSubCategory(p => ({ ...p, error: true, errorMessage: "Sub-category is required!" }));
            countError++;
        }
        if (!quantity.value || quantity.value <= 0 || quantity.error) {
            setQuantity(p => ({ ...p, error: true, errorMessage: p.errorMessage || " Quantity required!" }));
            countError++;
        }
        if (!unitMeasurement.value || unitMeasurement.error) {
            setUnitMeasurement(p => ({ ...p, error: true, errorMessage: unitMeasurement.errorMessage || "Unit of measurement is required!" }));
            countError++;
        }
        if (!totalAmount.value || totalAmount.value <= 0 || totalAmount.error) {
            setTotalAmount(p => ({ ...p, error: true, errorMessage: totalAmount.errorMessage || "Amount required!" }));
            countError++;
        }

        if (countError === 0) {
            setIsLoading(true);
            const unitShorthand: Record<string, string> = { "1": "(L)", "2": "(KG)", "3": "(G)", "4": "(ML)" };
            const displayUnit = unitShorthand[unitMeasurement.value] || unitMeasurement.value;

            // Resolve the clean subcategory value or assign category title fallback
            const assignedSubName = checkCategoryHasSubCategory.includes(category.value) 
                ? subCategory.value 
                : voucherInfo.fertilizer_categories.find(c => c.value === category.value)?.label || "Item";

            const serializedItem = {
                name:                   assignedSubName,
                category:               category.value,
                subCategory:            subCategory.value,
                quantity:               quantity.value,
                unitMeasurement:        displayUnit,
                uom:                    unitMeasurement.value,
                totalAmount:            totalAmount.value,
                cashAdded:              cashAdded,
                itemCategoryRemarks:    remarks.value.trim() || "None",
            };

            console.log("[ADD ITEM SCREEN] Serialization payload generated:", serializedItem);
            
            // Execute parent context state appending hook directly
            addToCart(serializedItem);
            setIsLoading(false);
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />

            {/* HEADER DESIGN ROW LAYER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Item Details</Text>
                <View style={styles.backPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* FIELD: CATEGORY SELECTION DROPDOWN */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>
                        Category <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <Category
                        // iconName="auto-awesome-mosaic"
                        placeholder="Select Category"
                        items={voucherInfo?.fertilizer_categories || []}
                        value={category.value}
                        isFocus={category.focus}
                        isError={category.error}
                        errorMessage={category.errorMessage}
                        onFocus={() => setCategory(p => ({ ...p, focus: true }))}
                        onBlur={() => setCategory(p => ({ ...p, focus: false }))}
                        onChangeValue={(val: any) => {
                            // Clean resetting: clear sub-category value whenever the parent category changes
                            setCategory(p => ({ ...p, value: val, error: false, errorMessage: '' }));
                            setSubCategory(p => ({ ...p, value: '', error: false, errorMessage: '' }));
                        }}
                    />
                </View>

                {/* FIELD: MODAL SUB-CATEGORY SELECTOR DRAWER LIST */}
                {checkCategoryHasSubCategory.includes(category.value) && (
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Sub Category</Text>
                        <TouchableOpacity 
                            style={[
                                styles.dropdownBox, 
                                subCategory.error && { borderColor: '#D9383A' } // Fallback style indicator
                            ]}
                            onPress={() => setClicked(!clicked)}
                            activeOpacity={0.7}
                        >
                            <Text style={{ color: subCategory.value ? '#2C3E50' : '#BDC3C7', fontWeight: subCategory.value ? '600' : '400' }}>
                                {subCategory.value || "Select Sub Category"}
                            </Text>
                        </TouchableOpacity>

                        {clicked && (
                            <View style={styles.modalContainer}>
                                <View style={styles.modalSearchRow}>
                                    <MaterialIcons name="search" size={20} color="#7F8C8D" />
                                    <TextInput 
                                        ref={searchRef}
                                        style={styles.modalSearchInput}
                                        placeholder="Search sub-category..."
                                        placeholderTextColor="#95A5A6"
                                        value={search}
                                        onChangeText={setSearch}
                                    />
                                    <Pressable onPress={() => { setClicked(false); setSearch(''); }}>
                                        <MaterialIcons name="cancel" size={20} color="#2C3E50" />
                                    </Pressable>
                                </View>
                                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                    {availableSubCategories.length > 0 ? (
                                        availableSubCategories.map((item, idx) => (
                                            <TouchableOpacity 
                                                key={idx} 
                                                style={styles.modalItemRow}
                                                onPress={() => {
                                                    setSubCategory({ value: item.value, focus: false, error: false, errorMessage: '' });
                                                    setClicked(false);
                                                    setSearch('');
                                                }}
                                            >
                                                <Text style={[
                                                    styles.modalItemText,
                                                    subCategory.value === item.value && { fontWeight: '700', color: '#009246' }
                                                ]}>
                                                    {item.value}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <Text style={styles.noResultsText}>No sub-categories found</Text>
                                    )}
                                </ScrollView>
                            </View>
                        )}
                        {/* Display manual error message if validation catches missing sub-category selection */}
                        {subCategory.error && <Text style={styles.errorLabel}>{subCategory.errorMessage}</Text>}
                    </View>
                )}

                {/* ROW COMPONENT BLOCK: QUANTITY & UNIT ELEMENT SEGMENTS */}
                <View style={styles.flexRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.formLabel}>Quantity</Text>
                        <AmountInput 
                            placeholder="Enter quantity"
                            value={quantity.value} // FakeCurrencyInput handles numeric values directly
                            isFocus={quantity.focus}
                            isError={quantity.error}
                            errorMessage={quantity.errorMessage}
                            onChangeValue={handleChangeQuantity}
                            onFocus={() => setQuantity(p => ({ ...p, focus: true }))}
                            onBlur={() => setQuantity(p => ({ ...p, focus: false }))}
                        />
                        {/* Removed duplicate error text element here */}
                    </View>

                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.formLabel}>* Unit Measurement</Text>
                        <Category
                            placeholder="Select unit"
                            items={voucherInfo?.unit_measurements || []}
                            value={unitMeasurement.value}
                            isFocus={unitMeasurement.focus}
                            isError={unitMeasurement.error}
                            errorMessage={unitMeasurement.errorMessage}
                            onFocus={() => setUnitMeasurement(p => ({ ...p, focus: true }))}
                            onBlur={() => setUnitMeasurement(p => ({ ...p, focus: false }))}
                            onChangeValue={handleChangeUnitMeasurement}
                        />
                    </View>
                </View>

                {/* FIELD: VALUATION AMOUNT CARD BLOCK */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Amount</Text>
                    <AmountInput 
                        placeholder="₱0.00"
                        prefix="₱" // Added currency visual indicator safely
                        value={totalAmount.value}
                        isFocus={totalAmount.focus}
                        isError={totalAmount.error}
                        errorMessage={totalAmount.errorMessage}
                        onChangeValue={handleChangeTotalAmount}
                        onFocus={() => setTotalAmount(p => ({ ...p, focus: true }))}
                        onBlur={() => setTotalAmount(p => ({ ...p, focus: false }))}
                    />
                </View>

                {/* FIELD: REMARKS */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Remarks (Optional)</Text>
                    <TextInput 
                        style={styles.inputField}
                        placeholder="Add execution comments..."
                        value={remarks.value}
                        onChangeText={(val) => setRemarks(p => ({ ...p, value: val }))}
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomDock}>
                <View style={styles.dockRow}>
                    <Text style={styles.dockLabel}>Remaining Voucher Balance</Text>
                    <Text style={styles.dockValue}>₱{remainingBalanceDisplay.toFixed(2)}</Text>
                </View>
                {voucherInfo?.is_special !== '1' && (
                    <View style={styles.dockRow}>
                        <Text style={styles.dockLabel}>Cash Added</Text>
                        <Text style={[styles.dockValue, cashAdded > 0 && { color: '#E67E22' }]}>₱{cashAdded.toFixed(2)}</Text>
                    </View>
                )}
                
                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleAddToCart}
                    disabled={isLoading}
                >
                    <Text style={styles.submitButtonText}>ADD ITEM</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddItem;