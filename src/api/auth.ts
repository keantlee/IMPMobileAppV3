import React, { useState, useEffect } from 'react';
import NetInfo from "@react-native-community/netinfo";
import getBaseUrl from "../config";
import { POST, GET } from "./config/axios";
import { getSession, setSession, clearSession } from '../utils/session';
import { checkAppVersion } from '../utils/app_version';
import EndPoints from './config/endpoints';
import ScreenNames from '../navigation/screenNames';
import { useMutation } from '@tanstack/react-query'; // Imported for the new engine
import { useAuthStore } from '../store/useAuthStore'; // Imported your new store
import { Linking, PermissionsAndroid } from 'react-native';
import { getLocation } from '../utils/location';

// Helpers 
// declare const getLocation:      () => Promise<{ latitude?: number; longitude?: number; code?: number } | null>;
declare const constants: { 
    ScreenNames: { APP_STACK: { MAIN_TAB: string; LOGIN: string } },
    EndPoints: { LOGIN: string }
};

export type AlertIconType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
    showConfirm:        boolean;
    confirmText:        string;
    title:              string;
    message:            string;
    confirmButtonColor: string; 
    alertType:          AlertIconType | '';
    onConfirm?:         () => void;
};

interface ServerLoginResponseType {
    status: boolean;
    message?: string;
    data?: {
        user_id: string;
        email: string;
        supplier_name: string;
        full_name: string;
        reg_name: string;
        role: string;
        status: boolean;
    };
    programs?:      any[];
    supplierInfo?:  any;
}
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
    const setAuth = useAuthStore((state) => state.setAuth);

    const [isLoading, setIsLoading]     = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>('Initializing...');
    const [alert, setAlert] = useState<AlertState>({
        alertType:          '',
        showConfirm:        false,
        confirmText:        'OK',
        title:              '',
        message:            '',
        confirmButtonColor: '#3085d6',
    });

    const authCheck = async (navigation: any) => {
        setIsLoading(true);
        setLoadingText('Checking connection...');

        console.log("[AuthCheck] status: Checking connection...");

        try {
            // 1. Verfiy network status 
            const netState = await NetInfo.fetch();
            if (!netState.isConnected || !netState.isInternetReachable) {
                setAlert({
                    alertType:          'error',
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
            setLoadingText('Verifying App Version...');

            const versionCheck = await checkAppVersion();
            console.log(`[AuthCheck] Version Check: ${versionCheck.status}`);
            console.log(versionCheck)

            if (!versionCheck.status) {
                console.log("[AuthCheck] status: Verifying version...");
                // Fallback safe assignment for backend driven strings
                const backedType = versionCheck.alertType as AlertIconType;
                const safeAlertType: AlertIconType = ['success', 'info', 'error', 'warning'].includes(backedType) 
                    ? backedType 
                    : 'info';

                setAlert({
                    showConfirm:        true,
                    confirmText:        'OK',
                    title:              versionCheck.title || 'Notification',
                    message:            versionCheck.message || 'Action required.',
                    confirmButtonColor: getSwalColor(safeAlertType),
                    alertType:          safeAlertType // 👈 Now safely unified with the color
                });
                setIsLoading(false);
                return;
            }

            // 3. Fetch session and device location
            setLoadingText('Securing credentials...');
            const session               = getSession<string>('USER_ID');
            const cachedProfileData     = getSession<any>('USER_PROFILE');

            // 4. Fetch device coordinates
            const location = await getLocation();

            // 5. Run routing assertions based on device sensors
            const hasValidCoordinates = location?.latitude && location?.longitude;

            // Catch code 2 (Hardware Off) OR check if the error message mentions "provider" or "disabled"
            const isLocationServiceSwitchedOff = 
                location?.code === 2 || 
                (location?.message && location.message.toLowerCase().includes('disabled'));

            // Catch code 1 (Permission Denied)
            const isPermissionDenied = location?.code === 1;      
            
            // Catch code 3 (Timeout - This is what your emulator is getting!)
            const isTimeout = location?.code === 3;

            if (hasValidCoordinates) {
                if (session && cachedProfileData) {
                    console.log("[AuthCheck] status: Found saved profile data! Checking format...");

                    let rehydratedSession = null;

                    try {
                        if (typeof cachedProfileData === 'string') {
                            // If it's a raw string, parse it cleanly
                            rehydratedSession = JSON.parse(cachedProfileData);
                        } else if (typeof cachedProfileData === 'object' && cachedProfileData !== null) {
                            // FIX: If it's already a native JavaScript object, use it directly!
                            rehydratedSession = cachedProfileData;
                        }

                        if (rehydratedSession && rehydratedSession.userId) {
                            console.log("[AuthCheck] Success! Hydrating store with profile:", rehydratedSession.fullName);
                            
                            // Hydrate the state - This automatically moves them to the Home tab
                            setAuth(rehydratedSession);
                        } else {
                            throw new Error("Parsed data structure is invalid or missing a userId.");
                        }

                    } catch (parseError) {
                        // Fallback Gatekeeper: If the data is broken/truncated, don't crash! Wipe it and let them log in again.
                        console.warn("[AuthCheck Warning] Session data was corrupted or malformed. Clearing session...", parseError);
                        
                        // Use whatever clear/remove session method your MMKV helper provides
                        setSession('USER_PROFILE', null); 

                        // clearSession(); 
                        
                        navigation.navigate(ScreenNames.APP_STACK.LOGIN);
                    }
                } else {
                    console.log("[AuthCheck] status: No active session -> Directing to login group path.");
                    
                    navigation.navigate(ScreenNames.APP_STACK.LOGIN);
                }
            } else if (isLocationServiceSwitchedOff) {
                console.log("[AuthCheck] status: Location Service Disabled");
                setAlert({
                    alertType:          'error',
                    showConfirm:        true,
                    confirmText:        'Try again',
                    title:              'Location Service Disabled',
                    message:            'Please swipe down your notification panel and turn on your device Location/GPS service.',
                    confirmButtonColor: getSwalColor('warning'), 
                });
            }  else if (isPermissionDenied) {
                console.log("[AuthCheck] status: Location Permission Denied");
                setAlert({
                    alertType:          'error',
                    showConfirm:        true,
                    confirmText:        'Settings',
                    title:              'Permission Required',
                    message:            'Please allow the app to access your location in your device settings.',
                    confirmButtonColor: getSwalColor('error'),

                    // Use a clear, immutable string flag instead of a raw function closure
                    actionKey:          'OPEN_SETTINGS' 
                } as any);
            } else if (isTimeout) {
                // THE EMULATOR ADJUSTMENT:
                // If it times out, let's give them a clear error that suggests checking their GPS toggle or mock settings
                console.log("[AuthCheck] status: Location Timeout (Check GPS or Emulator Stream)");
                setAlert({
                    alertType:          'error',
                    showConfirm:        true,
                    confirmText:        'Try again',
                    title:              'Location Signal Lost',
                    message:            'We could not connect to your device GPS. Please make sure your Location service is turned ON and try again.',
                    confirmButtonColor: getSwalColor('error'),
                });
            } else {
                console.log("[AuthCheck] status: Unknown Location Error. Code:", location?.code);
            }
        } catch (e) {
            console.error('authenticatin failure: ', e);
            setAlert({
                alertType:          'error',
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

// 
export const useLoginMutation = (navigation: any) => {
    // const setAuth = useAuthStore((state) => state.setAuth);

    // We explicitly tell useMutation what data type to expect: <ResponseType, Error, InputPayloadType>
    return useMutation<ServerLoginResponseType, Error, { email: string; password: string }>({
        mutationFn: async (cleanPayload) => {
            const netState = await NetInfo.fetch();
            console.log('[LogIn] payload: ', cleanPayload);
            if (!netState.isConnected || !netState.isInternetReachable) {
                //This also should show the error message on awesome-alert
                throw new Error('[LogIn] No internet connection found.');
            }

            const response = await POST<ServerLoginResponseType>(EndPoints.LOGIN, cleanPayload);

            console.log('[LogIn] post request: ', response);

            console.log('[LogIn] response status: ', response.status);

            // const responseBody = response?.data ? response.data : (response as any);

            // console.log('[Login] responseBody: ', responseBody);
            // console.log('[Login] response data: ', response?.data);

            if (response.status !== true) {
                throw new Error(response.message || 'Invalid credentials.');
            }

            // This returns the whole ServerLoginResponseType container!
            return response;
        },
        onSuccess: (serverData: ServerLoginResponseType) => {
            console.log('[LogIn] Received Server Data inside onSuccess:', serverData);
            
            // if (serverData && serverData.data) {
            //     // const params = {
            //     //     userId:       serverData.data.user_id,
            //     //     email:        serverData.data.email,
            //     //     supplierName: serverData.data.supplier_name,
            //     //     fullName:     serverData.data.full_name,
            //     //     regName:      serverData.data.reg_name,                            
            //     //     programs:     serverData.programs,
            //     //     role:         serverData.data.role,
            //     //     supplierInfo: serverData.supplierInfo,
            //     // };

            //     // console.log('[Login Params Array Ready for State Store]: ', params);

            //     // // Save to Zustand Global State Engine
            //     //setAuth(params);

            //     // // Save local session state token
            //     // setSession('USER_ID', serverData.data.user_id);
            // }
        },
        onError: (error: Error) => {
            // Your AwesomeAlert on the UI reads this directly via loginMutation.error.message!
            console.warn('[LogIn] TanStack Exception Tracker:', error.message);
        }
    });
};

export const verifyOtpMutation = (navigation: any) => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation<{ status: boolean; message: string }, Error, { user_id: string, otp: number, loginParams: any }>({
        mutationFn: async (cleanPayload) => {
            const netState = await NetInfo.fetch();

            console.log('[OTP] payload: ', cleanPayload);

            if(!netState.isConnected || !netState.isInternetReachable) {
                throw new Error('[OTP] No internet connection found.');
            }

            const response = await POST<any>(EndPoints.VERIFY_OTP, cleanPayload);

            if (response.status !== true) {
                throw new Error(response.message || 'Invalid OTP')
            }

            return response;
        },
        onSuccess: (serverData, variables) => {
            console.log('[Otp] Verified Successfully on Backend!', serverData);
            
            // Extract the carried profile metadata safely
            const cachedParams = variables.loginParams;

            if (cachedParams) {
                // SAFE EXTRACTOR: Gracefully read keys whether they are CamelCase or Snake_case
                const extractedUserId       = cachedParams.userId || cachedParams.user_id;
                const extractedEmail        = cachedParams.email;
                const extractedSupplierName = cachedParams.supplierName || cachedParams.supplier_name;
                const extractedFullName     = cachedParams.fullName || cachedParams.full_name;
                const extractedRegName      = cachedParams.regName || cachedParams.reg_name;
                const extractedPrograms     = cachedParams.programs;
                const extractedRole         = cachedParams.role;
                const extractedSupplierInfo = cachedParams.supplierInfo || cachedParams.supplier_info;

                console.log('[Otp Success Parsing Verification]:', {
                    extractedUserId,
                    extractedEmail,
                    extractedFullName
                });

                // Ensure we actually caught the User ID string before hitting storage layers
                if (!extractedUserId) {
                    console.error("[Otp Success Error] userId missing from cache metadata!");
                    return;
                }

                const finalAuthSession = {
                    userId:       extractedUserId,
                    email:        extractedEmail,
                    supplierName: extractedSupplierName,
                    fullName:     extractedFullName,
                    regName:      extractedRegName,                            
                    programs:     extractedPrograms,
                    role:         extractedRole,
                    supplierInfo: extractedSupplierInfo,
                };

                console.log('[Otp Success] Mapping full session into application state:', finalAuthSession);

                // Write to Disk Caching Engine
                setSession('USER_ID', String(extractedUserId));
                setSession('USER_PROFILE', JSON.stringify(finalAuthSession)); 

                console.log('[OTP] session User ID Saved:', extractedUserId);

                // Hydrate global Zustand engine. 
                // This reactively shifts AppStack from false to true, loading the Dashboard instantly!
                setTimeout(() => {
                    setAuth(finalAuthSession);
                }, 200); // 👈 Safely clear all active UI animations before flipping the login switch
                
            } else {
                console.error("[Otp Success Error] No local login parameter cache found to build profile session!");
            }
        },
        onError: (error: Error) => {
            console.warn('[OTP] TanStack Exception Tracker:', error.message);
        }
    });
};