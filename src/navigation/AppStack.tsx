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
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    console.log(" [AppStack Evaluation Layout Frame] Is Logged In?:", isLoggedIn);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                
                {isLoggedIn ? (
                    <Stack.Screen 
                        component={BottomNavBar} 
                        name={ScreenNames.APP_STACK.MAIN_TAB}
                    />
                ) : (
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