import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

// 1. Define a strict TypeScript interface for what this helper returns
export interface LocationResult {
    latitude?:  number;
    longitude?: number;
    altitude?:  number | null;
    code?:      number;
    message?:   string;
}

const requestLocationPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission",
                message: "This app needs access to your location to verify your terminal.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn(err);
        return false;
    }
};

/**
 * Wraps the native Geolocation sensor callback in a promise.
 * Resolves with coordinates or a standard error code block.
 */
export const getLocation = (): Promise<LocationResult> => {
    return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
            (position) => {            
                const { latitude, longitude, altitude } = position.coords;
                
                console.log(`[GetLocatoion] Lat: ${latitude}, Lng: ${longitude}, Altitude: ${altitude}, Code: ${0}`);
                
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
                enableHighAccuracy: true,  // 👈 MUST be true to track hardware GPS state accurately
                timeout: 10000,            // 10 seconds is plenty for an emulator
                maximumAge: 0              // Force a fresh read instead of using a stale cache
            }
            // { 
            //     enableHighAccuracy: false, // Low accuracy is faster and consumes less battery on cold start
            //     timeout: 15000,            // Fails gracefully if the phone can't find a satellite in 15 seconds
            //     maximumAge: 10000          // Uses cached location if it's less than 10 seconds old
            // }
        );
    });
};