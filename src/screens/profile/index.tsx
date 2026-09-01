import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import { useAuthStore } from '../../store/useAuthStore';
import { clearSession } from '../../utils/session';
import ScreenNames from '../../navigation/screenNames';
import AppIcons from '../../assets/icons';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

const Profile = () => {
  const navigation = useNavigation<any>();
  const userProfile = useAuthStore(state => state.user);
  const clearAuth = useAuthStore(state => state.clearAuth);

  const fullName = userProfile?.fullName || 'User';
  const supplierName = userProfile?.supplierName || '';
  const email = userProfile?.email || '';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            clearSession();
            clearAuth();
          },
        },
      ],
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'manage_account',
      title: 'Manage Account',
      description: 'View and edit your profile',
      icon: 'person',
      color: '#1565C0',
      bgColor: '#E3F2FD',
      onPress: () => navigation.navigate(ScreenNames.PROFILE_STACK.MANAGE_ACCOUNT),
    },
    {
      id: 'office_info',
      title: 'Office Info',
      description: 'View office branches',
      icon: 'business',
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      onPress: () => navigation.navigate(ScreenNames.PROFILE_STACK.OFFICE_INFO),
    },
    {
      id: 'documentation',
      title: 'Documentation',
      description: 'Guides and reference docs',
      icon: 'menu-book',
      color: '#E65100',
      bgColor: '#FFF3E0',
      onPress: () => navigation.navigate(ScreenNames.PROFILE_STACK.DOCUMENTATION),
    },
    {
      id: 'accreditation',
      title: 'Accreditation',
      description: 'Programs and certificates',
      icon: 'verified',
      color: '#6A1B9A',
      bgColor: '#F3E5F5',
      onPress: () => navigation.navigate(ScreenNames.PROFILE_STACK.ACCREDITATION),
    },
    {
      id: 'app_info',
      title: 'App Information',
      description: `Version ${DeviceInfo.getVersion()}`,
      icon: 'info-outline',
      color: '#455A64',
      bgColor: '#ECEFF1',
      onPress: () => navigation.navigate(ScreenNames.PROFILE_STACK.APP_INFORMATION),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#009246" />

      {/* Profile Header */}
      <View
        style={{
          backgroundColor: '#009246',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 28,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Image
            source={AppIcons.userIcon || { uri: 'https://placehold.co/100' }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
        </View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: 2,
          }}>
          {fullName}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: '500',
          }}>
          {supplierName}
        </Text>
        {email ? (
          <Text
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.7)',
              marginTop: 2,
            }}>
            {email}
          </Text>
        ) : null}
      </View>

      {/* Menu List */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={item.onPress}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#F0F0F0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
              elevation: 1,
            }}>
            <View
              style={{
                backgroundColor: item.bgColor,
                width: 40,
                height: 40,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 14,
              }}>
              <MaterialIcons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 1 }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 11, color: '#8E8E8E' }}>
                {item.description}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#C0C0C0" />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 14,
            marginTop: 6,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FFEBEE',
          }}>
          <View
            style={{
              backgroundColor: '#FFEBEE',
              width: 40,
              height: 40,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 14,
            }}>
            <MaterialIcons name="logout" size={20} color="#C62828" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#C62828' }}>
              Logout
            </Text>
            <Text style={{ fontSize: 11, color: '#E57373' }}>
              Sign out of your account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
