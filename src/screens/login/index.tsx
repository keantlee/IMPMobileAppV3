import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { loginSchema, LoginFormData } from '../../types/schemas/loginSchema';
import { useLoginMutation } from '../../api/auth';
import ScreenNames from '../../navigation/screenNames';
import { styles } from './styles';
import { Images } from '../../assets';
import { renderAlertPng } from '../../assets/icons';

interface LoginProps {
    navigation: any;
}

const LogIn = ({ navigation }: LoginProps) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error' as 'error' | 'success',
    });

    // 1. Initialize TanStack Mutation Engine
    const loginMutation = useLoginMutation(navigation);

    // A. Watch for API Errors
    useEffect(() => {
        if (loginMutation.isError) {
            setAlertConfig({
                visible: true,
                title: 'Authentication Error',
                message: loginMutation.error?.message || 'Invalid credentials.',
                type: 'error',
            });
        }
    }, [loginMutation.isError, loginMutation.error]);

    // B. Watch for API Successes
    useEffect(() => {
        if (loginMutation.isSuccess && loginMutation.data) {
            setAlertConfig({
                visible: true,
                title: 'Success!',
                message: loginMutation.data.message || 'You have logged in successfully.',
                type: 'success',
            });
        }
    }, [loginMutation.isSuccess, loginMutation.data]);

    const onLoginPressed = () => {
        const formData: LoginFormData = { email, password };
        const result = loginSchema.safeParse(formData);

        if (!result.success) {
            const formattedErrors: Partial<Record<keyof LoginFormData, string>> = {};
            result.error.issues.forEach((issue) => {
                const pathKey = issue.path[0] as keyof LoginFormData;
                if (!formattedErrors[pathKey]) {
                    formattedErrors[pathKey] = issue.message;
                }
            });
            setErrors(formattedErrors);
            return;
        }

        setErrors({});

        loginMutation.mutate({
            email: result.data.email,
            password: result.data.password,
        });
    };

    const goToRegister = () => {
        navigation.navigate(ScreenNames.APP_STACK.REGISTER);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#009246" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {/* Brand banner */}
                <View style={styles.headerBanner}>
                    <View style={styles.logoContainer}>
                        <Image
                            style={styles.logo}
                            source={Images.logos.daLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.bannerTitle}>Intervention Management Platform</Text>
                    <Text style={styles.bannerSubtitle}>Voucher Mobile App</Text>
                </View>

                {/* Login card */}
                <View style={styles.card}>
                    <Text style={styles.welcomeTitle}>Welcome back</Text>
                    <Text style={styles.welcomeSubtitle}>Sign in to continue to your account</Text>

                    {/* Email */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={[styles.inputField, errors.email ? styles.inputError : null]}>
                            <MaterialIcons name="email" size={18} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#B0B0B0"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={[styles.inputField, errors.password ? styles.inputError : null]}>
                            <MaterialIcons name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#B0B0B0"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                secureTextEntry={secureTextEntry}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setSecureTextEntry(prev => !prev)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <MaterialIcons
                                    name={secureTextEntry ? 'visibility' : 'visibility-off'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate(ScreenNames.APP_STACK.FORGOT_PASSWORD)}
                        activeOpacity={0.7}>
                        <Text style={styles.fpText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logInBtn, loginMutation.isPending ? styles.btnDisabled : null]}
                        onPress={onLoginPressed}
                        disabled={loginMutation.isPending}
                        activeOpacity={0.85}>
                        {loginMutation.isPending ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text style={styles.btnText}>LOGIN</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>New to IMP?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Register */}
                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={goToRegister}
                        activeOpacity={0.8}>
                        <MaterialIcons name="person-add-alt" size={18} color="#009246" />
                        <Text style={styles.registerBtnText}>Register as Merchant</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>Department of Agriculture — IMP RSBSA</Text>
            </ScrollView>

            {/* Custom feedback modal */}
            <Modal
                visible={alertConfig.visible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    loginMutation.reset();
                }}>
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 24,
                }}>
                    <View style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        width: '100%',
                        maxWidth: 340,
                        padding: 24,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5,
                    }}>
                        <View style={{ marginBottom: 16 }}>
                            {renderAlertPng(alertConfig.type)}
                        </View>

                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#333333',
                            textAlign: 'center',
                            marginBottom: 10,
                        }}>
                            {alertConfig.title}
                        </Text>

                        <Text style={{
                            fontSize: 14,
                            color: '#666666',
                            textAlign: 'center',
                            lineHeight: 20,
                            marginBottom: 24,
                        }}>
                            {alertConfig.message}
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setAlertConfig(prev => ({ ...prev, visible: false }));

                                if (alertConfig.type === 'success' && loginMutation.data) {
                                    const rawData: any = loginMutation.data;
                                    const innerData = rawData.data?.user_id ? rawData.data : rawData;
                                    const nestedPrograms = rawData.programs || rawData.data?.programs;
                                    const nestedSupplier = rawData.supplierInfo || rawData.data?.supplierInfo;

                                    const params = {
                                        userId: innerData.user_id,
                                        email: innerData.email,
                                        supplierName: innerData.supplier_name,
                                        fullName: innerData.full_name,
                                        regName: innerData.reg_name,
                                        programs: nestedPrograms,
                                        role: innerData.role,
                                        supplierInfo: nestedSupplier,
                                    };

                                    navigation.navigate('VerifyOtp', params);
                                } else {
                                    loginMutation.reset();
                                }
                            }}
                            style={{
                                backgroundColor: alertConfig.type === 'success' ? '#009246' : '#f27474',
                                width: '100%',
                                paddingVertical: 12,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}>
                            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                                OK
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default LogIn;
