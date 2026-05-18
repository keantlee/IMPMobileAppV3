import React, { useState, useEffect } from 'react';
import NetInfo from "@react-native-community/netinfo";
import getBaseUrl from "../config";
import { POST, GET } from "./config/axios";

// Helpers 
declare const GET_SESSION:      (key: string) => Promise<string | null>;
declare const getLocation:      () => Promise<{ latitude?: number; longitude?: number; code?: number } | null>;
declare const checkAppVersion:  () => Promise<{ status: boolean; message: string }>;
declare const constants:        { ScreenNames: { APP_STACK: { MAIN_TAB: string; LOGIN: string } } };

interface AlertState {
    showConfirm: boolean;
    confirmText: string;
    title:       string;
    message:     string;
};

export const authenticate = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>('Initializing...');
    const [alert, setAlert] = useState<AlertState>({
        showConfirm:    false,
        confirmText:    'OK',
        title:          '',
        message:        '',
    });

    const authCheck = async (navigation: any) => {
        setIsLoading(true);
        setLoadingText('Checking connection...');

        try {
            // 1. Verfiy network status 
            const netState = await NetInfo.fetch();
            if (!netState.isConnected || !netState.isInternetReachable) {
                setAlert({
                    showConfirm:    true,
                    confirmText:    'Try again',
                    title:          'Message',
                    message:        'Please check your internet connectivity.',
                });
                setIsLoading(false);
                return;
            }

            // 2. Vaidate App version 
            setLoadingText('Verifying version...');
            const versionCheck = await checkAppVersion();
            if (!versionCheck.status) {
                setAlert({
                    showConfirm: true,
                    confirmText: 'OK',
                    title: 'Message',
                    message: versionCheck.message,
                });
                setIsLoading(false);
                return;
            }

            // 3. Fetch session and device location
            setLoadingText('Securing credentials...');
            const [session, location] = await Promise.all([
                GET_SESSION('USER_ID'),
                getLocation(),
            ]);

            // 4. Run routing assertions based on device sensors
            const hasValidCoordinates       = location?.latitude && location?.longitude;
            const isLocationErrorBypassed   = location?.code !== 2;

            if (hasValidCoordinates || isLocationErrorBypassed) {
                // Route cleanly based on session truthiness
                if (session) {
                    navigation.replace(constants.ScreenNames.APP_STACK.MAIN_TAB);
                } else {
                    navigation.replace(constants.ScreenNames.APP_STACK.LOGIN);
                }
            } else {
                // Location code matches 2 (Disabled completely on device settings)
                setAlert({
                    showConfirm:    true,
                    confirmText:    'Try again',
                    title:          'Message',
                    message:        'Please turn on your location service.',
                });
            }
        } catch (e) {
            console.error('authenticatin failure: ', e);
            setAlert({
                showConfirm:    true,
                confirmText:    'OK',
                title:          'Error',
                message:        typeof e === 'string' ? e : (e instanceof Error ? e.message : 'An unexpected system error occurred during startup.'),
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
