import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../store/useAuthStore';
import { useOfficeStore } from '../../../store/useOfficeStore';
import { fetchOfficeInfo, OfficeListItem } from '../../../api/office';
import { getSession } from '../../../utils/session';
import ScreenNames from '../../../navigation/screenNames';
import StatusModal, { StatusModalConfig } from '../../../components/statusModal';
import { styles } from './styles';

const OfficeInfo = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userProfile = useAuthStore(state => state.user);
  const prevRouteName = route.params?.prevRouteName;

  const setOfficesInStore = useOfficeStore(state => state.setOffices);
  const setRoleInStore = useOfficeStore(state => state.setRole);
  const setSelectedOffice = useOfficeStore(state => state.setSelectedOffice);

  const [offices, setOffices] = useState<OfficeListItem[]>([]);
  const [role, setRole] = useState<'main' | 'branch'>('branch');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Warning modal shown when the user tries to edit an office that already has
  // a pending update request awaiting RFO approval.
  const [pendingModal, setPendingModal] = useState<StatusModalConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
  });

  const isMainOfficeUser = role === 'main';

  // Resolve the supplier_id from the auth store / MMKV session.
  const supplierId =
    userProfile?.userId || getSession<string>('USER_ID') || '';

  const loadOffices = useCallback(async () => {
    if (!supplierId) {
      setError('Unable to identify your account. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetchOfficeInfo(supplierId);

      const list = response.offices || [];
      // Prefer the server-derived role; fall back to the MMKV session hints.
      const resolvedRole: 'main' | 'branch' =
        response.role ||
        (userProfile?.supplierType === 'main' ||
        String(userProfile?.roleId) === '6'
          ? 'main'
          : 'branch');

      setOffices(list);
      setRole(resolvedRole);

      // Share with the Zustand store so the form screens can reuse it.
      setOfficesInStore(list);
      setRoleInStore(resolvedRole);
    } catch (e: any) {
      setError(e.message || 'Failed to load office information.');
    } finally {
      setLoading(false);
    }
  }, [supplierId, userProfile, setOfficesInStore, setRoleInStore]);

  const handleGoBack = () => {
    if (prevRouteName === 'HomeScreen') {
      navigation.navigate(ScreenNames.BOTTOM_TABS.HOME);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOffices();

      const handleBackPress = () => {
        handleGoBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadOffices, prevRouteName]),
  );

  const handleRegisterBranch = () => {
    navigation.navigate(ScreenNames.PROFILE_STACK.OFFICE_ADD_BRANCH);
  };

  const handleEditBranch = (office: OfficeListItem) => {
    // Block editing while an update request is still pending RFO approval.
    if (String(office.update_status) === '1') {
      setPendingModal({
        visible: true,
        title: 'Update Pending',
        message: `"${
          office.supplier_name || 'This office'
        }" already has a profile update awaiting RFO Program Focal approval. You cannot edit this information until the current request is reviewed.`,
        type: 'warning',
      });
      return;
    }

    // Seed the selected office so the Edit form can prefill from it.
    setSelectedOffice(office);
    navigation.navigate(ScreenNames.PROFILE_STACK.OFFICE_EDIT, {
      officeId: office.supplier_id,
      officeName: office.supplier_name,
    });
  };

  // NOTE: Deactivate branch is intentionally disabled. The backend deactivation
  // flow is not active, so this action is commented out on mobile.
  // const handleInactivateBranch = (office: OfficeListItem) => {
  //   Alert.alert(
  //     'Deactivate Branch',
  //     `Are you sure you want to deactivate "${office.supplier_name}"?`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Deactivate',
  //         style: 'destructive',
  //         onPress: () => {
  //           // Backend deactivate endpoint is not yet available.
  //         },
  //       },
  //     ],
  //   );
  // };

  const renderOfficeCard = ({ item }: { item: OfficeListItem }) => {
    const isMainOffice = item.supplier_type === 'main';
    // update_status = 1 means an edit is pending RFO approval.
    const isPending = String(item.update_status) === '1';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.officeName} numberOfLines={1}>
                {item.supplier_name || 'Unnamed Office'}
              </Text>
              {isMainOffice && (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>MAIN</Text>
                </View>
              )}
            </View>
            {!!item.owner_name && <Text style={styles.ownerName}>{item.owner_name}</Text>}
          </View>
          {isPending && (
            <View style={[styles.statusBadge, { backgroundColor: '#FFF7E6' }]}>
              <Text style={[styles.statusText, { color: '#B26A00' }]}>PENDING</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          {!!item.email && (
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={14} color="#8E8E8E" />
              <Text style={styles.infoText}>{item.email}</Text>
            </View>
          )}
          {!!item.address && (
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={14} color="#8E8E8E" />
              <Text style={styles.infoText} numberOfLines={2}>{item.address}</Text>
            </View>
          )}
          {!!item.contact && (
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={14} color="#8E8E8E" />
              <Text style={styles.infoText}>{item.contact}</Text>
            </View>
          )}
          {(item.mun_name || item.prov_name) && (
            <View style={styles.infoRow}>
              <MaterialIcons name="map" size={14} color="#8E8E8E" />
              <Text style={styles.infoText}>
                {[item.mun_name, item.prov_name].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Actions:
            - Branch user: can edit only its own office.
            - Main user: can edit its own office and every branch. */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleEditBranch(item)}
            style={styles.actionButton}>
            <MaterialIcons name="edit" size={16} color="#1565C0" />
            <Text style={[styles.actionText, { color: '#1565C0' }]}>Edit</Text>
          </TouchableOpacity>

          {/* Deactivate button intentionally disabled (see handleInactivateBranch note).
          {isMainOfficeUser && !isMainOffice && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleInactivateBranch(item)}
              style={styles.actionButton}>
              <MaterialIcons name="block" size={16} color="#C62828" />
              <Text style={[styles.actionText, { color: '#C62828' }]}>Deactivate</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Office Info</Text>
        {/* Add-branch action is available to main-office users only. */}
        {isMainOfficeUser ? (
          <TouchableOpacity onPress={handleRegisterBranch}>
            <MaterialIcons name="add-circle-outline" size={24} color="#009246" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#009246" />
          <Text style={styles.emptyText}>Loading office information...</Text>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={48} color="#D0D0D0" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            onPress={loadOffices}
            style={{ marginTop: 12 }}
            activeOpacity={0.7}>
            <Text style={[styles.actionText, { color: '#1565C0' }]}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {!loading && !error && (
        <FlatList
          data={offices}
          keyExtractor={item => item.supplier_id}
          renderItem={renderOfficeCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="business" size={48} color="#D0D0D0" />
              <Text style={styles.emptyText}>No office branches found</Text>
            </View>
          }
        />
      )}

      {/* Pending-update warning modal */}
      <StatusModal
        config={pendingModal}
        confirmText="GOT IT"
        onConfirm={() => setPendingModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

export default OfficeInfo;
