import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Component Imports
import Home from '../screens/home';
import ScreenNames from './screenNames';
import VoucherQR from '../screens/scanQr/voucher';
import FarmerProfile from '../screens/transaction/voucher/farmerProfile';

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
            initialRouteName={ScreenNames.TRANSACTION_STACK.SCANNING}
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
            />

            {/* Cart Screen */}

            {/* Add Items Screen */}

            {/* Edit Items Screen */}

            {/* Checkout Screen */}

            {/* Review Transaction Screen */}

            {/* Upload Attachment Screen */}
        </TransactionStack.Navigator>
    );
};


export default TransactionStackComponent;