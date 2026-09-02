import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../store/useAuthStore';
import { getSession } from '../../../utils/session';
import { styles } from './styles';

/**
 * Account screen — a read-only view of the signed-in user's information.
 * Data is sourced entirely from the MMKV session / auth store (no API call,
 * no editing). Editing was intentionally removed.
 */
const Account = () => {
  const navigation = useNavigation<any>();
  const userProfile = useAuthStore(state => state.user);

  // Prefer the live store; fall back to the persisted MMKV session.
  const session = useMemo(() => {
    if (userProfile) return userProfile;
    return getSession<any>('USER_PROFILE') || null;
  }, [userProfile]);

  // The first supplierInfo row carries owner/address/contact details.
  const info = useMemo(() => {
    const list = session?.supplierInfo;
    if (Array.isArray(list) && list.length > 0) return list[0];
    return null;
  }, [session]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  const buildOwnerName = () => {
    if (!info) return session?.fullName || 'N/A';
    const parts = [
      info.owner_first_name,
      info.owner_middle_name,
      info.owner_last_name,
      info.owner_ext_name,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : session?.fullName || 'N/A';
  };

  const officeTypeLabel = () => {
    const type = session?.supplierType;
    if (type === 'main') return 'Main Office';
    if (type === 'branch') return 'Branch Office';
    if (String(session?.roleId) === '6') return 'Main Office';
    if (String(session?.roleId) === '7') return 'Branch Office';
    return null;
  };

  const rows: { label: string; value?: string | null }[] = [
    { label: 'Full Name', value: session?.fullName || buildOwnerName() },
    { label: 'Email', value: session?.email || info?.email },
    { label: 'Contact No.', value: info?.contact },
    { label: 'Role', value: session?.role },
    { label: 'Office Type', value: officeTypeLabel() },
    { label: 'Supplier / Company', value: session?.supplierName || info?.supplier_name },
    { label: 'Supplier Group', value: info?.supplier_group },
    { label: 'Address', value: info?.address },
    { label: 'Region', value: session?.regName || info?.reg_name },
  ];

  const renderRow = (label: string, value?: string | null) => (
    <View style={styles.fieldContainer} key={label}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldInput, styles.fieldDisabled]}>
        <Text style={{ fontSize: 14, color: '#4B5563' }}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (no edit action) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        {rows.map(row => renderRow(row.label, row.value))}

        {/* Programs the user is accredited to (read-only chips). */}
        {Array.isArray(session?.programs) && session.programs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Programs</Text>
            {session.programs.map((p: any, index: number) => (
              <View style={styles.fieldContainer} key={`${p.program_id}-${index}`}>
                <View style={[styles.fieldInput, styles.fieldDisabled]}>
                  <Text style={{ fontSize: 14, color: '#4B5563' }}>
                    {p.title || p.program_name || p.shortname || 'Program'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;
