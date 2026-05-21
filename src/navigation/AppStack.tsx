import { BackHandler } from 'react-native';

if (BackHandler && !(BackHandler as any).removeEventListener) {
    (BackHandler as any).removeEventListener = (eventName: string, handler: any) => {
        console.log(`[Polyfill] Successfully intercepted and bypassed deprecated removeEventListener for: ${eventName}`);
    };
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/useAuthStore';
import ScreenNames from './screenNames';
import Authentication from '../screens/authentication';
import LogIn from '../screens/login';
import Otp from '../screens/otp';


const Stack = createStackNavigator();

const AppStack = () => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    return (
        <Stack.Navigator
            initialRouteName={ScreenNames.APP_STACK.AUTHENTICATION}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen 
                component={Authentication} 
                name={ScreenNames.APP_STACK.AUTHENTICATION}
            />
            {!isLoggedIn && (
                <Stack.Screen 
                    component={LogIn} 
                    name={ScreenNames.APP_STACK.LOGIN} 
                />
            )}
            <Stack.Screen 
                component={Otp}
                name={ScreenNames.APP_STACK.VERIFY_OTP}
            />
        </Stack.Navigator>
    );
};

const Route: React.FC = () => {
    return (
        <NavigationContainer>
            <AppStack />
        </NavigationContainer>
    );
};

export default Route;