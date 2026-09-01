import * as z from 'zod';

const EXT_NAME_OPTIONS = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'] as const;

export const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required.')
    .regex(/^[a-zA-Z\s\-.']+$/, 'First name contains invalid characters.'),
  middle_name: z
    .string()
    .optional()
    .or(z.literal('')),
  last_name: z
    .string()
    .min(1, 'Last name is required.')
    .regex(/^[a-zA-Z\s\-.']+$/, 'Last name contains invalid characters.'),
  ext_name: z
    .string()
    .optional()
    .or(z.literal('')),
  main_office_name: z
    .string()
    .min(1, 'Main office name is required.'),
  company_name: z
    .string()
    .min(1, 'Company name is required.'),
  company_address: z
    .string()
    .min(1, 'Complete company address is required.'),
  region: z
    .string()
    .min(1, 'Region is required.'),
  province: z
    .string()
    .min(1, 'Province is required.'),
  municipality: z
    .string()
    .min(1, 'Municipality/City is required.'),
  barangay: z
    .string()
    .min(1, 'Barangay is required.'),
  business_permit: z
    .string()
    .min(1, 'Business permit is required.')
    .regex(/^[a-zA-Z0-9\s\-./]+$/, 'Business permit contains invalid characters.'),
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.')
    .trim()
    .lowercase(),
  contact_no: z
    .string()
    .min(1, 'Contact number is required.')
    .regex(/^\d{8,12}$/, 'Contact number must be 8 to 12 digits.'),
  bank_name: z
    .string()
    .min(1, 'Bank name is required.'),
  bank_account_name: z
    .string()
    .min(1, 'Bank account name is required.')
    .regex(/^[a-zA-Z\s\-.']+$/, 'Bank account name contains invalid characters.'),
  bank_account_no: z
    .string()
    .min(1, 'Bank account number is required.')
    .regex(/^[0-9\-]+$/, 'Bank account number must contain only digits and dashes.'),
  phone_no: z
    .string()
    .min(1, 'Phone number is required.')
    .regex(/^\d{11}$/, 'Phone number must be exactly 11 digits.'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export { EXT_NAME_OPTIONS };
