import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';

import { useAuthStore } from '../../../store/useAuthStore';
import {
  addBranchMutation,
  fetchRegions,
  fetchProvinces,
  fetchMunicipalities,
  fetchBarangays,
} from '../../../api/office';
import { getSession } from '../../../utils/session';
import {
  addBranchSchema,
  AddBranchFormData,
  EXT_NAME_OPTIONS,
} from '../../../types/schemas/officeSchema';
import StatusModal, { StatusModalConfig } from '../../../components/statusModal';
import { styles } from './formStyles';

interface Option {
  label: string;
  value: string;
}

// Extension name dropdown options (e.g. Jr., Sr., III).
const EXT_OPTIONS: Option[] = EXT_NAME_OPTIONS.map(val => ({
  label: val || 'None',
  value: val,
}));

const AddBranch = () => {
  const navigation = useNavigation<any>();
  const userProfile = useAuthStore(state => state.user);

  const supplierId = userProfile?.userId || getSession<string>('USER_ID') || '';

  // Programs the main office is tied to (from the auth session).
  const programOptions: Option[] = (userProfile?.programs || [])
    .map((p: any) => ({
      label: p.title || p.program_name || p.shortname || 'Program',
      value: String(p.program_id),
    }))
    .filter((o: Option) => o.value && o.value !== 'undefined');

  const [showPassword, setShowPassword] = useState(false);

  const branchMutation = addBranchMutation();
  const submitting = branchMutation.isPending;

  // Custom status feedback modal (shared with Login / Transaction / Upload).
  const [statusModal, setStatusModal] = useState<StatusModalConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const [regionOptions, setRegionOptions] = useState<Option[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<Option[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<Option[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddBranchFormData>({
    resolver: zodResolver(addBranchSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      ext_name: '',
      username: '',
      email: '',
      contact_no: '',
      company_name: '',
      company_address: '',
      password: '',
      program_id: '',
      reg_code: '',
      prov_code: '',
      mun_code: '',
      brgy_code: '',
    },
  });

  const regCode = watch('reg_code');
  const provCode = watch('prov_code');
  const munCode = watch('mun_code');

  useEffect(() => {
    let mounted = true;
    fetchRegions()
      .then(regions => {
        if (mounted) {
          setRegionOptions(regions.map(r => ({ label: r.reg_name, value: String(r.reg_code) })));
        }
      })
      .catch((e: any) => Alert.alert('Error', e.message));
    return () => {
      mounted = false;
    };
  }, []);

  const onRegionChange = async (value: string) => {
    setValue('reg_code', value, { shouldValidate: true });
    setValue('prov_code', '');
    setValue('mun_code', '');
    setValue('brgy_code', '');
    setProvinceOptions([]);
    setMunicipalityOptions([]);
    setBarangayOptions([]);
    try {
      const provinces = await fetchProvinces(value);
      setProvinceOptions(provinces.map(p => ({ label: p.prov_name, value: String(p.prov_code) })));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const onProvinceChange = async (value: string) => {
    setValue('prov_code', value, { shouldValidate: true });
    setValue('mun_code', '');
    setValue('brgy_code', '');
    setMunicipalityOptions([]);
    setBarangayOptions([]);
    try {
      const cities = await fetchMunicipalities(regCode, value);
      setMunicipalityOptions(cities.map(c => ({ label: c.mun_name, value: String(c.mun_code) })));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const onMunicipalityChange = async (value: string) => {
    setValue('mun_code', value, { shouldValidate: true });
    setValue('brgy_code', '');
    setBarangayOptions([]);
    try {
      const brgys = await fetchBarangays(regCode, provCode, value);
      setBarangayOptions(brgys.map(b => ({ label: b.bgy_name, value: String(b.bgy_code) })));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const onSubmit = (formData: AddBranchFormData) => {
    if (!supplierId) {
      setStatusModal({
        visible: true,
        title: 'Unavailable',
        message: 'Unable to identify your account. Please sign in again.',
        type: 'error',
      });
      return;
    }

    branchMutation.mutate(
      {
        supplier_id: supplierId,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        ext_name: formData.ext_name,
        username: formData.username,
        email: formData.email,
        contact_no: formData.contact_no,
        company_name: formData.company_name,
        company_address: formData.company_address,
        password: formData.password,
        program_id: formData.program_id,
        reg_code: formData.reg_code,
        prov_code: formData.prov_code,
        mun_code: formData.mun_code,
        brgy_code: formData.brgy_code,
      },
      {
        onSuccess: serverData => {
          setStatusModal({
            visible: true,
            title: 'Branch Submitted',
            message: serverData.message || 'New branch submitted for RFO approval.',
            type: 'success',
          });
        },
        onError: (error: Error) => {
          setStatusModal({
            visible: true,
            title: 'Failed',
            message: error.message || 'Unable to add branch.',
            type: 'error',
          });
        },
      },
    );
  };

  // Dismiss the modal; on a successful submit, return to the list.
  const handleModalConfirm = () => {
    const wasSuccess = statusModal.type === 'success';
    setStatusModal(prev => ({ ...prev, visible: false }));
    if (wasSuccess) {
      navigation.goBack();
    }
  };

  const renderInput = (
    label: string,
    name: keyof AddBranchFormData,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      maxLength?: number;
      required?: boolean;
      multiline?: boolean;
      secure?: boolean;
      autoCapitalize?: 'none' | 'sentences' | 'words';
    },
  ) => (
    <View style={styles.fieldContainer} key={name}>
      <Text style={styles.fieldLabel}>
        {label} {options?.required && <Text style={styles.required}>*</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={[styles.fieldInput, errors[name] && styles.fieldError]}
              value={value as string}
              onChangeText={onChange}
              keyboardType={options?.keyboardType || 'default'}
              maxLength={options?.maxLength}
              multiline={options?.multiline}
              secureTextEntry={options?.secure && !showPassword}
              autoCapitalize={options?.autoCapitalize || 'sentences'}
            />
            {options?.secure && (
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                style={{ position: 'absolute', right: 12 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name]?.message as string}</Text>}
    </View>
  );

  const renderDropdown = (
    label: string,
    name: keyof AddBranchFormData,
    data: Option[],
    onSelect: (value: string) => void,
    opts?: { disabled?: boolean; required?: boolean },
  ) => (
    <View style={styles.fieldContainer} key={name}>
      <Text style={styles.fieldLabel}>
        {label} {opts?.required && <Text style={styles.required}>*</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { value } }) => (
          <Dropdown
            style={[
              styles.dropdown,
              opts?.disabled && styles.dropdownDisabled,
              errors[name] && styles.fieldError,
            ]}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            data={data}
            labelField="label"
            valueField="value"
            placeholder="Select..."
            value={value as string}
            disable={opts?.disabled}
            search
            onChange={item => onSelect(item.value)}
          />
        )}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name]?.message as string}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Branch</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeBox}>
          <MaterialIcons name="info-outline" size={18} color="#B26A00" />
          <Text style={styles.noticeText}>
            The new branch account is submitted to the RFO Program Focal for review and approval
            before it becomes active.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Owner Information</Text>
        {renderInput('First Name', 'first_name', { required: true })}
        {renderInput('Middle Name', 'middle_name')}
        {renderInput('Last Name', 'last_name', { required: true })}
        {renderDropdown('Extension Name', 'ext_name', EXT_OPTIONS, value =>
          setValue('ext_name', value, { shouldValidate: true }),
        )}

        <Text style={styles.sectionTitle}>Account Credentials</Text>
        {renderInput('Username', 'username', { required: true, autoCapitalize: 'none' })}
        {renderInput('Email', 'email', { keyboardType: 'email-address', required: true, autoCapitalize: 'none' })}
        {renderInput('Password', 'password', { required: true, secure: true, autoCapitalize: 'none' })}

        <Text style={styles.sectionTitle}>Branch Information</Text>
        {renderInput('Branch / Company Name', 'company_name', { required: true })}
        {renderInput('Complete Address', 'company_address', { required: true, multiline: true })}
        {renderInput('Contact No.', 'contact_no', { keyboardType: 'phone-pad', maxLength: 12, required: true })}
        {renderDropdown('Program', 'program_id', programOptions, value =>
          setValue('program_id', value, { shouldValidate: true }),
          { required: true },
        )}

        <Text style={styles.sectionTitle}>Location</Text>
        {renderDropdown('Region', 'reg_code', regionOptions, onRegionChange, { required: true })}
        {renderDropdown('Province', 'prov_code', provinceOptions, onProvinceChange, {
          required: true,
          disabled: !regCode,
        })}
        {renderDropdown('Municipality / City', 'mun_code', municipalityOptions, onMunicipalityChange, {
          required: true,
          disabled: !provCode,
        })}
        {renderDropdown(
          'Barangay',
          'brgy_code',
          barangayOptions,
          value => setValue('brgy_code', value, { shouldValidate: true }),
          { required: true, disabled: !munCode },
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          style={[styles.saveButton, submitting && { opacity: 0.6 }]}>
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Submit New Branch</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <StatusModal
        config={statusModal}
        confirmText={statusModal.type === 'success' ? 'DONE' : 'TRY AGAIN'}
        onConfirm={handleModalConfirm}
      />
    </SafeAreaView>
  );
};

export default AddBranch;
