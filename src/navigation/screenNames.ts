const ScreenNames = {
  APP_STACK: {
    AUTHENTICATION: 'Authentication',
    MAIN_TAB: 'MainTabs',
    LOGIN: 'Login',
    FORGOT_PASSWORD: 'ForgotPassword',
    VERIFY_OTP: 'VerifyOtp',
    MAINTENANCE: 'Maintenance',
    NOINTERNETCONNECTION: 'NoInternetConnection',
  },
  BOTTOM_TABS: {
    HOME: 'Home',
    SCANNING: 'Scanning',
    PROFILE: 'Profile',
  },
  HOME_STACK: {
    HOME: 'HomeScreen',
    VIEW_TRANSACTION: 'ViewTransaction',
    SEARCH_VOUCHER: 'SearchVoucher',
    EDIT_COMMODITY_DETAILS: 'EditCommodityDetails',
    EDIT_CART: 'EditCart',
    EDIT_UPLOAD_ATTACHMENTS: 'EditUploadAttachments',
    EDIT_RE_UPLOAD_ATTACHMENTS: 'EditReUploadAttachments',
    UPLOAD_VOUCHER_ATTACHMENTS: 'UploadVoucherAttachments',
    EDIT_COMMODITIES: 'EditCommodities',
    ADD_COMMODITY_DETAILS: 'AddCommodityDetails',
  },
  TRANSACTION_STACK: {
    SCANNING: 'ScanningScreen',
    FARMER_PROFILE: 'FarmerProfile',
    COMMODITIES: 'Commodities',
    SET_COMMODITY_DETAILS: 'SetCommodityDetails',
    EDIT_COMMODITY_DETAILS: 'TransactionEditCommodityDetails',
    CHECKOUT: 'Checkout',
    UPLOAD_ATTACHMENTS: 'UploadAttachments',
    REVIEW_TRANSACTION: 'ReviewTransaction',
  },
} as const;

// Optional: Useful type utilities if you need to reference these types elsewhere
export type ScreenNamesType =         typeof ScreenNames;
export type AppStackScreens =         typeof ScreenNames.APP_STACK[keyof typeof ScreenNames.APP_STACK];
export type BottomTabScreens =        typeof ScreenNames.BOTTOM_TABS[keyof typeof ScreenNames.BOTTOM_TABS];
export type HomeStackScreens =        typeof ScreenNames.HOME_STACK[keyof typeof ScreenNames.HOME_STACK];
export type TransactionStackScreens = typeof ScreenNames.TRANSACTION_STACK[keyof typeof ScreenNames.TRANSACTION_STACK];

export default ScreenNames;