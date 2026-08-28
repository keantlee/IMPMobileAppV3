import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../../store/useAuthStore';
import { getFilteredTransactionsMutation, getAttachmentMutation } from '../../../../api/transaction';
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

const ReuploadTransactions = () => {
  const navigation = useNavigation<any>();
  const userInfo = useAuthStore.getState().user;
  const supplierId = userInfo?.userId;

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const filteredMutation = getFilteredTransactionsMutation();
  const attachmentMutation = getAttachmentMutation(navigation);

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
        { supplier_id: supplierId, status: 'Re-Upload' },
        {
          onSuccess: data => {
            setTransactions(data.data || []);
          },
        },
      );
    }
  }, [supplierId]);

  const handleTransactionPress = (item: TransactionItem) => {
    attachmentMutation.mutate({
      params: {
        transaction_id: item.transaction_id,
        reference_no: item.reference_no,
        supplier_id: item.supplier_id,
        transac_date: item.transact_date,
        prevRouteName: 'ReuploadTransactionsScreen',
      },
    });
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
        <Text style={styles.badgeText}>Re-Upload</Text>
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
        <Text style={styles.headerTitle}>Re-Upload Transactions</Text>
      </View>

      {/* Loading */}
      {filteredMutation.isPending && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}

      {/* Empty State */}
      {!filteredMutation.isPending && transactions.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="cloud-upload" size={48} color="#D0D0D0" />
          <Text style={styles.emptyText}>No re-upload transactions</Text>
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

      {/* Attachment loading overlay */}
      {attachmentMutation.isPending && (
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

export default ReuploadTransactions;
