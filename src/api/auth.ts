import React, { useState, useEffect } from 'react';
import NetInfo from "@react-native-community/netinfo";
import getBaseUrl from "../config";
import { POST, GET } from "./config/axios";
import { getSession } from '../utils/session';
import { checkAppVersion } from '../utils/app_version';

// Helpers 
declare const getLocation:      () => Promise<{ latitude?: number; longitude?: number; code?: number } | null>;
declare const constants:        { ScreenNames: { APP_STACK: { MAIN_TAB: string; LOGIN: string } } };

interface AlertState {
    showConfirm:        boolean;
    confirmText:        string;
    title:              string;
    message:            string;
    confirmButtonColor: string; 
};

const getSwalColor = (type: 'success' | 'info' | 'error' | 'warning') => {
    const colors = {
        success:    '#a5dc86', 
        error:      '#f27474',  
        warning:    '#f8bb86', 
        info:       '#3bc9db',   
    };
    return colors[type] || '#3085d6';
};

export const authenticate = () => {
    const [isLoading, setIsLoading]     = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>('Initializing...');
    const [alert, setAlert] = useState<AlertState>({
        showConfirm:    false,
        confirmText:    'OK',
        title:          '',
        message:        '',
        confirmButtonColor: '#3085d6',
    });

    const authCheck = async (navigation: any) => {
        setIsLoading(true);
        setLoadingText('Checking connection...');

        try {
            // 1. Verfiy network status 
            const netState = await NetInfo.fetch();
            if (!netState.isConnected || !netState.isInternetReachable) {
                setAlert({
                    showConfirm:        true,
                    confirmText:        'Try again',
                    title:              'Connection Lost',
                    message:            'Please check your internet connectivity.',
                    confirmButtonColor: getSwalColor('error'),
                });
                setIsLoading(false);
                return;
            }

            // 2. Validate App version 
            setLoadingText('Verifying version...');
            const versionCheck = await checkAppVersion();
            if (!versionCheck.status) {
                setAlert({
                    showConfirm:        true,
                    confirmText:        'OK',
                    title:              versionCheck.title || 'Notification',
                    message:            versionCheck.message || 'Action required.',
                    confirmButtonColor: getSwalColor(versionCheck.alertType || 'info'),
                });
                setIsLoading(false);
                return;
            }

            // 3. Fetch session and device location
            setLoadingText('Securing credentials...');
            const session = getSession<string>('USER_ID');

            // 4. Fetch device coordinates
            const location = await getLocation();

            // 5. Run routing assertions based on device sensors
            const hasValidCoordinates       = location?.latitude && location?.longitude;

            // If code is 2, it means the hardware GPS toggle is completely switched off on their phone
            const isLocationServiceSwitchedOff = location?.code === 2;

            if (hasValidCoordinates) {
                if (session) {
                    navigation.replace(constants.ScreenNames.APP_STACK.MAIN_TAB);
                } else {
                    navigation.replace(constants.ScreenNames.APP_STACK.LOGIN);
                }
            } else if (isLocationServiceSwitchedOff) {
                setAlert({
                    showConfirm:        true,
                    confirmText:        'Try again',
                    title:              'Location Service Disabled',
                    message:            'Please swipe down your notification panel and turn on your device Location/GPS service.',
                    confirmButtonColor: getSwalColor('warning'), 
                });
            } else {
                // Handles general sensor timeouts or permission rejections (Code 1 or 3)
                setAlert({
                    showConfirm:        true,
                    confirmText:        'Try again',
                    title:              'Location Sensor Timeout',
                    message:            'We could not acquire your device location. Please step into an open area and try again.',
                    confirmButtonColor: getSwalColor('error'),
                });
            }
        } catch (e) {
            console.error('authenticatin failure: ', e);
            setAlert({
                showConfirm:        true,
                confirmText:        'OK',
                title:              'Error',
                message:            typeof e === 'string' ? e : (e instanceof Error ? e.message : 'An unexpected system error occurred during startup.'),
                confirmButtonColor: getSwalColor('error'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        loadingText,
        alert,
        setAlert,
        authCheck
    };
};

export const login = () => {};

export const sendForgotPasswordLink = () => {};

export const verifyOtp = () => {};

export const resendOtp = () => {};
