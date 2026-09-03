import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Global Typing Contracts
import { VoucherInfo } from '../../../../@types/voucher';

// Style Configurations and Screen Context Maps
import { styles } from './styles';
import { AmountInput, Category } from '../../../../components/inputs';
import ScreenNames from '../../../../navigation/screenNames';

interface EditItemRouteParams {
    commodityInfo:      any; // Includes {...item, index} passed down from Checkout
    voucherInfo:        VoucherInfo;
    cart:               any[];
    cartTotalAmount:    number; // This maps exactly to our 'otherItemsTotal' balance line
    timer?:             number;
}

const EditItem = () => {
    const navigation    = useNavigation<any>();
    const route         = useRoute<any>();

    // Cast route parameters cleanly
    const routeParams = (route.params || {}) as EditItemRouteParams;
    const { 
        commodityInfo, 
        voucherInfo, 
        cart,
        cartTotalAmount: otherItemsTotal, 
        timer,
    } = routeParams;

    console.log('[EDIT ITEM SCREEN] Route parameters payload intercepted:', routeParams);

    // 1. Core Structural State Trackers
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [clicked, setClicked]     = useState<boolean>(false);
    const [search, setSearch]       = useState<string>('');
    const searchRef                 = useRef<TextInput>(null);

    // Form Object Parameter Trackers (Pre-loaded with existing item values)
    const [category, setCategory] = useState({ 
        value: commodityInfo?.category || '', 
        focus: false, 
        error: false, 
        errorMessage: '' 
    });
    const [subCategory, setSubCategory] = useState({ 
        value: commodityInfo?.subCategory || '', 
        focus: false, 
        error: false, 
        errorMessage: '' 
    });
    const [quantity, setQuantity] = useState({ 
        value: commodityInfo?.quantity || 0.00,  
        focus: false, 
        error: false, 
        errorMessage: '' 
    });
    const [unitMeasurement, setUnitMeasurement] = useState({ 
        value: commodityInfo?.uom || '', 
        focus: false, 
        error: false, 
        errorMessage: '' 
    });
    const [totalAmount, setTotalAmount] = useState({ 
        value: parseFloat(commodityInfo?.totalAmount || '0'), 
        focus: false,
        error: false, 
        errorMessage: '' 
    });
    const [remarks, setRemarks] = useState({ 
        value: commodityInfo?.itemCategoryRemarks === "None" ? "" : commodityInfo?.itemCategoryRemarks || '', 
        focus: false, 
        error: false, 
        errorMessage: '' 
    });

    // 2. Performance Memoized Arrays & Dynamic Balances
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

    const availableWalletBalance = useMemo(() => {
        const remainingBalanceProfile = parseFloat(voucherInfo?.voucherRemainingBalance || '0');
        const otherItemsCost = parseFloat((otherItemsTotal || 0).toString());
        return remainingBalanceProfile - otherItemsCost;
    }, [voucherInfo, otherItemsTotal]);

    const cashAdded = useMemo(() => {
        const inputAmount = parseFloat(totalAmount.value.toString() || '0');
        const diff = availableWalletBalance - inputAmount;
        return diff < 0 ? Math.abs(diff) : 0;
    }, [availableWalletBalance, totalAmount.value]);

    const remainingBalanceDisplay = useMemo(() => {
        const inputAmount = parseFloat(totalAmount.value.toString() || '0');
        const balance = availableWalletBalance - inputAmount;
        return balance < 0 ? 0 : balance;
    }, [availableWalletBalance, totalAmount.value]);

    // 3. Optimized Change Handlers
    const handleChangeQuantity = useCallback((value: number | null) => {
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
        let error = false;
        let errorMessage = '';

        if (voucherInfo?.is_special === '1') {
            if (availableWalletBalance >= 1500) {
                if (newValue > 1500) {
                    error = true;
                    errorMessage = "Amount should not exceed ₱1,500.00";
                } else if (newValue < 1500) {
                    error = true;
                    errorMessage = "Amount should not be lower than ₱1,500.00";
                }
            } else {
                if (newValue !== availableWalletBalance) {
                    error = true;
                    errorMessage = `Amount must match the precise balance: ₱${availableWalletBalance.toFixed(2)}`;
                }
            }
        } else {
            if (newValue > availableWalletBalance) {
                error = true;
                errorMessage = "Amount exceeds remaining balance";
            }
        }
        setTotalAmount(prev => ({ ...prev, value: newValue, error, errorMessage }));
    }, [voucherInfo, availableWalletBalance]);

    // 4. State Update and Back-Propagation Handler
    const handleSaveChanges = () => {
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
            setQuantity(p => ({ ...p, error: true, errorMessage: p.errorMessage || "Quantity required!" }));
            countError++;
        }
        if (!unitMeasurement.value || unitMeasurement.error) {
            setUnitMeasurement(p => ({ ...p, error: true, errorMessage: unitMeasurement.errorMessage || "Unit required!" }));
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

            // Resolve the selected category's display label. Fall back to the
            // item's original categoryName so it's never dropped on edit.
            const categoryLabel =
                voucherInfo?.fertilizer_categories?.find(c => c.value === category.value)?.label
                || commodityInfo?.categoryName
                || "Commodity";

            const assignedSubName = checkCategoryHasSubCategory.includes(category.value) 
                ? subCategory.value 
                : categoryLabel;

            const serializedEditedItem = {
                name:                   assignedSubName,
                category:               category.value,
                categoryName:           categoryLabel,   // preserve category label for the Review Cart display
                subCategory:            subCategory.value,
                quantity:               quantity.value,
                unitMeasurement:        displayUnit,
                uom:                    unitMeasurement.value,
                totalAmount:            totalAmount.value,
                cashAdded:              cashAdded,
                itemCategoryRemarks:    remarks.value.trim() || "None",
            };

            console.log("[EDIT ITEM SCREEN] Generating updated payload:", serializedEditedItem);

            // ✅ Map updates directly across your historical array mapping using the original index 
            const fullyUpdatedCartArray = cart.map((item, idx) => 
                idx === commodityInfo.index ? serializedEditedItem : item
            );

            setIsLoading(false);

            // ✅ Back-propagate the edited cart into the Review Cart screen, which
            // intercepts updatedCartFromEdit via its route params. Re-send
            // voucherInfo and timer too so Review Cart never loses its voucher
            // context on the edit round-trip (it originally received these from
            // the Cart screen).
            navigation.navigate({
                name: ScreenNames.TRANSACTION_STACK.REVIEW_CART,
                params: { 
                    updatedCartFromEdit: fullyUpdatedCartArray,
                    voucherInfo:         voucherInfo,
                    timer:               timer,
                },
                merge: true,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />

            {/* HEADER DESIGN AREA */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Item Details</Text>
                <View style={styles.backPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* FIELD: CATEGORY SELECTION DROPDOWN */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>
                        Category <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <Category
                        placeholder="Select Category"
                        items={voucherInfo?.fertilizer_categories || []}
                        value={category.value}
                        isFocus={category.focus}
                        isError={category.error}
                        errorMessage={category.errorMessage}
                        onFocus={() => setCategory(p => ({ ...p, focus: true }))}
                        onBlur={() => setCategory(p => ({ ...p, focus: false }))}
                        onChangeValue={(val: any) => {
                            setCategory(p => ({ ...p, value: val, error: false, errorMessage: '' }));
                            setSubCategory(p => ({ ...p, value: '', error: false, errorMessage: '' }));
                        }}
                    />
                </View>

                {/* FIELD: SUB-CATEGORY DROPDOWN DRAWER */}
                {checkCategoryHasSubCategory.includes(category.value) && (
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>
                            Sub Category <Text style={styles.asterisk}>*</Text>
                        </Text>
                        <TouchableOpacity 
                            style={[styles.dropdownBox, subCategory.error && { borderColor: '#D9383A' }]}
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
                        {subCategory.error && <Text style={styles.errorLabel}>{subCategory.errorMessage}</Text>}
                    </View>
                )}

                {/* ROW SYSTEM BLOCK: QUANTITY & UNIT ELEMENT SEGMENTS */}
                <View style={styles.flexRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.formLabel}>
                            Quantity <Text style={styles.asterisk}>*</Text>
                        </Text>
                        <AmountInput 
                            placeholder="Enter quantity"
                            value={quantity.value} 
                            isFocus={quantity.focus}
                            isError={quantity.error}
                            errorMessage={quantity.errorMessage}
                            onChangeValue={handleChangeQuantity}
                            onFocus={() => setQuantity(p => ({ ...p, focus: true }))}
                            onBlur={() => setQuantity(p => ({ ...p, focus: false }))}
                        />
                    </View>

                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.formLabel}> 
                            Unit Measurement <Text style={styles.asterisk}>*</Text>
                        </Text>
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
                    <Text style={styles.formLabel}>
                        Amount <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <AmountInput 
                        placeholder="₱0.00"
                        prefix="₱" 
                        value={totalAmount.value}
                        isFocus={totalAmount.focus}
                        isError={totalAmount.error}
                        errorMessage={totalAmount.errorMessage}
                        onChangeValue={handleChangeTotalAmount}
                        onFocus={() => setTotalAmount(p => ({ ...p, focus: true }))}
                        onBlur={() => setTotalAmount(p => ({ ...p, focus: false }))}
                    />
                </View>

                {/* FIELD: REMARKS TEXTAREA INPUT BOX */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Remarks (Optional)</Text>
                    <TextInput 
                        style={styles.inputField}
                        placeholder="Enter any remarks"
                        placeholderTextColor="#95A5A6"
                        value={remarks.value}
                        onChangeText={(val) => setRemarks(p => ({ ...p, value: val }))}
                    />
                </View>
            </ScrollView>

            {/* --- BOTTOM DOCK CONTROL STRIP CONTAINER --- */}
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
                    onPress={handleSaveChanges}
                    disabled={isLoading}
                >
                    <Text style={styles.submitButtonText}>SAVE CHANGES</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default EditItem;