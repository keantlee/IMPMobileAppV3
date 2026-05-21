import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    Image, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator, 
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginSchema, LoginFormData } from '../../types/schemas/loginSchema';
import { useLoginMutation } from '../../api/auth'; 
import { styles } from './styles';
import { Images } from '../../assets';
import { renderAlertPng } from '../../assets/icons'; 

interface LoginProps {
    navigation: any;
}

const LogIn = ({ navigation }: LoginProps) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [secureTextEntry] = useState<boolean>(true);
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

    // Controls your new native custom modal visibility
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'errors' as 'error' | 'success'
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
                type: 'error'
            });
        }
    }, [loginMutation.isError]);

    // B. Watch for API Successes
    useEffect(() => {
        if (loginMutation.isSuccess && loginMutation.data) {
            setAlertConfig({
                visible: true,
                title: 'Success!',
                message: loginMutation.data.message || 'You have logged in successfully.',
                type: 'success'
            });
        }
    }, [loginMutation.isSuccess, loginMutation.data]);

    // 2. Watch for changes to the API state. If TanStack throws an error, pop open the alert!
    useEffect(() => {
        if (loginMutation.isError) {
            setShowAlert(true);
        }
    }, [loginMutation.isError]);

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

        // Fire the mutation with pre-validated Zod data payload
        loginMutation.mutate({
            email: result.data.email,
            password: result.data.password
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.subContainer}>
   
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo}                        
                        source={Images.logos.daLogo}
                        resizeMode="contain"                      
                    />
                </View>   

                <Text style={styles.title}>Intervention Management Platform</Text>
                <Text style={styles.subtitle}>Voucher Mobile App</Text>

                {/* API Error Feedback Notification Banner */}
                {loginMutation.isError && (
                    <Text style={{ color: '#f27474', marginBottom: 10, fontWeight: 'bold' }}>
                        {loginMutation.error?.message}
                    </Text>
                )}

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[styles.input, errors.email ? styles.inputError : null]}
                        placeholder="Email"
                        placeholderTextColor="#a0a0a0"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[styles.input, errors.password ? styles.inputError : null]}
                        placeholder="Password"
                        placeholderTextColor="#a0a0a0"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        secureTextEntry={secureTextEntry}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <TouchableOpacity onPress={() => console.warn("Forgot Password")} activeOpacity={0.7}>
                    <Text style={styles.fpText}>Forgot Password?</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.logInBtn, loginMutation.isPending ? styles.btnDisabled : null]} 
                    onPress={onLoginPressed}
                    disabled={loginMutation.isPending} 
                    activeOpacity={0.8}
                >
                    {loginMutation.isPending ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <Text style={styles.btnText}>LOGIN</Text>
                    )}
                </TouchableOpacity>

                {/* 3. Pure Native Custom SweetAlert Modal Replacement */}
                <Modal
                    visible={alertConfig.visible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                        setAlertConfig(prev => ({ ...prev, visible: false }));
                        loginMutation.reset();
                    }}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 24
                    }}>
                        <View style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 12,
                            width: '100%',
                            maxWidth: 320,
                            padding: 24,
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 5
                        }}>
                            
                            <View style={{ marginBottom: 16 }}>
                                {renderAlertPng(alertConfig.type)}
                            </View>

                            {/* B. Dynamic Title Text */}
                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: '#333333',
                                textAlign: 'center',
                                marginBottom: 10
                            }}>
                                {alertConfig.title}
                            </Text>

                            <Text style={{
                                fontSize: 14,
                                color: '#666666',
                                textAlign: 'center',
                                lineHeight: 20,
                                marginBottom: 24
                            }}>
                                {alertConfig.message}
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    setAlertConfig(prev => ({ ...prev, visible: false }));

                                    console.log("[Login Button Click]: ", alertConfig.type);
                                    
                                    if (alertConfig.type === 'success' && loginMutation.data) {
                                        const rawData: any      = loginMutation.data;
                                        const innerData         = rawData.data?.user_id ? rawData.data : rawData;
                                        const nestedPrograms    = rawData.programs || rawData.data?.programs;
                                        const nestedSupplier    = rawData.supplierInfo || rawData.data?.supplierInfo;

                                        const params = {
                                            userId:       innerData.user_id,
                                            email:        innerData.email,
                                            supplierName: innerData.supplier_name,
                                            fullName:     innerData.full_name,
                                            regName:      innerData.reg_name,                            
                                            programs:     nestedPrograms,
                                            role:         innerData.role,
                                            supplierInfo: nestedSupplier,
                                        };

                                        console.log('[Modal Action Button] User read the success alert! Heading to VerifyOtp with:', params);

                                        navigation.navigate('VerifyOtp', params);
                                    } else {
                                        loginMutation.reset(); 
                                    }
                                }}
                                style={{
                                    backgroundColor: alertConfig.type === 'success' ? '#a5dc86' : '#f27474', 
                                    width: '100%',
                                    paddingVertical: 12,
                                    borderRadius: 6,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{
                                    color: '#ffffff',
                                    fontSize: 15,
                                    fontWeight: '600'
                                }}>
                                    OK
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>
               
            </View>
        </SafeAreaView>
    );
};

export default LogIn;