import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { getSession, setSession, clearSession } from '../utils/session';
import NetInfo from "@react-native-community/netinfo";
import { POST, GET } from "./config/axios";
import ScreenNames from '../navigation/screenNames';
import EndPoints from './config/endpoints';
import { SubCategory, UnitMeasurement, FertilizerCategory, CheckCategoryHasSubCategory, VoucherInfo } from '../@types/voucher';

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

        console.log('[Scan Voucher Mutation] Incoming payload target code:', payload.voucherCode);

        let cleanPayload = {
            reference_number:   payload.voucherCode,
            user_id:            getSession<string>('USER_ID')
        };

        const response = await POST<ScanVoucherResponse>(EndPoints.SCAN_QR_CODE, cleanPayload);

        if (response.status !== true) {
            throw new Error(response.message);
        }

        return response;
    },
    // 'variables' contains anything you passed into the mutate() call
    onSuccess: (serverData, variables) => {
        console.log('[Scan Voucher Mutation] Voucher Verified: ', serverData.voucherInfo?.first_name, serverData.voucherInfo?.last_name);
        
        // Safely navigate using the screen's contextual navigation driver
        variables.navigation.navigate(ScreenNames.TRANSACTION_STACK.FARMER_PROFILE, serverData);
    },
    onError: (error: Error) => {
        console.warn('[Scan Voucher Mutation] TanStack Exception Tracker:', error.message);
    }
  });
};

//