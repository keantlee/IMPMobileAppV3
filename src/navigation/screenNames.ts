const ScreenNames = {
  APP_STACK: {
    AUTHENTICATION:       'Authentication',
    MAIN_TAB:             'MainTabs',
    LOGIN:                'Login',
    FORGOT_PASSWORD:      'ForgotPassword',
    VERIFY_OTP:           'VerifyOtp',
    MAINTENANCE:          'Maintenance',
    NOINTERNETCONNECTION: 'NoInternetConnection',
  },
  BOTTOM_TABS: {
    HOME:     'Home',
    SCANNING: 'Scanning',
    PROFILE:  'Profile',
  },
  HOME_STACK: {
    HOME:                       'HomeScreen',
    TRANSACTION_HISTORY:        'TransactionHistory',
    TRANSACTION_DETAIL:         'TransactionDetail',
    VIEW_TRANSACTION:           'ViewTransaction',
    SEARCH_VOUCHER:             'SearchVoucher',
    UPLOAD_VOUCHER_ATTACHMENTS: 'UploadVoucherAttachments',
  },
  TRANSACTION_STACK: {
    SCANNING:                   'ScanningScreen',
    FARMER_PROFILE:             'FarmerProfile',
    CART:                       'Cart',
    ADD_ITEM:                   'AddItem',
    EDIT_ITEM:                  'EditItem',
    // CHECKOUT:                   'Checkout',
    REVIEW_CART:                'ReviewCart',
    UPLOAD_CONFIRMATION_SCREEN: 'UploadConfirmationScreen',
    UPLOAD_ATTACHMENTS:         'UploadAttachments',
    REVIEW_TRANSACTION:         'ReviewTransaction',
    RE_UPLOAD_ATTACHMENTS:      'ReUploadAttachment',
  },
} as const;

// Optional: Useful type utilities if you need to reference these types elsewhere
export type ScreenNamesType =         typeof ScreenNames;
export type AppStackScreens =         typeof ScreenNames.APP_STACK[keyof typeof ScreenNames.APP_STACK];
export type BottomTabScreens =        typeof ScreenNames.BOTTOM_TABS[keyof typeof ScreenNames.BOTTOM_TABS];
export type HomeStackScreens =        typeof ScreenNames.HOME_STACK[keyof typeof ScreenNames.HOME_STACK];
export type TransactionStackScreens = typeof ScreenNames.TRANSACTION_STACK[keyof typeof ScreenNames.TRANSACTION_STACK];

export default ScreenNames;