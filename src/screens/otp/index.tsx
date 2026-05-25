import React, { useEffect, useState, useRef } from 'react';
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
import { useRoute } from '@react-navigation/native'; 
import { verifyOtpMutation } from '../../api/auth';
import { styles } from './styles';
import { Images } from '../../assets';
import MaskedEmail from '../../components/maskedEmail';
import { renderAlertPng } from '../../assets/icons'; 
import { OtpFormData, otpSchema } from '../../types/schemas/otpSchema';

interface OtpProps {
    navigation: any;
}

const Otp = ({ navigation }: OtpProps) => {
    // Extract params passed down from your Login Modal Action
    const route = useRoute<any>();
    const loginParams = route.params || {};
    const { userId, email, fullName } = loginParams;

    // Array state to handle 6 individual split digit boxes 
    const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
    const [validationError, setValidationError] = useState<string>('');

    // Array of refs to manage box focus transitions dynamically
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error' as 'error' | 'success'
    });

    const otpMutation = verifyOtpMutation(navigation);

    // Watch for server verification exceptions
    useEffect(() => {
        if (otpMutation.isError) {
            setAlertConfig({
                visible: true,
                title: 'Verification Failed',
                message: otpMutation.error?.message || 'The code entered is incorrect.',
                type: 'error'
            });
        }
    }, [otpMutation.isError]);

    // Watch for server verification exceptions
    useEffect(() => {
        if (otpMutation.isSuccess && otpMutation.data) {
            setAlertConfig({
                visible: true,
                title: 'Success!',
                message: otpMutation.data.message,
                type: 'success'
            });
        }
    }, [otpMutation.isSuccess, otpMutation.data]);

    // Handle split-box code input logic
    const handleOtpChange = (text: string, index: number) => {
        // Only accept numbers
        const cleanText     = text.replace(/[^0-9]/g, '');
        const newOtpValues  = [...otpValues];
        
        // Grab the last character typed (handles autocomplete or double key taps gracefully)
        newOtpValues[index] = cleanText.slice(-1);
        setOtpValues(newOtpValues);
        setValidationError(''); // Clear local client validation string

        // Auto-focus next box forward if text was added
        if (cleanText && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle deletion backspaces dynamically
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
            // Focus the previous input box and clear it
            const newOtpValues = [...otpValues];
            newOtpValues[index - 1] = '';
            setOtpValues(newOtpValues);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const onPressed = () => {
        // Compile the 6 separate strings into a solid string sequence
        const combinedOtp = otpValues.join('');
        const formData: OtpFormData = { otp: combinedOtp };
        
        // Parse through our local validation checker rules
        const result = otpSchema.safeParse(formData);
    
        if (!result.success) {
            setValidationError(result.error.issues[0].message);
            return;
        }
        
        setValidationError('');

        // Trigger our TanStack pipeline, converting string to number for Laravel
        otpMutation.mutate({
            user_id:    userId, // Extracted seamlessly from route params!
            otp:        parseInt(result.data.otp, 10),
            loginParams: loginParams
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

                <Text style={styles.textTitle}>OTP Verification</Text>
                
                <Text style={styles.text}>
                    Enter the 6-digit code sent to {'\n'} 
                    <MaskedEmail email={email || "your email"} />
                </Text>

                {/* 3. The 6-Digit Interactive UI Square Grid Container */}
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    paddingHorizontal: 30,
                    marginVertical: 24 
                }}>
                    {otpValues.map((value, index) => (
                        <TextInput
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            style={{
                                width: 45,
                                height: 50,
                                borderWidth: 1.5,
                                borderColor: validationError ? '#f27474' : value ? '#a5dc86' : '#cccccc',
                                borderRadius: 8,
                                fontSize: 20,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                backgroundColor: '#ffffff',
                                color: '#333333'
                            }}
                            keyboardType="numeric"
                            maxLength={1}
                            value={value}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                        />
                    ))}
                </View>

                {/* Client-side validation message text line */}
                {validationError ? (
                    <Text style={{ color: '#f27474', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
                        {validationError}
                    </Text>
                ) : null}

                {/* Action Submit Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#009246',
                        width: '70%',
                        paddingVertical: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 10,
                        opacity: otpMutation.isPending ? 0.6 : 1
                    }}
                    onPress={onPressed}
                    disabled={otpMutation.isPending}
                >
                    {otpMutation.isPending ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>
                            Verify Code
                        </Text>
                    )}
                </TouchableOpacity>

            </View>

            {/* Status Alert feedback Modal */}
            <Modal
                visible={alertConfig.visible}
                transparent={true}
                animationType="fade"
                // This handles Android hardware back buttons safely
                onRequestClose={() => {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    otpMutation.reset();
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: '#ffffff', borderRadius: 12, width: '100%', maxWidth: 320, padding: 24, alignItems: 'center' }}>
                        <View style={{ marginBottom: 16 }}>
                            {renderAlertPng(alertConfig.type)}
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333333', marginBottom: 10 }}>
                            {alertConfig.title}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center', marginBottom: 24 }}>
                            {alertConfig.message}
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: '#009246', width: '100%', paddingVertical: 12, borderRadius: 6, alignItems: 'center' }}
                            onPress={() => {
                                // 1. First, hide the modal layout
                                setAlertConfig(prev => ({ ...prev, visible: false }));
                                
                                // 2. FIX: If it was a success token, add a slight delay before resetting 
                                // the mutation state. This gives the native modal transition window a 
                                // clean 150ms frame buffer to dissolve safely!
                                if (alertConfig.type === 'success') {
                                    setTimeout(() => {
                                        otpMutation.reset();
                                    }, 150);
                                } else {
                                    otpMutation.reset();
                                }
                            }}
                        >
                            <Text style={{ color: '#ffffff', fontWeight: '600' }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Otp;