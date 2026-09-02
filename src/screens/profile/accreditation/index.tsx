import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Alert,
  Platform,
  PermissionsAndroid,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, CommonActions } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';

import { useAuthStore } from '../../../store/useAuthStore';
import { getSession } from '../../../utils/session';
import ScreenNames from '../../../navigation/screenNames';
import { fetchCertificate } from '../../../api/profile';
import { styles } from './styles';

// A single accredited program record coming from the session supplierInfo array
interface AccreditationItem {
  supplier_id: string;
  supplier_name: string;
  owner_first_name: string;
  owner_middle_name: string | null;
  owner_last_name: string;
  owner_ext_name: string | null;
  access_status: string; // '1' = accredited/active
  program_id: string;
  title: string; // program name
  shortname: string;
  description: string;
  date_created: string;
}

const Accreditation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userProfile = useAuthStore(state => state.user);
  const prevRouteName = route.params?.prevRouteName;

  // Read the accredited programs directly from the MMKV session / auth store.
  // supplierInfo holds one row per program permission the merchant is tied to.
  const accreditations = useMemo<AccreditationItem[]>(() => {
    // Prefer live store value; fall back to persisted MMKV session
    let supplierInfo: any[] = userProfile?.supplierInfo || [];

    if (!supplierInfo || supplierInfo.length === 0) {
      const cached = getSession<any>('USER_PROFILE');
      supplierInfo = cached?.supplierInfo || [];
    }

    if (!Array.isArray(supplierInfo)) {
      return [];
    }

    // Show all programs the merchant is tied to (both active and inactive).
    // access_status === '1' => Active, otherwise Inactive.
    return supplierInfo.filter((item: any) => item?.program_id) as AccreditationItem[];
  }, [userProfile]);

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Certificate lightbox (View Certificate) state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerLoading, setViewerLoading] = useState(false);

  // Track which program is currently downloading (by program_id) for button spinners
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loadingViewId, setLoadingViewId] = useState<string | null>(null);

  const buildFullName = (item: AccreditationItem) =>
    [item.owner_first_name, item.owner_middle_name, item.owner_last_name, item.owner_ext_name]
      .filter(Boolean)
      .join(' ');

  const filteredAccreditations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return accreditations;

    return accreditations.filter(item => {
      const statusText = String(item.access_status) === '1' ? 'active' : 'inactive';
      const haystack = [
        item.title,
        item.shortname,
        item.description,
        buildFullName(item),
        statusText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [accreditations, searchQuery]);

  const handleGoBack = () => {
    if (prevRouteName === 'HomeScreen') {
      // Accreditation was opened from Home by nested-navigating into the Profile
      // stack. Before switching back to the Home tab, reset the Profile stack to
      // its root so a later Profile tab press doesn't re-focus this screen.
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ScreenNames.PROFILE_STACK.PROFILE_MAIN }],
        }),
      );
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

  // Resolve the supplier_id from the current item (falls back to the auth store)
  const resolveSupplierId = (item: AccreditationItem) =>
    item.supplier_id || userProfile?.userId || getSession<string>('USER_ID') || '';

  /**
   * View Certificate -> open the resolved PDF in an in-app lightbox modal.
   * PDFs are rendered through Google's document viewer wrapper so we don't
   * need a native PDF module. The presigned URL is valid for ~60 minutes.
   */
  const handleViewCertificate = async (item: AccreditationItem) => {
    const supplierId = resolveSupplierId(item);

    if (!supplierId) {
      Alert.alert('Unavailable', 'Unable to identify your account. Please sign in again.');
      return;
    }

    try {
      setLoadingViewId(item.program_id);

      const response = await fetchCertificate({
        supplier_id: supplierId,
        program_id: item.program_id,
      });

      const gviewUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        response.url!,
      )}`;

      setViewerTitle(response.program_name || item.title);
      setViewerUrl(gviewUrl);
      setViewerLoading(true);
      setViewerVisible(true);
    } catch (error: any) {
      Alert.alert('Certificate Unavailable', error.message || 'Unable to load the certificate.');
    } finally {
      setLoadingViewId(null);
    }
  };

  /**
   * Download Certificate -> fetch the resolved PDF url and save it to the
   * device using RNFS.
   */
  const handleDownloadCertificate = async (item: AccreditationItem) => {
    const supplierId = resolveSupplierId(item);

    if (!supplierId) {
      Alert.alert('Unavailable', 'Unable to identify your account. Please sign in again.');
      return;
    }

    try {
      setDownloadingId(item.program_id);

      if (Platform.OS === 'android' && Platform.Version < 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Storage permission is needed to download the certificate.');
          return;
        }
      }

      const response = await fetchCertificate({
        supplier_id: supplierId,
        program_id: item.program_id,
      });

      const filename =
        response.filename || `Certificate_${item.shortname}_${item.program_id}.pdf`;
      const baseDir =
        Platform.OS === 'android'
          ? RNFS.DownloadDirectoryPath
          : RNFS.DocumentDirectoryPath;
      const downloadDest = `${baseDir}/${filename}`;

      console.log('[Accreditation] Downloading certificate to:', downloadDest);

      const result = await RNFS.downloadFile({
        fromUrl: response.url!,
        toFile: downloadDest,
      }).promise;

      if (result.statusCode === 200) {
        Alert.alert('Certificate Downloaded', `Saved to:\n${downloadDest}`);
      } else {
        Alert.alert('Download Failed', 'Unable to download the certificate.');
      }
    } catch (error: any) {
      Alert.alert('Download Failed', error.message || 'Unable to download the certificate.');
    } finally {
      setDownloadingId(null);
    }
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setViewerUrl(null);
    setViewerTitle('');
    setViewerLoading(false);
  };

  const renderItem = ({ item }: { item: AccreditationItem }) => {
    const isActive = String(item.access_status) === '1';

    return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.programName}>{item.title}</Text>
        <Text style={styles.shortname}>{item.shortname}</Text>
      </View>

      {/* Status Badge */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isActive ? '#E8F5E9' : '#FFEBEE' },
          ]}>
          <MaterialIcons
            name={isActive ? 'check-circle' : 'cancel'}
            size={13}
            color={isActive ? '#2E7D32' : '#C62828'}
          />
          <Text
            style={[
              styles.statusText,
              { color: isActive ? '#2E7D32' : '#C62828' },
            ]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Info Rows */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Full Name</Text>
        <Text style={styles.infoValue}>{getFullName(item)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Program</Text>
        <Text style={styles.infoValue}>{item.title}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Date Accredited</Text>
        <Text style={styles.infoValue}>{formatDate(item.date_created)}</Text>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={loadingViewId === item.program_id}
          onPress={() => handleViewCertificate(item)}
          style={styles.actionButton}>
          {loadingViewId === item.program_id ? (
            <ActivityIndicator size="small" color="#1565C0" />
          ) : (
            <MaterialIcons name="visibility" size={16} color="#1565C0" />
          )}
          <Text style={[styles.actionText, { color: '#1565C0' }]}>View Certificate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={downloadingId === item.program_id}
          onPress={() => handleDownloadCertificate(item)}
          style={styles.actionButton}>
          {downloadingId === item.program_id ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <MaterialIcons name="file-download" size={16} color="#2E7D32" />
          )}
          <Text style={[styles.actionText, { color: '#2E7D32' }]}>Download</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Accreditation</Text>
      </View>

      {/* Search Filter */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search program or name..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Empty State */}
      {filteredAccreditations.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="verified" size={48} color="#D0D0D0" />
          <Text style={styles.emptyText}>
            {searchQuery.length > 0
              ? 'No matching accreditations'
              : 'No accreditations found'}
          </Text>
        </View>
      )}

      {/* List */}
      {filteredAccreditations.length > 0 && (
        <FlatList
          data={filteredAccreditations}
          keyExtractor={(item, index) => `${item.program_id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Certificate Lightbox */}
      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeViewer}>
        <View style={styles.lightboxOverlay}>
          <View style={styles.lightboxHeader}>
            <Text style={styles.lightboxTitle} numberOfLines={1}>
              {viewerTitle}
            </Text>
            <TouchableOpacity onPress={closeViewer} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={26} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.lightboxBody}>
            {viewerUrl && (
              <WebView
                source={{ uri: viewerUrl }}
                style={styles.lightboxWebView}
                startInLoadingState
                onLoadEnd={() => setViewerLoading(false)}
                javaScriptEnabled
                domStorageEnabled
              />
            )}

            {viewerLoading && (
              <View style={styles.lightboxLoader}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.lightboxLoaderText}>Loading certificate...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Accreditation;
