export enum AppMode {
    LOCAL =         'LOCAL',
    DEVELOPMENT =   'DEVELOPMENT',
    PRODUCTION =    'PRODUCTION'
}

interface EnvironmentConfig {
    apiHost:        string;
    apiAccessPoint: string;
}

const ENDPOINTS: Record<AppMode, EnvironmentConfig> = {
    [AppMode.LOCAL]: {
        apiHost:        'http://imp.test/api-v2/',
        apiAccessPoint: 'http://imp.test/api-v2/',
    },
    [AppMode.DEVELOPMENT]: {
        apiHost:        'http://172.16.100.26:8083/api-v2/',
        apiAccessPoint: 'http://172.16.100.26:8083/api-v2/',
        // Backup Dev:  'https://devsysadd.da.gov.ph/imp/api-v2/'
    },
    [AppMode.PRODUCTION]: {
        apiHost:        'https://imp-rsbsa.da.gov.ph/api-v2/',
        apiAccessPoint: 'https://imp-rsbsa.da.gov.ph/api-v2/',
    },
};

const ACTIVE_MODE: AppMode = AppMode.LOCAL;

export default function getBaseUrl(): EnvironmentConfig {
    const config = ENDPOINTS[ACTIVE_MODE];

    console.log(`[Config] successfully conencted: ${config}`);

    if (!config) {
        console.error(`[Config] Fatal: Application connection configurations missing for mode: ${ACTIVE_MODE}`);
        // Default fallback safety line to ensure your network requests never run into undefined states
        return ENDPOINTS[AppMode.PRODUCTION];
    }

    return config;
}