import React from 'react';
import { View, Text, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';

import { styles } from './styles';

const AppInformation = () => {
  const navigation = useNavigation<any>();

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }, [navigation]),
  );

  const infoItems = [
    { label: 'App Name', value: 'IMP Voucher Management' },
    { label: 'Version', value: DeviceInfo.getVersion() },
    { label: 'Build Number', value: DeviceInfo.getBuildNumber() },
    { label: 'Bundle ID', value: DeviceInfo.getBundleId() },
    { label: 'Platform', value: Platform.OS === 'ios' ? 'iOS' : 'Android' },
    { label: 'OS Version', value: `${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${Platform.Version}` },
    { label: 'Device Model', value: DeviceInfo.getModel() },
    { label: 'Device Brand', value: DeviceInfo.getBrand() },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Information</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* App Logo Area */}
      <View style={styles.logoSection}>
        <View style={styles.logoWrapper}>
          <MaterialIcons name="agriculture" size={48} color="#009246" />
        </View>
        <Text style={styles.appName}>IMP Voucher Management</Text>
        <Text style={styles.versionText}>Version {DeviceInfo.getVersion()}</Text>
      </View>

      {/* Info List */}
      <View style={styles.infoCard}>
        {infoItems.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.infoRow,
              index < infoItems.length - 1 && styles.infoRowBorder,
            ]}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Department of Agriculture - Philippines
        </Text>
        <Text style={styles.footerSubtext}>
          IMP-RSBSA System
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AppInformation;
