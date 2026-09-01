import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';

import { useAuthStore } from '../../../store/useAuthStore';
import { getProfileMutation, updateProfileMutation, ProfileData } from '../../../api/profile';
import { profileSchema, ProfileFormData, EXT_NAME_OPTIONS } from '../../../types/schemas/profileSchema';
import { styles } from './styles';

const BANK_OPTIONS = [
  { label: 'BDO', value: 'BDO' },
  { label: 'BPI', value: 'BPI' },
  { label: 'Metrobank', value: 'Metrobank' },
  { label: 'Landbank', value: 'Landbank' },
  { label: 'PNB', value: 'PNB' },
  { label: 'UnionBank', value: 'UnionBank' },
  { label: 'RCBC', value: 'RCBC' },
  { label: 'Security Bank', value: 'Security Bank' },
  { label: 'China Bank', value: 'China Bank' },
  { label: 'EastWest Bank', value: 'EastWest Bank' },
  { label: 'GCash', value: 'GCash' },
  { label: 'Maya', value: 'Maya' },
  { label: 'Others', value: 'Others' },
];

const EXT_OPTIONS = EXT_NAME_OPTIONS.map(val => ({
  label: val || 'None',
  value: val,
}));

const ManageAccount = () => {
  const navigation = useNavigation<any>();
  const userProfile = useAuthStore(state => state.user);
  const supplierId = userProfile?.userId;

  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const profileMutation = getProfileMutation();
  const updateMutation = updateProfileMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      ext_name: '',
      main_office_name: '',
      company_name: '',
      company_address: '',
      region: '',
      province: '',
      municipality: '',
      barangay: '',
      business_permit: '',
      email: '',
      contact_no: '',
      bank_name: '',
      bank_account_name: '',
      bank_account_no: '',
      phone_no: '',
    },
  });

  useEffect(() => {
    const handleBackPress = () => {
      if (isEditMode) {
        setIsEditMode(false);
        return true;
      }
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [navigation, isEditMode]);

  useEffect(() => {
    if (supplierId) {
      profileMutation.mutate(
        { supplier_id: supplierId },
        {
          onSuccess: data => {
            const p = data.data;
            setProfileData(p);
            reset({
              first_name: p.owner_first_name || '',
              middle_name: p.owner_middle_name || '',
              last_name: p.owner_last_name || '',
              ext_name: p.owner_ext_name || '',
              main_office_name: p.supplier_group || '',
              company_name: p.supplier_name || '',
              company_address: p.address || '',
              region: p.reg_name || '',
              province: p.prov_name || '',
              municipality: p.mun_name || '',
              barangay: p.brgy_name || '',
              business_permit: p.business_permit || '',
              email: p.email || '',
              contact_no: p.contact || '',
              bank_name: p.bank_name || '',
              bank_account_name: p.bank_account_name || '',
              bank_account_no: p.bank_account_no || '',
              phone_no: p.phone_no || '',
            });
          },
        },
      );
    }
  }, [supplierId]);

  const onSubmit = (formData: ProfileFormData) => {
    if (!supplierId) return;

    updateMutation.mutate(
      {
        supplier_id: supplierId,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        ext_name: formData.ext_name,
        company_name: formData.company_name,
        company_address: formData.company_address,
        business_permit: formData.business_permit,
        email: formData.email,
        contact_no: formData.contact_no,
        bank_name: formData.bank_name,
        bank_account_name: formData.bank_account_name,
        bank_account_no: formData.bank_account_no,
        phone_no: formData.phone_no,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated successfully.');
          setIsEditMode(false);
        },
        onError: error => {
          Alert.alert('Error', error.message);
        },
      },
    );
  };

  const renderField = (
    label: string,
    name: keyof ProfileFormData,
    options?: {
      locked?: boolean;
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      dropdown?: { label: string; value: string }[];
      maxLength?: number;
    },
  ) => {
    const isLocked = options?.locked || false;

    return (
      <View style={styles.fieldContainer} key={name}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => {
            if (options?.dropdown && isEditMode && !isLocked) {
              return (
                <Dropdown
                  style={[styles.dropdown, errors[name] && styles.fieldError]}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownText}
                  data={options.dropdown}
                  labelField="label"
                  valueField="value"
                  placeholder="Select..."
                  value={value}
                  onChange={item => onChange(item.value)}
                />
              );
            }

            return (
              <TextInput
                style={[
                  styles.fieldInput,
                  !isEditMode && styles.fieldDisabled,
                  isLocked && isEditMode && styles.fieldLocked,
                  errors[name] && styles.fieldError,
                ]}
                value={value}
                onChangeText={onChange}
                editable={isEditMode && !isLocked}
                keyboardType={options?.keyboardType || 'default'}
                maxLength={options?.maxLength}
              />
            );
          }}
        />
        {errors[name] && (
          <Text style={styles.errorText}>{errors[name]?.message}</Text>
        )}
      </View>
    );
  };

  if (profileMutation.isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009246" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (isEditMode ? setIsEditMode(false) : navigation.goBack())}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Profile' : 'Manage Account'}
        </Text>
        {!isEditMode ? (
          <TouchableOpacity onPress={() => setIsEditMode(true)}>
            <MaterialIcons name="edit" size={22} color="#009246" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Personal Info */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderField('First Name', 'first_name')}
        {renderField('Middle Name', 'middle_name')}
        {renderField('Last Name', 'last_name')}
        {renderField('Extension Name', 'ext_name', { dropdown: EXT_OPTIONS })}

        {/* Company Info */}
        <Text style={styles.sectionTitle}>Company Information</Text>
        {renderField('Main Office Name', 'main_office_name', { locked: true })}
        {renderField('Company Name', 'company_name')}
        {renderField('Complete Company Address', 'company_address')}

        {/* Location (locked) */}
        <Text style={styles.sectionTitle}>Location</Text>
        {renderField('Region', 'region', { locked: true })}
        {renderField('Province', 'province', { locked: true })}
        {renderField('Municipality/City', 'municipality', { locked: true })}
        {renderField('Barangay', 'barangay', { locked: true })}

        {/* Business & Contact */}
        <Text style={styles.sectionTitle}>Business & Contact</Text>
        {renderField('Business Permit', 'business_permit')}
        {renderField('Email', 'email', { keyboardType: 'email-address' })}
        {renderField('Contact No.', 'contact_no', { keyboardType: 'phone-pad', maxLength: 12 })}
        {renderField('Phone No.', 'phone_no', { keyboardType: 'phone-pad', maxLength: 11 })}

        {/* Banking */}
        <Text style={styles.sectionTitle}>Banking Information</Text>
        {renderField('Bank', 'bank_name', { dropdown: BANK_OPTIONS })}
        {renderField('Bank Account Name', 'bank_account_name')}
        {renderField('Bank Account No.', 'bank_account_no', { keyboardType: 'numeric' })}

        {/* Save Button */}
        {isEditMode && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
            style={[styles.saveButton, updateMutation.isPending && { opacity: 0.6 }]}>
            {updateMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageAccount;
