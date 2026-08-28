import React from 'react';
import { View, Platform, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, RouteProp, ParamListBase, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeStackComponent from '../HomeStack';
import TransactionStackComponent from '../TransactionStack';
import ProfileStackComponents from '../ProfileStack';
import ScreenNames from '../screenNames';
import AppIcons from '../../assets/icons';

export type BottomTabParamList = {
  HomeTab: undefined;
  ScanningTab: undefined;
  UserProfileTab: undefined;
};

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export function getTabBarVisibility(route: RouteProp<ParamListBase, string>): boolean {
  const routeName = getFocusedRouteNameFromRoute(route);

  if (!routeName) {
    return true;
  }

  if (
    routeName !== ScreenNames.HOME_STACK.HOME &&
    routeName !== ScreenNames.TRANSACTION_STACK.SCANNING
  ) {
    return false;
  }

  return true;
}

// Custom Tab Bar Component for proper centering
const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  // Check visibility from the focused route
  const focusedRoute = state.routes[state.index];
  const isVisible = getTabBarVisibility(focusedRoute as any);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.tabBarWrapper, { bottom: Platform.OS === 'ios' ? insets.bottom + 8 : 16 }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Render icons based on route name
          if (route.name === ScreenNames.BOTTOM_TABS.SCANNING) {
            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.8}
                onPress={onPress}
                style={styles.scanButton}>
                <AppIcons.MaterialIcons
                  name="qr-code-scanner"
                  size={24}
                  color="#ffffff"
                />
              </TouchableOpacity>
            );
          }

          const iconName = route.name === ScreenNames.BOTTOM_TABS.HOME ? 'home-filled' : 'person-outline';
          const iconColor = isFocused ? '#009246' : '#A0A0A0';

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}>
              <AppIcons.MaterialIcons name={iconName} size={24} color={iconColor} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

interface BottomNavBarProps {
  navigation: any;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = () => {
  const isFocused = useIsFocused();

  if (isFocused) {
    console.log(' [BottomNavBar] Tab Container is Active and Focused.');
  }

  return (
    <BottomTab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      {/* HOME TAB */}
      <BottomTab.Screen
        name={ScreenNames.BOTTOM_TABS.HOME as any}
        component={HomeStackComponent}
      />

      {/* SCAN QR TAB */}
      <BottomTab.Screen
        name={ScreenNames.BOTTOM_TABS.SCANNING as any}
        component={TransactionStackComponent}
      />

      {/* PROFILE TAB */}
      <BottomTab.Screen
        name={ScreenNames.BOTTOM_TABS.PROFILE as any}
        component={ProfileStackComponents}
      />
    </BottomTab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 27,
    height: 54,
    paddingHorizontal: 16,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#009246',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16,
    shadowColor: '#009246',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default BottomNavBar;
