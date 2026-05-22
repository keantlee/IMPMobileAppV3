// 📄 Replace your src/navigation/AppStack.tsx with this blueprint:
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import ScreenNames from './screenNames';

// Screen Imports
import Authentication from '../screens/authentication'; 
import LogIn from '../screens/login';
import Otp from '../screens/otp';
import BottomNavBar from './bottomNav/BottomNavBar';

const Stack = createNativeStackNavigator();

export const AppStack = () => {
    // ⚡️ Grab active indicators directly from your store
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    console.log(" [AppStack Evaluation Layout Frame] Is Logged In?:", isLoggedIn);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                
                {/* 🛡️ GATE 1: USER IS ALREADY LOGGED IN */}
                {isLoggedIn ? (
                    <Stack.Screen 
                        component={BottomNavBar} 
                        name={ScreenNames.APP_STACK.MAIN_TAB}
                    />
                ) : (
                    // GATE 2: USER IS UNAUTHENTICATED
                    // Grouping these here ensures they unmount seamlessly together 
                    // without leaving dangling navigation pointers behind!
                    <>
                        <Stack.Screen 
                            component={Authentication} 
                            name="SplashAuthCheck" 
                        />
                        <Stack.Screen 
                            component={LogIn} 
                            name={ScreenNames.APP_STACK.LOGIN} 
                        />
                        <Stack.Screen 
                            component={Otp} 
                            name={ScreenNames.APP_STACK.VERIFY_OTP} 
                        />
                    </>
                )}
                
            </Stack.Navigator>
        </NavigationContainer>
    );
};

// Ensure your default export matches what App.tsx expects!
export default AppStack;