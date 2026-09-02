import NetInfo from '@react-native-community/netinfo';
import { useMutation } from '@tanstack/react-query';
import { POST } from './config/axios';
import EndPoints from './config/endpoints';

/**
 * ==================== OFFICE INFO MODULE ====================
 * Imperative API helpers for the Office Info feature. The logged-in supplier is
 * either a MAIN office (sees + manages all branches in its group) or a BRANCH
 * office (sees + edits only itself). Edits are staged for RFO approval and adds
 * create a pending branch user — both mirror the web SupplierProfileModule.
 */

const ensureOnline = async (context: string) => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected || !netState.isInternetReachable) {
    throw new Error(`[${context}] No internet connection found. Please check your network and try again.`);
  }
};

// ---- Office list ----
export interface OfficeListItem {
  supplier_id: string;
  supplier_name: string | null;
  address: string | null;
  contact: string | null;
  email: string | null;
  supplier_type: string | null; // 'main' | 'branch'
  supplier_group_id: string | null;
  update_status: string | number | null;
  group_name: string | null;
  reg_name: string | null;
  prov_name: string | null;
  mun_name: string | null;
  bgy_name: string | null;
  owner_name: string | null;
}

export interface GetOfficeInfoResponse {
  status: boolean;
  role?: 'main' | 'branch';
  supplier_type?: string | null;
  role_id?: string | number | null;
  offices?: OfficeListItem[];
  message?: string;
}

export const fetchOfficeInfo = async (
  supplier_id: string,
): Promise<GetOfficeInfoResponse> => {
  await ensureOnline('GET OFFICE INFO');

  const response = await POST<GetOfficeInfoResponse>(EndPoints.GET_OFFICE_INFO, {
    supplier_id,
  });

  if (response.status !== true) {
    throw new Error(response.message || 'Failed to load office information.');
  }

  return response;
};

// ---- Office detail (edit prefill) ----
export interface OfficeDetail {
  supplier_id: string;
  supplier_name: string | null;
  supplier_group_id: string | null;
  supplier_group: string | null;
  address: string | null;
  email: string | null;
  contact: string | null;
  business_permit: string | null;
  owner_first_name: string | null;
  owner_middle_name: string | null;
  owner_last_name: string | null;
  owner_ext_name: string | null;
  owner_phone: string | null;
  geo_code: string | null;
  reg: string | null;
  reg_name: string | null;
  prv: string | null;
  prov_name: string | null;
  mun: string | null;
  mun_name: string | null;
  brgy: string | null;
  bgy_name: string | null;
  bank_short_name: string | null;
  bank_long_name: string | null;
  bank_account_name: string | null;
  bank_account_no: string | null;
  supplier_type: string | null;
  verified: string | number | null;
  update_status: string | number | null;
}

export interface BankOption {
  shortname: string;
  name: string;
}

export interface GetOfficeDetailResponse {
  status: boolean;
  data?: OfficeDetail;
  banks?: BankOption[];
  message?: string;
}

export interface GetOfficeDetailPayload {
  supplier_id: string;
  office_id: string;
}

// get_office_detail
// useMutation hook (transaction.ts pattern): connectivity guard -> POST ->
// status/data validation, with onSuccess / onError logging.
export const getOfficeDetailMutation = () => {
  return useMutation<GetOfficeDetailResponse, Error, GetOfficeDetailPayload>({
    mutationFn: async payload => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error('[GET OFFICE DETAIL MUTATION] No internet connection found.');
      }

      console.log('[GET OFFICE DETAIL MUTATION] payload: ', payload);

      const response = await POST<GetOfficeDetailResponse>(EndPoints.GET_OFFICE_DETAIL, {
        supplier_id: payload.supplier_id,
        office_id: payload.office_id,
      });

      if (response.status !== true || !response.data) {
        throw new Error(response.message || 'Failed to load office detail.');
      }

      return response;
    },
    onSuccess: serverData => {
      console.log('[GET OFFICE DETAIL MUTATION] Server data received: ', serverData);
    },
    onError: (error: Error) => {
      console.warn('[GET OFFICE DETAIL MUTATION] TanStack Exception Tracker: ', error.message);
    },
  });
};

// ---- Geo cascade ----
export interface GeoOption {
  // The stored procedures return varying key casings; keep it permissive.
  [key: string]: any;
}

interface GeoResponse {
  status: boolean;
  data?: GeoOption[];
  message?: string;
}

const fetchGeo = async (
  endpoint: string,
  params: Record<string, unknown>,
  context: string,
): Promise<GeoOption[]> => {
  await ensureOnline(context);
  const response = await POST<GeoResponse>(endpoint, params);
  if (response.status !== true) {
    throw new Error(response.message || `[${context}] Request failed.`);
  }
  return response.data || [];
};

export const fetchRegions = () =>
  fetchGeo(EndPoints.GET_OFFICE_REGIONS, {}, 'GET REGIONS');

export const fetchProvinces = (reg_code: string | number) =>
  fetchGeo(EndPoints.GET_OFFICE_PROVINCES, { reg_code }, 'GET PROVINCES');

export const fetchMunicipalities = (
  reg_code: string | number,
  prov_code: string | number,
) => fetchGeo(EndPoints.GET_OFFICE_MUNICIPALITIES, { reg_code, prov_code }, 'GET MUNICIPALITIES');

export const fetchBarangays = (
  reg_code: string | number,
  prov_code: string | number,
  mun_code: string | number,
) =>
  fetchGeo(
    EndPoints.GET_OFFICE_BARANGAYS,
    { reg_code, prov_code, mun_code },
    'GET BARANGAYS',
  );

export const fetchBanks = async (): Promise<BankOption[]> => {
  await ensureOnline('GET BANKS');
  const response = await POST<{ status: boolean; data?: BankOption[]; message?: string }>(
    EndPoints.GET_OFFICE_BANKS,
    {},
  );
  if (response.status !== true) {
    throw new Error(response.message || 'Failed to load banks.');
  }
  return response.data || [];
};

// ---- Update office (edit) ----
export interface UpdateOfficePayload {
  supplier_id: string; // logged-in user
  office_id: string; // office being edited
  supplier_name: string;
  address: string;
  business_permit?: string;
  email: string;
  contact_no: string;
  owner_first_name: string;
  owner_middle_name?: string;
  owner_last_name: string;
  owner_ext_name?: string;
  owner_phone_no?: string;
  reg_code: string;
  prv_code: string;
  mun_code: string;
  brgy_code: string;
  bank_long_name?: string;
  bank_short_name?: string;
  bank_account_name?: string;
  bank_account_no?: string;
  supplier_type?: string;
}

export interface MutationResponse {
  status: boolean;
  message?: string;
  regs_code?: string;
  new_user_id?: string;
}

// update_office
// useMutation hook (transaction.ts pattern): connectivity guard -> POST ->
// status validation, with onSuccess / onError logging.
export const updateOfficeMutation = () => {
  return useMutation<MutationResponse, Error, UpdateOfficePayload>({
    mutationFn: async payload => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error('[UPDATE OFFICE MUTATION] No internet connection found.');
      }

      console.log('[UPDATE OFFICE MUTATION] payload: ', payload);

      const response = await POST<MutationResponse>(EndPoints.UPDATE_OFFICE, payload);

      if (response.status !== true) {
        throw new Error(
          response.message || 'The database rejected this office profile update.',
        );
      }

      return response;
    },
    onSuccess: serverData => {
      console.log('[UPDATE OFFICE MUTATION] Server data received: ', serverData);
    },
    onError: (error: Error) => {
      console.warn('[UPDATE OFFICE MUTATION] TanStack Exception Tracker: ', error.message);
    },
  });
};

// ---- Add branch (main office only) ----
export interface AddBranchPayload {
  supplier_id: string; // logged-in main office user
  first_name: string;
  middle_name?: string;
  last_name: string;
  ext_name?: string;
  username: string;
  email: string;
  contact_no: string;
  company_name: string;
  company_address: string;
  password: string;
  program_id: string;
  reg_code: string;
  prov_code: string;
  mun_code: string;
  brgy_code: string;
}

// add_branch
// Follows the transaction.ts mutation pattern: a useMutation hook with a
// mutationFn that guards connectivity, POSTs the payload and validates the
// server status, plus onSuccess / onError handlers for logging.
export const addBranchMutation = () => {
  return useMutation<MutationResponse, Error, AddBranchPayload>({
    mutationFn: async payload => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error('[ADD BRANCH MUTATION] No internet connection found.');
      }

      console.log('[ADD BRANCH MUTATION] payload: ', payload);

      const response = await POST<MutationResponse>(EndPoints.ADD_BRANCH, payload);

      if (response.status !== true) {
        throw new Error(
          response.message || 'The database rejected this new branch registration.',
        );
      }

      return response;
    },
    onSuccess: serverData => {
      console.log('[ADD BRANCH MUTATION] Server data received: ', serverData);
    },
    onError: (error: Error) => {
      console.warn('[ADD BRANCH MUTATION] TanStack Exception Tracker: ', error.message);
    },
  });
};
// ==================== OFFICE INFO MODULE ====================
