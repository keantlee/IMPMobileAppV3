import { Platform } from 'react-native';

export enum AppMode {
    LOCAL =         'LOCAL',
    DEVELOPMENT =   'DEVELOPMENT',
    PRODUCTION =    'PRODUCTION'
}

interface EnvironmentConfig {
    apiHost:        string;
    apiAccessPoint: string;
}

/**
 *  Dynamically target the right local loopback ip depending on the runtime platform
 *  [Note: This is only used if using VPN.]
 *  android studio IP:  10.0.2.2    
 *  local mobile IP:    0.0.0.0 
 *  Backend laravel: php artisan serve --host=0.0.0.0 --port=8000
 *  Terminal: adb reverse tcp:8000 tcp:8000
 */
// const localIp = Platform.OS === 'android' ? '10.0.2.2:8000' : '0.0.0.0:8000';
const localIp = '172.17.151.147:8080';

// Note: If you run your local PHP/Laravel server on a specific port (like :8000), append it here:
// const localIp = Platform.OS === 'android' ? '10.0.2.2:8000' : '127.0.0.1:8000';

const ENDPOINTS: Record<AppMode, EnvironmentConfig> = {
    [AppMode.LOCAL]: {
        apiHost:        `http://${localIp}/api-v2/`,
        apiAccessPoint: `http://${localIp}/api-v2/`,
    },
    [AppMode.DEVELOPMENT]: {
        apiHost:        'https://devsysadd.da.gov.ph/imp/api-v2/',
        apiAccessPoint: 'https://devsysadd.da.gov.ph/imp/api-v2/',
    },
    [AppMode.PRODUCTION]: {
        apiHost:        'https://imp-rsbsa.da.gov.ph/api-v2/',
        apiAccessPoint: 'https://imp-rsbsa.da.gov.ph/api-v2/',
    },
};

const ACTIVE_MODE: AppMode = AppMode.LOCAL;

export default function getBaseUrl(): EnvironmentConfig {
    const config = ENDPOINTS[ACTIVE_MODE];

    // 2. Printing ${config} directly outputs [object Object]. Let's log the actual string url!
    console.log(`[Config] Successfully connected to: ${config?.apiHost}`);

    if (!config) {
        console.error(`[Config] Fatal: Application connection configurations missing for mode: ${ACTIVE_MODE}`);
        return ENDPOINTS[AppMode.PRODUCTION];
    }

    return config;
}