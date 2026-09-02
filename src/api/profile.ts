import { useMutation } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { POST } from './config/axios';
import EndPoints from './config/endpoints';

/**
 * ==================== PROFILE MODULE ====================
 */

// --- Get Profile ---
export interface GetProfilePayload {
  supplier_id: string;
}

export interface ProfileData {
  supplier_id: string;
  supplier_name: string;
  owner_first_name: string;
  owner_middle_name: string | null;
  owner_last_name: string;
  owner_ext_name: string | null;
  address: string | null;
  email: string | null;
  contact: string | null;
  geo_code: string | null;
  business_permit: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_no: string | null;
  phone_no: string | null;
  supplier_group: string | null;
  reg_name: string | null;
  prov_name: string | null;
  mun_name: string | null;
  brgy_name: string | null;
  reg_code: string | null;
  prov_code: string | null;
  mun_code: string | null;
}

export interface GetProfileResponse {
  status: boolean;
  data: ProfileData;
  message?: string;
}

export const getProfileMutation = () => {
  return useMutation<GetProfileResponse, Error, GetProfilePayload>({
    mutationFn: async payload => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error('[GET PROFILE] No internet connection found.');
      }

      console.log('[GET PROFILE] payload:', payload);

      const response = await POST<GetProfileResponse>(EndPoints.GET_PROFILE, {
        supplier_id: payload.supplier_id,
      });

      if (response.status !== true) {
        throw new Error(response.message || 'Failed to fetch profile.');
      }

      return response;
    },
    onSuccess: serverData => {
      console.log('[GET PROFILE] Server data received:', serverData);
    },
    onError: (error: Error) => {
      console.warn('[GET PROFILE] Exception:', error.message);
    },
  });
};

// --- Update Profile ---
export interface UpdateProfilePayload {
  supplier_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  ext_name?: string;
  company_name: string;
  company_address: string;
  business_permit: string;
  email: string;
  contact_no: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_no: string;
  phone_no: string;
}

export interface UpdateProfileResponse {
  status: boolean;
  message: string;
}

export const updateProfileMutation = () => {
  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: async payload => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error('[UPDATE PROFILE] No internet connection found.');
      }

      console.log('[UPDATE PROFILE] payload:', payload);

      const response = await POST<UpdateProfileResponse>(
        EndPoints.UPDATE_PROFILE,
        payload,
      );

      if (response.status !== true) {
        throw new Error(response.message || 'Failed to update profile.');
      }

      return response;
    },
    onSuccess: serverData => {
      console.log('[UPDATE PROFILE] Server data received:', serverData);
    },
    onError: (error: Error) => {
      console.warn('[UPDATE PROFILE] Exception:', error.message);
    },
  });
};

// --- Get Accreditation ---
export interface GetAccreditationPayload {
  supplier_id: string;
}

export interface AccreditationItem {
  permission_id: string;
  program_id: string;
  user_id: string;
  status: string;
  date_created: string;
  program_name: string;
  shortname: string;
  description: string;
  owner_first_name: string;
  owner_middle_name: string | null;
  owner_last_name: string;
  owner_ext_name: string | null;
}

export interface GetAccreditationResponse {
  status: boolean;
  data: AccreditationItem[];
  message?: string;
}

export const getAccreditationMutation = () => {
  return useMutation<GetAccreditationResponse, Error, GetAccreditationPayload>({
    mutationFn: async payload => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error('[GET ACCREDITATION] No internet connection found.');
      }

      console.log('[GET ACCREDITATION] payload:', payload);

      const response = await POST<GetAccreditationResponse>(
        EndPoints.GET_ACCREDITATION,
        { supplier_id: payload.supplier_id },
      );

      if (response.status !== true) {
        throw new Error(response.message || 'Failed to fetch accreditation.');
      }

      return response;
    },
    onSuccess: serverData => {
      console.log('[GET ACCREDITATION] Server data received:', serverData);
    },
    onError: (error: Error) => {
      console.warn('[GET ACCREDITATION] Exception:', error.message);
    },
  });
};

// --- Get Certificate ---
export interface GetCertificatePayload {
  supplier_id: string;
  program_id: string;
}

export interface GetCertificateResponse {
  status: boolean;
  url?: string; // Presigned S3 URL (valid ~60 minutes)
  filename?: string;
  program_name?: string;
  shortname?: string;
  message?: string;
}

/**
 * Imperative fetch for the active certificate of accreditation.
 * Returns a temporary presigned S3 URL the client can open (lightbox)
 * or download (RNFS). Intended to be called from a button handler,
 * so it is a plain async function rather than a React Query hook.
 */
export const fetchCertificate = async (
  payload: GetCertificatePayload,
): Promise<GetCertificateResponse> => {
  const netState = await NetInfo.fetch();

  if (!netState.isConnected || !netState.isInternetReachable) {
    throw new Error('No internet connection found. Please check your network and try again.');
  }

  console.log('[GET CERTIFICATE] payload:', payload);

  const response = await POST<GetCertificateResponse>(EndPoints.GET_CERTIFICATE, {
    supplier_id: payload.supplier_id,
    program_id: payload.program_id,
  });

  if (response.status !== true || !response.url) {
    throw new Error(response.message || 'Failed to fetch certificate.');
  }

  return response;
};
// ==================== PROFILE MODULE ====================
