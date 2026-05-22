import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Images } from '../../assets';
import { authenticate } from '../../api/auth'; 
import { renderAlertPng } from '../../assets/icons';

interface AuthenticationProps {
    navigation: any;
}

const Authentication = ({ navigation }: AuthenticationProps) => {
    const { isLoading, loadingText, alert, setAlert, authCheck } = authenticate();

    // Automatically trigger the system check when the screen mounts
    useEffect(() => {
        authCheck(navigation);
    }, [navigation]);

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

                {/* Loading Feedback Indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>{loadingText}</Text>
                    </View>
                )}

                {/* ✅ Pure Native Custom Modal Replacement */}
                <Modal
                    visible={alert.showConfirm}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                        setAlert((prev) => ({ ...prev, showConfirm: false }));
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
                            
                            {/* Alert Icon Render */}
                            {alert.alertType ? (
                                <View style={{ marginBottom: 16 }}>
                                    {renderAlertPng(alert.alertType)}
                                </View>
                            ) : null}

                            {/* Alert Title */}
                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: '#333333',
                                textAlign: 'center',
                                marginBottom: 10
                            }}>
                                {alert.title || "Notification"}
                            </Text>

                            {/* Alert Message */}
                            <Text style={{
                                fontSize: 14,
                                color: '#666666',
                                textAlign: 'center',
                                lineHeight: 20,
                                marginBottom: 24
                            }}>
                                {alert.message || "Action required."}
                            </Text>

                            {/* Dynamic Action Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    const currentAction = (alert as any).actionKey;

                                    // 1. Instantly hide the modal 
                                    setAlert((prev) => ({ ...prev, showConfirm: false }));
                                    
                                    // 2. Intercept custom settings hook if present
                                    if (currentAction === 'OPEN_SETTINGS') {
                                        Linking.openSettings().catch(() => {
                                            console.error("Could not launch system settings");
                                        });
                                        return;
                                    }

                                    // 3. Handle retry loop
                                    if (alert.confirmText === 'Try again') {
                                        authCheck(navigation);
                                    }
                                }}
                                style={{
                                    backgroundColor: alert.confirmButtonColor || '#3085d6', 
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
                                    {alert.confirmText || "OK"}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>
               
            </View>
        </SafeAreaView>
    );
};

export default Authentication;