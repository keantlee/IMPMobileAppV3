import Geolocation from 'react-native-geolocation-service';

// 1. Define a strict TypeScript interface for what this helper returns
export interface LocationResult {
    latitude?:  number;
    longitude?: number;
    altitude?:  number | null;
    code?:      number;
    message?:   string;
}

/**
 * Wraps the native Geolocation sensor callback in a promise.
 * Resolves with coordinates or a standard error code block.
 */
export const getLocation = (): Promise<LocationResult> => {
    return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
            (position) => {            
                const { latitude, longitude, altitude } = position.coords;
                
                console.log(`[GetLocatoion] Lat: ${latitude}, Lng: ${longitude}`);
                
                resolve({
                    latitude,
                    longitude,
                    altitude,
                    code: 0 // 0 means absolute success
                });
            },
            (error) => {
                console.warn(`[GetLocatoion] [Code ${error.code}]: ${error.message}`);
                
                // Instead of rendering a Toast here, we pass the raw error code back.
                // Code 1 = Permission Denied
                // Code 2 = Location Provider Disabled (GPS turned off)
                // Code 3 = Timeout
                resolve({
                    code: error.code,
                    message: error.message
                });
            },
            { 
                enableHighAccuracy: false, // Low accuracy is faster and consumes less battery on cold start
                timeout: 15000,            // Fails gracefully if the phone can't find a satellite in 15 seconds
                maximumAge: 10000          // Uses cached location if it's less than 10 seconds old
            }
        );
    });
};