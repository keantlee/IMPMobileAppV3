export interface SubCategory {
  fertilizer_sub_category_id:   string;
  fertilizer_category_id:       string;
  sub_category:                 string;
  program_item_sub_category_id: string;
  program_id:                   string;
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
  mother_maiden:            string;
  contact_no:               string;
  civil_status:             string | null;
  geo_code:                 string;
  reg:                      string;
  reg_desc:                 string;
  prv:                      string;
  prv_desc:                 string;
  mun:                      string;
  mun_desc:                 string;
  brgy:                     string;
  brgy_desc:                string;
  farm_area:                string;
  is_scanned:               string; // "1"
  scanned_date:             string;
  last_scanned_by_id:       string;
  batch_code:               string;
  reg_farm:                 string;
  seed_class:               string;
  sub_project:              string;
  rrp_fertilizer_kind:      string;
  voucherAmountBalance:     string;  // "3300.00"
  voucherRemainingBalance:  string;  // "3300.00"
  voucher_status:           string;  // "NOT YET CLAIMED"
  voucherProgramID:         string;
  crop_area:                string;
  programID:                string;
  title:                    string;
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