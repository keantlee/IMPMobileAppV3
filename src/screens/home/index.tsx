import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuthStore } from '../../store/useAuthStore';
import AppIcons from '../../assets/icons';
import ScreenNames from '../../navigation/screenNames';
import { getTransactionHistoryMutation, getTransactionDetailsMutation, getTransactionStatusCountsMutation } from '../../api/transaction';

interface HomeProps {
  navigation: any;
}

// --- Metric Cards (1st Row) ---
interface MetricCardProps {
  title: string;
  count: number;
  icon: string;
  iconFamily: 'MaterialIcons' | 'MaterialCommunityIcons' | 'Ionicons';
  color: string;
  bgColor: string;
  onPress: () => void;
}

const MetricCard = ({ title, count, icon, iconFamily, color, bgColor, onPress }: MetricCardProps) => {
  const IconComponent =
    iconFamily === 'MaterialCommunityIcons'
      ? MaterialCommunityIcons
      : iconFamily === 'Ionicons'
        ? Ionicons
        : MaterialIcons;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}>
      {/* Icon + Count aligned horizontally */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View
          style={{
            backgroundColor: bgColor,
            width: 30,
            height: 30,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <IconComponent name={icon} size={18} color={color} />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '800',
            color: '#1A1A1A',
          }}>
          {count}
        </Text>
      </View>
      {/* Title at bottom, aligned right */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: '#7A7A7A',
          textTransform: 'uppercase',
          letterSpacing: 0.3,
          textAlign: 'right',
        }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// --- Feature Menu Card (2nd Row) ---
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  iconFamily: 'MaterialIcons' | 'MaterialCommunityIcons' | 'Ionicons';
  color: string;
  bgColor: string;
  onPress: () => void;
}

const FeatureCard = ({ title, description, icon, iconFamily, color, bgColor, onPress }: FeatureCardProps) => {
  const IconComponent =
    iconFamily === 'MaterialCommunityIcons'
      ? MaterialCommunityIcons
      : iconFamily === 'Ionicons'
        ? Ionicons
        : MaterialIcons;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: '#ffffff',
        width: '48%',
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          backgroundColor: bgColor,
          width: 38,
          height: 38,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
        }}>
        <IconComponent name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginBottom: 1 }}>
          {title}
        </Text>
        <Text numberOfLines={2} style={{ fontSize: 10, color: '#8E8E8E', lineHeight: 13 }}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Home Screen ---
const Home = ({ navigation }: HomeProps) => {
  const userProfile = useAuthStore(state => state.user);
  const fullName = userProfile?.fullName;
  const supplierName = userProfile?.supplierName;
  const supplierId = userProfile?.userId;

  // Transaction history state
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // True per-status totals for the Status Overview cards (independent of the
  // 8-item recent list). Sourced from a dedicated counts endpoint.
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    'Re-Upload': 0,
    'Re-Transact': 0,
  });

  // Mutations
  const transactionHistoryMutation = getTransactionHistoryMutation();
  const transactionDetailsMutation = getTransactionDetailsMutation();
  const statusCountsMutation = getTransactionStatusCountsMutation();

  // Load the recent transactions. Reused on focus and pull-to-refresh.
  // The mutation object is intentionally omitted from deps: it's recreated each
  // render, so including it would loop. supplierId is the only real dependency.
  const loadTransactions = useCallback(
    (options?: { isRefresh?: boolean }) => {
      if (!supplierId) return;

      if (options?.isRefresh) setRefreshing(true);

      transactionHistoryMutation.mutate(
        { supplier_id: supplierId },
        {
          onSuccess: data => {
            setRecentTransactions(data.data?.slice(0, 8) || []);
          },
          onSettled: () => {
            if (options?.isRefresh) setRefreshing(false);
          },
        },
      );

      // Fetch true per-status totals separately (not derived from the sliced
      // recent list), so the Status Overview counts reflect the full history.
      statusCountsMutation.mutate(
        { supplier_id: supplierId },
        {
          onSuccess: data => {
            setStatusCounts({
              Pending: data.counts?.Pending || 0,
              'Re-Upload': data.counts?.['Re-Upload'] || 0,
              'Re-Transact': data.counts?.['Re-Transact'] || 0,
            });
          },
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supplierId],
  );

  // Refetch every time the Home screen regains focus (e.g. after uploading
  // attachments and navigating back), so the latest data is always shown.
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  // True totals per status (from the dedicated counts endpoint), independent of
  // the 8-item recent list.
  const pendingCount = statusCounts.Pending;
  const reUploadCount = statusCounts['Re-Upload'];
  const reTransactCount = statusCounts['Re-Transact'];

  const handleNavigateTransactionHistory = () => {
    navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_HISTORY);
  };

  const handleNavigatePrograms = () => {
    navigation.navigate(ScreenNames.BOTTOM_TABS.PROFILE, {
      screen: ScreenNames.PROFILE_STACK.OFFICE_INFO,
      params: { prevRouteName: 'HomeScreen' },
    });
  };

  const handleNavigateAccreditation = () => {
    navigation.navigate(ScreenNames.BOTTOM_TABS.PROFILE, {
      screen: ScreenNames.PROFILE_STACK.ACCREDITATION,
      params: { prevRouteName: 'HomeScreen' },
    });
  };

  const handleNavigateDocumentation = () => {
    navigation.navigate(ScreenNames.BOTTOM_TABS.PROFILE, {
      screen: ScreenNames.PROFILE_STACK.DOCUMENTATION,
      params: { prevRouteName: 'HomeScreen' },
    });
  };

  const handleNavigatePending = () => {
    navigation.navigate(ScreenNames.HOME_STACK.PENDING_TRANSACTIONS);
  };

  const handleNavigateReUpload = () => {
    navigation.navigate(ScreenNames.HOME_STACK.REUPLOAD_TRANSACTIONS);
  };

  const handleNavigateReTransact = () => {
    navigation.navigate(ScreenNames.HOME_STACK.RETRANSACT_TRANSACTIONS);
  };

  const handleTransactionPress = (item: any) => {
    transactionDetailsMutation.mutate(
      {
        transaction_id: item.transaction_id,
        reference_no: item.reference_no,
        supplier_id: item.supplier_id,
        status: item.transaction_status,
        navigation,
      },
      {
        onSuccess: (serverData, variables) => {
          navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_DETAIL, {
            transactionId: variables.transaction_id,
            referenceNo: variables.reference_no,
            supplierId: variables.supplier_id,
            status: variables.status,
            transactionInfo: serverData.trans_info,
            attachments: serverData.attachments,
            uploadInfo: serverData.upload_info,
            transactionStatus: serverData.transaction_status,
            prevRouteName: 'RecentVoucherClaims',
          });
        },
      },
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'Pending':
        return { bg: '#FFF3E0', text: '#E65100' };
      case 'Re-Transact':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'Re-Upload':
        return { bg: '#E3F2FD', text: '#1565C0' };
      default:
        return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#009246" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
          backgroundColor: '#009246',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
            Welcome Back
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#ffffff',
              marginTop: 2,
            }}>
            {fullName}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: '500',
              marginTop: 2,
            }}>
            {supplierName}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate(ScreenNames.BOTTOM_TABS.PROFILE)}>
          <Image
            source={AppIcons.userIcon || { uri: 'https://placehold.co/100' }}
            style={{ width: 28, height: 28, borderRadius: 14 }}
          />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <FlatList
        data={null}
        renderItem={null}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTransactions({ isRefresh: true })}
            colors={['#009246']}
            tintColor="#009246"
          />
        }
        ListHeaderComponent={
          <View style={{ marginTop: 20 }}>
            {/* Section: Status Overview (1st Row - 3 Metric Cards) */}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#2C3E50',
                marginBottom: 12,
                marginLeft: 4,
              }}>
              Status Overview
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <MetricCard
                title="Pending"
                count={pendingCount}
                icon="hourglass-empty"
                iconFamily="MaterialIcons"
                color="#E67E22"
                bgColor="#FFF3E0"
                onPress={handleNavigatePending}
              />
              <MetricCard
                title="Re-Upload"
                count={reUploadCount}
                icon="cloud-upload"
                iconFamily="MaterialIcons"
                color="#2196F3"
                bgColor="#E3F2FD"
                onPress={handleNavigateReUpload}
              />
              <MetricCard
                title="Re-Transact"
                count={reTransactCount}
                icon="refresh"
                iconFamily="MaterialIcons"
                color="#E53935"
                bgColor="#FFEBEE"
                onPress={handleNavigateReTransact}
              />
            </View>

            {/* Section: Menu Features (2nd Row - 2x2 Grid) */}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#2C3E50',
                marginBottom: 12,
                marginLeft: 4,
              }}>
              Menu
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
              <FeatureCard
                title="Transaction Logs"
                description="Review claimed voucher transactions"
                icon="receipt-long"
                iconFamily="MaterialIcons"
                color="#E65100"
                bgColor="#FFF3E0"
                onPress={handleNavigateTransactionHistory}
              />
              <FeatureCard
                title="Office Info"
                description="View registered programs"
                icon="business"
                iconFamily="MaterialIcons"
                color="#1B5E20"
                bgColor="#E8F5E9"
                onPress={handleNavigatePrograms}
              />
              <FeatureCard
                title="Accreditation"
                description="Check supplier accreditation status"
                icon="verified"
                iconFamily="MaterialIcons"
                color="#4A148C"
                bgColor="#F3E5F5"
                onPress={handleNavigateAccreditation}
              />
              <FeatureCard
                title="Documentation"
                description="Guides and reference documents"
                icon="folder-open"
                iconFamily="MaterialIcons"
                color="#0D47A1"
                bgColor="#E3F2FD"
                onPress={handleNavigateDocumentation}
              />
            </View>

            {/* Section: Recent Voucher Claims */}
            <View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginTop: 8,
                borderWidth: 1,
                borderColor: '#F0F0F0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 3,
              }}>
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#2C3E50' }}>
                  Recent Voucher Claims
                </Text>
                <TouchableOpacity onPress={handleNavigateTransactionHistory}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#3498DB' }}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Loading State — only on the initial load (empty list), so
                  focus refetches update the list in place without flashing. */}
              {transactionHistoryMutation.isPending && recentTransactions.length === 0 && !refreshing && (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#009246" />
                  <Text style={{ fontSize: 12, color: '#8E8E8E', marginTop: 8 }}>
                    Loading transactions...
                  </Text>
                </View>
              )}

              {/* Empty State */}
              {!transactionHistoryMutation.isPending && recentTransactions.length === 0 && (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <MaterialIcons name="receipt-long" size={36} color="#D0D0D0" />
                  <Text style={{ fontSize: 12, color: '#8E8E8E', marginTop: 8 }}>
                    No recent transactions
                  </Text>
                </View>
              )}

              {/* Transaction List */}
              {recentTransactions.map(item => {
                const statusColor = getStatusColor(item.transaction_status);
                return (
                  <TouchableOpacity
                    key={item.transaction_id}
                    activeOpacity={0.7}
                    onPress={() => handleTransactionPress(item)}
                    style={{
                      backgroundColor: '#FAFAFA',
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#EAEAEA',
                    }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#2C3E50', marginBottom: 3 }}>
                        {item.reference_no}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#95A5A6' }}>
                        {item.transact_date}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View
                        style={{
                          backgroundColor: statusColor.bg,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                        }}>
                        <Text style={{ fontSize: 10, color: statusColor.text, fontWeight: '600' }}>
                          {item.transaction_status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Loading overlay for detail navigation */}
              {transactionDetailsMutation.isPending && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator size="small" color="#009246" />
                </View>
              )}
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Home;
