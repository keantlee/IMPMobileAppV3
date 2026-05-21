import NetInfo from "@react-native-community/netinfo";
import { POST } from "../../api/config/axios";
import DeviceInfo from 'react-native-device-info';
import EndPoints from "../../api/config/endpoints";

declare const constants:    { EndPoints: { CHECK_APP_VERSION: string } };

export interface AppVersionResult {
    status:     boolean;
    alertType?: 'success' | 'info' | 'error' | 'warning';
    title?:     string;
    message?:   string;
}

export const checkAppVersion = async (): Promise<AppVersionResult> => {
    console.log("[CheckAppVersion] DeviceInfo: ", `${DeviceInfo.getVersion()}`);

    try {
        const cleanPayload = { version: `${DeviceInfo.getVersion()}` };

        // 1. Check internet connection status
        const state = await NetInfo.fetch();
        if (!state.isConnected || !state.isInternetReachable) {
            return { 
                status:     false, 
                alertType:  'error',
                title:      'No Connection Found',
                message:    'Please check your network connection and try again.' 
            };
        }

        console.log(`[CheckAppVersion] Current Version: ${cleanPayload.version}`);

        interface ApiResponse {
            status:     boolean;
            message?:   string;
        }
        
        const response = await POST<ApiResponse>(EndPoints.CHECK_APP_VERSION, cleanPayload);
        console.log("[CheckAppVersion] Server Response: ", response);

        // 2. Handle Server Business Logic
        if (response.status === true) {
            return { status: true }; // App version matches, bypass alert
        } else {
            return { 
                status:     false, 
                alertType:  'info', 
                title:      'System Information',
                message:    response.message || 'A new update is required to continue.' 
            };
        }

    } catch (e: any) {
        // 1. THE FIX: If Axios caught a 4xx/5xx response from your backend
        if (e.response) {
            console.log('[CheckAppVersion] Handled Server Error Data: ', e.response.data);
            
            const serverResponse = e.response.data; // This holds your json snippet!

            return { 
                status:     false, 
                alertType:  'error', 
                title:      'Version Incompatible',
                // Display the exact string: "Error: The specified IMP App version 1 could not be found!"
                message:    serverResponse.message || 'Application version validation failed.' 
            };
        }

        // 2. FALLBACK: Hard network drop (Server completely offline / Timeout)
        console.error('[CheckAppVersion] Network/Code Crash: ', e.message);
        return { 
            status:     false, 
            alertType:  'error',
            title:      'Connection Failed',
            message:    `Checking application version failed. (${e.message})` 
        };
    }
};