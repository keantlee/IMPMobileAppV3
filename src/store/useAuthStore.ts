import { create } from 'zustand';

interface UserData {
    userId:            string;
    email:             string;
    fullName:          string;
    role:              string;
    supplierName?:     string;
    regName?:          string;
    programs?:         any[];
    supplierInfo?:     any;
    // Office Info: main vs branch identifiers (from verify_otp response)
    roleId?:           string | number; // 6 = main office, 7 = branch office
    supplierType?:     string;          // 'main' | 'branch'
    supplierGroupId?:  string;          // supplier.supplier_group_id (group key)
    groupSupplierId?:  string;          // users.group_supplier_id (head/group ref)
}

interface AuthState {
    user:       UserData | null;
    isLoggedIn: boolean;
    setAuth:    (user: UserData) => void;
    clearAuth:  () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoggedIn: false, // AppStack is watching this!

    // Ensure calling setAuth updates the user AND flips the login switch!
    setAuth: (sessionData) => set({ 
        user: sessionData, 
        isLoggedIn: true 
    }),

    clearAuth: () => set({ 
        user: null, 
        isLoggedIn: false 
    }),
}));