// Inside your src/navigation/BottomNavBar.tsx
import React, { useEffect } from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, RouteProp, ParamListBase, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Feature Screen Stack Components Imports
import HomeStackComponent from '../HomeStack';
import TransactionStackComponent from '../TransactionStack';
import ProfileStackComponents from '../ProfileStack';
import ScreenNames from '../screenNames';
import AppIcons from '../../assets/icons';
import { styles } from './styles';

// Define the clear parameter structures for your Bottom Tab Array routes
export type BottomTabParamList = {
    HomeTab:             undefined;
    ScanningTab:         undefined;
    PayoutMonitoringTab: undefined;
    UserProfileTab:      undefined;
};

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Pure Type-Safe Visibility Evaluator
 * Determines whether the bottom main navigation layout frame should display or hide 
 * based on nested children focus events.
 */
export function getTabBarVisibility(route: RouteProp<ParamListBase, string>): 'flex' | 'none' {   
    const routeName = getFocusedRouteNameFromRoute(route);
    
    console.log(`[Tab Visibility Tracker] Current Nested Route Focus Name:`, routeName);

    // If routeName is undefined, we are transitioning or on the absolute root landing layout frame.
    // Return 'flex' immediately and don't evaluate further logic during layout alignment shifts.
    if (!routeName) {
        return 'flex';
    }

    // Exact string evaluation matches against your ScreenNames registry
    if (
        routeName !== ScreenNames.HOME_STACK.HOME && 
        routeName !== ScreenNames.TRANSACTION_STACK.SCANNING
    ) {        
        return 'none';
    }
    
    return 'flex';
}

interface BottomNavBarProps {
    navigation: any; // 👈 1. Receive the native navigation prop directly from AppStack
}

/**
 * Completely Type-Safe Bottom Tab Bar Navigator
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({ navigation }) => {
    // Using your theme green color
    const staticIconColor = '#009246'; 

    // Dynamic safe-spacing values directly from the hardware operating system layer
    const insets = useSafeAreaInsets();

    const isFocused = useIsFocused(); 
        
    if (isFocused) {
        console.log(" [BottomNavBar Layout Frame] Tab Container is explicitly Active and Focused.");
    }

    const platformTabHeight = Platform.OS === 'ios' ? 64 + insets.bottom : 68;

    return (
        <BottomTab.Navigator            
            screenOptions={({ route }: { route: RouteProp<ParamListBase, string> }) => ({  
                tabBarActiveBackgroundColor: "#FFFFFF",
                tabBarInactiveBackgroundColor: "#FFFFFF",
                tabBarActiveTintColor: "#009246",
                tabBarInactiveTintColor: "#545a64",
                tabBarLabelStyle: styles.tabBarLabelStyle,            
                headerShown: false,
                tabBarStyle: { 
                    display: getTabBarVisibility(route),
                    height: platformTabHeight,
                    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
                    paddingTop: 8,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#EAEAEA',
                } as ViewStyle,   
            })}
        >
            {/* HOME TAB SCREEN */}
            <BottomTab.Screen 
                name={ScreenNames.BOTTOM_TABS.HOME as any}
                component={HomeStackComponent}
                options={{     // FIX: Changed from an arrow function () => ({}) to a clean, static Object {}
                    tabBarShowLabel: true,
                    tabBarLabel: 'Home',
                    tabBarIcon: () => (
                        <AppIcons.Octicons name="home" size={24} color={staticIconColor} />
                    )
                }}
            />   

            {/* VOUCHER SCANNING TAB SCREEN */}
            <BottomTab.Screen 
                name={ScreenNames.BOTTOM_TABS.SCANNING as any}
                component={TransactionStackComponent}
                options={{          
                    tabBarShowLabel: true,       
                    tabBarLabel: 'Scan QR',             
                    tabBarIcon: () => (
                        <AppIcons.MaterialIcons name="qrcode-scan" size={24} color={staticIconColor} />
                    )
                }}
            />

            {/* USER PROFILE TAB SCREEN */}
            {/* <BottomTab.Screen 
                name={ScreenNames.BOTTOM_TABS.PROFILE as any}
                component={ProfileStackComponents}
                options={{             // ✅ FIX HERE TOO for when you uncomment later
                    tabBarShowLabel: true,
                    tabBarLabel: 'Profile',      
                    tabBarIcon: () => (
                        <AppIcons.Octicons name="person-fill" size={24} color={staticIconColor} />
                    )
                }}
            /> */}
        </BottomTab.Navigator>
    );
};

export default BottomNavBar;