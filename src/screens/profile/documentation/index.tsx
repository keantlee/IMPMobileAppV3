import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';

import ScreenNames from '../../../navigation/screenNames';
import { styles } from './styles';

const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const PDF_FILENAME = 'IMP_Documentation_Guide.pdf';

const Documentation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const prevRouteName = route.params?.prevRouteName;

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

  const handleDownloadPdf = async () => {
    try {
      // Request storage permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to download the PDF file.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        // Android 10+ scoped storage doesn't need this permission
        // but we still proceed regardless
      }

      const downloadDest = `${RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath}/${PDF_FILENAME}`;

      console.log('[Documentation] Downloading PDF to:', downloadDest);

      const result = await RNFS.downloadFile({
        fromUrl: SAMPLE_PDF_URL,
        toFile: downloadDest,
      }).promise;

      if (result.statusCode === 200) {
        Alert.alert(
          'Download Complete',
          `File saved to:\n${downloadDest}`,
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert('Download Failed', 'Unable to download the file. Please try again.');
      }
    } catch (error: any) {
      console.warn('[Documentation] Download error:', error.message);
      Alert.alert('Error', `Download failed: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documentation</Text>
        <TouchableOpacity onPress={handleDownloadPdf}>
          <MaterialIcons name="file-download" size={24} color="#009246" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.emptyState}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="menu-book" size={56} color="#009246" />
          </View>
          <Text style={styles.title}>Documentation Guide</Text>
          <Text style={styles.subtitle}>
            Reference materials and user guides for the IMP Voucher Management System.
          </Text>

          {/* Download Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDownloadPdf}
            style={styles.downloadCard}>
            <View style={styles.downloadIcon}>
              <MaterialIcons name="picture-as-pdf" size={28} color="#C62828" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.downloadTitle}>IMP User Guide</Text>
              <Text style={styles.downloadSubtitle}>PDF Document - Tap to download</Text>
            </View>
            <MaterialIcons name="file-download" size={22} color="#009246" />
          </TouchableOpacity>

          <Text style={styles.note}>
            More documentation materials will be available in future updates.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Documentation;
