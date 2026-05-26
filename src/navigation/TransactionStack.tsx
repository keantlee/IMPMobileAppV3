import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Component Imports
import Home from '../screens/home';
import ScreenNames from './screenNames';
import VoucherQR from '../screens/scanQr/voucher';
import FarmerProfile from '../screens/transaction/voucher/farmerProfile';
import Cart from '../screens/transaction/voucher/cart';
import AddItem from '../screens/transaction/voucher/addItem';

import { MOCK_VOUCHER_INFO } from '../data/voucherInfo';

// 1. Declare the type structure for perfect internal navigation safety
export type TransactionStackParamList = {
    [key: string]: undefined | object; 
};

// 2. Instantiate using the modern native optimizer engine
const TransactionStack = createNativeStackNavigator<TransactionStackParamList>();

export const TransactionStackComponent: React.FC = () => {
    return (
        <TransactionStack.Navigator
            screenOptions={{
                 headerShown: false,
                 // Native stack equivalent for clean fade transitions across operating systems
                 animation: 'fade_from_bottom' 
            }}
            // initialRouteName={ScreenNames.TRANSACTION_STACK.SCANNING}
            initialRouteName={ScreenNames.TRANSACTION_STACK.FARMER_PROFILE}
        >
            {/* Scan QR Screen */}
            <TransactionStack.Screen
                component={VoucherQR}
                name={ScreenNames.TRANSACTION_STACK.SCANNING}
            />

            {/* Farmer Profile Screen */}
            <TransactionStack.Screen
                component={FarmerProfile}
                name={ScreenNames.TRANSACTION_STACK.FARMER_PROFILE}
                initialParams={{
                    voucherInfo: MOCK_VOUCHER_INFO,
                    cart: [],
                    cartTotalAmount: 0
                }}
            />

            {/* Cart Screen */}
            <TransactionStack.Screen
                component={Cart}
                name={ScreenNames.TRANSACTION_STACK.CART}
            />

            {/* Add Items Screen */}
            <TransactionStack.Screen
                component={AddItem}
                name={ScreenNames.TRANSACTION_STACK.ADD_ITEM}
            />

            {/* Edit Items Screen */}

            {/* Checkout Screen */}

            {/* Review Transaction Screen */}

            {/* Upload Attachment Screen */}
        </TransactionStack.Navigator>
    );
};


export default TransactionStackComponent;