import NetInfo from '@react-native-community/netinfo';
import { useMutation } from '@tanstack/react-query';
import { POST } from './config/axios';
import EndPoints from './config/endpoints';

/**
 * ==================== MERCHANT REGISTRATION MODULE ====================
 * Public self-registration API. Interventions (programs) drive a dropdown, and
 * registerMerchantMutation creates the pending merchant account. The geo cascade
 * (region/province/municipality/barangay) reuses the office endpoints via
 * ../api/office (fetchRegions/fetchProvinces/fetchMunicipalities/fetchBarangays).
 */

// ---- Interventions (programs) ----
export interface Intervention {
  program_id: string;
  shortname: string | null;
  title: string | null;
  description: string | null;
}

export const fetchInterventions = async (): Promise<Intervention[]> => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected || !netState.isInternetReachable) {
    throw new Error('No internet connection found. Please check your network and try again.');
  }

  const response = await POST<{ status: boolean; data?: Intervention[]; message?: string }>(
    EndPoints.GET_PROGRAMS,
    {},
  );

  if (response.status !== true) {
    throw new Error(response.message || 'Failed to load interventions.');
  }

  return response.data || [];
};

// ---- Register merchant ----
export interface RegisterMerchantPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  ext_name?: string;
  merchant_type: 'main' | 'branch';
  program_id: string;
  company_name: string;
  company_address: string;
  reg_code: string;
  prov_code: string;
  mun_code: string;
  brgy_code: string;
  contact_no: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterMerchantResponse {
  status: boolean;
  message?: string;
  regs_code?: string;
  new_user_id?: string;
}

// register_merchant
// useMutation hook following the transaction.ts pattern: connectivity guard ->
// POST -> status validation, with onSuccess / onError logging.
export const registerMerchantMutation = () => {
  return useMutation<RegisterMerchantResponse, Error, RegisterMerchantPayload>({
    mutationFn: async payload => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error('[REGISTER MERCHANT MUTATION] No internet connection found.');
      }

      console.log('[REGISTER MERCHANT MUTATION] payload: ', payload);

      const response = await POST<RegisterMerchantResponse>(
        EndPoints.REGISTER_MERCHANT,
        payload,
      );

      console.log('[REGISTER MERCHANT MUTATION] response: ', response);

      if (response.status !== true) {
        throw new Error(response.message || 'The database rejected this registration.');
      }

      return response;
    },
    onSuccess: serverData => {
      console.log('[REGISTER MERCHANT MUTATION] Server data received: ', serverData);
    },
    onError: (error: Error) => {
      console.warn('[REGISTER MERCHANT MUTATION] TanStack Exception Tracker: ', error.message);
    },
  });
};
// ==================== MERCHANT REGISTRATION MODULE ====================
