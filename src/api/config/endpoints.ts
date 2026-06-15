const EndPoints = {
  LOGIN:                                'login',
  VERIFY_OTP:                           'verify-otp',
  RESEND_OTP:                           'resend-otp',
  VIEW_TRANSACTED_VOUCHER_INFO:         'view-transaction-info',
  GET_TRANSACTED_VOUCHERS:              'get-transacted-vouchers',
  GET_TRANSCTION_HISTORY:              'get-transaction-history',
  GET_LATEST_TRANSACTED_VOUCHERS:       'get-latest-transacted-vouchers',
  GET_TRANSACTED_ITEM_COMMODITIES:      'get-transacted-item-commodities',
  GET_TRANSACTED_UPLOADED_ATTACHMENTS:  'get-transacted-uploaded-attachments',
  CHECK_APP_VERSION:                    'check-app-version-authentication',
  SCAN_QR_CODE:                         'scan-qr-code',
  SAVE_TRANSACTION:                     'save-transaction',
  SAVE_ATTACHMENT:                      'save-attachment',
  SEND_RESET_PASSWORD_LINK:             'form_reset_password_link/sending_request',
  SEARCH_VOUCHER:                       'search-voucher',
  UPDATE_ATTACHMENTS:                   'update-attachments',
  UPDATE_RE_UPLOAD_ATTACHMENTS:         'update-reupload-attachments',
  SAVE_UPLOAD_ATTACHMENTS:              'save-upload-attachments',
  UPDATE_CART:                          'update-cart',
  CHECK_IN_BATCH:                       'check-in-batch',
  CHECK_LAST_ATTACHMENTS:               'check-last-attachments',
} as const;

// Optional: This creates a union type of all your endpoint values 
// (e.g., 'login' | 'verify-otp' | ...) if you need to strictly type function arguments.
export type EndPointType = typeof EndPoints[keyof typeof EndPoints];

export default EndPoints;