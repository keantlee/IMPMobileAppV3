import { Platform } from 'react-native'; // 👈 Add this import at the top of your file

export enum AppMode {
    LOCAL =         'LOCAL',
    DEVELOPMENT =   'DEVELOPMENT',
    PRODUCTION =    'PRODUCTION'
}

interface EnvironmentConfig {
    apiHost:        string;
    apiAccessPoint: string;
}

// 1. THE FIX: Dynamically target the right local loopback ip depending on the runtime platform
// const localIp = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

// Note: If you run your local PHP/Laravel server on a specific port (like :8000), append it here:
// const localIp = Platform.OS === 'android' ? '10.0.2.2:8000' : '127.0.0.1:8000';

const ENDPOINTS: Record<AppMode, EnvironmentConfig> = {
    [AppMode.LOCAL]: {
        apiHost:        `http://localhost:8000/api-v2/`,
        apiAccessPoint: `http://localhost:8000/api-v2/`,
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

    // 2. Pro Tip: Printing ${config} directly outputs [object Object]. Let's log the actual string url!
    console.log(`[Config] Successfully connected to: ${config?.apiHost}`);

    if (!config) {
        console.error(`[Config] Fatal: Application connection configurations missing for mode: ${ACTIVE_MODE}`);
        return ENDPOINTS[AppMode.PRODUCTION];
    }

    return config;
}