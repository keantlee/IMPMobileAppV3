import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { getSession, setSession, clearSession } from '../utils/session';
import NetInfo from "@react-native-community/netinfo";
import { POST, GET } from "./config/axios";
import ScreenNames from '../navigation/screenNames';
import EndPoints from './config/endpoints';
import { TransactionInfo, VoucherInfo } from '../@types/voucher';

interface ScanVoucherPayload {
  voucherCode: string;
}

export interface ScanVoucherResponse {
  status:       boolean;        // true or false
  message?:     string;         // Fallback text property for error maps
  voucherInfo?: VoucherInfo;    // Present on true status blocks
  timer?:       number;         // 2700000
}

// scan_qr
export const scanVoucherMutation = () => {
  return useMutation<ScanVoucherResponse, Error, ScanVoucherPayload & { navigation: any }>({ 
    mutationFn: async (payload) => {
        const netState = await NetInfo.fetch();

        if(!netState.isConnected || !netState.isInternetReachable) {
            throw new Error('[Scan Voucher Mutation] No internet connection found.');
        }

        const authState   = useAuthStore.getState();

        console.log('[Scan Voucher Mutation] Incoming payload target code:', payload.voucherCode);

        let cleanPayload = {
            reference_number:   payload.voucherCode,
            user_id:            getSession<string>('USER_ID')
        };

        const response = await POST<ScanVoucherResponse>(EndPoints.SCAN_QR_CODE, cleanPayload);

        if (response.status !== true) {
            throw new Error(response.message || 'The database rejected this transaction update snapshot.');
        }

        return response;
    },
    // 'variables' contains anything you passed into the mutate() call
    onSuccess: (serverData, variables) => {
        console.log('[Scan Voucher Mutation] Server data received: ', serverData.voucherInfo?.first_name, serverData.voucherInfo?.last_name);
        
        // Safely navigate using the screen's contextual navigation driver
        variables.navigation.navigate(ScreenNames.TRANSACTION_STACK.FARMER_PROFILE, serverData);
    },
    onError: (error: Error) => {
        console.warn('[Scan Voucher Mutation] TanStack Exception Tracker:', error.message);
    }
  });
};


// Payload from ReviewCart Screen - this is the unified package that the screen will send to the mutation for processing
interface SaveTransactionPayload {
  checkoutParams: {
    voucherInfo:  VoucherInfo;
    cart:         any[];
  };
}

// Response expected from the server after processing the save transaction request - this is what the mutation will receive in its onSuccess handler
export interface SaveResponsePayload {
  status:         boolean;
  message:        string;
  data:           [];
}

// save_transaction
export const saveTransactionMutation = (navigation: any) => {
  return useMutation<SaveResponsePayload, Error, SaveTransactionPayload>({ 
    mutationFn: async (payload) => {
        const netState = await NetInfo.fetch();

        if (!netState.isConnected || !netState.isInternetReachable) {
            throw new Error('No internet connection found. Please check your network and try again.');
        }

        const userProfile   = useAuthStore.getState().user;
        
        const userId        = userProfile?.userId;
        const fullName      = userProfile?.fullName;
        const supplierName  = userProfile?.supplierName;

        console.log('[SAVE TRANSACTION MUTATION] Raw incoming package observed:', payload);

        console.log('[SAVE TRANSACTION MUTATION] Extracted state from Zustand:', { userId, fullName, supplierName });

        const cleanCart = payload.checkoutParams.cart.map((item) => ({
            sub_id:              item.sub_id,                                      
            category:            item.category,
            categoryName:        item.categoryName,
            subCategory:         item.subCategory ,
            quantity:            parseFloat(item.quantity),
            unitMeasurement:     item.unitMeasurement,            
            totalAmount:         parseFloat(item.totalAmount),
            cashAdded:           parseFloat(item.cashAdded),
            itemCategoryRemarks: item.itemCategoryRemarks
        }));

        const verifiedTotalTransactionCost = cleanCart.reduce(
            (prev, current) => prev + current.totalAmount, 0
        ).toFixed(2);

        const cleanPayload = {
            voucherInfo:              payload.checkoutParams.voucherInfo,
            userId:                   userId,
            fullName:                 fullName,
            supplierName:             supplierName,
            cart:                     cleanCart,
            transactionTotalAmount:   verifiedTotalTransactionCost,
        };

        console.log('[SAVE TRANSACTION MUTATION] Payload:', cleanPayload);

        const response = await POST<SaveResponsePayload>(EndPoints.SAVE_TRANSACTION, cleanPayload);
        
        if (response.status !== true) {
            throw new Error(response.message || 'The database rejected this transaction update snapshot.');
        }

        return response;
    },
    onSuccess: (serverData) => {
        console.log('[SAVE TRANSACTION MUTATION]  Server data received:', serverData);
        
        // Note: Navigation is handled by the ReviewCart screen's success modal 
        // to allow the user to see the confirmation message before moving forward.
    },
    onError: (error: Error) => {
        console.warn('[SAVE TRANSACTION MUTATION] Critical transmission exception encountered:', error.message);
    }
  });
};

/**
 * ==================== ATTACHMENTS ==================== 
 * 1.) Save attachment
 *    - Target Screen: 
 *    - Functions:
 * 2.) Fetch attachment
 *    - Target Screen:
 *    - Functions:
 * 3.) Update attachment 
 *    - Target Screen: ReUpload.tsx
*     - Functions:
 */
export interface SaveAttachmentPayload {
  attachmentParams: {
    beneficiary:    any;
    frontID:        any;
    backID:         any;
    receipt:        any;
    otherDocs:      any[];
    rsbsa_no:       string;
    reference_no:   string;
    supplier_id:    string;
    transaction_id: string;
    voucher_id:     string;
    shortname:      string;
    prevRouteName:  string;
  }
}

export interface SaveAttachmentResponsePayload {
  status: boolean;
  message: string;
}

// save_attachment 
export const saveAttachmentMutation = (navigation: any) => {
  return useMutation<SaveAttachmentResponsePayload, Error, SaveAttachmentPayload>({
    mutationFn: async (payload) => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
          throw new Error("No internet connection found. Please check your network and try again.");
      }

      console.log("[SAVE ATTACHMENT MUTATION] payload: ", payload);

      // Construct a clean, perfectly spelled payload mapping matching your Laravel keys
      const cleanPayload = {
        beneficiary:    payload.attachmentParams.beneficiary, 
        frontID:        payload.attachmentParams.frontID,
        backID:         payload.attachmentParams.backID,
        receipt:        payload.attachmentParams.receipt,
        otherDocs:      payload.attachmentParams.otherDocs,
        rsbsa_no:       payload.attachmentParams.rsbsa_no,
        reference_no:   payload.attachmentParams.reference_no,
        supplier_id:    payload.attachmentParams.supplier_id,
        transaction_id: payload.attachmentParams.transaction_id,
        voucher_id:     payload.attachmentParams.voucher_id,
        shortname:      payload.attachmentParams.shortname, 
        prevRouteName:  payload.attachmentParams.prevRouteName
      };

      console.log("[SAVE ATTACHMENT MUTATION] clean payload: ", cleanPayload);

      const response = await POST<SaveAttachmentResponsePayload>(EndPoints.SAVE_ATTACHMENT, cleanPayload);

      // const response = "";

      if (response.status !== true) {
          throw new Error(response.message || '[SAVE ATTACHMENT] The database rejected this transaction update snapshot.');
      }

      return response;
    },
    onSuccess: (serverData) => {
        console.log('[SAVE ATTACHMENT MUTATION] Server pipeline successfully completed code execution:', serverData);
        
        // Navigate to Home Screen
    },
    onError: (error: Error) => {
        console.warn('[SAVE ATTACHMENT MUTATION] Critical transmission exception encountered:', error.message);
    }
  });
};

export interface fetchAttachmentPayload {
  transaction_id: string;
  reference_no:   string;
  supplier_id:    string;
  navigation:     any; 
}

export interface fetchAttachmentResponsePayload {
  status: boolean;
  attachments: Array<{
    attachment_id: string;
    name:          string;
    file_name:     string;
    image:         string; // Base64 raw string payload stream from S3
  }>;
  upload_info: Array<{
    voucher_id:     string;
    transaction_id: string;
    rsbsa_no:       string;
    supplier_id:    string; 
    shortname:      string;
  }>;
  message?: string;
}

export const fetchAttachmentMutation = (navigation: any) => {
  return useMutation<fetchAttachmentResponsePayload, Error, fetchAttachmentPayload>({
    mutationFn: async (payload) => {
      const netState = await NetInfo.fetch();

      if(!netState.isConnected || !netState.isInternetReachable) {
          throw new Error('[FETCH ATTACHMENT MUTATION] No internet connection found.');
      }

      console.log("[FETCH ATTACHMENT MUTATION] payload payload: ", payload);

      let cleanPayload = { 
        transaction_id: payload.transaction_id, 
        reference_no:   payload.reference_no,
        supplier_id:    payload.supplier_id,
      };

      const response = await POST<transactionDetailsResponsePayload>(
        EndPoints.GET_TRANSACTION_DETAILS, 
        cleanPayload
      );

      if (response.status !== true) {
          throw new Error(response.message || 'The database rejected this transaction request.');
      }

      return response;
    },
    onSuccess: (serverData, variables) => {
      console.log("[FETCH ATTACHMENT MUTATION] Server data received: ", serverData); 
      console.log("[FETCH ATTACHMENT MUTATION] Routing execution to destination detail viewport");
      
      // Navigate to the transaction details screen using the passed navigation reference
      // Passing both identification keys and retrieved backend information lists
      variables.navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_DETAIL, {
          transactionId:      variables.transaction_id,
          referenceNo:        variables.reference_no,
          supplierId:         variables.supplier_id,
          attachments:        serverData.attachments,
          uploadInfo:         serverData.upload_info
      });
    },
    onError: (error: Error) => {
      console.warn("[FETCH ATTACHMENT MUTATION] TanStack Exception Tracker: ", error.message);
    }
  });
}

export interface UpdateAttachmentPayload {
  attachmentParams: {
    beneficiary:    any;
    frontID:        any;
    backID:         any;
    receipt:        any;
    otherDocs:      any[];
    rsbsa_no:       string;
    reference_no:   string;
    supplier_id:    string;
    transaction_id: string;
    voucher_id:     string;
    shortname:      string;
  }
}

export interface UpdateResponsePayload {
  status: boolean;
  message: string;
}

// update_attachment
export const updateAttachmentMutation = (navigation: any) => {
  return useMutation<UpdateResponsePayload, Error, UpdateAttachmentPayload>({
    mutationFn: async (payload) => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error("No internet connection found. Please check your network and try again.");
      }

      // Construct a clean, perfectly spelled payload mapping matching your Laravel keys
      const cleanPayload = {
        beneficiary:    payload.attachmentParams.beneficiary, 
        frontID:        payload.attachmentParams.frontID,
        backID:         payload.attachmentParams.backID,
        receipt:        payload.attachmentParams.receipt,
        otherDocs:      payload.attachmentParams.otherDocs,
        rsbsa_no:       payload.attachmentParams.rsbsa_no,
        reference_no:   payload.attachmentParams.reference_no,
        supplier_id:    payload.attachmentParams.supplier_id,
        transaction_id: payload.attachmentParams.transaction_id,
        voucher_id:     payload.attachmentParams.voucher_id,
        shortname:      payload.attachmentParams.shortname
      };

      console.log("[UPDATE ATTACHMENT MUTATION] payload: ", payload);

      const response = await POST<SaveAttachmentResponsePayload>(EndPoints.SAVE_ATTACHMENT, cleanPayload);

      if (response.status !== true) {
          throw new Error(response.message || '[UPDATE ATTACHMENT] The database rejected this transaction update snapshot.');
      }

      return response;
    },
    onSuccess: (serverData) => {
      console.log('[UPDATE ATTACHMENT MUTATION] Server pipeline successfully completed code execution:', serverData);

      // Navigate to Home Screen
    },
    onError: (error: Error) => {
      console.warn('[UPDATE ATTACHMENT MUTATION] Critical transmission exception encountered:', error.message);
      throw new Error(`[UPDATE ATTACHMENT] Critical transmission exception encountered: ${error.message}`);
    }
  });
}
// ==================== ATTACHMENTS ==================== 

/**
 * ==================== TRANSCATION LOGS ==================== 
 * 1.) Transaction history
 *    - Target Screen: TransactionHistory.tsx
 * 2.) Transaction Details
 *    - Target Screen: TranscationDetails.tsx
 */
export interface transactionHistoryPayload {
  supplier_id: string;
}

export interface transactionHistoryResponsePayload {
  status: boolean;
  data: Array<{
    voucher_id:         string;
    rsbsa_no:           string;
    reference_no:       string;
    transaction_id:     string;
    supplier_id:        string;
    total_amount:       string | number;
    transact_date:      string;
    transaction_status: 'Completed' | 'Pending' | 'Re-Transact' | 'Re-Upload';
  }>;
  message?: string;
}

// view transaction history
export const getTransactionHistoryMutation = () => {
  return useMutation<transactionHistoryResponsePayload, Error, transactionHistoryPayload>({
    mutationFn: async (payload) => {
      const netState = await NetInfo.fetch();

      if(!netState.isConnected || !netState.isInternetReachable) {
          throw new Error('[GET TRANSACTION HISTORY MUTATION] No internet connection found.');
      }

      console.log("[GET TRANSACTION HISTORY MUTATION] payload: ", payload);

      let cleanPayload = { supplier_id: payload.supplier_id };

      const response = await POST<transactionHistoryResponsePayload>(EndPoints.GET_TRANSCTION_HISTORY, cleanPayload);

      if (response.status !== true) {
          throw new Error(response.message || 'The database rejected this transaction request.');
      }

      return response;
    }, 
    onSuccess: (serverData) => {
      console.log("[GET TRANSACTION HISTORY MUTATION] Server data received: ", serverData);  
    },
    onError: (error: Error) => {
      console.warn("[GET TRANSACTION HISTORY MUTATION] TanStack Exception Tracker: ", error.message);
    }
  });
}


export interface transactionDetailsPayload {
  transaction_id: string;
  reference_no:   string;
  supplier_id:    string;
  status:         'Completed' | 'Pending' | 'Re-Transact' | 'Re-Upload';
  navigation:     any; // Receives the UI workflow navigation hook reference
}

export interface transactionDetailsResponsePayload {
  status: boolean;
  trans_info: Array<{
    voucher_details_id: string;
    category:           string;
    subCategory:        string;
    quantity:           string | number;
    unitType:           string;
    amount:             string | number;
    remarks:            string;
    transac_date:       string;
  }>;
  attachments: Array<{
    attachment_id: string;
    name:          string;
    file_name:     string;
    image:         string; // Base64 raw string payload stream from S3
  }>;
  upload_info: Array<{
    voucher_id:     string;
    transaction_id: string;
    rsbsa_no:       string;
    supplier_id:    string; 
    shortname:      string;
  }>;
  message?: string;
  transaction_status: 'Completed' | 'Pending';
}

// view transaction details
export const getTransactionDetailsMutation = () => {
  return useMutation<transactionDetailsResponsePayload, Error, transactionDetailsPayload>({
    mutationFn: async (payload) => {
      const netState = await NetInfo.fetch();

      if(!netState.isConnected || !netState.isInternetReachable) {
          throw new Error('[GET TRANSACTION DETAILS MUTATION] No internet connection found.');
      }

      console.log("[GET TRANSACTION DETAILS MUTATION] payload payload: ", payload);

      let cleanPayload = { 
        transaction_id: payload.transaction_id, 
        reference_no:   payload.reference_no,
        supplier_id:    payload.supplier_id,
        status:         payload.status,
      };

      const response = await POST<transactionDetailsResponsePayload>(
        EndPoints.GET_TRANSACTION_DETAILS, 
        cleanPayload
      );

      if (response.status !== true) {
          throw new Error(response.message || 'The database rejected this transaction request.');
      }

      return response;
    },
    onSuccess: (serverData, variables) => {
      console.log("[GET TRANSACTION DETAILS MUTATION] Server data received: ", serverData); 
      console.log("[GET TRANSACTION DETAILS MUTATION] Routing execution to destination detail viewport");
      
      // Navigate to the transaction details screen using the passed navigation reference
      // Passing both identification keys and retrieved backend information lists
      variables.navigation.navigate(ScreenNames.HOME_STACK.TRANSACTION_DETAIL, {
          transactionId:      variables.transaction_id,
          referenceNo:        variables.reference_no,
          supplierId:         variables.supplier_id,
          status:             variables.status,
          transactionInfo:    serverData.trans_info,
          attachments:        serverData.attachments,
          uploadInfo:         serverData.upload_info,
          transactionStatus:  serverData.transaction_status
      });
    },
    onError: (error: Error) => {
      console.warn("[GET TRANSACTION DETAILS MUTATION] TanStack Exception Tracker: ", error.message);
    }
  });
};
// ==================== TRANSCATION LOGS ==================== 

