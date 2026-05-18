import NetInfo from "@react-native-community/netinfo";
import { POST } from "../../api/config/axios";

declare const DeviceInfo:   { getVersion: () => string };
declare const constants:    { EndPoints: { CHECK_APP_VERSION: string } };

export interface AppVersionResult {
    status:     boolean;
    alertType?: 'success' | 'info' | 'error' | 'warning';
    title?:     string;
    message?:   string;
}

export const checkAppVersion = async (): Promise<AppVersionResult> => {
    try {
        const cleanPayload = { version: DeviceInfo.getVersion() };

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
        
        const response = await POST<ApiResponse>(constants.EndPoints.CHECK_APP_VERSION, cleanPayload);
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
        if (e.response) {
            console.error('[CheckAppVersion] Error: ', e.response.data);
        }

        return { 
            status:     false, 
            alertType:  'error',
            title:      'Connection Failed',
            message:    `Checking application version failed. (${e.message})` 
        };
    }
};