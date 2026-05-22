import { create } from 'zustand';

interface UserData {
    userId:         string;
    email:          string;
    fullName:       string;
    role:           string;
    supplierName?:  string;
    regName?:       string;
    programs?:      any[];
    supplierInfo?:  any;
}

interface AuthState {
    user:       UserData | null;
    isLoggedIn: boolean;
    setAuth:    (user: UserData) => void;
    clearAuth:  () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoggedIn: false, // 👈 AppStack is watching this!

    // FIX: Ensure calling setAuth updates the user AND flips the login switch!
    setAuth: (sessionData) => set({ 
        user: sessionData, 
        isLoggedIn: true 
    }),

    clearAuth: () => set({ 
        user: null, 
        isLoggedIn: false 
    }),
}));