import * as z from 'zod';

const EXT_NAME_OPTIONS = ['', 'N/A', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'] as const;

const nameRegex = /^[a-zA-Z\s\-.']+$/;
const contactRegex = /^\d{8,12}$/;

/**
 * Edit Office form. Used by both a MAIN office (editing itself or a branch) and a
 * BRANCH office (editing itself). Mirrors the fields the web update flow stages
 * into temp_supplier.
 */
export const officeEditSchema = z.object({
  supplier_name: z.string().min(1, 'Office / company name is required.'),
  address: z.string().min(1, 'Complete office address is required.'),
  business_permit: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .trim()
    .lowercase(),
  contact_no: z
    .string()
    .min(1, 'Contact number is required.')
    .regex(contactRegex, 'Contact number must be 8 to 12 digits.'),
  owner_first_name: z
    .string()
    .min(1, 'Owner first name is required.')
    .regex(nameRegex, 'First name contains invalid characters.'),
  owner_middle_name: z.string().optional().or(z.literal('')),
  owner_last_name: z
    .string()
    .min(1, 'Owner last name is required.')
    .regex(nameRegex, 'Last name contains invalid characters.'),
  owner_ext_name: z.string().optional().or(z.literal('')),
  owner_phone_no: z.string().optional().or(z.literal('')),
  // Geo codes (dropdown values). Descriptions are resolved server-side.
  reg_code: z.string().min(1, 'Region is required.'),
  prv_code: z.string().min(1, 'Province is required.'),
  mun_code: z.string().min(1, 'Municipality / City is required.'),
  brgy_code: z.string().min(1, 'Barangay is required.'),
  // Bank details
  bank_short_name: z.string().optional().or(z.literal('')),
  bank_long_name: z.string().optional().or(z.literal('')),
  bank_account_name: z.string().optional().or(z.literal('')),
  bank_account_no: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      value => !value || /^[0-9-]+$/.test(value),
      'Bank account number must contain only digits and dashes.',
    ),
});

export type OfficeEditFormData = z.infer<typeof officeEditSchema>;

/**
 * Add New Branch form (MAIN office only). Creates a pending branch login user.
 */
export const addBranchSchema = z.object({
  first_name: z
    .string()
    .min(1, 'Owner first name is required.')
    .regex(nameRegex, 'First name contains invalid characters.'),
  middle_name: z.string().optional().or(z.literal('')),
  last_name: z
    .string()
    .min(1, 'Owner last name is required.')
    .regex(nameRegex, 'Last name contains invalid characters.'),
  ext_name: z.string().optional().or(z.literal('')),
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters.')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username may contain letters, numbers, dot and underscore only.'),
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .trim()
    .lowercase(),
  contact_no: z
    .string()
    .min(1, 'Contact number is required.')
    .regex(contactRegex, 'Contact number must be 8 to 12 digits.'),
  company_name: z.string().min(1, 'Branch / company name is required.'),
  company_address: z.string().min(1, 'Complete branch address is required.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
  program_id: z.string().min(1, 'Program is required.'),
  reg_code: z.string().min(1, 'Region is required.'),
  prov_code: z.string().min(1, 'Province is required.'),
  mun_code: z.string().min(1, 'Municipality / City is required.'),
  brgy_code: z.string().min(1, 'Barangay is required.'),
});

export type AddBranchFormData = z.infer<typeof addBranchSchema>;

export { EXT_NAME_OPTIONS };
