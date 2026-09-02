import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';

import {
  fetchRegions,
  fetchProvinces,
  fetchMunicipalities,
  fetchBarangays,
} from '../../api/office';
import {
  fetchInterventions,
  registerMerchantMutation,
} from '../../api/registration';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import {
  registrationSchema,
  RegistrationFormData,
  EXT_NAME_OPTIONS,
  MERCHANT_TYPE_OPTIONS,
} from '../../types/schemas/registrationSchema';
import StatusModal, { StatusModalConfig } from '../../components/statusModal';
import { styles } from '../profile/officeInfo/formStyles';

interface Option {
  label: string;
  value: string;
}

const EXT_OPTIONS: Option[] = EXT_NAME_OPTIONS.map(val => ({
  label: val || 'None',
  value: val,
}));

const MERCHANT_TYPE_DROPDOWN: Option[] = MERCHANT_TYPE_OPTIONS.map(o => ({
  label: o.label,
  value: o.value,
}));

interface RegisterProps {
  navigation: any;
}

const Register = ({ navigation }: RegisterProps) => {
  const setInterventions = useRegistrationStore(state => state.setInterventions);

  const registerMutation = registerMerchantMutation();
  const submitting = registerMutation.isPending;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [interventionOptions, setInterventionOptions] = useState<Option[]>([]);
  const [regionOptions, setRegionOptions] = useState<Option[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<Option[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<Option[]>([]);

  const [statusModal, setStatusModal] = useState<StatusModalConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      ext_name: '',
      merchant_type: undefined as any,
      program_id: '',
      company_name: '',
      company_address: '',
      reg_code: '',
      prov_code: '',
      mun_code: '',
      brgy_code: '',
      contact_no: '',
      email: '',
      username: '',
      password: '',
      confirm_password: '',
    },
  });

  const regCode = watch('reg_code');
  const provCode = watch('prov_code');
  const munCode = watch('mun_code');

  // Load interventions + regions on mount.
  useEffect(() => {
    let mounted = true;

    Promise.all([fetchInterventions(), fetchRegions()])
      .then(([interventions, regions]) => {
        if (!mounted) return;
        setInterventions(interventions);
        setInterventionOptions(
          interventions.map(i => ({
            label: `${i.shortname || ''} ${i.title ? `(${i.title})` : ''}`.trim() || 'Program',
            value: String(i.program_id),
          })),
        );
        setRegionOptions(regions.map(r => ({ label: r.reg_name, value: String(r.reg_code) })));
      })
      .catch((e: any) => showError(e.message || 'Failed to load registration data.'));

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showError(e.message);
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
      showError(e.message);
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
      showError(e.message);
    }
  };

  const onSubmit = (formData: RegistrationFormData) => {
    registerMutation.mutate(
      {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        ext_name: formData.ext_name,
        merchant_type: formData.merchant_type,
        program_id: formData.program_id,
        company_name: formData.company_name,
        company_address: formData.company_address,
        reg_code: formData.reg_code,
        prov_code: formData.prov_code,
        mun_code: formData.mun_code,
        brgy_code: formData.brgy_code,
        contact_no: formData.contact_no,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      },
      {
        onSuccess: serverData => {
          setStatusModal({
            visible: true,
            title: 'Registration Submitted',
            message:
              serverData.message ||
              'Your registration has been submitted. Please wait for RFO Program Focal accreditation.',
            type: 'success',
          });
        },
        onError: (error: Error) => {
          setStatusModal({
            visible: true,
            title: 'Registration Failed',
            message: error.message || 'Unable to submit your registration.',
            type: 'error',
          });
        },
      },
    );
  };

  const handleModalConfirm = () => {
    const wasSuccess = statusModal.type === 'success';
    setStatusModal(prev => ({ ...prev, visible: false }));
    if (wasSuccess) {
      navigation.goBack();
    }
  };

  // Surface a transient error (e.g. geo load failure) via the custom modal.
  const showError = (message: string) =>
    setStatusModal({
      visible: true,
      title: 'Error',
      message,
      type: 'error',
    });

  const renderInput = (
    label: string,
    name: keyof RegistrationFormData,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      maxLength?: number;
      required?: boolean;
      multiline?: boolean;
      secure?: 'password' | 'confirm';
      autoCapitalize?: 'none' | 'sentences' | 'words';
    },
  ) => {
    const isSecure = !!options?.secure;
    const visible = options?.secure === 'confirm' ? showConfirm : showPassword;

    return (
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
                secureTextEntry={isSecure && !visible}
                autoCapitalize={options?.autoCapitalize || 'sentences'}
              />
              {isSecure && (
                <TouchableOpacity
                  onPress={() =>
                    options?.secure === 'confirm'
                      ? setShowConfirm(p => !p)
                      : setShowPassword(p => !p)
                  }
                  style={{ position: 'absolute', right: 12 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons
                    name={visible ? 'visibility-off' : 'visibility'}
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
  };

  const renderDropdown = (
    label: string,
    name: keyof RegistrationFormData,
    data: Option[],
    onSelect: (value: string) => void,
    opts?: { disabled?: boolean; required?: boolean; search?: boolean },
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
            search={opts?.search}
            onChange={item => onSelect(item.value)}
          />
        )}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name]?.message as string}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Merchant Registration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeBox}>
          <MaterialIcons name="info-outline" size={18} color="#B26A00" />
          <Text style={styles.noticeText}>
            Your account will be reviewed and accredited by the RFO Program Focal before you can log
            in.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Owner Information</Text>
        {renderInput('First Name', 'first_name', { required: true })}
        {renderInput('Middle Name', 'middle_name')}
        {renderInput('Last Name', 'last_name', { required: true })}
        {renderDropdown('Extension Name', 'ext_name', EXT_OPTIONS, value =>
          setValue('ext_name', value, { shouldValidate: true }),
        )}

        <Text style={styles.sectionTitle}>Merchant Details</Text>
        {renderDropdown(
          'Merchant Type',
          'merchant_type',
          MERCHANT_TYPE_DROPDOWN,
          value => setValue('merchant_type', value as 'main' | 'branch', { shouldValidate: true }),
          { required: true },
        )}
        {renderDropdown(
          'Intervention',
          'program_id',
          interventionOptions,
          value => setValue('program_id', value, { shouldValidate: true }),
          { required: true, search: true },
        )}
        {renderInput('Company Name', 'company_name', { required: true })}
        {renderInput('Complete Company Address', 'company_address', {
          required: true,
          multiline: true,
        })}

        <Text style={styles.sectionTitle}>Location</Text>
        {renderDropdown('Region', 'reg_code', regionOptions, onRegionChange, {
          required: true,
          search: true,
        })}
        {renderDropdown('Province', 'prov_code', provinceOptions, onProvinceChange, {
          required: true,
          disabled: !regCode,
          search: true,
        })}
        {renderDropdown('Municipality / City', 'mun_code', municipalityOptions, onMunicipalityChange, {
          required: true,
          disabled: !provCode,
          search: true,
        })}
        {renderDropdown(
          'Barangay',
          'brgy_code',
          barangayOptions,
          value => setValue('brgy_code', value, { shouldValidate: true }),
          { required: true, disabled: !munCode, search: true },
        )}

        <Text style={styles.sectionTitle}>Contact & Account</Text>
        {renderInput('Contact Number', 'contact_no', {
          keyboardType: 'phone-pad',
          maxLength: 11,
          required: true,
        })}
        {renderInput('Email', 'email', {
          keyboardType: 'email-address',
          required: true,
          autoCapitalize: 'none',
        })}
        {renderInput('Username', 'username', { required: true, autoCapitalize: 'none' })}
        {renderInput('Password', 'password', {
          required: true,
          secure: 'password',
          autoCapitalize: 'none',
        })}
        {renderInput('Re-enter Password', 'confirm_password', {
          required: true,
          secure: 'confirm',
          autoCapitalize: 'none',
        })}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          style={[styles.saveButton, submitting && { opacity: 0.6 }]}>
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Submit Registration</Text>
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

export default Register;
