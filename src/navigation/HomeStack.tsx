import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Component Imports
import Home from '../screens/home';
import ScreenNames from './screenNames';
import TransactionHistory from '../screens/home/transactionHistory';
import TransactionDetail from '../screens/home/transactionHistory/transactionDetail';
import UploadAttachment from '../screens/transaction/voucher/uploadAttachment';
import ReUploadAttachment from '../screens/transaction/voucher/reupload';

// 1. Declare the type structure for perfect internal navigation safety
export type HomeStackParamList = {
    [key: string]: undefined | object; 
};

// 2. Instantiate using the modern native optimizer engine
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackComponent: React.FC = () => {
    return (
        <HomeStack.Navigator            
            screenOptions={{
                 headerShown: false,
                 // Native stack equivalent for clean fade transitions across operating systems
                 animation: 'fade_from_bottom' 
            }}
            initialRouteName={ScreenNames.HOME_STACK.HOME}
        >           
            <HomeStack.Screen
                component={Home}
                name={ScreenNames.HOME_STACK.HOME}
            />  

            {/* 
                Transaction History Screen
                1.) Filter by All
                1.) Filter by Complete Transaction
                2.) Filter by Pending Transaction
                3.) Filter by Re-Transact
                4.) Filter by Re-Upload Transaction
            */}
            <HomeStack.Screen
                component={TransactionHistory}
                name={ScreenNames.HOME_STACK.TRANSACTION_HISTORY}
                options={{ animation: 'fade' }}                
            />  

            {/*  
                Transaction Detail Screen
                1.) Use for Complete Transaction
                2.) Use for Pending Transaction
            */}
            <HomeStack.Screen
                component={TransactionDetail}
                name={ScreenNames.HOME_STACK.TRANSACTION_DETAIL}
                options={{ animation: 'fade' }}                
            />

            {/* 
                Upload Attachment Screen use for Pending Transactions 
                1.) Use for Pending Transaction
            */}
            <HomeStack.Screen
                component={UploadAttachment}
                name={ScreenNames.TRANSACTION_STACK.UPLOAD_ATTACHMENTS}
                options={{ animation: 'fade' }}                
            />

            {/* 
                ReUpload Screen 
                1.) Use for Re-Upload Transaction
            */}
            <HomeStack.Screen
                component={ReUploadAttachment}
                name={ScreenNames.TRANSACTION_STACK.RE_UPLOAD_ATTACHMENTS}
                options={{ animation: 'fade' }}                
            />
        </HomeStack.Navigator>
    );
};

export default HomeStackComponent;