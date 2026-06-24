import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Component Imports
import Home from '../screens/home';
import ScreenNames from './screenNames';
import TransactionHistory from '../screens/home/transactionHistory';
import TransactionDetail from '../screens/home/transactionHistory/transactionDetail';
import UploadAttachment from '../screens/transaction/voucher/uploadAttachment';

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

            <HomeStack.Screen
                component={TransactionHistory}
                name={ScreenNames.HOME_STACK.TRANSACTION_HISTORY}
                options={{ animation: 'fade' }}                
            />  

            <HomeStack.Screen
                component={TransactionDetail}
                name={ScreenNames.HOME_STACK.TRANSACTION_DETAIL}
                options={{ animation: 'fade' }}                
            />

            <HomeStack.Screen
                component={UploadAttachment}
                name={ScreenNames.TRANSACTION_STACK.UPLOAD_ATTACHMENTS}
                options={{ animation: 'fade' }}                
            />

            {/* 

            <HomeStack.Screen
                component={SearchVoucher}
                name={constants.ScreenNames.HOME_STACK.SEARCH_VOUCHER}
                options={{ animation: 'slide_from_bottom' }}                
            />  

            <HomeStack.Screen
                component={EditCommodityDetails}
                name={constants.ScreenNames.HOME_STACK.EDIT_COMMODITY_DETAILS}
                options={{ animation: 'slide_from_right' }}                
            />  

            <HomeStack.Screen
                component={EditCart}
                name={constants.ScreenNames.HOME_STACK.EDIT_CART}
                options={{ animation: 'slide_from_right' }}                
            />  

            <HomeStack.Screen
                component={EditUploadAttachments}
                name={constants.ScreenNames.HOME_STACK.EDIT_UPLOAD_ATTACHMENTS}
                options={{ animation: 'slide_from_right' }}                
            />  

            <HomeStack.Screen
                component={EditReUploadAttachments}
                name={constants.ScreenNames.HOME_STACK.EDIT_RE_UPLOAD_ATTACHMENTS}
                options={{ animation: 'slide_from_right' }}                
            /> 

            <HomeStack.Screen
                component={UploadVoucherAttachments}
                name={constants.ScreenNames.HOME_STACK.UPLOAD_VOUCHER_ATTACHMENTS}
                options={{ animation: 'slide_from_right' }}                
            /> 

            <HomeStack.Screen
                component={EditCommodities}
                name={constants.ScreenNames.HOME_STACK.EDIT_COMMODITIES}
                options={{ animation: 'slide_from_right' }}                
            />  

            <HomeStack.Screen
                component={AddCommodityDetails}
                name={constants.ScreenNames.HOME_STACK.ADD_COMMODITY_DETAILS}
                options={{ animation: 'slide_from_right' }}                
            />   */}
        </HomeStack.Navigator>
    );
};

export default HomeStackComponent;