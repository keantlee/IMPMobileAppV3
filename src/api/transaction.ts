import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { getSession, setSession, clearSession } from '../utils/session';
import NetInfo from "@react-native-community/netinfo";
import { POST, GET } from "./config/axios";
import ScreenNames from '../navigation/screenNames';
import EndPoints from './config/endpoints';

interface ScanVoucherPayload {
  voucherCode: string;
}

export interface SubCategory {
  fertilizer_sub_category_id: string;
  fertilizer_category_id: string;
  sub_category: string;
  program_item_sub_category_id: string;
  program_id: string;
}

export interface UnitMeasurement {
  label: string;
  value: string;
}

export interface FertilizerCategory {
  label: string;
  value: string;
}

export interface CheckCategoryHasSubCategory {
  fertilizer_category_id: string;
}

export interface VoucherInfo {
  voucher_id: string;
  rsbsa_no: string;
  control_no: string;
  reference_no: string;
  program_id: string;
  fund_id: string;
  fund_desc: string;
  type: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  ext_name: string;
  sex: string;
  birthday: string;
  birth_place: string;
  mother_maiden: string;
  contact_no: string;
  civil_status: string | null;
  geo_code: string;
  reg: string;
  reg_desc: string;
  prv: string;
  prv_desc: string;
  mun: string;
  mun_desc: string;
  brgy: string;
  brgy_desc: string;
  farm_area: string;
  is_scanned: string; // "1"
  scanned_date: string;
  last_scanned_by_id: string;
  batch_code: string;
  reg_farm: string;
  seed_class: string;
  sub_project: string;
  rrp_fertilizer_kind: string;
  voucherAmountBalance: string;     // "3300.00"
  voucherRemainingBalance: string;  // "3300.00"
  voucher_status: string;           // "NOT YET CLAIMED"
  voucherProgramID: string;
  crop_area: string;
  programID: string;
  title: string;
  shortname: string;
  description: string;
  cluster: string;
  intervention: string;
  remitter_id: string;
  duration_start_date: string;
  duration_end_date: string;
  status: string; // "1"
  one_time_transaction: string; // "0"
  process_type: string; // "VOUCHER"
  is_special: string; // "1"
  prog_code: string;
  proj_code: string | null;
  sub_categories: SubCategory[];
  unit_measurements: UnitMeasurement[];
  fertilizer_categories: FertilizerCategory[];
  getCheckCategoryHasSubCategory: CheckCategoryHasSubCategory[];
}

export interface ScanVoucherResponse {
  status: boolean;
  message?: string; // Fallback text property for error maps
  voucherInfo?: VoucherInfo; // Present on true status blocks
  timer?: number; // 2700000
}

export const scanVoucherMutation = () => {
  return useMutation<ScanVoucherResponse, Error, ScanVoucherPayload & { navigation: any }>({ 
    mutationFn: async (payload) => {
        const netState = await NetInfo.fetch();

        if(!netState.isConnected || !netState.isInternetReachable) {
            throw new Error('[Scan Voucher Mutation] No internet connection found.');
        }

        console.log('[Scan Voucher Mutation] Incoming payload target code:', payload.voucherCode);

        let cleanPayload = {
            reference_number: payload.voucherCode,
            user_id: getSession<string>('USER_ID')
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