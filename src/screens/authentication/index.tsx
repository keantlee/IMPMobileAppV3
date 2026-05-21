import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Animated, Easing, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Images } from '../../assets';
import AwesomeAlert from 'react-native-awesome-alerts';
import { authenticate } from '../../api/auth'; // Connect to your existing controller hook
import AppIcons, { renderAlertPng } from '../../assets/icons';
import { clearSession } from '../../utils/session';

interface AuthenticationProps {
    navigation: any;
}

const Authentication = ({ navigation }: AuthenticationProps) => {
    // 1. Hook up the custom state controllers from your api/auth file
    const { isLoading, loadingText, alert, setAlert, authCheck } = authenticate();

    // const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // TRIGGER IT HERE to wipe the session immediately on bootup
        console.log("[Testing] Purging stale MMKV sessions...");
        clearSession(); 
    }, []);

    // 2. Automatically trigger the system check when the splash screen loads up
    useEffect(() => {
        authCheck(navigation);
    }, []);

    // // 2. Control the infinite spinning loop based on the isLoading state
    // useEffect(() => {
    //     if (isLoading) {
    //         // Reset to 0 before starting
    //         spinValue.setValue(0);
            
    //         // Loop the rotation continuously
    //         Animated.loop(
    //             Animated.timing(spinValue, {
    //                 toValue: 1,
    //                 duration: 1500, // Speed of rotation (1.5 seconds per full turn)
    //                 easing: Easing.linear, // Moves at a perfectly constant speed
    //                 useNativeDriver: true, // Offloads animation to the hardware thread for 60fps performance
    //             })
    //         ).start();
    //     } else {
    //         spinValue.setValue(0);
    //     }
    // }, [isLoading]);

    // // 3. Map the 0-1 timing value to standard 360-degree rotation string markers
    // const spinRotation = spinValue.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: ['0deg', '360deg'],
    // });

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

                {/* 3. Dynamic Loading Icon Block */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        {/* THE FIX: Swapped out the buggy static GIF layout with an Animated.Image wrapper.
                          We pass your clean checkIcon (or any branding icon) and apply the hardware rotation matrix!
                        */}
                        {/* <Animated.Image 
                            source={AppIcons.loadingIcon} 
                            style={{ 
                                width: 64, 
                                height: 64, 
                                resizeMode: 'contain', 
                                marginBottom: 12,
                                transform: [{ rotate: spinRotation }] // 👈 Magic happens here
                            }} 
                        /> */}
                        <Text style={styles.loadingText}>{loadingText}</Text>
                    </View>
                )}

                {/* 4. AwesomeAlert configurations connected to the system sensor alerts */}
                <AwesomeAlert
                    show={alert.showConfirm}
                    showProgress={false}
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showConfirmButton={true}
                    confirmText={alert.confirmText || "OK"}
                    confirmButtonColor={alert.confirmButtonColor || "#3085d6"}

                    // 1. THE TRICK: Clear out the native text properties so they don't render at the top
                    title={undefined}
                    message={undefined}

                    customView={
                        <View style={{ alignItems: 'center', width: '100%', paddingVertical: 10 }}>
                            {/* A. The Image Icon goes on top */}
                            {alert.alertType ? (
                                <View style={{ marginBottom: 16 }}>
                                    {renderAlertPng(alert.alertType)}
                                </View>
                            ) : null}

                            {/* B. The Title Text goes in the middle */}
                            <Text style={{ 
                                fontSize: 18, 
                                fontWeight: 'bold', 
                                color: '#333', 
                                textAlign: 'center',
                                marginBottom: 8 
                            }}>
                                {alert.title || "Notification"}
                            </Text>

                            {/* C. The Message Text goes at the bottom */}
                            <Text style={{ 
                                fontSize: 14, 
                                color: '#666', 
                                textAlign: 'center', 
                                lineHeight: 20 
                            }}>
                                {alert.message || "Action required."}
                            </Text>
                        </View>
                    }

                    onConfirmPressed={() => {
                        // 1. Grab the action flag out of the alert payload data before we close it
                        const currentAction = (alert as any).actionKey;

                        // 2. Safely close the alert modal window right away
                        setAlert((prev) => ({ ...prev, showConfirm: false }));
                        
                        // 3. THE MATRIX ROUTER: Intercept the action key string!
                        if (currentAction === 'OPEN_SETTINGS') {
                            console.log('OnConfirmAction Triggered: Launching System Settings Panel!');
                            Linking.openSettings().catch(() => {
                                console.error("Could not launch system settings");
                            });
                            return; // Terminate execution here
                        }

                        // 4. Default Fallback: Re-run the auth checker loop
                        if (alert.confirmText === 'Try again') {
                            authCheck(navigation);
                        }
                    }}
                />
               
            </View>
        </SafeAreaView>
    );
};

export default Authentication;