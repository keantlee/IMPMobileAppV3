import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  BackHandler,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';

import { useAuthStore } from '../../../store/useAuthStore';
import { getAccreditationMutation, AccreditationItem } from '../../../api/profile';
import ScreenNames from '../../../navigation/screenNames';
import { styles } from './styles';

const SAMPLE_CERTIFICATE_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const Accreditation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userProfile = useAuthStore(state => state.user);
  const supplierId = userProfile?.userId;
  const prevRouteName = route.params?.prevRouteName;

  const [accreditations, setAccreditations] = useState<AccreditationItem[]>([]);

  const accreditationMutation = getAccreditationMutation();

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

  useEffect(() => {
    if (supplierId) {
      accreditationMutation.mutate(
        { supplier_id: supplierId },
        {
          onSuccess: data => {
            setAccreditations(data.data || []);
          },
        },
      );
    }
  }, [supplierId]);

  const getFullName = (item: AccreditationItem) => {
    const parts = [item.owner_first_name, item.owner_middle_name, item.owner_last_name, item.owner_ext_name]
      .filter(Boolean);
    return parts.join(' ');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleViewCertificate = async (item: AccreditationItem) => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
      }

      const filename = `Certificate_${item.shortname}_${item.permission_id}.pdf`;
      const downloadDest = `${RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath}/${filename}`;

      console.log('[Accreditation] Downloading certificate to:', downloadDest);

      const result = await RNFS.downloadFile({
        fromUrl: SAMPLE_CERTIFICATE_PDF,
        toFile: downloadDest,
      }).promise;

      if (result.statusCode === 200) {
        Alert.alert('Certificate Downloaded', `Saved to:\n${downloadDest}`);
      } else {
        Alert.alert('Download Failed', 'Unable to download the certificate.');
      }
    } catch (error: any) {
      Alert.alert('Error', `Download failed: ${error.message}`);
    }
  };

  const handleRequestCopy = (item: AccreditationItem) => {
    Alert.alert(
      'Request Sent',
      `A copy of your ${item.program_name} certificate has been requested. You will be notified once it is ready.`,
    );
  };

  const renderItem = ({ item }: { item: AccreditationItem }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.programName}>{item.program_name}</Text>
        <Text style={styles.shortname}>{item.shortname}</Text>
      </View>

      {/* Info Rows */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Full Name</Text>
        <Text style={styles.infoValue}>{getFullName(item)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Date Accredited</Text>
        <Text style={styles.infoValue}>{formatDate(item.date_created)}</Text>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleViewCertificate(item)}
          style={styles.actionButton}>
          <MaterialIcons name="picture-as-pdf" size={16} color="#C62828" />
          <Text style={[styles.actionText, { color: '#C62828' }]}>View Certificate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleRequestCopy(item)}
          style={styles.actionButton}>
          <MaterialIcons name="content-copy" size={16} color="#1565C0" />
          <Text style={[styles.actionText, { color: '#1565C0' }]}>Request Copy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accreditation</Text>
      </View>

      {/* Loading */}
      {accreditationMutation.isPending && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009246" />
          <Text style={styles.loadingText}>Loading accreditations...</Text>
        </View>
      )}

      {/* Empty State */}
      {!accreditationMutation.isPending && accreditations.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="verified" size={48} color="#D0D0D0" />
          <Text style={styles.emptyText}>No accreditations found</Text>
        </View>
      )}

      {/* List */}
      {!accreditationMutation.isPending && accreditations.length > 0 && (
        <FlatList
          data={accreditations}
          keyExtractor={item => item.permission_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Accreditation;
