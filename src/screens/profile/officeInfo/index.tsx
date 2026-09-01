import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '../../../store/useAuthStore';
import { MOCK_OFFICES, OfficeBranch } from '../../../data/officeInfo';
import ScreenNames from '../../../navigation/screenNames';
import { styles } from './styles';

const OfficeInfo = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userProfile = useAuthStore(state => state.user);
  const prevRouteName = route.params?.prevRouteName;

  // For now assume main office user (TODO: derive from API role)
  const isMainOfficeUser = true;

  const [offices, setOffices] = useState<OfficeBranch[]>(MOCK_OFFICES);

  const handleGoBack = () => {
    if (prevRouteName === 'HomeScreen') {
      navigation.navigate(ScreenNames.BOTTOM_TABS.HOME);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        handleGoBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }, [navigation, prevRouteName]),
  );

  const handleRegisterBranch = () => {
    Alert.alert('Register New Branch', 'This feature is under development.');
  };

  const handleEditBranch = (office: OfficeBranch) => {
    Alert.alert('Edit Branch', `Editing: ${office.office_name}\n\nThis feature is under development.`);
  };

  const handleInactivateBranch = (office: OfficeBranch) => {
    Alert.alert(
      'Deactivate Branch',
      `Are you sure you want to deactivate "${office.office_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => {
            setOffices(prev =>
              prev.map(o =>
                o.office_id === office.office_id ? { ...o, status: 'Inactive' } : o,
              ),
            );
          },
        },
      ],
    );
  };

  const renderOfficeCard = ({ item }: { item: OfficeBranch }) => {
    const isActive = item.status === 'Active';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.officeName} numberOfLines={1}>
                {item.office_name}
              </Text>
              {item.is_main && (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>MAIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.ownerName}>{item.owner_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.statusText, { color: isActive ? '#2E7D32' : '#C62828' }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={14} color="#8E8E8E" />
            <Text style={styles.infoText}>{item.contact_person}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={14} color="#8E8E8E" />
            <Text style={styles.infoText} numberOfLines={2}>{item.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={14} color="#8E8E8E" />
            <Text style={styles.infoText}>{item.contact}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="map" size={14} color="#8E8E8E" />
            <Text style={styles.infoText}>{item.municipality}, {item.province}</Text>
          </View>
        </View>

        {/* Actions (Main Office User only, non-main branches only) */}
        {isMainOfficeUser && !item.is_main && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleEditBranch(item)}
              style={styles.actionButton}>
              <MaterialIcons name="edit" size={16} color="#1565C0" />
              <Text style={[styles.actionText, { color: '#1565C0' }]}>Edit</Text>
            </TouchableOpacity>
            {isActive && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleInactivateBranch(item)}
                style={styles.actionButton}>
                <MaterialIcons name="block" size={16} color="#C62828" />
                <Text style={[styles.actionText, { color: '#C62828' }]}>Deactivate</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
        {isMainOfficeUser ? (
          <TouchableOpacity onPress={handleRegisterBranch}>
            <MaterialIcons name="add-circle-outline" size={24} color="#009246" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* List */}
      <FlatList
        data={offices}
        keyExtractor={item => item.office_id}
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
    </SafeAreaView>
  );
};

export default OfficeInfo;
