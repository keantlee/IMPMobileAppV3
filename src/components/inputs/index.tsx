import React from 'react';
import { View, Text, KeyboardTypeOptions } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';
import FakeCurrencyInput from 'react-native-currency-input'; // Assuming this is the source library

// Define precise type structures for every single prop property
interface CategoryProps {
    onChangeValue: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    isFocus: boolean;
    // iconName?: string;
    placeholder: string;
    isError: boolean;
    errorMessage: string;
    value: string;
    items: Array<{ label: string; value: string }>;
}

// Destructure properties properly and bind the TS Type declaration interface
export const Category = ({
    onChangeValue,
    onBlur,
    onFocus,
    isFocus,
    // iconName,
    placeholder,
    isError,
    errorMessage,
    value,
    items
}: CategoryProps) => {
    
    // Determine dynamic interactive border colors matching your existing UX rules
    const currentBorderColor = isFocus || value !== '' 
        ? '#009246' // Active Primary Green
        : isError 
            ? '#D9383A' // Error Red
            : '#BDC3C7'; // Default Muted Gray

    return (
        <View style={styles.wrapper}>
            <Dropdown
                style={[styles.dropdown, { borderColor: currentBorderColor }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.containerStyle}
                itemTextStyle={styles.itemTextStyle}
                activeColor="rgba(0, 146, 70, 0.05)" 
                data={items || []} 
                labelField="label"
                valueField="value"
                placeholder={placeholder}
                value={value}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={item => {
                    // Extract item.value string cleanly for backward form-state safety
                    onChangeValue(item.value);
                }}
                // renderLeftIcon={() => (
                //     <MaterialIcons
                //         name={iconName || 'auto-awesome-mosaic'}
                //         size={22}
                //         color={isFocus || value !== '' ? '#009246' : '#7F8C8D'}
                //         style={styles.leftIcon}
                //     />
                // )}
            />

            {isError && (
                <View style={styles.errorContainer}>
                    {/* <MaterialIcons name="error-outline" size={14} color="#D9383A" /> */}
                    <Text style={styles.errorMessageText}>{errorMessage}</Text>
                </View>
            )}
        </View>
    );
};

interface AmountInputProps {
    label?:             string;
    onChangeValue:      (value: number | null) => void;
    onBlur?:            () => void;
    onFocus?:           () => void;
    isFocus:            boolean;
    secureTextEntry?:   boolean;
    iconName?:          string;
    placeholder?:       string;
    isError:            boolean;
    errorMessage:       string; 
    value:              number | null; 
    keyboardType?:      KeyboardTypeOptions;
    prefix?:            string;
    textColor?:         string;
}

export const AmountInput = ({
    label,
    onChangeValue,
    onBlur,
    onFocus,
    isFocus,
    secureTextEntry,
    iconName,
    placeholder,
    isError,
    errorMessage,
    value,
    keyboardType = 'decimal-pad', // Clean fallback defaults assignment
    prefix = '',
    textColor = '#2C3E50'
}: AmountInputProps) => {

    // Map uniform input wrapper borders matching core validation design states
    const currentBorderColor = isFocus || (value !== 0 && value !== null)
        ? '#009246' // Active Focus Green
        : isError 
            ? '#D9383A' // Validation Failure Danger Red
            : '#BDC3C7'; // Default Uniform Idle Gray

    return (
        <View style={styles.wrapperContainer}>
            {/* {label && <Text style={styles.inputHeaderLabel}>{label}</Text>} */}
            
            <View style={styles.primaryContainer}>
                <View>
                    <FakeCurrencyInput 
                        value={value}
                        onChangeValue={onChangeValue}
                        keyboardType={keyboardType}
                        placeholder={placeholder}     
                        placeholderTextColor="#95A5A6"            
                        style={[
                            styles.primaryInputSmallBox,
                            { 
                                borderColor: currentBorderColor,
                                color: "#000000" 
                            }
                        ]} 
                        onFocus={onFocus} 
                        onBlur={onBlur} 
                        prefix={prefix}
                        delimiter=","
                        separator="."
                        minValue={0}
                        precision={2}                                       
                    />
                    
                    {/* Unified Validation Alert Banner Display Layout */}
                    {isError && (
                        <View style={styles.errorRowInline}>
                            {/* <MaterialIcons 
                                name="error-outline" 
                                size={14} 
                                color="#D9383A"                     
                            /> */}
                            <Text style={styles.errorMessageText}>
                                {errorMessage}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};