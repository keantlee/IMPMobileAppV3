import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../../store/useAuthStore';
import { getFilteredTransactionsMutation, getTransactionDetailsMutation } from '../../../../api/transaction';
import ScreenNames from '../../../../navigation/screenNames';
import { styles } from './styles';

interface TransactionItem {
  voucher_id: string;
  rsbsa_no: string;
  reference_no: string;
  transaction_id: string;
  supplier_id: string;
  total_amount: string | number;
  transact_date: string;
  transaction_status: string;
}

const PendingTransactions = () => {
  const navigation = useNavigation<any>();
  const userInfo = useAuthStore.getState().user;
  const supplierId = userInfo?.userId;

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const filteredMutation = getFilteredTransactionsMutation();
  const detailsMutation = getTransactionDetailsMutation();

  useEffect(() => {
    const handleBackPress = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (supplierId) {
      filteredMutation.mutate(
        { supplier_id: supplierId, status: 'Pending' },
        {
          onSuccess: data => {
            setTransactions(data.data || []);
          },
        },
      );
    }
  }, [supplierId]);

  const handleTransactionPress = (item: TransactionItem) => {
    detailsMutation.mutate(
      {
        transaction_id: item.transaction_id,
        reference_no: item.reference_no,
        supplier_id: item.supplier_id,
        status: 'Pending',
        navigation,
      },
      {
        onSuccess: (serverData, variables) => {
          // Override default navigation to include prevRouteName
          navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_DETAIL, {
            transactionId: variables.transaction_id,
            referenceNo: variables.reference_no,
            supplierId: variables.supplier_id,
            status: variables.status,
            transactionInfo: serverData.trans_info,
            attachments: serverData.attachments,
            uploadInfo: serverData.upload_info,
            transactionStatus: serverData.transaction_status,
            prevRouteName: 'PendingTransactionsScreen',
          });
        },
      },
    );
  };

  const renderItem = ({ item }: { item: TransactionItem }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleTransactionPress(item)}
      style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.refNo}>{item.reference_no}</Text>
        <Text style={styles.date}>{item.transact_date}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Pending</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Transactions</Text>
      </View>

      {/* Loading */}
      {filteredMutation.isPending && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E67E22" />
        </View>
      )}

      {/* Empty State */}
      {!filteredMutation.isPending && transactions.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="hourglass-empty" size={48} color="#D0D0D0" />
          <Text style={styles.emptyText}>No pending transactions</Text>
        </View>
      )}

      {/* List */}
      {!filteredMutation.isPending && transactions.length > 0 && (
        <FlatList
          data={transactions}
          keyExtractor={item => item.transaction_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Detail loading overlay */}
      {detailsMutation.isPending && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color="#009246" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default PendingTransactions;
