import { createMMKV } from 'react-native-mmkv'

// 1. Initialize a single, global MMKV instance for your sessions
// @ts-ignore
export const storage = createMMKV()

/**
 * Saves data into the local MMKV storage instance.
 * Automatically handles object serialization to string format.
 */
const setSession = (name: string, data: unknown): boolean => {
    try {
        const rawValue = typeof data === 'string' ? data : JSON.stringify(data);
        
        storage.set(name, rawValue);

        console.log(`[MMKV setSession] Successfully saved key: "${name}"`);

        return true;
    } catch (e) {
        console.error(`[MMKV setSession] Error [${name}]:`, e);
        return false;
    }
};

/**
 * Retrieves data synchronously from MMKV.
 * Uses TypeScript Generics <T> to return a fully-typed object/primitive.
 */
const getSession = <T = any>(name: string): T | null => {
    console.log(`[MMKV getSession] processing...`);
    try {
        const value = storage.getString(name);
        console.log(`[MMKV getSession] get session raw value: "${value}"`);

        // Catch empty data OR accidental literal "undefined"/"null" text strings
        if (!value || value === 'undefined' || value === 'null') {
            console.log(`[MMKV getSession] Session is empty or corrupt. Returning null.`);
            return null; 
        }

        // Check if the string looks like stringified JSON array or object
        if (value.startsWith('{') || value.startsWith('[')) {
            return JSON.parse(value) as T;
        }
        
        return value as unknown as T;
    } catch (e) {
        console.error(`[MMKV getSession] Error [${name}]:`, e);
        return null;
    }
};

// Clears all key-value pairs stored within this MMKV instance.
const clearSession = (): boolean => {
    try {
        storage.clearAll();
        return true;
    } catch (e) {
        console.error('[MMKV clearSession] Error:', e);
        return false;
    }
};

export { setSession, getSession, clearSession };