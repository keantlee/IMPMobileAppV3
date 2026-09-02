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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';

import { useAuthStore } from '../../../store/useAuthStore';
import {
  getOfficeDetailMutation,
  updateOfficeMutation,
  fetchRegions,
  fetchProvinces,
  fetchMunicipalities,
  fetchBarangays,
  BankOption,
  OfficeDetail,
} from '../../../api/office';
import { getSession } from '../../../utils/session';
import {
  officeEditSchema,
  OfficeEditFormData,
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

const EditOffice = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userProfile = useAuthStore(state => state.user);

  const supplierId = userProfile?.userId || getSession<string>('USER_ID') || '';
  const officeId: string = route.params?.officeId;

  const detailMutation = getOfficeDetailMutation();
  const updateMutation = updateOfficeMutation();

  const [loading, setLoading] = useState(true);
  const submitting = updateMutation.isPending;
  const [supplierType, setSupplierType] = useState<string | null>(null);

  // Custom status feedback modal (shared with Login / Transaction / Upload).
  const [statusModal, setStatusModal] = useState<StatusModalConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  // Dropdown option sets
  const [bankOptions, setBankOptions] = useState<Option[]>([]);
  const [regionOptions, setRegionOptions] = useState<Option[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<Option[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<Option[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OfficeEditFormData>({
    resolver: zodResolver(officeEditSchema),
    defaultValues: {
      supplier_name: '',
      address: '',
      business_permit: '',
      email: '',
      contact_no: '',
      owner_first_name: '',
      owner_middle_name: '',
      owner_last_name: '',
      owner_ext_name: '',
      owner_phone_no: '',
      reg_code: '',
      prv_code: '',
      mun_code: '',
      brgy_code: '',
      bank_short_name: '',
      bank_long_name: '',
      bank_account_name: '',
      bank_account_no: '',
    },
  });

  const regCode = watch('reg_code');
  const provCode = watch('prv_code');
  const munCode = watch('mun_code');

  const mapBanks = (banks: BankOption[]): Option[] =>
    banks.map(b => ({ label: b.name, value: b.shortname }));

  // Initial load: regions + banks + office detail prefill.
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!supplierId || !officeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [regions, detailResp] = await Promise.all([
          fetchRegions(),
          detailMutation.mutateAsync({ supplier_id: supplierId, office_id: officeId }),
        ]);

        if (!mounted) return;

        setRegionOptions(
          regions.map(r => ({ label: r.reg_name, value: String(r.reg_code) })),
        );

        const detail = detailResp.data as OfficeDetail;
        setSupplierType(detail.supplier_type);
        setBankOptions(mapBanks(detailResp.banks || []));

        // Prefill the form.
        reset({
          supplier_name: detail.supplier_name || '',
          address: detail.address || '',
          business_permit: detail.business_permit || '',
          email: detail.email || '',
          contact_no: detail.contact || '',
          owner_first_name: detail.owner_first_name || '',
          owner_middle_name: detail.owner_middle_name || '',
          owner_last_name: detail.owner_last_name || '',
          owner_ext_name: detail.owner_ext_name || '',
          owner_phone_no: detail.owner_phone || '',
          reg_code: detail.reg ? String(detail.reg) : '',
          prv_code: detail.prv ? String(detail.prv) : '',
          mun_code: detail.mun ? String(detail.mun) : '',
          brgy_code: detail.brgy ? String(detail.brgy) : '',
          bank_short_name: detail.bank_short_name || '',
          bank_long_name: detail.bank_long_name || '',
          bank_account_name: detail.bank_account_name || '',
          bank_account_no: detail.bank_account_no || '',
        });

        // Preload the cascade for the existing selection so labels render.
        if (detail.reg) {
          const provinces = await fetchProvinces(detail.reg);
          if (!mounted) return;
          setProvinceOptions(
            provinces.map(p => ({ label: p.prov_name, value: String(p.prov_code) })),
          );
        }
        if (detail.reg && detail.prv) {
          const cities = await fetchMunicipalities(detail.reg, detail.prv);
          if (!mounted) return;
          setMunicipalityOptions(
            cities.map(c => ({ label: c.mun_name, value: String(c.mun_code) })),
          );
        }
        if (detail.reg && detail.prv && detail.mun) {
          const brgys = await fetchBarangays(detail.reg, detail.prv, detail.mun);
          if (!mounted) return;
          setBarangayOptions(
            brgys.map(b => ({ label: b.bgy_name, value: String(b.bgy_code) })),
          );
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load office detail.');
        navigation.goBack();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, officeId]);

  // Cascade handlers: reset the dependent levels when a parent changes.
  const onRegionChange = async (value: string) => {
    setValue('reg_code', value, { shouldValidate: true });
    setValue('prv_code', '');
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
    setValue('prv_code', value, { shouldValidate: true });
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

  const onSubmit = (formData: OfficeEditFormData) => {
    if (!supplierId || !officeId) return;

    updateMutation.mutate(
      {
        supplier_id: supplierId,
        office_id: officeId,
        supplier_name: formData.supplier_name,
        address: formData.address,
        business_permit: formData.business_permit,
        email: formData.email,
        contact_no: formData.contact_no,
        owner_first_name: formData.owner_first_name,
        owner_middle_name: formData.owner_middle_name,
        owner_last_name: formData.owner_last_name,
        owner_ext_name: formData.owner_ext_name,
        owner_phone_no: formData.owner_phone_no,
        reg_code: formData.reg_code,
        prv_code: formData.prv_code,
        mun_code: formData.mun_code,
        brgy_code: formData.brgy_code,
        bank_long_name: formData.bank_long_name,
        bank_short_name: formData.bank_short_name,
        bank_account_name: formData.bank_account_name,
        bank_account_no: formData.bank_account_no,
        supplier_type: supplierType || undefined,
      },
      {
        onSuccess: serverData => {
          setStatusModal({
            visible: true,
            title: 'Submitted',
            message: serverData.message || 'Your update has been submitted for approval.',
            type: 'success',
          });
        },
        onError: (error: Error) => {
          setStatusModal({
            visible: true,
            title: 'Update Failed',
            message: error.message || 'Unable to update office.',
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
    name: keyof OfficeEditFormData,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      maxLength?: number;
      required?: boolean;
      multiline?: boolean;
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
          <TextInput
            style={[styles.fieldInput, errors[name] && styles.fieldError]}
            value={value as string}
            onChangeText={onChange}
            keyboardType={options?.keyboardType || 'default'}
            maxLength={options?.maxLength}
            multiline={options?.multiline}
          />
        )}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name]?.message as string}</Text>}
    </View>
  );

  const renderDropdown = (
    label: string,
    name: keyof OfficeEditFormData,
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009246" />
          <Text style={styles.loadingText}>Loading office detail...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Office</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeBox}>
          <MaterialIcons name="info-outline" size={18} color="#B26A00" />
          <Text style={styles.noticeText}>
            Changes are submitted for RFO Program Focal approval and take effect once approved.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Owner Information</Text>
        {renderInput('First Name', 'owner_first_name', { required: true })}
        {renderInput('Middle Name', 'owner_middle_name')}
        {renderInput('Last Name', 'owner_last_name', { required: true })}
        {renderDropdown('Extension Name', 'owner_ext_name', EXT_OPTIONS, value =>
          setValue('owner_ext_name', value, { shouldValidate: true }),
        )}
        {renderInput('Owner Phone', 'owner_phone_no', { keyboardType: 'phone-pad', maxLength: 12 })}

        <Text style={styles.sectionTitle}>Office Information</Text>
        {renderInput('Office / Company Name', 'supplier_name', { required: true })}
        {renderInput('Complete Address', 'address', { required: true, multiline: true })}
        {renderInput('Business Permit', 'business_permit')}
        {renderInput('Email', 'email', { keyboardType: 'email-address', required: true })}
        {renderInput('Contact No.', 'contact_no', { keyboardType: 'phone-pad', maxLength: 12, required: true })}

        <Text style={styles.sectionTitle}>Location</Text>
        {renderDropdown('Region', 'reg_code', regionOptions, onRegionChange, { required: true })}
        {renderDropdown('Province', 'prv_code', provinceOptions, onProvinceChange, {
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

        <Text style={styles.sectionTitle}>Banking Information</Text>
        {renderDropdown(
          'Bank',
          'bank_short_name',
          bankOptions,
          value => {
            setValue('bank_short_name', value, { shouldValidate: true });
            const selected = bankOptions.find(b => b.value === value);
            setValue('bank_long_name', selected?.label || '');
          },
          {},
        )}
        {renderInput('Bank Account Name', 'bank_account_name')}
        {renderInput('Bank Account No.', 'bank_account_no', { keyboardType: 'numeric' })}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          style={[styles.saveButton, submitting && { opacity: 0.6 }]}>
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Submit for Approval</Text>
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

export default EditOffice;
